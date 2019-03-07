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
 * Get a list of file from executing a git command
 * @param  {String} cmd The command to execute
 * @return {Array}      A list of file paths
 */
function getFilesFromGitCommand(cmd) {
  return execSync(cmd, { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.length > 0);
}

/**
 * Filter file by their diff status
 * @return {Vinyl}
 */
export default function diff(isDiffOnly = false) {
  const changedFiles = getFilesFromGitCommand('git diff --name-only');
  const newFiles = getFilesFromGitCommand(
    'git ls-files --others --exclude-standard'
  );

  const formattedChangedFiles = changedFiles
    .map(file => `modified:   ${file}`)
    .join('\n    ');
  const formattedNewFiles = newFiles
    .map(file => `added:      ${file}`)
    .join('\n    ');

  if (isDiffOnly) {
    if (changedFiles.length > 0 || newFiles.length > 0) {
      console.log('');
      console.log(
        `    The '${colors.green(
          '--diff-only'
        )}' option is enabled, the task will only`
      );
      console.log('    process the following matching modified files:');
      console.log('');

      if (changedFiles.length > 0) {
        console.log(`    ${colors.red(formattedChangedFiles)}`);
      }

      if (newFiles.length > 0) {
        console.log(`    ${colors.red(formattedNewFiles)}`);
      }

      console.log('');
    } else {
      console.log('');
      console.log(
        `    The '${colors.green(
          '--diff-only'
        )}' option is enabled, but you do not have`
      );
      console.log(
        '    any modified files in your repository, nothing will happen.'
      );
      console.log('');
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

      const hasChanged = fileHasChanged(file, [...changedFiles, ...newFiles]);

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
