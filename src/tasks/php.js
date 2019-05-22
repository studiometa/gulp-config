import { src as source, dest } from 'gulp';
import merge from 'lodash/merge';
import phpcs from 'gulp-phpcs';
import phpcbf from 'gulp-phpcbf';
import gif from 'gulp-if';
import errorHandler from '../utils/error-handler';
import cache from '../plugins/gulp-cache';
import diff from '../plugins/gulp-diff';
import args from '../utils/arguments';

/**
 * Create the `scripts-lint` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object defined below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createPHPLinter = options => {
  /** @type {String} The task's name */
  const name = 'php-lint';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/php',
    glob: '**/*.php',
    PHPCSOptions: {
      bin: 'phpcs',
      standard: 'PSR2',
      warningSeverity: 1,
      errorSeverity: 1,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const { src, glob, PHPCSOptions } = merge({}, defaults, options);

  return [
    name,
    () =>
      source(glob, { cwd: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(phpcs(PHPCSOptions))
        .pipe(phpcs.reporter('log'))
        .pipe(gif(args.failAfterError, phpcs.reporter('fail'))),
  ];
};

/**
 * Create the `scripts-format` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createPHPFormatter = options => {
  /** @type {String} The task's name */
  const name = 'php-format';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/php',
    glob: '**/*.php',
    PHPCBFOptions: {
      bin: 'phpcbf',
      standard: 'PSR2',
      warningSeverity: 1,
      errorSeverity: 1,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const { src, glob, PHPCBFOptions } = merge({}, defaults, options);

  return [
    name,
    () =>
      source(glob, { cwd: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(phpcbf(PHPCBFOptions))
        .on('error', errorHandler)
        .pipe(dest(src)),
  ];
};
