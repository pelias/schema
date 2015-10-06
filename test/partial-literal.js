
var schema = require('../mappings/partial/literal');

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
  test('store enabled', function(t) {
    t.equal(schema.store, 'yes', 'correct value');
    t.end();
  });
};

// do not perform analysis on categories
module.exports.tests.analysis = function(test, common) {
  test('index analysis', function(t) {
    t.equal(schema.index_analyzer, 'keyword', 'should be keyword');
    t.equal(schema.search_analyzer, 'keyword', 'should be keyword');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('literal: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
