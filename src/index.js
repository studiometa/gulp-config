import PrettyError from 'pretty-error';
import { series } from 'gulp';
import isObject from 'lodash/isObject';
import { createServer } from './tasks/server';
import {
  createStylesBuilder,
  createStylesLinter,
  createStylesFormatter,
} from './tasks/styles';
import {
  createScriptsBuilder,
  createScriptsLinter,
  createScriptsFormatter,
} from './tasks/scripts';
import { createPHPLinter, createPHPFormatter } from './tasks/php';

// Start immediately the pretty error instance
PrettyError.start();

/**
 * A gulp task generator
 *
 * @param  {Object} options The options for the generator, see the documentation
 *                          for all available possibilities
 * @return {Object}         An object containing all the tasks
 */
export const create = options => {
  /** @type {Array} An array for the builder tasks */
  const buildTasksNames = [];

  /** @type {Array} An array for all the linter tasks */
  const lintTasksNames = [];

  /** @type {Array} An array for all the lint fixer tasks */
  const formatTasksNames = [];

  /** @type {Array} An array for all the server tasks */
  const serverTasksNames = [];

  /** @type {Object} An object to register all the tasks */
  const tasks = {};

  /** @type {Array} An array of watchers to add to the server task */
  const watchers = [];

  // Generate styles tasks
  if ('styles' in options) {
    const [builderName, builderTask, builderOptions] = createStylesBuilder(
      options.styles
    );
    const [linterName, linterTask] = createStylesLinter(options.styles);
    const [formatName, formatTask] = createStylesFormatter(options.styles);

    buildTasksNames.push(builderName);
    lintTasksNames.push(linterName);
    formatTasksNames.push(formatName);

    // Add styles watchers
    watchers.push({
      files: [builderOptions.glob],
      options: {
        cwd: builderOptions.src,
      },
      tasks: [builderName, linterName],
    });

    tasks[builderName] = builderTask;
    tasks[linterName] = linterTask;
    tasks[formatName] = formatTask;
  }

  // Generate scripts tasks
  if ('scripts' in options) {
    const [builderName, builderTask, builderOptions] = createScriptsBuilder(
      options.scripts
    );
    const [linterName, linterTask] = createScriptsLinter(options.scripts);
    const [formatName, formatTask] = createScriptsFormatter(options.scripts);

    buildTasksNames.push(builderName);
    lintTasksNames.push(linterName);
    formatTasksNames.push(formatName);

    // Trigger build and lint on source files when they change
    watchers.push({
      files: [builderOptions.glob],
      options: {
        cwd: builderOptions.src,
      },
      tasks: [builderName, linterName],
    });

    // Trigger browser reload when any dist files changes
    watchers.push({
      files: [builderOptions.glob],
      options: {
        cwd: builderOptions.dist,
      },
      callbacks: [
        {
          event: 'change',
          callback: server => server.reload(),
        },
      ],
    });

    tasks[builderName] = builderTask;
    tasks[linterName] = linterTask;
    tasks[formatName] = formatTask;
  }

  if ('php' in options) {
    const [linterName, linterTask] = createPHPLinter(options.php);
    const [formatName, formatTask] = createPHPFormatter(options.php);

    lintTasksNames.push(linterName);
    formatTasksNames.push(formatName);

    tasks[linterName] = linterTask;
    tasks[formatName] = formatTask;
  }

  // Generate server task
  // ---
  // The server option can be either a boolean or an object,
  // so we need to check it is true when it is not an object
  // before registering any task.
  if (
    'server' in options &&
    (isObject(options.server) || options.server === true)
  ) {
    options.server = isObject(options.server)
      ? options.server
      : { watchers: [] };

    // We add the default watchers to the options `watchers` array, but we have
    // to make sure it exists in the first place
    if (options.server.watchers === undefined) {
      options.server.watchers = [];
    }
    watchers.forEach(watcher => options.server.watchers.push(watcher));

    const [serverName, serverTask] = createServer(options.server);
    serverTasksNames.push(serverName);
    tasks[serverName] = serverTask;
  }

  // Register default task
  tasks.default = async () =>
    series(...lintTasksNames, ...buildTasksNames, ...serverTasksNames)();

  return tasks;
};

export default create;
