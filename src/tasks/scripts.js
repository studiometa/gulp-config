import { src as source, dest } from 'gulp';
import { resolve } from 'path';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import notify from 'gulp-notify';
import cache from 'gulp-cached';
import babel from 'gulp-babel';
import gif from 'gulp-if';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import errorHandler from '../utils/error-handler';
import diff from '../plugins/gulp-diff';
import args from '../utils/arguments';

/**
 * Create the `scripts-build` Gulp task
 *
 * @param  {Object} options The options for the builder task, see the default
 *                          object defined below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createScriptsBuilder = options => {
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
        drop_console: true
      },
    },
    es6: false,
    babelOptions: {
      presets: ['@babel/preset-env'],
    },
    esModules: false,
    webpackOptions: {
      mode: 'production',
      devtool: false,
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
            },
          },
        ],
      },
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    glob,
    dist,
    uglifyOptions,
    es6,
    babelOptions,
    esModules,
    webpackOptions,
  } = merge({}, defaults, options);

  return [
    name,
    () =>
      source(resolve(src, glob))
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(
          gif(
            es6 && esModules,
            webpackStream(webpackOptions, webpack, (err, stats) => {
              const { errors, warnings } = stats.compilation;
              [...errors, ...warnings].forEach(errorHandler.bind(this));
            }).on('error', function err() {
              this.emit('end');
            })
          )
        )
        .pipe(sourcemaps.init())
        .pipe(gif(es6 && !esModules, babel(babelOptions)))
        .pipe(uglify(uglifyOptions).on('error', errorHandler))
        .pipe(sourcemaps.write('maps'))
        .pipe(dest(dist))
        .pipe(
          gif(
            !args.quiet,
            notify({
              title: `gulp ${name}`,
              message: ({ relative }) =>
                `The file ${relative} has been updated.`,
            })
          )
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
export const createScriptsLinter = options => {
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
  const { src, glob, ESLintOptions } = merge({}, defaults, options);

  return [
    name,
    () =>
      source(resolve(src, glob))
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(eslint.format()),
  ];
};

/**
 * Create the `scripts-format` Gulp task
 *
 * @param  {Object} options The options for the linter task, see the default
 *                          object below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createScriptsFormatter = options => {
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
  const { src, glob, ESLintOptions } = merge({}, defaults, options);

  // Make sure the `fix` option is activated
  ESLintOptions.fix = true;

  return [
    name,
    () =>
      source(resolve(src, glob))
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(dest(src))
        .pipe(
          gif(
            !args.quiet,
            notify({
              title: `gulp ${name}`,
              message: ({ relative }) =>
                `The file ${relative} has been formatted with ESLint.`,
            })
          )
        ),
  ];
};
