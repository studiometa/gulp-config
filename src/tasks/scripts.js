import { src as source, dest } from 'gulp';
import { extname } from 'path';
import merge from 'lodash/merge';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import gulpUglify from 'gulp-uglify';
import notify from 'gulp-notify';
import babel from 'gulp-babel';
import gif from 'gulp-if';
import filter from 'gulp-filter';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import { mergeConfig, findEntries } from '@studiometa/webpack-config';
import errorHandler from '../utils/error-handler';
import cache from '../plugins/gulp-cache';
import diff from '../plugins/gulp-diff';
import noop from '../plugins/gulp-noop';
import log from '../plugins/gulp-log';
import args from '../utils/arguments';
import nameFunction from '../utils/name-function';
import logFilesUpdate from '../utils/log-files-update';

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
    glob: ['**/*.js'],
    dist: 'src/scripts',
    uglify: true,
    uglifyOptions: {
      compress: {
        /* eslint-disable-next-line */
        drop_console: true,
      },
    },
    es6: true,
    babelOptions: {
      presets: ['@babel/preset-env'],
    },
    esModules: true,
    webpackOptions: {},
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

  const webpackGlob = Array.isArray(glob)
    ? [...glob, '!**/_*.js']
    : [glob, '!**/_*.js'];
  const webpackConfig = mergeConfig(
    {
      entry: findEntries(webpackGlob, src),
      output: {
        path: dist,
      },
    },
    webpackOptions
  );

  if (esModules) {
    webpack(webpackConfig);
  }

  return [
    nameFunction(name, () =>
      source(glob, { cwd: src, base: src })
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
            webpackStream(webpackConfig, webpack, (err, stats) => {
              console.log(
                stats.toString({
                  ...webpackConfig.stats,
                  colors: true,
                })
              );
              console.log();
            }).on('error', errorHandler)
          )
        )
        .pipe(hooks.afterEsModules())
        .pipe(hooks.beforeSourceMapsInit())
        .pipe(gif(!esModules, sourcemaps.init()))
        .pipe(hooks.afterSourceMapsInit())
        .pipe(hooks.beforeBabel())
        .pipe(gif(es6 && !esModules, babel(babelOptions)))
        .pipe(hooks.afterBabel())
        .pipe(hooks.beforeUglify())
        .pipe(
          gif(
            uglify && !esModules,
            gulpUglify(uglifyOptions).on('error', errorHandler)
          )
        )
        .pipe(hooks.afterUglify())
        .pipe(hooks.beforeSourceMapsWrite())
        .pipe(gif(!esModules, sourcemaps.write('maps')))
        .pipe(hooks.afterSourceMapsWrite())
        .pipe(hooks.beforeDest())
        .pipe(dest(dist))
        .pipe(hooks.afterDest())
        .pipe(hooks.beforeNotify())
        .pipe(filter(file => extname(file.path) !== '.map'))
        .pipe(
          gif(
            !args.quiet,
            notify(
              JSON.parse(
                JSON.stringify({
                  title: `gulp ${name}`,
                  message: 'The file <%= file.relative %> has been updated.',
                })
              )
            )
          )
        )
        .pipe(gif(args.quiet && !esModules, log(null, logFilesUpdate(name))))
        .pipe(hooks.afterNotify())
    ),

    nameFunction(`${name}-cache`, () =>
      source(glob, { cwd: src, base: src })
        .pipe(hooks.beforeDiff())
        .pipe(diff(args.diffOnly))
        .pipe(hooks.afterDiff())
        .pipe(hooks.beforeCache())
        .pipe(cache(name))
        .pipe(hooks.afterCache())
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
    glob: ['**/*.js'],
    ESLintOptions: {
      useEslintrc: true,
    },
  };

  /** @type {Object} Merge the defaults and custom options */
  const { src, glob, ESLintOptions } = merge({}, defaults, options);

  return [
    nameFunction(name, () =>
      source(glob, { cwd: src, base: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
        .pipe(eslint(ESLintOptions))
        .pipe(eslint.format())
        .pipe(gif(args.failAfterError, eslint.failAfterError()))
    ),

    nameFunction(`${name}-cache`, () =>
      source(glob, { cwd: src, base: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
    ),
    {
      src,
      glob,
      ESLintOptions,
    },
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
    glob: ['**/*.js'],
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
    nameFunction(name, () =>
      source(glob, { cwd: src, base: src })
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
        )
    ),
    nameFunction(`${name}-cache`, () =>
      source(glob, { cwd: src, base: src })
        .pipe(diff(args.diffOnly))
        .pipe(cache(name))
    ),
    { src, glob, ESLintOptions },
  ];
};
