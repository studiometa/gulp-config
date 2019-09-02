import * as error from './error';

export default {
  error,
  async foo() {
    window.alert('foo');
    this.debug = await import(/* webpackChunkName: "debug" */'./utils/_debug');
  },
  baz() {
    this.bar = 'bar';
    $(document.body).addClass(this.bar);
  },
};
