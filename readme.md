# Gulp Configuration

A small helper to simplify the usage of Gulp to compile, lint, fix, compress and live-reload SCSS and JS files.

## Usage

Install the package with your favorite package manager:

```bash
yarn add --dev @studiometa/gulp-config
# or 
npm install --save-dev @studiometa/gulp-config
```

Create a file named `gulpfile.js` at the root of your project with the following:

```js
const config = require('@studiometa/gulp-config');

module.exports = config.create({
  styles: {
    src: './tests/src/styles',
    dist: './tests/dist/styles',
  },
  scripts: {
    src: './tests/src/scripts/**/*.js',
    dist: './tests/dist/scripts/',
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

## Options

The main options object can contain 3 different keys : [`styles`](#styles), [`scripts`](#scripts) and [`server`](#server). If one of them is omitted, the corresponding tasks won't be created. Find below the description and default values for each configuration object.

### Styles

#### `styles.src` _(String)_

The path to your SCSS files. 

```js
{
  src: 'src/styles',
}
```

#### `styles.glob` _(String)_

The glob to match your SCSS files.

```js
{
  glob: '**/*.scss',
}
```

#### `styles.dist` _(String)_

The path where the compiled CSS files are saved.
```js
{
  dist: 'dist/styles',
}
```

#### `styles.postCssPlugins` _(Array)_

A list of PostCSS plugins to use.

```js
{
  postCssPlugins: [ 
    autoprefixer(),
  ],
}
```

#### `styles.cleanCssOptions` _(Object)_

Options for the [`gulp-clean-css`](https://github.com/scniro/gulp-clean-css#options) plugin.

```js
{ 
  cleanCssOptions: {
    level: 1 
  },
}
```

#### `styles.gulpSassOptions` _(Object)_

Options for the [`gulp-sass`](https://github.com/dlmanning/gulp-sass#options) plugin. It uses the [`node-sass-magic-importer`](https://github.com/maoberlehner/node-sass-magic-importer) by default to resolve `@import` in your SCSS files.

```js
{
  importer: require('node-sass-magic-importer')({
    disableImportOnce: true,
  }),
}
```

#### `styles.styleLintOptions` _(Object)_

Options for the [`gulp-stylelint`](https://github.com/olegskl/gulp-stylelint#options) plugin. This configuration is used in both the `styles-lint` and `styles-format` tasks, with the `fix` options automatically set to `true` for the `styles-format` task.

```js
{
  failAfterError: false,
  reporters: [
    {
      formatter: 'string',
      console: true,
    },
  ],
}
```

### Scripts

#### `scripts.src` _(String)_

The path to your JS files.

```js
{
  src: 'src/scripts',
}
```

#### `scripts.glob` _(String)_

The glob to match your JS files.

```js
{
  glob: '**/*.js',
}
```

#### `scripts.dist` _(String)_

The path where the uglified and/or compiled JS files are saved.

```js
{
  dist: 'dist/scripts',
}
```

#### `scripts.uglifyOptions` _(Object)_

Options for the [`gulp-uglify`](https://github.com/terinjokes/gulp-uglify/#options) plugin.

```js
{
  uglifyOptions: {
    compress: {
      drop_console: true,
    },
  },
}
```

#### `scripts.uglifyErrorHandler` _(Function)_

Handler for the `error` event of the `gulp-uglify` plugin.

```js
{
  uglifyErrorHandler: ({ message }) => {
    console.log(message);
    notify.onError({ message });
  },
}
```

#### `scripts.ESLintOptions` _(Object)_

Options for the `gulp-eslint` plugin. Check for a `.eslintrc` file in your project by default. This configuration object is used in both the `scripts-lint` and `scripts-format` tasks, with the `fix` options automatically set to `true` for the `scripts-format` task.

```js
{
  ESLintOptions: {
    useEslintrc: true,
  },
}
```

### Server

You can simply enable the server task by setting the `server` key to `true` in your configuration. But you might want to set some more detailed configuration with extra watchers for example.

#### `server.browserSyncOptions` _(Object)_

Options for the [`browser-sync`]() plugin. 

```js
{
  browserSyncOptions: {
    watchTask: true,
    open: false,
    proxy: process.env.APP_HOST || false,
  },
}
```

> If your project is using a `.env` file, you can load it in your `gulpfile.js` file with the [`dotenv`](https://github.com/motdotla/dotenv) package and set a variable named `APP_HOST` to take advantage of the default browser-sync configuration. The server setup by browser-sync will then be proxied on the port 3000 of the host you defined, you will have live-reload enabled by accessing `http://APP_HOST:3000`.

#### `server.watchers` _(Array)_

A list of files you want to watch when the server is running. It allows you to execute custom tasks and callbacks when the given files or glob changes. By default, the build tasks (`styles-build` and `scripts-build`) and the lint tasks (`styles-lint` and `scripts-build`) are triggered when any of the files found in the `styles.src` and `scripts.src` paths changes. 

The following example will watch for changes in your HTML files and trigger a browser-sync reload and execute the `styles-build` task:

```js
{
  files: [ '**/*.html' ],
  options: {
    cwd: 'path/to/your/files',
  },
  callbacks: [
    () => browserSync.reload(),
  ],
  tasks: [
    'styles-build',
  ],
}
```


## Contributing

See the "[Features](https://github.com/studiometa/gulp-config/projects/2)" project for a list of things to do. This project's branches are managed with [Git Flow](https://github.com/petervanderdoes/gitflow-avh) , every feature branch must be merged into develop via a pull request.
