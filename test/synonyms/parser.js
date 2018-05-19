const parser = require('../../synonyms/parser');

module.exports.tests = {};

module.exports.tests.load = function(test, common) {
  test('load: invalid file', function(t) {
    t.throws(() => parser('/invalid/path'), /file not found/, 'invalid file');
    t.throws(() => parser('/tmp'), /file not found/, 'directory');
    t.end();
  });
};

module.exports.tests.parse = function(test, common) {
  test('empty file', function(t) {
    t.deepEqual( parser.parse(``), [] );
    t.end();
  });
  test('comments and newlines', function(t) {
    t.deepEqual( parser.parse(`

# foo bar

# baz

`), [] );
    t.end();
  });
  test('lowercase', function(t) {
    t.deepEqual( parser.parse(`
Foo => BaR
Foo,Bar,Baz
`), [
  'foo => bar',
  'foo,bar,baz'
] );
    t.end();
  });
  test('squash spaces', function(t) {
    t.deepEqual( parser.parse(`
foo  bar => foo
Foo  Bar, Foo
`), [
  'foo bar => foo',
  'foo bar,foo'
] );
    t.end();
  });
  test('trim commas', function(t) {
    t.deepEqual( parser.parse(`
,foo => bar
,foo, bar,
`), [
  'foo => bar',
  'foo,bar'
] );
    t.end();
  });
  test('trim around commas', function(t) {
    t.deepEqual( parser.parse(`
 ,foo, bar , baz
`), [
  'foo,bar,baz'
] );
    t.end();
  });
  test('trim around arrows', function(t) {
    t.deepEqual( parser.parse(`
  foo  =>   bar
`), [
  'foo => bar'
] );
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('synonyms parser: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
