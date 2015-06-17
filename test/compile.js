
var schema = require('../');

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
    t.equal(typeof schema.mappings['_default_'], 'object', 'mappings present');
    t.equal(schema.mappings['_default_'].dynamic_templates[0].nameGram.mapping.analyzer, 'peliasTwoEdgeGram');
    t.end();
  });
  test('explicitly specify some admin indeces and their analyzer', function(t) {
    t.equal(typeof schema.mappings['admin0'], 'object', 'mappings present');
    t.equal(schema.mappings['admin0'].dynamic_templates[0].nameGram.mapping.analyzer, 'peliasOneEdgeGram');
    t.equal(typeof schema.mappings['admin1'], 'object', 'mappings present');
    t.equal(schema.mappings['admin1'].dynamic_templates[0].nameGram.mapping.analyzer, 'peliasOneEdgeGram');
    t.equal(typeof schema.mappings['admin2'], 'object', 'mappings present');
    t.equal(schema.mappings['admin2'].dynamic_templates[0].nameGram.mapping.analyzer, 'peliasOneEdgeGram');
    t.end();
  });
};

// some 'admin' types allow single edgeNGrams and so have a different dynamic_template
module.exports.tests.dynamic_templates = function(test, common) {
  test('dynamic_templates: nameGram', function(t) {
    t.equal(typeof schema.mappings.admin0.dynamic_templates[0].nameGram, 'object', 'nameGram template specified');
    var template = schema.mappings.admin0.dynamic_templates[0].nameGram;
    t.equal(template.path_match, 'name.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'string',
      analyzer: 'peliasOneEdgeGram',
      fielddata: {
        format: 'fst',
        loading: 'eager_global_ordinals'
      }
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