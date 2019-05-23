/**
 * Get a list of globs to ignore from a list of globs
 *
 * @param  {Array|String} globs The glob(s) to filter
 * @return {Array}              A list of glob to be ignored
 */
export default globs =>
  Array.isArray(globs)
    ? globs.reduce(
        (ignoredGlobs, glob) =>
          glob.startsWith('!')
            ? [...ignoredGlobs, glob.substring(1)]
            : ignoredGlobs,
        []
      )
    : [];
