# Gulp Configuration

## Usage

Install the package with your favorite package manager:

```bash
yarn add --dev @studiometa/gulp-config
# or 
npm install --save-dev @studiometa/gulp-config
```

Create a file named `gulpfile.babel.js` at the root of your project:

```js
import { resolve } from 'path';
import create from '@studiometa/gulp-config';

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
```

You will then have the following tasks available:

- `gulp styles-build`
- `gulp styles-lint`
- `gulp styles-format`
- `gulp scripts-build`
- `gulp scripts-lint`
- `gulp scripts-format`
- `gulp serve`

The `gulp` default tasks will execute the build and lint tasks before the server one.

The server tasks watch automatically for changes in the styles and scripts files to re-trigger the build and lint tasks.

## Contributing

See the "[Features](https://github.com/studiometa/gulp-config/projects/2)" project for a list of things to do. This project's branches are managed with [Git Flow](https://github.com/petervanderdoes/gitflow-avh) , every feature branch must be merged into develop via a pull request.
