import es from 'event-stream';
import sassGraph from 'sass-graph';
import { resolve } from 'path';
import vinylFs from 'vinyl-fs';
import PluginError from 'plugin-error';

/**
 * Get the files paths which imports the given file
 *
 * @param  {Object} graph   A sass-graph object
 * @param  {Vinyl}  file    The current file to test
 * @param  {Array}  parents A list of existing parents to complete
 * @return {Array}          A list of files importing the given file
 */
function getFileParents(graph, filePath, parents = []) {
  if (!(filePath in graph)) {
    return parents;
  }

  const { importedBy } = graph[filePath];

  return importedBy.reduce((acc, path) => {
    const reducedPaths = getFileParents(graph, path, []);
    return [path, ...reducedPaths, ...acc];
  }, parents);
}

/**
 * Gulp Sass plugin to resolve multiple file inheritance
 *
 * @param  {Object} options Options for the plugin
 * @return {Stream}         The current stream
 */
export default function gulpSassInheritance(options = {}) {
  if (!options.dir) {
    throw new PluginError(
      'gulp-sass-inheritance',
      'You must specify the `dir` options.'
    );
  }

  const dir = resolve(options.dir);
  const graph = sassGraph.parseDir(dir).index || {};
  const files = [];

  return es.through(
    /* eslint-disable-next-line */
    function write(file) {
      if (file && file.contents.length > 0) {
        files.push(file);
      }
    },
    function end() {
      if (files.length <= 0) {
        return this.emit('end');
      }

      const filePaths = new Set();

      files.forEach(file => {
        filePaths.add(file.path);
        const parents = getFileParents(graph, file.path);

        if (options.debug) {
          console.log(file.path);
          parents.forEach((parent, index) => {
            const tree = index < parents.length - 1 ? '├─' : '└─';
            console.log(`${tree} ${parent}`);
          });
        }
        parents.forEach(parent => filePaths.add(parent));
      });

      if (filePaths.length <= 0) {
        return this.emit('end');
      }

      vinylFs
        .src([...filePaths], { cwd: dir })
        .pipe(
          es.through(file => this.emit('data', file), () => this.emit('end'))
        );

      return this;
    }
  );
}
