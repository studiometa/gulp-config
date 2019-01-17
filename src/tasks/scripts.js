import gulp from 'gulp';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import notify from 'gulp-notify';

/**
 * Create the `scripts-build` Gulp task
 * @param  {Object} options The options for the builder task, see the default
 *                          object defined below for all available options
 * @return {String}         The task's name
 */
export const createScriptsBuilder = (options) => {
  /** @type {String} The task's name */
  const taskName = 'scripts-build';

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

  gulp.task(taskName, () => (
    gulp.src(src)
      .pipe(sourcemaps.init())
      .pipe(uglify(uglifyOptions).on('error', uglifyErrorHandler))
      .pipe(sourcemaps.write('maps'))
      .pipe(gulp.dest(dist))
      .pipe(notify({
        title: `gulp ${taskName}`,
        message: 'The file <%= file.relative %> has been updated.',
      }))
  ));

  return taskName;
};


/**
 * Create the `scripts-lint` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object defined below for all available options
 * @return {String}         The task's name
 */
export const createScriptsLinter = (options) => {
  /** @type {String} The task's name */
  const taskName = 'scripts-lint';

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

  gulp.task(taskName, () => (
    gulp.src(src)
      .pipe(eslint(ESLintOptions))
  ));

  return taskName;
};


/**
 * Create the `scripts-format` Gulp task
 * @param  {Object} options The options for the linter task, see the default
 *                          object below for all available options
 * @return {String}         The task's name
 */
export const createScriptsFormatter = (options) => {
  /** @type {String} The task's name */
  const taskName = 'scripts-format';
  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/scripts',
    dist: 'src/scripts',
    ESLintOptions: {
      useEslintrc: true,
      fix: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    dist,
    ESLintOptions,
  } = merge({}, defaults, options);

  // Make sure the `fix` option is activated
  ESLintOptions.fix = true;

  gulp.task(taskName, () => (
    gulp.src(src)
      .pipe(eslint(ESLintOptions))
      .pipe(gulp.dest(dist))
  ));

  return taskName;
};
