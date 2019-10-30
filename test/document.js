const _ = require('lodash');
const schema = require('../mappings/document');

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
  var fields = ['source', 'layer', 'name', 'phrase', 'address_parts',
    'parent', 'center_point', 'shape', 'bounding_box', 'source_id', 'category',
    'population', 'popularity', 'addendum'];
  test('fields specified', function(t) {
    t.deepEqual(Object.keys(schema.properties), fields);
    t.end();
  });
};

// should contain the correct address field definitions
module.exports.tests.address_fields = function(test, common) {
  var fields = ['name','unit','number','street','cross_street','zip'];
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
    t.equal(prop.name.type, 'text');
    t.equal(prop.name.analyzer, 'keyword');
    t.end();
  });

  // $unit analysis
  test('unit', function(t) {
    t.equal(prop.unit.type, 'text', 'unit has full text type');
    t.equal(prop.unit.analyzer, 'peliasUnit', 'unit analyzer is peliasUnit');
    t.end();
  });

  // $number analysis is discussed in: https://github.com/pelias/schema/pull/77
  test('number', function(t) {
    t.equal(prop.number.type, 'text');
    t.equal(prop.number.analyzer, 'peliasHousenumber');
    t.end();
  });

  // $street analysis is discussed in: https://github.com/pelias/schema/pull/77
  test('street', function(t) {
    t.equal(prop.street.type, 'text');
    t.equal(prop.street.analyzer, 'peliasStreet');
    t.end();
  });

  // $zip analysis is discussed in: https://github.com/pelias/schema/pull/77
  // note: this is a poor name, it would be better to rename this field to a more
  // generic term such as $postalcode as it is not specific to the USA.
  test('zip', function(t) {
    t.equal(prop.zip.type, 'text');
    t.equal(prop.zip.analyzer, 'peliasZip');
    t.end();
  });
};

// should contain the correct parent field definitions
module.exports.tests.parent_fields = function(test, common) {
  var fields = [
    'continent',      'continent_a',      'continent_id',     'continent.fields.ngram',
    'ocean',          'ocean_a',          'ocean_id',         'ocean.fields.ngram',
    'empire',         'empire_a',         'empire_id',        'empire.fields.ngram',
    'country',        'country_a',        'country_id',       'country.fields.ngram',
    'dependency',     'dependency_a',     'dependency_id',    'dependency.fields.ngram',
    'marinearea',     'marinearea_a',     'marinearea_id',    'marinearea.fields.ngram',
    'macroregion',    'macroregion_a',    'macroregion_id',   'macroregion.fields.ngram',
    'region',         'region_a',         'region_id',        'region.fields.ngram',
    'macrocounty',    'macrocounty_a',    'macrocounty_id',   'macrocounty.fields.ngram',
    'county',         'county_a',         'county_id',        'county.fields.ngram',
    'locality',       'locality_a',       'locality_id',      'locality.fields.ngram',
    'borough',        'borough_a',        'borough_id',       'borough.fields.ngram',
    'localadmin',     'localadmin_a',     'localadmin_id',    'localadmin.fields.ngram',
    'neighbourhood',  'neighbourhood_a',  'neighbourhood_id', 'neighbourhood.fields.ngram',
    'postalcode',     'postalcode_a',     'postalcode_id',    'postalcode.fields.ngram'
  ];
  test('parent fields specified', function(t) {
    fields.forEach( expected => {
      t.true( _.has( schema.properties.parent.properties, expected ), expected );
    });
    t.end();
  });
};

// parent field analysis
// ref: https://github.com/pelias/schema/pull/95
module.exports.tests.parent_analysis = function(test, common) {
  var prop = schema.properties.parent.properties;
  var fields = [
    'continent', 'ocean', 'empire', 'country', 'dependency', 'marinearea',
    'macroregion', 'region', 'macrocounty', 'county', 'locality', 'borough',
    'localadmin', 'neighbourhood'
  ];
  fields.forEach( function( field ){
    test(field, function(t) {
      t.equal(prop[field].type, 'text', `${field} is set to text type`);
      t.equal(prop[field].analyzer, 'peliasAdmin', `${field} analyzer is peliasAdmin`);
      t.equal(prop[field+'_a'].type, 'text', `${field}_a type is text`);
      t.equal(prop[field+'_a'].analyzer, 'peliasAdmin', `${field}_a analyzer is peliasAdmin`);
      t.equal(prop[field+'_id'].type, 'keyword', `${field}_id type is keyword`);
      t.equal(prop[field+'_id'].index, undefined, `${field}_id index left at default`);

      // subfields
      t.equal(prop[field].fields.ngram.type, 'text', `${field}.ngram type is full text`);
      t.equal(prop[field].fields.ngram.analyzer, 'peliasIndexOneEdgeGram', `${field}.ngram analyzer is peliasIndexOneEdgeGram`);

      t.end();
    });
  });

  test('postalcode', function(t) {
    t.equal(prop['postalcode'].type, 'text', 'postalcode is full text field');
    t.equal(prop['postalcode'].analyzer, 'peliasZip', 'postalcode analyzer is peliasZip');
    t.equal(prop['postalcode'+'_a'].type, 'text', 'postalcode_a is full text field');
    t.equal(prop['postalcode'+'_a'].analyzer, 'peliasZip', 'postalcode_a analyzer is peliasZip');
    t.equal(prop['postalcode'+'_id'].type, 'keyword', 'postalcode_id field is keyword type');
    t.equal(prop['postalcode'+'_id'].index, undefined, 'postalcode_id index left at default');

    t.end();
  });
};

module.exports.tests.dynamic_templates = function(test, common) {
  test('dynamic_templates: nameGram', function(t) {
    t.equal(typeof schema.dynamic_templates[0].nameGram, 'object', 'nameGram template specified');
    var template = schema.dynamic_templates[0].nameGram;
    t.equal(template.path_match, 'name.*');
    t.equal(template.match_mapping_type, 'string');
    t.equal(template.mapping.type, 'text', 'set to full text type');
    t.equal(template.mapping.fielddata, undefined, 'fielddata is left to default (disabled)');
    t.equal(template.mapping.analyzer, 'peliasIndexOneEdgeGram', 'analyzer set');
    t.end();
  });
  test('dynamic_templates: phrase', function(t) {
    t.equal(typeof schema.dynamic_templates[1].phrase, 'object', 'phrase template specified');
    var template = schema.dynamic_templates[1].phrase;
    t.equal(template.path_match, 'phrase.*');
    t.equal(template.match_mapping_type, 'string');
    t.equal(template.mapping.type, 'text', 'set to full text type');
    t.equal(template.mapping.fielddata, undefined, 'fielddata is left to default (disabled)');
    t.equal(template.mapping.analyzer, 'peliasPhrase', 'analyzer set');
    t.end();
  });
};

// _all should be disabled
module.exports.tests.all_disabled = function(test, common) {
  test('_all disabled', function(t) {
    t.false(schema._all, '_all undefined');
    t.end();
  });
};

// dynamic should be true in order for dynamic_templates to function properly
// @see: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-dynamic-mapping.html
// strict ensures extra fields cannot be added: https://www.elastic.co/guide/en/elasticsearch/guide/current/dynamic-mapping.html
module.exports.tests.dynamic_disabled = function(test, common) {
  test('dynamic strict', function(t) {
    t.equal(schema.dynamic, 'strict', 'dynamic true');
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
