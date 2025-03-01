const schema = require('../mappings/partial/keyword');

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
    t.equal(schema.type, 'keyword', 'correct value');
    t.end();
  });
};

module.exports.tests.store = (test, common) => {
  test('store unset (will not be stored)', t => {
    t.equal(schema.store, undefined, 'unset');
    t.end();
  });
};

// do not perform analysis on categories
module.exports.tests.analysis = (test, common) => {
  test('index analysis disabled', t => {
    t.equal(schema.index, undefined, 'should be set to default');
    t.end();
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('keyword: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
