import { src as source, dest } from 'gulp';
import { resolve } from 'path';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import notify from 'gulp-notify';
import cache from 'gulp-cached';
import prettyError from '../utils/pretty-error';

/**
 * Create the `scripts-build` Gulp task
 *
 * @param  {Object} options The options for the builder task, see the default
 *                          object defined below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createScriptsBuilder = (options) => {
  /** @type {String} The task's name */
  const name = 'scripts-build';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/scripts',
    glob: '**/*.js',
    dist: 'src/scripts',
    uglifyOptions: {
      compress: {
        /* eslint-disable-next-line */
        drop_console: true,
      },
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    glob,
    dist,
    uglifyOptions,
  } = merge({}, defaults, options);

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOptions).on('error', function err(error) {
          prettyError.render(error, true);
          return this.emit('end');
        }))
        .pipe(sourcemaps.write('maps'))
        .pipe(dest(dist))
        .pipe(notify({
          title: `gulp ${name}`,
          message: ({ relative }) => (
            `The file ${relative} has been updated.`
          ),
        }))
    ),
    {
      src,
      glob,
      dist,
      uglifyOptions,
    },
  ];
};


/**
 * Create the `scripts-lint` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object defined below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createScriptsLinter = (options) => {
  /** @type {String} The task's name */
  const name = 'scripts-lint';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/scripts',
    glob: '**/*.js',
    ESLintOptions: {
      useEslintrc: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    glob,
    ESLintOptions,
  } = merge({}, defaults, options);

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(eslint.format())
    ),
  ];
};


/**
 * Create the `scripts-format` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createScriptsFormatter = (options) => {
  /** @type {String} The task's name */
  const name = 'scripts-format';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/scripts',
    glob: '**/*.js',
    ESLintOptions: {
      useEslintrc: true,
      fix: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    glob,
    ESLintOptions,
  } = merge({}, defaults, options);

  // Make sure the `fix` option is activated
  ESLintOptions.fix = true;

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(dest(src))
        .pipe(notify({
          title: `gulp ${name}`,
          message: ({ relative }) => (
            `The file ${relative} has been formatted with ESLint.`
          ),
        }))
    ),
  ];
};
