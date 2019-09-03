import bytes from 'bytes';

const findlongestString = array =>
  array.reduce((a, b) => (a.length > b.length ? a : b));

export default taskName => (files, colors) => {
  if (!files.length) {
    return false;
  }

  const names = files.reduce((acc, file) => [...acc, file.relative], []);
  const namePad = findlongestString(names).length + 1;
  const coloredName = colors.blue(`gulp ${taskName}`);
  const filesOutput = files
    .map(({ relative, stat }) => {
      const size = bytes(stat.size, { unitSeparator: ' ' });
      const name = relative.padStart(namePad, ' ');
      return `${colors.green(name)}  ${size}\n`;
    })
    .join('');

  const columnTitles = [
    colors.white('Asset'.padStart(namePad, ' ')),
    colors.white('  Size'),
  ].join('');

  return `[${coloredName}]\n\n${columnTitles}\n${filesOutput}`;
};
