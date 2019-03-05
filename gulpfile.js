const { create } = require('./dist');

module.exports = create({
  styles: {
    src: './tests/src/styles',
    dist: './tests/dist/styles',
  },
  scripts: {
    src: './tests/src/scripts',
    dist: './tests/dist/scripts',
    es6: true,
    esModules: true,
    rollupOptions: {
      input: './tests/src/scripts/error.js',
      output: {
        format: 'iife',
        globals: {
          lodash: 'lodash',
          jquery: 'jquery',
        },
      },
    },
    webpackOptions: {
      entry: {
        esModules: './tests/src/scripts/es-modules.js',
      },
      output: {
        filename: 'bundle.js',
      },
    },
  },
  server: true,
});
