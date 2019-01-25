(function(window, document) {

  function Foo() {
    this.foo = 'bar';
    return this;
  }

  var foo = new Foo();

  console.log(foo);

})(window, document);
