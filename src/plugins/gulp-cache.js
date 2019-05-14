import through from 'through2';

/**
 * Gulp cache plugin which store vinyl files
 *
 * @param  {String}  name  The name of the cache
 * @param  {Boolean} debug Debug mode?
 * @return {void}
 */
function gulpCache(name, debug = false) {
  if (!gulpCache.caches[name]) {
    gulpCache.caches[name] = {};
  }

  return through.obj(
    /* eslint-disable-next-line */
    function(file, enc, cb) {
      if (file.isNull()) {
        return cb(null, file);
      }

      const hash = file.contents.toString();
      const cachedFile = gulpCache.caches[name][file.path];

      // Hit - ignore it
      if (cachedFile && cachedFile.hash === hash) {
        if (debug) {
          console.log('file has not changed', file.path);
        }
        return cb();
      }

      if (debug) {
        console.log('file has changed', file.path);
      }

      // Miss - add it and pass it through
      gulpCache.caches[name][file.path] = { hash, file };
      return cb(null, file);
    }
  );
}

/**
 * Cache object which will hold all cache domains
 * @type {Object}
 */
gulpCache.caches = {};

/**
 * Get an object by its key from the given cache
 *
 * @param  {String} name The name of the cache
 * @param  {String} key  The key of the object
 * @return {Vinyl}       The cached Vinyl file
 */
function getObject(name, key) {
  if (!gulpCache.caches[name]) {
    throw new Error(`No existing cache for "${name}".`);
  }

  if (!gulpCache.caches[name][key]) {
    throw new Error(`No existigin key for "${key}" in the cache "${name}".`);
  }

  return gulpCache.caches[name][key];
}
gulpCache.getObject = getObject;

export default gulpCache;
