var schema = require('../mappings/partial/hash');

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
    t.equal(schema.type, 'object', 'correct value');
    t.end();
  });
};

// if dynamic=false you won't be able to
// query the properties of the object!
module.exports.tests.dynamic = function(test, common) {
  test('dynamic true', function(t) {
    t.equal(schema.dynamic, true, 'correct value');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('hash: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
