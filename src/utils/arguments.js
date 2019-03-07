import commandLineArgs from 'command-line-args';

/** @type {Array} All available arguments definitions */
const optionsDefintions = [
  {
    name: 'diff-only',
    alias: 'd',
    type: Boolean,
  },
  {
    name: 'quiet',
    alias: 'q',
    type: Boolean,
    defaultOption: false,
  },
];

// Export the parsed command line options
export default commandLineArgs(optionsDefintions, {
  partial: true,
  stopAtFirstUnknown: false,
  camelCase: true,
});
