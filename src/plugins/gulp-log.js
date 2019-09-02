import log from 'fancy-log';
import through from 'through2';
import colors from 'gulp-cli/lib/shared/ansi';

/**
 * Log the given logger
 *
 * @param  {Function|String} logger A function that returns a string to log
 * @return {Vinyl}
 */
export default function(logger) {
  return through.obj((file, enc, cb) => {
    if (typeof logger === 'function') {
      log(logger(file, colors));
    } else if (typeof logger === 'string') {
      log(logger);
    }

    cb();
  });
}
