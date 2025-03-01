const schema = require('../mappings/partial/admin');

module.exports.tests = {};

module.exports.tests.compile = (test, common) => {
  test('valid schema file', t => {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

// this should never need to change
module.exports.tests.type = (test, common) => {
  test('correct type', t => {
    t.equal(schema.type, 'text', 'set to text field for full text search');
    t.end();
  });
};

module.exports.tests.store = (test, common) => {
  test('store unset (will not be stored)', t => {
    t.equal(schema.store, undefined, 'unset');
    t.end();
  });
};

// this should be enabled to allow 'exists' filters to work
module.exports.tests.index = (test, common) => {
  test('index enabled', t => {
    t.notEqual(schema.index, 'no', 'should not be disabled');
    t.end();
  });
};

// pelias analysis does not ensure that we get ['Great Britain'] instead of ['Great','Britain']
// TODO this needs to be addressed
module.exports.tests.analysis = (test, common) => {
  test('index analysis', t => {
    t.equal(schema.analyzer, 'peliasAdmin', 'should be peliasAdmin');
    t.end();
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`admin: ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
