
var schema = require('../mappings/partial/suggest');

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
    t.equal(schema.type, 'completion', 'correct value');
    t.end();
  });
};

// this should always be disabled as they consume vast amounts of memory
module.exports.tests.payloads = function(test, common) {
  test('payloads disabled', function(t) {
    t.equal(schema.payloads, false, 'correct value');
    t.end();
  });
};

// these should always be the same or there may
// be a mismatch beweeen the search and indexing
// analysis. This was advised by es corp.
module.exports.tests.analyzers = function(test, common) {
  test('same analyzers', function(t) {
    t.equal(typeof schema.index_analyzer, 'string', 'analyzer specified');
    t.equal(typeof schema.search_analyzer, 'string', 'analyzer specified');
    t.equal(schema.index_analyzer, schema.search_analyzer, 'same analyzer');
    t.end();
  });
};

// the context section
module.exports.tests.context = function(test, common) {
  test('context', function(t) {
    t.equal(typeof schema.context, 'object', 'context specified');
    t.end();
  });
};

// the location context
module.exports.tests.context_location = function(test, common) {
  test('location context', function(t) {
    var context = schema.context;
    t.equal(typeof context.location, 'object', 'location context specified');
    var location = context.location;
    t.equal(location.type, 'geo', 'correct value'); // this should not change
    t.equal(location.neighbors, true, 'correct value'); // this should not change
    t.equal(Array.isArray(location.precision), true, 'precisions set');
    t.equal(location.precision.length>0, true, 'precisions set');
    t.equal(typeof location.path, 'string', 'path specified'); // this should be set
    t.equal(location.path.length>0, true, 'path specified'); // this should be set
    t.end();
  });
};

// precisions should be set as geohash integers not in meters
var maxSanePrecision = 9;
module.exports.tests.context_location_precisions = function(test, common) {
  test('location precision', function(t) {
    var context = schema.context;
    var location = context.location;
    t.equal(Array.isArray(location.precision), true, 'precisions set');
    t.equal(location.precision.length>0, true, 'precisions set');
    location.precision.forEach( function( precision ){
      t.equal(typeof precision, 'number', 'precision value is an integer');
      t.ok(precision > 0, 'precision value valid integer');
      t.ok(precision <= maxSanePrecision, 'precision value not insanely precise');
    });
    t.end();
  });
};

// the dataset context
module.exports.tests.context_dataset = function(test, common) {
  test('dataset context', function(t) {
    var context = schema.context;
    t.equal(typeof context.dataset, 'object', 'dataset context specified');
    var dataset = context.dataset;
    t.equal(dataset.type, 'category', 'correct value'); // this should not change
    t.equal(typeof dataset.path, 'string', 'path specified'); // this should be set
    t.equal(dataset.path.length>0, true, 'path specified'); // this should be set
    t.end();
  });
};

// the alpha3 context
// module.exports.tests.context_alpha3 = function(test, common) {
//   test('alpha3 context', function(t) {
//     var context = schema.context;
//     t.equal(typeof context.alpha3, 'object', 'alpha3 context specified');
//     var alpha3 = context.alpha3;
//     t.equal(alpha3.type, 'category', 'correct value'); // this should not change
//     t.equal(typeof alpha3.path, 'string', 'path specified'); // this should be set
//     t.equal(alpha3.path.length>0, true, 'path specified'); // this should be set

//     // this should be set for imports which do not specify an alpha3 value or ES will error with:
//     // ElasticsearchIllegalArgumentException[one or more prefixes needed]
//     t.equal(alpha3.default, 'XXX', 'default alpha3 value set');
//     t.end();
//   });
// };

// Verify https://github.com/pelias/schema/issues/21
module.exports.tests.max_input_length = function(test, common) {
  test('maximum input length', function(t) {
    t.equal(schema.max_input_length, 50, 'correct value');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('suggest: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};