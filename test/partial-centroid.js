
var schema = require('../mappings/partial/centroid')();

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
    t.equal(schema.type, 'geo_point', 'correct value');
    t.end();
  });
};

// this should always be enabled for geo_distance filter
// queries to execute correctly
module.exports.tests.latlon = function(test, common) {
  test('latlon enabled', function(t) {
    t.equal(schema.lat_lon, true, 'correct value');
    t.end();
  });
};

// this should always be enabled for geohash_cell filter
// queries to execute correctly
module.exports.tests.geohash = function(test, common) {
  test('geohash enabled', function(t) {
    t.equal(schema.geohash, true, 'correct value');
    t.equal(schema.geohash_prefix, true, 'correct value');
    t.equal(schema.geohash_precision, 18, 'correct value');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('centroid: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
