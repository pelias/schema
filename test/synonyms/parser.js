const parser = require('../../synonyms/parser');

module.exports.tests = {};

module.exports.tests.load = (test, common) => {
  test('load: invalid file', t => {
    t.throws(() => parser('/invalid/path'), /file not found/, 'invalid file');
    t.throws(() => parser('/tmp'), /file not found/, 'directory');
    t.end();
  });
};

module.exports.tests.parse = (test, common) => {
  test('empty file', t => {
    t.deepEqual( parser.parse(``), [] );
    t.end();
  });
  test('comments and newlines', t => {
    t.deepEqual( parser.parse(`

# foo bar

# baz

`), [] );
    t.end();
  });
  test('lowercase', t => {
    t.deepEqual( parser.parse(`
Foo => BaR
Foo,Bar,Baz
`), [
  'foo => bar',
  'foo,bar,baz'
] );
    t.end();
  });
  test('squash spaces', t => {
    t.deepEqual( parser.parse(`
foo  bar => foo
Foo  Bar, Foo
`), [
  'foo bar => foo',
  'foo bar,foo'
] );
    t.end();
  });
  test('trim commas', t => {
    t.deepEqual( parser.parse(`
,foo => bar
,foo, bar,
`), [
  'foo => bar',
  'foo,bar'
] );
    t.end();
  });
  test('trim around commas', t => {
    t.deepEqual( parser.parse(`
 ,foo, bar , baz
`), [
  'foo,bar,baz'
] );
    t.end();
  });
  test('trim around arrows', t => {
    t.deepEqual( parser.parse(`
  foo  =>   bar
`), [
  'foo => bar'
] );
    t.end();
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('synonyms parser: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
