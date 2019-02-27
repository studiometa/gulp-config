import log from 'fancy-log';
import through from 'through2';
import PluginError from 'plugin-error';
import { execSync } from 'child_process';
import colors from 'gulp-cli/lib/shared/ansi';

/**
 * Check if a file has changed or not
 *
 * @param  {Vinyl}   file         A vinyl file
 * @param  {Array}   changedFiles A list of changed files
 * @return {Boolean}              Whether the file has changed or not
 */
function fileHasChanged(file, changedFiles) {
  const currentFile = file.path.substr(process.cwd().length + 1);
  return changedFiles.indexOf(currentFile) > -1;
}

/**
 * Filter file by their diff status
 * @return {Vinyl}
 */
export default function diff(isDiffOnly = false) {
  const cmd = 'git diff --name-only';
  const changedFiles = execSync(cmd, { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.length > 0);

  const formattedChangedFiles = changedFiles.map(file => `modified:   ${file}`)
    .join('\n    ');

  if (isDiffOnly) {
    if (changedFiles.length > 0) {
      log(`

    The '${colors.green('--diff-only')}' option is enabled, the task will only
    process the following matching modified files:

    ${colors.red(formattedChangedFiles)}
      `);
    } else {
      log(`

    The '${colors.green('--diff-only')}' option is enabled, but you do not have
    any modified files in your repository, nothing will happen.
      `);
    }
  }

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

      const hasChanged = fileHasChanged(file, changedFiles);

      try {
        if ((isDiffOnly && hasChanged) || !isDiffOnly) {
          this.push(file);
        }
      } catch (err) {
        this.emit('error', new PluginError('gulp-diff', err));
      }
      cb();
    }
  );
}
