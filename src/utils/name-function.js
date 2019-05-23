/**
 * Create a named function from a given name and anonymous function
 * @param  {String}   name The name of the function
 * @param  {Function} fn   The function to name
 * @return {Function}      A new named function
 */
export default (name, fn) => {
  Object.defineProperty(fn, 'name', { value: name, writable: false });
  return fn;
};
