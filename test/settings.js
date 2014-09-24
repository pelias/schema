
var path = require('path'),
    settings = require('../settings'),
    fs = require('fs');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof settings, 'function', 'settings is a function');
    t.end();
  });
};

module.exports.tests.compile = function(test, common) {
  test('valid settings file', function(t) {
    var s = settings();
    t.equal(typeof s, 'object', 'settings generated');
    t.equal(Object.keys(s).length>0, true, 'settings has body');
    t.end();
  });
};

// analysis should always be set
module.exports.tests.analysis = function(test, common) {
  test('has analysis settings', function(t) {
    var s = settings();
    t.equal(typeof s.analysis, 'object', 'analysis specified');
    t.end();
  });
};

module.exports.tests.peliasAnalyzer = function(test, common) {
  test('has custom analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.pelias, 'object', 'there is a pelias analyzer');
    t.equal(typeof s.analysis.filter, 'object', 'there are custom filters');
    t.end();
  });
};

module.exports.tests.synonyms = function(test, common){
  test('synonyms.txt exists', function(t) {
    var s = settings();
    var synonymsPath = s.analysis.filter.synonym.synonyms_path;
    t.true(fs.existsSync(synonymsPath), "synonyms mapping detected");
    t.end();
  })
}

// 

// index should always be set
module.exports.tests.index = function(test, common) {
  test('has index settings', function(t) {
    var s = settings();
    t.equal(typeof s.index, 'object', 'index specified');
    t.end();
  });
};

// allow overrides from pelias/config
module.exports.tests.overrides = function(test, common) {
  test('override defaults', function(t) {

    var s = settings();
    t.equal(s.index['number_of_replicas'], '0', 'unchanged');

    // set the PELIAS_CONFIG env var
    process.env['PELIAS_CONFIG'] = path.resolve( __dirname + '/fixtures/config.json' );

    var s = settings();
    t.equal(s.index['number_of_replicas'], '999', 'changed');
    t.end();

    // unset the PELIAS_CONFIG env var
    delete process.env['PELIAS_CONFIG'];
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('settings: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};