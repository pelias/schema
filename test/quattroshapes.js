
var schema = require('../mappings/quattroshapes');

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

// properties should always be set
module.exports.tests.properties = function(test, common) {
  test('has properties', function(t) {
    t.equal(typeof schema.properties, 'object', 'properties specified');
    t.end();
  });
};

// should contain the correct field definitions
module.exports.tests.fields = function(test, common) {
  var fields = ['name','alpha3','admin0','admin1','admin2','gn_id','woe_id','boundaries','center_point','suggest'];
  test('fields specified', function(t) {
    fields.forEach( function( field ){
      t.equal(schema.properties.hasOwnProperty(field), true, field + ' field specified');
    });
    t.end();
  });
  test('fields length', function(t) {
    t.equal(Object.keys(schema.properties).length, fields.length, 'equal');
    t.end();
  });
};

// _all should be disabled
module.exports.tests.all_disabled = function(test, common) {
  test('_all disabled', function(t) {
    t.equal(schema._all.enabled, false, '_all disabled');
    t.end();
  });
};

// dynamic should be strict
// @see: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-dynamic-mapping.html
module.exports.tests.dynamic_disabled = function(test, common) {
  test('dynamic strict', function(t) {
    t.equal(schema.dynamic, 'strict', 'dynamic strict');
    t.end();
  });
};

// boundaries field should be exluded from _source because it's massive
module.exports.tests._source = function(test, common) {
  test('_source', function(t) {
    t.ok(Array.isArray(schema._source.excludes), 'exclusions specified');
    t.equal(schema._source.excludes[0], 'boundaries', 'exclude boundaries');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('quattroshapes: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};