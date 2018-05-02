var path = require('path'),
    schema = require('../'),
    fixture = require('./fixtures/expected.json');

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

// admin indeces are explicitly specified in order to specify a custom
// dynamic_template and to avoid 'type not found' errors when deploying
// the api codebase against an index without admin data
module.exports.tests.indeces = function(test, common) {
  test('contains "_default_" index definition', function(t) {
    t.equal(typeof schema.mappings._default_, 'object', 'mappings present');
    t.equal(schema.mappings._default_.dynamic_templates[0].nameGram.mapping.analyzer, 'peliasIndexOneEdgeGram');
    t.end();
  });
  test('explicitly specify some admin indeces and their analyzer', function(t) {
    t.equal(typeof schema.mappings.country, 'object', 'mappings present');
    t.equal(schema.mappings.country.dynamic_templates[0].nameGram.mapping.analyzer, 'peliasIndexOneEdgeGram');
    t.equal(typeof schema.mappings.region, 'object', 'mappings present');
    t.equal(schema.mappings.region.dynamic_templates[0].nameGram.mapping.analyzer, 'peliasIndexOneEdgeGram');
    t.equal(typeof schema.mappings.county, 'object', 'mappings present');
    t.equal(schema.mappings.county.dynamic_templates[0].nameGram.mapping.analyzer, 'peliasIndexOneEdgeGram');
    t.end();
  });
};

// some 'admin' types allow single edgeNGrams and so have a different dynamic_template
module.exports.tests.dynamic_templates = function(test, common) {
  test('dynamic_templates: nameGram', function(t) {
    t.equal(typeof schema.mappings.country.dynamic_templates[0].nameGram, 'object', 'nameGram template specified');
    var template = schema.mappings.country.dynamic_templates[0].nameGram;
    t.equal(template.path_match, 'name.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'string',
      analyzer: 'peliasIndexOneEdgeGram',
      fielddata: {
        format: "disabled"
      }
    });
    t.end();
  });
};

// current schema (compiled) - requires schema to be copied and settings to
// be regenerated from a fixture in order to pass in CI environments.
module.exports.tests.current_schema = function(test, common) {
  test('current schema vs. fixture', function(t) {

    // copy schema
    var schemaCopy = JSON.parse( JSON.stringify( schema ) );

    // use the pelias config fixture instead of the local config
    process.env.PELIAS_CONFIG = path.resolve( __dirname + '/fixtures/config.json' );
    schemaCopy.settings = require('../settings')();
    delete process.env.PELIAS_CONFIG;

    // code intentionally commented to allow quick debugging of expected.json
    // common.diff(schemaCopy, fixture);

    t.deepEqual(schemaCopy, fixture);
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
