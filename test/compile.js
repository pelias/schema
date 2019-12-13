const _ = require('lodash');
const path = require('path');
const schema = require('../');
const fixture = require('./fixtures/expected.json');
const config = require('pelias-config').generate();

const forEachDeep = (obj, cb) =>
  _.forEach(obj, (val, key) => {
    cb(val, key);
    if (_.isPlainObject(val) || _.isArray(val)){
      forEachDeep(val, cb);
    }
  });

module.exports.tests = {};

module.exports.tests.compile = function(test, common) {
  test('valid schema file', function(t) {
    t.equal(typeof schema, 'object', 'schema generated');
    t.equal(Object.keys(schema).length>0, true, 'schema has body');
    t.end();
  });
};

// admin indices are explicitly specified in order to specify a custom
// dynamic_template and to avoid 'type not found' errors when deploying
// the api codebase against an index without admin data
module.exports.tests.indices = function(test, common) {
  test('explicitly specify some admin indices and their analyzer', function(t) {
    const _type = config.schema.typeName;
    t.equal(typeof schema.mappings[_type], 'object', 'mappings present');
    t.equal(schema.mappings[_type].dynamic_templates[0].nameGram.mapping.analyzer, 'peliasIndexOneEdgeGram');
    t.end();
  });
};

// some 'admin' types allow single edgeNGrams and so have a different dynamic_template
module.exports.tests.dynamic_templates = function(test, common) {
  test('dynamic_templates: nameGram', function(t) {
    const _type = config.schema.typeName;
    t.equal(typeof schema.mappings[_type].dynamic_templates[0].nameGram, 'object', 'nameGram template specified');
    var template = schema.mappings[_type].dynamic_templates[0].nameGram;
    t.equal(template.path_match, 'name.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'text',
      analyzer: 'peliasIndexOneEdgeGram',
      search_analyzer: 'peliasQuery'
    });
    t.end();
  });
  test('dynamic_templates: phrase', function (t) {
    const _type = config.schema.typeName;
    t.equal(typeof schema.mappings[_type].dynamic_templates[1].phrase, 'object', 'phrase template specified');
    var template = schema.mappings[_type].dynamic_templates[1].phrase;
    t.equal(template.path_match, 'phrase.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'text',
      analyzer: 'peliasPhrase',
      search_analyzer: 'peliasQuery'
    });
    t.end();
  });
  test('dynamic_templates: addendum', function (t) {
    const _type = config.schema.typeName;
    t.equal(typeof schema.mappings[_type].dynamic_templates[2].addendum, 'object', 'addendum template specified');
    var template = schema.mappings[_type].dynamic_templates[2].addendum;
    t.equal(template.path_match, 'addendum.*');
    t.equal(template.match_mapping_type, 'string');
    t.deepEqual(template.mapping, {
      type: 'keyword',
      index: false,
      doc_values: false
    });
    t.end();
  });
};

// ensure both "analyzer" and "search_analyzer" are set for stringy fields
module.exports.tests.analyzers = function (test, common) {
  test('analyzers: ensure "analyzer" and "search_analyzer" are set', function (t) {

    const stringyTypes = ['string', 'text'];
    const stringyFields = [];

    forEachDeep(schema, (value, key) => {
      if (!_.isPlainObject(value)) { return; }
      if (!stringyTypes.includes(_.get(value, 'type', ''))) { return; }
      stringyFields.push({ key: key, value: value });
    });

    stringyFields.forEach(field => {
      t.true(_.has(field.value, 'analyzer'), `analyzer not set on ${field.key}`)
      t.true(_.has(field.value, 'search_analyzer'), `search_analyzer not set on ${field.key}`)
    })

    t.end();
  });
};

// ensure "normalizer" is set for keyword fields
// module.exports.tests.normalizers = function (test, common) {
//   test('normalizers: ensure "normalizer" is set', function (t) {
//     const keywordFields = [];

//     forEachDeep(schema, (value, key) => {
//       if (!_.isPlainObject(value)) { return; }
//       if (_.get(value, 'type', '') !== 'keyword') { return; }
//       keywordFields.push({ key: key, value: value });
//     });

//     keywordFields.forEach(field => {
//       t.true(_.has(field.value, 'normalizer'), `normalizer not set on ${field.key}`)
//     })

//     t.end();
//   });
// };

// current schema (compiled) - requires schema to be copied and settings to
// be regenerated from a fixture in order to pass in CI environments.
module.exports.tests.current_schema = function(test, common) {
  test('current schema vs. fixture', function(t) {

    // copy schema
    var schemaCopy = JSON.parse( JSON.stringify( schema ) );

    // the fixture contains a _type named 'doc'.
    // this code allows the generated schema to match the fixture if the
    // type name is defined named differently in pelias.json, the rest of
    // the settings still apply verbatim.
    const _type = config.schema.typeName;
    if(_type && _type !== 'doc'){
      schemaCopy.mappings.doc = schemaCopy.mappings[_type];
      delete schemaCopy.mappings[_type];
    }

    // use the pelias config fixture instead of the local config
    process.env.PELIAS_CONFIG = path.resolve( __dirname + '/fixtures/config.json' );
    schemaCopy.settings = require('../settings')();
    delete process.env.PELIAS_CONFIG;

    // code intentionally commented to allow quick debugging of expected.json
    // common.diff(schemaCopy, fixture);
    // console.error( JSON.stringify( schemaCopy, null, 2 ) );

    // code to write expected output to the fixture
    // const fs = require('fs');
    // fs.writeFileSync(path.resolve( __dirname + '/fixtures/expected.json' ), JSON.stringify(schemaCopy, null, 2));

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
