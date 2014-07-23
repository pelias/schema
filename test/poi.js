
var schema = require('../mappings/poi');

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
}

// properties should always be set
module.exports.tests.properties = function(test, common) {
  test('has properties', function(t) {
    t.equal(typeof schema.properties, 'object', 'properties specified');
    t.end();
  });
}

// should contain the correct field definitions
module.exports.tests.fields = function(test, common) {
  var fields = ['name','address','type','admin0','admin1','admin2','center_point','suggest','tags'];
  test('fields specified', function(t) {
    fields.forEach( function( field ){
      t.equal(schema.properties.hasOwnProperty(field), true, field + ' field specified');
    });
    t.end();
  });
}

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('poi: ' + name, testFunction)
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
}