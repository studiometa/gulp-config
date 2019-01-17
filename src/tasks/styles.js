import gulp from 'gulp';
import sass from 'gulp-sass';
import cleanCss from 'gulp-clean-css';
import browserSync from 'browser-sync';
import notify from 'gulp-notify';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import merge from 'lodash/merge';
import styleLint from 'gulp-stylelint';

/**
 * Create the styles compilation task
 *
 * @param  {Object} options All the options, see the defaults for all available
 *                          possibilities
 * @return {String}         The task's name
 */
export const createStylesBuilder = (options) => {
  /** @type {String} The task's name */
  const taskName = 'styles-build';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/styles',
    dist: 'dist/styles',
    postcssPlugins: [
      autoprefixer(),
    ],
    cleanCssOptions: {
      level: 1,
    },
  };

  // Merge custom options with default options
  const {
    src,
    dist,
    postcssPlugins,
    cleanCssOptions,
  } = merge({}, defaults, options);

  gulp.task(taskName, () => (
    gulp.src(src)
      .pipe(sourcemaps.init())
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(postcss(postcssPlugins))
      .pipe(cleanCss(cleanCssOptions))
      .pipe(sourcemaps.write('map'))
      .pipe(gulp.dest(dist))
      .pipe(browserSync.stream())
      .pipe(notify({
        title: `gulp ${taskName}`,
        message: 'The file <%= file.relative %> has been updated.',
      }))
  ));

  return taskName;
};


/**
 * Create the style linter task
 *
 * @param  {Object} options All the options, see the defaults object  below for
 *                          for all available possibilities
 * @return {String}         The task's name
 */
export const createStylesLinter = (options) => {
  /** @type {String} The task's name */
  const taskName = 'styles-lint';

  /** @type {Object} The linting task default options */
  const defaults = {
    src: 'src/styles',
    styleLintOptions: {
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    },
  };

  // Merge custom and default options
  const {
    src,
    styleLintOptions,
  } = merge({}, defaults, options);

  gulp.task(taskName, () => (
    gulp.src(src)
      .pipe(styleLint(styleLintOptions))
  ));

  return taskName;
};
