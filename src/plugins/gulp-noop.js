import through from 'through2';

/**
 * A no impact function to be piped through
 * @return {Vinyl}
 */
export default function noop() {
  return through.obj();
}
