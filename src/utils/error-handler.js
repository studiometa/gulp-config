import PrettyError from 'pretty-error';
import notifier from 'node-notifier';

const prettyError = new PrettyError();
prettyError.skipNodeFiles();

/**
 * Format a GulpUglifyError to display the origin of the error
 * @param  {GulpUglifyError} error A gulp-uglify error object
 * @return {GulpUglifyError}       A formatted gulp-uglify error
 */
const formatUglifyError = error => {
  const { message, line } = error.cause;

  const formatted = `
${error.fileName}
Error: ${message}
       on line ${line} of ${error.fileName}
`;

  error.originalMessage = error.message;
  error.message = formatted;

  return error;
};

/**
 * Format a given error with the correct formatter
 *
 * @param  {Error} error The error to format
 * @return {Error}       The formatted error
 */
const formatError = error =>
  error && 'cause' in error ? formatUglifyError(error) : error;

/**
 * Custom error handler
 *
 * @param  {Error} error The error to display
 * @return {void}
 */
export default function errorHandler(error) {
  const formatted = formatError(error);
  prettyError.render(formatted, true);
  notifier.notify({
    title: 'Error',
    message: formatted.message,
  });

  return this ? this.emit('end') : null;
}
