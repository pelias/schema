
var schema = require('../');

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

var mandatory_indeces = ['osmnode','osmway','geoname','openaddresses','admin0','admin1','admin2','local_admin','locality','neighborhood'];
module.exports.tests.indeces = function(test, common) {
  test('contains mandatory indeces', function(t) {
    t.plan( mandatory_indeces.length +1 );
    t.equal(typeof schema.mappings, 'object', 'mappings present');
    mandatory_indeces.forEach( function( index_name ){
      t.equal( schema.mappings.hasOwnProperty(index_name), true, 'mandatory mapping defined' );
    });
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('compile: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};