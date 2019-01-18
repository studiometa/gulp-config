import { resolve } from 'path';
import create from './src';

module.exports = create({
  styles: {
    src: resolve('./tests/src/styles/**/*.scss'),
    dist: resolve('./tests/dist/styles'),
  },
  scripts: {
    src: resolve('./tests/src/scripts/**/*.js'),
    dist: resolve('./tests/dist/scripts/'),
  },
  server: true,
});
