import { src as source, dest } from 'gulp';
import { resolve } from 'path';
import sass from 'gulp-sass';
import cleanCss from 'gulp-clean-css';
import browserSync from 'browser-sync';
import notify from 'gulp-notify';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import merge from 'lodash/merge';
import styleLint from 'gulp-stylelint';
import sassInheritance from 'gulp-sass-multi-inheritance';
import cache from 'gulp-cached';
import filter from 'gulp-filter';
import magicImporter from 'node-sass-magic-importer';

/**
 * Create the styles compilation task
 *
 * @param  {Object} options All the options, see the defaults for all available
 *                          possibilities
 * @return {Array}          Array of the name and function of the task
 */
export const createStylesBuilder = (options) => {
  /** @type {String} The task's name */
  const name = 'styles-build';

  /** @type {Object} The defaults options */
  const defaults = {
    src: 'src/styles',
    glob: '**/*.scss',
    dist: 'dist/styles',
    postcssPlugins: [
      autoprefixer(),
    ],
    cleanCssOptions: {
      level: 1,
    },
    gulpSassOptions: {
      importer: magicImporter({
        disableImportOnce: true,
      }),
    },
  };

  // Merge custom options with default options
  const {
    src,
    glob,
    dist,
    postcssPlugins,
    cleanCssOptions,
    gulpSassOptions,
  } = merge({}, defaults, options);

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(sassInheritance({ dir: src }))
        .pipe(filter(file => (
          !/\/_/.test(file.path) || !/^_/.test(file.relative)
        )))
        .pipe(sourcemaps.init())
        .pipe(sass.sync(gulpSassOptions).on('error', sass.logError))
        .pipe(postcss(postcssPlugins))
        .pipe(cleanCss(cleanCssOptions))
        .pipe(sourcemaps.write('map'))
        .pipe(dest(dist))
        .pipe(browserSync.stream())
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
 * Create the style linter task
 *
 * @param  {Object} options All the options, see the defaults object  below for
 *                          for all available possibilities
 * @return {Array}          Array of the name and function of the task
 */
export const createStylesLinter = (options) => {
  /** @type {String} The task's name */
  const name = 'styles-lint';

  /** @type {Object} The linting task default options */
  const defaults = {
    src: 'src/styles',
    glob: '**/*.scss',
    styleLintOptions: {
      failAfterError: false,
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    },
  };

  // Merge custom and default options
  const {
    src,
    glob,
    styleLintOptions,
  } = merge({}, defaults, options);

  // Make sure the `failAfterError` options is always false
  styleLintOptions.failAfterError = false;

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(styleLint(styleLintOptions))
    ),
  ];
};


/**
 * Create the style formatter task
 *
 * @param  {Object} options All the options, see the defaults object  below for
 *                          for all available possibilities
 * @return {Array}          Array of the name and function of the task
 */
export const createStylesFormatter = (options) => {
  /** @type {String} The task's name */
  const name = 'styles-format';

  /** @type {Object} The linting task default options */
  const defaults = {
    src: 'src/styles',
    glob: '**/*.scss',
    styleLintOptions: {
      failAfterError: false,
      fix: true,
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    },
  };

  // Merge custom and default options
  const {
    src,
    glob,
    styleLintOptions,
  } = merge({}, defaults, options);

  // Make sure the `failAfterError` options is always false
  styleLintOptions.failAfterError = false;

  // Make sure the `fix` options is always true
  styleLintOptions.fix = true;

  return [
    name,
    () => (
      source(resolve(src, glob))
        .pipe(cache(name))
        .pipe(styleLint(styleLintOptions))
        .pipe(dest(src))
        .pipe(notify({
          title: `gulp ${name}`,
          message: ({ relative }) => (
            `The file ${relative} has been formatted with StyleLint.`
          ),
        }))
    ),
  ];
};
