const { create } = require('./dist');

module.exports = create({
  styles: {
    src: './tests/src/styles',
    dist: './tests/dist/styles',
  },
  scripts: {
    src: './tests/src/scripts',
    dist: './tests/dist/scripts',
  },
  server: true,
});
