import gulp from 'gulp';
import browserSync from 'browser-sync';
import merge from 'lodash/merge';


/**
 * Regiester all the given callbacks on the given watcher
 *
 * @param  {GulpWatch} watcher   A Gulp watcher
 * @param  {Array}     callbacks A list of callbacks to register, defined by an
 *                               event name and its callback function
 * @return {void}
 */
const registerWatcherCallbacks = (watcher, callbacks) => {
  /** @type {Object} Definition of a watcher's callback object */
  const defaultCallback = {
    event: 'change',
    callback: () => {},
  };

  callbacks.map(callback => ({ ...defaultCallback, ...callback }))
    .forEach(({ event, callback }) => {
      watcher.on(event, callback);
    });
};


/**
 * Register all the watcher defined in the configuration
 *
 * @param  {Array} watchers A list of watcher, defined by the files to watch,
 *                          the options of the watcher, the tasks to execute and
 *                          the callbacks to call
 * @return {void}
 */
const registerWatchers = (watchers) => {
  /** @type {Object} Definition of a watcher object */
  const defaultWatcher = {
    files: [],
    options: {},
    tasks: [],
    callbacks: [],
  };

  watchers.map(watcher => ({ ...defaultWatcher, ...watcher }))
    .forEach(({
      files,
      options,
      tasks,
      callbacks,
    }) => {
      // Watch all `files`, with the given `options` and the `tasks` to execute
      const watcher = gulp.watch(files, options, tasks);
      // Register all defined `callbacks` for the watcher
      registerWatcherCallbacks(watcher, callbacks);
    });
};


/**
 * Create the `serve` Gulp task
 *
 * @param  {Object} options    The options for the server task, see the default
 *                             object below for all available options
 * @param  {Array}  buildTasks A list of builder tasks to execute before the
 *                             server starts
 * @param  {Array}  lintTasks  A list of linter tasks to executre before the
 *                             server starts
 * @return {String}            The task's name
 */
export const createServer = (options, buildTasks, lintTasks) => {
  /** @type {String} The task's name */
  const taskName = 'serve';

  /** @type {Object} Defaults options */
  const defaults = {
    beforeServe: [],
    browserSyncOptions: {
      watchTask: true,
      open: false,
      proxy: 'HOST' in process.env ? process.env.HOST : false,
    },
    watchers: [],
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    beforeServe,
    browserSyncOptions,
    watchers,
  } = merge({}, defaults, options);

  gulp.task(taskName, () => {
    // Init the browser sync serve
    browserSync.init(browserSyncOptions);
    // Register all defined watcher
    registerWatchers(watchers);
  });

  gulp.series.apply(null, [
    ...beforeServe,
    ...buildTasks,
    ...lintTasks,
    taskName,
  ]);

  return taskName;
};


// Export the only exported function by default
export default createServer;
