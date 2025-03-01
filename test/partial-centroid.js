
const schema = require('../mappings/partial/centroid');

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
    t.equal(schema.type, 'geo_point', 'correct value');
    t.end();
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('centroid: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
