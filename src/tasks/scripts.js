import { src as source, dest } from 'gulp';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import notify from 'gulp-notify';

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
    dist: 'src/scripts',
    uglifyOptions: {
      compress: {
        /* eslint-disable-next-line */
        drop_console: true,
      },
    },
    uglifyErrorHandler: ({ message }) => {
      console.log(message);
      notify.onError({ message });
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    dist,
    uglifyOptions,
    uglifyErrorHandler,
  } = merge({}, defaults, options);

  return [
    name,
    () => (
      source(src)
        .pipe(sourcemaps.init())
        .pipe(uglify(uglifyOptions).on('error', uglifyErrorHandler))
        .pipe(sourcemaps.write('maps'))
        .pipe(dest(dist))
        .pipe(notify({
          title: `gulp ${name}`,
          message: ({ relative }) => (
            `The file ${relative} has been updated.`
          ),
        }))
    ),
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
    ESLintOptions: {
      useEslintrc: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    ESLintOptions,
  } = merge({}, defaults, options);

  return [
    name,
    () => source(src).pipe(eslint(ESLintOptions)).pipe(eslint.format()),
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
    ESLintOptions: {
      useEslintrc: true,
      fix: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    ESLintOptions,
  } = merge({}, defaults, options);

  // Make sure the `fix` option is activated
  ESLintOptions.fix = true;

  return [
    name,
    () => (
      source(src)
        .pipe(eslint(ESLintOptions))
        .pipe(dest(({ dirname }) => dirname))
        .pipe(notify({
          title: `gulp ${name}`,
          message: ({ relative }) => (
            `The file ${relative} has been formatted with ESLint.`
          ),
        }))
    ),
  ];
};
