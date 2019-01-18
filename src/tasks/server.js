import { series, watch } from 'gulp';
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
      const watcher = watch(files, options, series(...tasks));
      // Register all defined `callbacks` for the watcher
      registerWatcherCallbacks(watcher, callbacks);
    });
};


/**
 * Create the `serve` Gulp task
 *
 * @param  {Object} options The options for the server task, see the default
 *                          object below for all available options
 * @return {Array}          Array of the name and function of the task
 */
export const createServer = (options) => {
  /** @type {String} The task's name */
  const name = 'serve';

  /** @type {Object} Defaults options */
  const defaults = {
    browserSyncOptions: {
      watchTask: true,
      open: false,
      proxy: 'HOST' in process.env ? process.env.HOST : false,
    },
    watchers: [],
  };

  /** @type {Object} Merge the defaults and custom options */
  const {
    browserSyncOptions,
    watchers,
  } = merge({}, defaults, options);

  return [
    name,
    () => {
      // Init the browser sync server
      browserSync.init(browserSyncOptions);
      // Register all defined watcher
      registerWatchers(watchers);
    },
  ];
};


// Export the only exported function by default
export default createServer;
