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
import getGlobsToIgnore from './utils/get-globs-to-ignore';
import nameFunction from './utils/name-function';
import sortByKey from './utils/sort-by-key';

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
  /** @type {Array} An array for the builder tasks' functions */
  const buildTasks = [];

  /** @type {Array} An array for all the linter tasks' functions */
  const lintTasks = [];

  /** @type {Array} An array for all the lint fixer tasks' functions */
  const formatTasks = [];

  /** @type {Array} An array for all the cache tasks' functions */
  const cacheTasks = [];

  /** @type {Array} An array for all the server tasks' functions */
  const serverTasks = [];

  /** @type {Array} An array of watchers to add to the server task */
  const watchers = [];

  // Generate styles tasks
  if ('styles' in options) {
    const [builderTask, builderCacheTask, builderOptions] = createStylesBuilder(
      options.styles
    );
    const [linterTask, linterCacheTask] = createStylesLinter(options.styles);
    const [formatTask, formatCacheTask] = createStylesFormatter(options.styles);

    buildTasks.push(builderTask);
    lintTasks.push(linterTask);
    formatTasks.push(formatTask);

    cacheTasks.push(builderCacheTask);
    cacheTasks.push(linterCacheTask);
    cacheTasks.push(formatCacheTask);

    // Add styles watchers
    watchers.push({
      files: builderOptions.glob,
      options: {
        cwd: builderOptions.src,
        ignored: getGlobsToIgnore(builderOptions.glob),
      },
      tasks: [builderTask, linterTask],
    });
  }

  // Generate scripts tasks
  if ('scripts' in options) {
    const [
      builderTask,
      builderCacheTask,
      builderOptions,
    ] = createScriptsBuilder(options.scripts);
    const [linterTask, linterCacheTask] = createScriptsLinter(options.scripts);
    const [formatTask, formatCacheTask] = createScriptsFormatter(
      options.scripts
    );

    buildTasks.push(builderTask);
    lintTasks.push(linterTask);
    formatTasks.push(formatTask);

    cacheTasks.push(builderCacheTask);
    cacheTasks.push(linterCacheTask);
    cacheTasks.push(formatCacheTask);

    // Trigger build and lint on source files when they change
    watchers.push({
      files: builderOptions.glob,
      options: {
        cwd: builderOptions.src,
        ignored: getGlobsToIgnore(builderOptions.glob),
      },
      tasks: [builderTask, linterTask],
    });

    // Trigger browser reload when any dist files changes
    watchers.push({
      files: builderOptions.glob,
      options: {
        cwd: builderOptions.dist,
        ignored: getGlobsToIgnore(builderOptions.glob),
      },
      callbacks: [
        {
          event: 'change',
          callback: server => server.reload(),
        },
      ],
    });
  }

  if ('php' in options) {
    const [linterTask, linterCacheTask, linterOptions] = createPHPLinter(
      options.php
    );
    const [formatTask, formatCacheTask] = createPHPFormatter(options.php);

    lintTasks.push(linterTask);
    formatTasks.push(formatTask);

    cacheTasks.push(linterCacheTask);
    cacheTasks.push(formatCacheTask);

    // Lint files on change
    watchers.push({
      files: linterOptions.glob,
      options: {
        cwd: linterOptions.src,
        ignored: getGlobsToIgnore(linterOptions.glob),
      },
      tasks: [linterTask],
    });
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

    const [serverTask] = createServer(options.server);
    serverTasks.push(serverTask);
  }

  // Register aliases tasks
  const lint = async () => series(...lintTasks)();
  const build = async () => series(...buildTasks)();
  const format = async () => series(...formatTasks)();

  const tasks = {
    lint,
    build,
    format,
    default: nameFunction('default', async () =>
      series(...buildTasks, ...cacheTasks, ...serverTasks)()
    ),
  };

  [...lintTasks, ...buildTasks, ...formatTasks, ...serverTasks]
    .sort(sortByKey('name'))
    .reduce((acc, task) => {
      acc[task.name] = task;
      return acc;
    }, tasks);

  return tasks;
};

export default create;
