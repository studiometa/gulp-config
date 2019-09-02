const { resolve } = require('path');
const { create } = require('./dist');

module.exports = create({
  styles: {
    src: resolve('./tests/src/styles'),
    dist: resolve('./tests/dist/styles'),
  },
  scripts: {
    src: resolve('./tests/src/scripts'),
    dist: resolve('./tests/dist/scripts'),
  },
  server: true,
  php: {
    src: resolve('./tests/src/php'),
    glob: ['**/*.php', '!vendor/**'],
    PHPCSOptions: {
      bin: 'phpcs',
    },
  },
});
