import { resolve } from 'path';
import register from './src';

register({
  styles: {
    src: resolve('./tests/src/styles/**/*.scss'),
    dist: resolve('./tests/dist/styles'),
  },
  scripts: {
    src: resolve('./tests/src/scripts/**/*.js'),
    dist: resolve('./tests/dist/scripts/'),
  },
  server: {
    watchers: [
      {
        files: [ '**/*.scss' ],
        options: {
          cwd: resolve('./tests/src/styles/'),
        },
        tasks: [
          'styles-lint',
          'styles-build',
        ],
      },
      {
        files: [ '**/*.js' ],
        options: {
          cwd: resolve('./tests/src/scripts/'),
        },
        tasks: [
          'scripts-lint',
          'scripts-build',
        ],
      },
    ],
  },
});
