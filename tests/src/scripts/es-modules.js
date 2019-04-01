import * as error from './error';

export default {
  error,
  foo() {
    window.alert('foo');
  },
  baz() {
    this.bar = 'bar';
    $(document.body).addClass(this.bar);
  },
};
