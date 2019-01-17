import { task, series } from 'gulp';
import { createServer } from './tasks/server';
import { createStylesBuilder, createStylesLinter } from './tasks/styles';
import {
  createScriptsBuilder,
  createScriptsLinter,
  createScriptsFormatter,
} from './tasks/scripts';

/**
 * Export a gulp task generator
 * @param  {Object} options The options for the generator, see the documentation
 *                          for all available possibilities
 * @return {void}
 */
export default (options) => {

  /** @type {Array} An array for the builder tasks */
  const buildTasks = [];

  /** @type {Array} An array for all the linter tasks */
  const lintTasks = [];

  /** @type {Array} An array for all the formatter tasks */
  const formatTasks = [];

  // Generate styles tasks
  if ('styles' in options) {
    buildTasks.push(createStylesBuilder(options.styles));
    lintTasks.push(createStylesLinter(options.styles));
  }

  // Generate scripts tasks
  if ('scripts' in options) {
    buildTasks.push(createScriptsBuilder(options.scripts));
    lintTasks.push(createScriptsLinter(options.scripts));
    formatTasks.push(createScriptsFormatter(options.scripts));
  }

  // Generate server task and set it as default task
  if ('server' in options) {
    task('default', () => (
      series(createServer(options.server, buildTasks, lintTasks))
    ));
  }
};
