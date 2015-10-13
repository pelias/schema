
var schema = require('../mappings/document');

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
  var fields = ['source','layer','name','phrase','address','alpha3','admin0','admin1','admin1_abbr','admin2','local_admin','locality','neighborhood','center_point','shape','source_id','category','population','popularity'];
  test('fields specified', function(t) {
    t.deepEqual(Object.keys(schema.properties), fields);
    t.end();
  });
};

module.exports.tests.dynamic_templates = function(test, common) {
  test('dynamic_templates: nameGram', function(t) {
    t.equal(typeof schema.dynamic_templates[0].nameGram, 'object', 'nameGram template specified');
    var template = schema.dynamic_templates[0].nameGram;
    t.equal(template.path_match, 'name.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'string',
      analyzer: 'peliasTwoEdgeGram',
      fielddata: {
        format: 'fst',
        loading: 'eager_global_ordinals'
      }
    });
    t.end();
  });
  test('dynamic_templates: phrase', function(t) {
    t.equal(typeof schema.dynamic_templates[1].phrase, 'object', 'phrase template specified');
    var template = schema.dynamic_templates[1].phrase;
    t.equal(template.path_match, 'phrase.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'string',
      analyzer: 'peliasPhrase',
      fielddata: {
        loading: 'eager_global_ordinals'
      }
    });
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

// dynamic should be true in order for dynamic_templates to function properly
// @see: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-dynamic-mapping.html
module.exports.tests.dynamic_disabled = function(test, common) {
  test('dynamic true', function(t) {
    t.equal(schema.dynamic, 'true', 'dynamic true');
    t.end();
  });
};

// shape field should be exluded from _source because it's massive
module.exports.tests._source = function(test, common) {
  test('_source', function(t) {
    t.ok(Array.isArray(schema._source.excludes), 'exclusions specified');
    t.equal(schema._source.excludes[0], 'shape', 'exclude shape');
    t.equal(schema._source.excludes[1], 'phrase', 'exclude phrase');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('document: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
