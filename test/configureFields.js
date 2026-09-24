const configureFields = require('../mappings/configureFields');
const document = require('../mappings/document');

module.exports.tests = {};

module.exports.tests.unstored = function(test, common) {
  test('no config leaves mapping unchanged', function(t) {
    t.deepEqual(configureFields(document, undefined), document);
    t.deepEqual(configureFields(document, {}), document);
    t.end();
  });

  test('unstored fields are appended to _source excludes', function(t) {
    const mapping = configureFields(document, { unstoredFields: ['addendum', 'parent.*_a', 'shape'] });
    t.deepEqual(mapping._source.excludes, ['shape', 'phrase', 'addendum', 'parent.*_a']);
    t.deepEqual(mapping.properties, document.properties, 'properties unchanged');
    t.end();
  });
};

module.exports.tests.excluded = function(test, common) {
  test('excluded fields are removed from mapping', function(t) {
    const mapping = configureFields(document, { excludedFields: ['popularity', 'parent.county_a', 'not_a_field'] });
    t.false(mapping.properties.popularity, 'top level field removed');
    t.false(mapping.properties.parent.properties.county_a, 'nested field removed');
    t.true(mapping.properties.parent.properties.county, 'sibling field kept');
    t.true(mapping.properties.population, 'other fields kept');
    t.end();
  });

  test('original mapping is not modified', function(t) {
    configureFields(document, { unstoredFields: ['addendum'], excludedFields: ['popularity', 'parent.county_a'] });
    t.deepEqual(document._source.excludes, ['shape', 'phrase']);
    t.true(document.properties.popularity);
    t.true(document.properties.parent.properties.county_a);
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('configureFields: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
