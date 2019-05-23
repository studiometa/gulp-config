/**
 * Sort an array of object by their given key value
 *
 * @param  {String} key   The key to compare
 * @return {Function}     A sorting function
 */
export default key => (a, b) => {
  const val1 = a[key].toUpperCase();
  const val2 = b[key].toUpperCase();

  if (val1 < val2) {
    return -1;
  }

  if (val1 > val2) {
    return 1;
  }

  return 0;
};
