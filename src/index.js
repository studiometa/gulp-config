import { series } from 'gulp';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
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

/**
 * A gulp task generator
 *
 * @param  {Object} options The options for the generator, see the documentation
 *                          for all available possibilities
 * @return {Object}         An object containing all the tasks
 */
export const create = (options) => {
  /** @type {Array} An array for the builder tasks */
  const buildTasksNames = [];

  /** @type {Array} An array for all the linter tasks */
  const lintTasksNames = [];

  /** @type {Array} An array for all the server tasks */
  const serverTasksNames = [];

  /** @type {Object} An object to register all the tasks */
  const tasks = {};

  /** @type {Array} An array of watchers to add to the server task */
  const watchers = [];

  // Generate styles tasks
  if ('styles' in options) {
    const [ builderName, builderTask ] = createStylesBuilder(options.styles);
    const [ linterName, linterTask ] = createStylesLinter(options.styles);
    const [ formatName, formatTask ] = createStylesFormatter(options.styles);

    buildTasksNames.push(builderName);
    lintTasksNames.push(linterName);

    // Add styles watchers
    watchers.push({
      files: [ options.styles.src ],
      tasks: [
        builderName,
        linterName,
      ],
    });

    tasks[builderName] = builderTask;
    tasks[linterName] = linterTask;
    tasks[formatName] = formatTask;
  }

  // Generate scripts tasks
  if ('scripts' in options) {
    const [ builderName, builderTask ] = createScriptsBuilder(options.scripts);
    const [ linterName, linterTask ] = createScriptsLinter(options.scripts);
    const [ formatName, formatTask ] = createScriptsFormatter(options.scripts);

    buildTasksNames.push(builderName);
    lintTasksNames.push(linterName);

    // Add scripts watchers
    watchers.push({
      files: [ options.scripts.src ],
      tasks: [
        builderName,
        linterName,
      ],
    });

    tasks[builderName] = builderTask;
    tasks[linterName] = linterTask;
    tasks[formatName] = formatTask;
  }

  // Generate server task
  // ---
  // The server option can be either a boolean or an object,
  // so we need to check it is true when it is not an object
  // before registering any task.
  if (
    ('server' in options)
    && (isObject(options.server) || options.server === true)
  ) {
    const customOptions = isObject(options.server)
      ? options.server
      : {};
    const serverOptions = merge({}, customOptions, { watchers });

    const [ serverName, serverTask ] = createServer(serverOptions);
    serverTasksNames.push(serverName);
    tasks[serverName] = serverTask;
  }

  // Register default task
  tasks.default = async () => series(
    ...lintTasksNames,
    ...buildTasksNames,
    ...serverTasksNames
  )();

  return tasks;
};


export default create;
