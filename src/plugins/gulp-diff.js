import through from 'through2';
import PluginError from 'plugin-error';
import { execSync } from 'child_process';

/**
 * Check if a file has changed or not
 *
 * @param  {Vinyl}   file         A vinyl file
 * @param  {Array}   filesChanged A list of changed files
 * @return {Boolean}              Whether the file has changed or not
 */
function fileHasChanged(file, filesChanged) {
  const currentFile = file.path.substr(process.cwd().length + 1);
  return filesChanged.indexOf(currentFile) > -1;
}

/**
 * Filter file by their diff status
 * @return {Vinyl}
 */
export default function diff() {
  const cmd = 'git diff --name-only';
  const filesChanged = execSync(cmd, { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.length > 0);

  return through.obj(
    /* eslint-disable-next-line */
    function(file, enc, cb) {
      if (file.isNull()) {
        cb(null, file);
        return;
      }

      if (file.isStream()) {
        const error = new PluginError('gulp-diff', 'Streaming not supported');
        cb(error);
        return;
      }

      try {
        if (fileHasChanged(file, filesChanged)) {
          this.push(file);
        }
      } catch (err) {
        this.emit('error', new PluginError('gulp-diff', err));
      }
      cb();
    }
  );
}
