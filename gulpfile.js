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
    webpackOptions: {
      entry: {
        esModules: './tests/src/scripts/es-modules.js',
      },
      output: {
        filename: '[name].js',
      },
    },
  },
  server: true,
  php: {
    src: './tests/src/php',
    glob: ['**/*.php', '!vendor/**'],
    PHPCSOptions: {
      bin: 'phpcs',
    },
  },
});
