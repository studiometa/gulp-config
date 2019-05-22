import { src as source, dest } from 'gulp';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import gulpUglify from 'gulp-uglify';
import notify from 'gulp-notify';
import babel from 'gulp-babel';
import gif from 'gulp-if';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import errorHandler from '../utils/error-handler';
import cache from '../plugins/gulp-cache';
import diff from '../plugins/gulp-diff';
import noop from '../plugins/gulp-noop';
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
    uglify: true,
    uglifyOptions: {
      compress: {
        /* eslint-disable-next-line */
        drop_console: true,
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
    hooks: {
      beforeDiff: noop,
      afterDiff: noop,
      beforeCache: noop,
      afterCache: noop,
      beforeEsModules: noop,
      afterEsModules: noop,
      beforeSourceMapsInit: noop,
      afterSourceMapsInit: noop,
      beforeBabel: noop,
      afterBabel: noop,
      beforeUglify: noop,
      afterUglify: noop,
      beforeSourceMapsWrite: noop,
      afterSourceMapsWrite: noop,
      beforeDest: noop,
      afterDest: noop,
      beforeNotify: noop,
      afterNotify: noop,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    src,
    glob,
    dist,
    uglify,
    uglifyOptions,
    es6,
    babelOptions,
    esModules,
    webpackOptions,
    hooks,
  } = merge({}, defaults, options);

  return [
    name,
    () =>
      source(glob, { cwd: src })
        .pipe(hooks.beforeDiff())
        .pipe(diff(args.diffOnly))
        .pipe(hooks.afterDiff())
        .pipe(hooks.beforeCache())
        .pipe(cache(name))
        .pipe(hooks.afterCache())
        .pipe(hooks.beforeEsModules())
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
        .pipe(hooks.afterEsModules())
        .pipe(hooks.beforeSourceMapsInit())
        .pipe(sourcemaps.init())
        .pipe(hooks.afterSourceMapsInit())
        .pipe(hooks.beforeBabel())
        .pipe(gif(es6 && !esModules, babel(babelOptions)))
        .pipe(hooks.afterBabel())
        .pipe(hooks.beforeUglify())
        .pipe(gif(uglify, gulpUglify(uglifyOptions).on('error', errorHandler)))
        .pipe(hooks.afterUglify())
        .pipe(hooks.beforeSourceMapsWrite())
        .pipe(sourcemaps.write('maps'))
        .pipe(hooks.afterSourceMapsWrite())
        .pipe(hooks.beforeDest())
        .pipe(dest(dist))
        .pipe(hooks.afterDest())
        .pipe(hooks.beforeNotify())
        .pipe(
          gif(
            !args.quiet,
            notify({
              title: `gulp ${name}`,
              message: ({ relative }) =>
                `The file ${relative} has been updated.`,
            })
          )
        )
        .pipe(hooks.afterNotify()),
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
      source(glob, { cwd: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(eslint.format())
        .pipe(gif(args.failAfterError, eslint.failAfterError())),
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
      source(glob, { cwd: src })
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
