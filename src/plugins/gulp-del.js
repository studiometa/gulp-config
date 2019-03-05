import log from 'fancy-log';
import through from 'through2';
import PluginError from 'plugin-error';
import del from 'del';
import colors from 'gulp-cli/lib/shared/ansi';

/**
 * Delete the given path
 * @return {Vinyl}
 */
export default function (path) {
  log(`Deleting ${colors.magenta(path)}...`);

  try {
    del(path);
  } catch (err) {
    if (err) {
      throw new PluginError('gulp-del', err);
    }
  }

  log(`${colors.magenta(path)} has been successfully deleted`);

  return through.obj((file, enc, cb) => cb());
}
