import PrettyError from 'pretty-error';
import notifier from 'node-notifier';

const prettyError = new PrettyError();

/**
 * Custom error handler
 *
 * @param  {Error} error The error to display
 * @return {void}
 */
export default function errorHandler(error) {
  notifier.notify({
    title: 'Error',
    message: error.message,
  });

  prettyError.render(error, true);

  return this.emit('end');
};
