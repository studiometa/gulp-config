/* eslint-disable */
import { createStylesTask, createStylesLint } from './tasks/styles';


export default (options) => {
  console.log(options);

  if (options.hasOwnProperty('styles')) {
    createStylesTask(options.styles);
    createStylesLint(options.styles);
  }
};
