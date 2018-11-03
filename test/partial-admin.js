var schema = require('../mappings/partial/admin');

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

// this should never need to change
module.exports.tests.type = function(test, common) {
  test('correct type', function(t) {
    t.equal(schema.type, 'string', 'correct value');
    t.end();
  });
};

module.exports.tests.store = function(test, common) {
  test('store unset (will not be stored)', function(t) {
    t.equal(schema.store, undefined, 'unset');
    t.end();
  });
};

// this should be enabled to allow 'exists' filters to work
module.exports.tests.index = function(test, common) {
  test('index enabled', function(t) {
    t.notEqual(schema.index, 'no', 'should not be disabled');
    t.end();
  });
};

// pelias analysis does not ensure that we get ['Great Britain'] instead of ['Great','Britain']
// TODO this needs to be addressed 
module.exports.tests.analysis = function(test, common) {
  test('index analysis', function(t) {
    t.equal(schema.analyzer, 'peliasAdmin', 'should be peliasAdmin');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('admin: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
