import { resolve } from 'path';
import register from './src';

register({
  styles: {
    src: resolve('./tests/src/styles/*'),
    dist: resolve('./tests/dist/styles'),
  },
  scripts: {
    src: resolve('./tests/src/scripts/*'),
    dist: resolve('./tests/dist/scripts/'),
  },
});
