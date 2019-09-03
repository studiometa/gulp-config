import log from 'fancy-log';
import es from 'event-stream';
import colors from 'gulp-cli/lib/shared/ansi';

/**
 * Log the given logger
 *
 * @param  {Function|String} logger A function that returns a string to log
 * @return {Vinyl}
 */
export default function(onWrite, onEnd) {
  const files = [];
  return es.through(
    /* eslint-disable-next-line */
    function write(file) {
      if (typeof onWrite === 'function') {
        const msg = onWrite(file, colors);
        if (msg) {
          log(msg);
        }
      } else if (typeof onWrite === 'string') {
        log(onWrite);
      }
      files.push(file);
    },
    function end() {
      if (typeof onEnd === 'function') {
        const msg = onEnd(files, colors);
        if (msg) {
          log(msg);
        }
      } else if (typeof onEnd === 'string') {
        log(onEnd);
      }
      this.emit('end');
    }
  );
}
