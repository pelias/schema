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
  var fields = ['source', 'layer', 'alpha3', 'name', 'phrase', 'address_parts',
    'parent', 'center_point', 'shape', 'bounding_box', 'source_id', 'category',
    'population', 'popularity'];
  test('fields specified', function(t) {
    t.deepEqual(Object.keys(schema.properties), fields);
    t.end();
  });
};

// should contain the correct address field definitions
module.exports.tests.address_fields = function(test, common) {
  var fields = ['name','unit','number','street','zip'];
  test('address fields specified', function(t) {
    t.deepEqual(Object.keys(schema.properties.address_parts.properties), fields);
    t.end();
  });
};

// address field analysis
// ref: https://github.com/pelias/schema/pull/77
module.exports.tests.address_analysis = function(test, common) {
  var prop = schema.properties.address_parts.properties;

  // $name analysis is pretty basic, work can be done to improve this, although
  // at time of writing this field was not used by any API queries.
  test('name', function(t) {
    t.equal(prop.name.type, 'string');
    t.equal(prop.name.analyzer, 'keyword');
    t.end();
  });

  // $unit analysis
  test('unit', function(t) {
    t.equal(prop.unit.type, 'string');
    t.equal(prop.unit.analyzer, 'peliasUnit');
    t.end();
  });

  // $number analysis is discussed in: https://github.com/pelias/schema/pull/77
  test('number', function(t) {
    t.equal(prop.number.type, 'string');
    t.equal(prop.number.analyzer, 'peliasHousenumber');
    t.end();
  });

  // $street analysis is discussed in: https://github.com/pelias/schema/pull/77
  test('street', function(t) {
    t.equal(prop.street.type, 'string');
    t.equal(prop.street.analyzer, 'peliasStreet');
    t.end();
  });

  // $zip analysis is discussed in: https://github.com/pelias/schema/pull/77
  // note: this is a poor name, it would be better to rename this field to a more
  // generic term such as $postalcode as it is not specific to the USA.
  test('zip', function(t) {
    t.equal(prop.zip.type, 'string');
    t.equal(prop.zip.analyzer, 'peliasZip');
    t.end();
  });
};

// should contain the correct parent field definitions
module.exports.tests.parent_fields = function(test, common) {
  var fields = [
    'continent',      'continent_a',      'continent_id',
    'empire',         'empire_a',         'empire_id',
    'country',        'country_a',        'country_id',
    'dependency',     'dependency_a',     'dependency_id',
    'macroregion',    'macroregion_a',    'macroregion_id',
    'region',         'region_a',         'region_id',
    'macrocounty',    'macrocounty_a',    'macrocounty_id',
    'county',         'county_a',         'county_id',
    'locality',       'locality_a',       'locality_id',
    'borough',        'borough_a',        'borough_id',
    'localadmin',     'localadmin_a',     'localadmin_id',
    'neighbourhood',  'neighbourhood_a',  'neighbourhood_id',
    'postalcode',     'postalcode_a',     'postalcode_id'
  ];
  test('parent fields specified', function(t) {
    t.deepEqual(Object.keys(schema.properties.parent.properties), fields);
    t.end();
  });
};

// parent field analysis
// ref: https://github.com/pelias/schema/pull/95
module.exports.tests.parent_analysis = function(test, common) {
  var prop = schema.properties.parent.properties;
  var fields = ['country','region','county','locality','localadmin','neighbourhood'];
  fields.forEach( function( field ){
    test(field, function(t) {
      t.equal(prop[field].type, 'string');
      t.equal(prop[field].analyzer, 'peliasAdmin');
      t.equal(prop[field+'_a'].type, 'string');
      t.equal(prop[field+'_a'].analyzer, 'peliasAdmin');
      t.equal(prop[field+'_id'].type, 'string');
      t.equal(prop[field+'_id'].analyzer, 'keyword');

      t.end();
    });
  });

  test('postalcode', function(t) {
    t.equal(prop['postalcode'].type, 'string');
    t.equal(prop['postalcode'].analyzer, 'peliasZip');
    t.equal(prop['postalcode'+'_a'].type, 'string');
    t.equal(prop['postalcode'+'_a'].analyzer, 'peliasZip');
    t.equal(prop['postalcode'+'_id'].type, 'string');
    t.equal(prop['postalcode'+'_id'].analyzer, 'keyword');

    t.end();
  });
};

module.exports.tests.alpha3_analysis = function(test, common) {
  var prop = schema.properties.alpha3;
  test('alpha3', function(t) {
    t.equal(prop.type, 'string');
    t.equal(prop.analyzer, 'peliasAdmin');
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
      analyzer: 'peliasIndexOneEdgeGram',
      fielddata: {
        format: "disabled"
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
        format: "disabled"
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
