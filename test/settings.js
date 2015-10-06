
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

// -- analyzers --

module.exports.tests.peliasAdminAnalyzer = function(test, common) {
  test('has pelias admin analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasAdmin, 'object', 'there is a pelias admin analyzer');
    var analyzer = s.analysis.analyzer.peliasAdmin;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
};

module.exports.tests.peliasOneEdgeGramAnalyzer = function(test, common) {
  test('has peliasOneEdgeGram analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasOneEdgeGram, 'object', 'there is a peliasOneEdgeGram analyzer');
    var analyzer = s.analysis.analyzer.peliasOneEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation"], 'punctuation filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasOneEdgeGram token filters', function(t) {
    var analyzer = settings().analysis.analyzer.peliasOneEdgeGram;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "asciifolding",
      "trim",
      "address_stop",
      "ampersand",
      "removeAllZeroNumericPrefix",
      "kstem",
      "peliasOneEdgeGramFilter",
      "unique",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasTwoEdgeGramAnalyzer = function(test, common) {
  test('has peliasTwoEdgeGram analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasTwoEdgeGram, 'object', 'there is a peliasTwoEdgeGram analyzer');
    var analyzer = s.analysis.analyzer.peliasTwoEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation"], 'punctuation filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasTwoEdgeGram token filters', function(t) {
    var analyzer = settings().analysis.analyzer.peliasTwoEdgeGram;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "asciifolding",
      "trim",
      "address_stop",
      "ampersand",
      "removeAllZeroNumericPrefix",
      "kstem",
      "peliasTwoEdgeGramFilter",
      "unique",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasPhraseAnalyzer = function(test, common) {
  test('has peliasPhrase analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasPhrase, 'object', 'there is a peliasPhrase analyzer');
    var analyzer = s.analysis.analyzer.peliasPhrase;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation"], 'punctuation filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasPhrase token filters', function(t) {
    var analyzer = settings().analysis.analyzer.peliasPhrase;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "asciifolding",
      "trim",
      "ampersand",
      "kstem",
      "street_synonym",
      "direction_synonym",
      "unique",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasZipAnalyzer = function(test, common) {
  test('has peliasZip analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasZip, 'object', 'there is a peliasZip analyzer');
    var analyzer = s.analysis.analyzer.peliasZip;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["alphanumeric"], 'alphanumeric filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasZip token filters', function(t) {
    var analyzer = settings().analysis.analyzer.peliasZip;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "trim"
    ]);
    t.end();
  });
};

module.exports.tests.peliasHousenumberAnalyzer = function(test, common) {
  test('has peliasHousenumber analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasHousenumber, 'object', 'there is a peliasHousenumber analyzer');
    var analyzer = s.analysis.analyzer.peliasHousenumber;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["numeric"], 'numeric filter specified');
    t.false(Array.isArray(analyzer.filter), 'no filters specified');
    t.end();
  });
};

module.exports.tests.peliasStreetAnalyzer = function(test, common) {
  test('has peliasStreet analyzer', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.analyzer.peliasStreet, 'object', 'there is a peliasStreet analyzer');
    var analyzer = s.analysis.analyzer.peliasStreet;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation"], 'punctuation filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasStreet token filters', function(t) {
    var analyzer = settings().analysis.analyzer.peliasStreet;
    t.equal( analyzer.filter.length, 29, 'lots of filters' );
    t.end();
  });
};

// cycle through all analyzers and ensure the corrsponding token filters are defined
module.exports.tests.allTokenFiltersPresent = function(test, common) {
  var ES_INBUILT_FILTERS = [
    'lowercase', 'asciifolding', 'trim', 'word_delimiter', 'kstem', 'unique'
  ];
  test('all token filters present', function(t) {
    var s = settings();
    for( var analyzerName in s.analysis.analyzer ){
      var analyzer = s.analysis.analyzer[analyzerName];
      if( Array.isArray( analyzer.filter ) ){
        analyzer.filter.forEach( function( tokenFilterName ){
          var filterExists = s.analysis.filter.hasOwnProperty( tokenFilterName );
          if( !filterExists && -1 < ES_INBUILT_FILTERS.indexOf( tokenFilterName ) ){
            filterExists = true;
          }
          t.true( filterExists, 'missing token filter: ' + tokenFilterName );
        });
      }
    }
    t.end();
  });
};

// cycle through all analyzers and ensure the corrsponding character filters are defined
module.exports.tests.allCharacterFiltersPresent = function(test, common) {
  var ES_INBUILT_FILTERS = [];
  test('all character filters present', function(t) {
    var s = settings();
    for( var analyzerName in s.analysis.analyzer ){
      var analyzer = s.analysis.analyzer[analyzerName];
      if( Array.isArray( analyzer.char_filter ) ){
        analyzer.char_filter.forEach( function( charFilterName ){
          var filterExists = s.analysis.char_filter.hasOwnProperty( charFilterName );
          if( !filterExists && -1 < ES_INBUILT_FILTERS.indexOf( charFilterName ) ){
            filterExists = true;
          }
          t.true( filterExists, 'missing character filter: ' + charFilterName );
        });
      }
    }
    t.end();
  });
};

// -- filters --

// note: pattern/replace should not have surrounding whitespace
// we convert and->& rather than &->and to save memory/disk
module.exports.tests.ampersandFilter = function(test, common) {
  test('has ampersand filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.ampersand, 'object', 'there is a ampersand filter');
    var filter = s.analysis.filter.ampersand;
    t.equal(filter.type, 'pattern_replace');
    t.equal(filter.pattern, 'and');
    t.equal(filter.replacement, '&');
    t.end();
  });
};

// this filter simply removes empty tokens which can occur when other
// filters do weird things, so just to be sure, we explicitly get rid of them
module.exports.tests.notnullFilter = function(test, common) {
  test('has notnull filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.notnull, 'object', 'there is a notnull filter');
    var filter = s.analysis.filter.notnull;
    t.equal(filter.type, 'length');
    t.equal(filter.min, 1);
    t.end();
  });
};

// this filter creates edgeNGrams with the minimum size of 1
module.exports.tests.peliasOneEdgeGramFilter = function(test, common) {
  test('has peliasOneEdgeGram filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.peliasOneEdgeGramFilter, 'object', 'there is a peliasOneEdgeGram filter');
    var filter = s.analysis.filter.peliasOneEdgeGramFilter;
    t.equal(filter.type, 'edgeNGram');
    t.equal(filter.min_gram, 1);
    t.equal(filter.max_gram, 10);
    t.end();
  });
};

// this filter creates edgeNGrams with the minimum size of 2
module.exports.tests.peliasTwoEdgeGramFilter = function(test, common) {
  test('has peliasTwoEdgeGram filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.peliasTwoEdgeGramFilter, 'object', 'there is a peliasTwoEdgeGram filter');
    var filter = s.analysis.filter.peliasTwoEdgeGramFilter;
    t.equal(filter.type, 'edgeNGram');
    t.equal(filter.min_gram, 2);
    t.equal(filter.max_gram, 10);
    t.end();
  });
};

// this filter removed leading 0 characters. eg. 0001 -> 1
module.exports.tests.removeAllZeroNumericPrefixFilter = function(test, common) {
  test('has removeAllZeroNumericPrefix filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.removeAllZeroNumericPrefix, 'object', 'there is a removeAllZeroNumericPrefix filter');
    var filter = s.analysis.filter.removeAllZeroNumericPrefix;
    t.equal(filter.type, 'pattern_replace');
    t.equal(filter.pattern, '^(0*)');
    t.equal(filter.replacement, '');
    t.end();
  });
};

// this filter can be used to remove certain common words in order to keep
// the index size down and the execution speed quick.
// note: it is not intended to be used with shingles, but useful for ngrams
module.exports.tests.addressStopFilter = function(test, common) {
  test('has address_stop filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.address_stop, 'object', 'there is an address_stop filter');
    var filter = s.analysis.filter.address_stop;
    t.equal(filter.type, 'stop');
    t.deepEqual(filter.stopwords, [
      "alley", "avenue", "boulevard", "bypass", "crescent", "drive", "esplanade",
      "expressway", "field", "freeway", "garden", "green", "grove", "heights",
      "highway", "lane", "mews", "parade", "pike", "place", "promenade", "road",
      "row", "street", "terrace", "turnpike", "viaduct", "way"
    ]);
    t.end();
  });
};

// this filter stems common street suffixes
// eg. road=>rd and street=>st
module.exports.tests.streetSynonymFilter = function(test, common) {
  test('has street_synonym filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.street_synonym, 'object', 'there is an street_synonym filter');
    var filter = s.analysis.filter.street_synonym;
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 18);
    t.end();
  });
};

// this filter stems common directional terms
// eg. north=>n and south=>s
module.exports.tests.directionSynonymFilter = function(test, common) {
  test('has direction_synonym filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.filter.direction_synonym, 'object', 'there is an direction_synonym filter');
    var filter = s.analysis.filter.direction_synonym;
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 8);
    t.end();
  });
};

// -- char filters --

// we use a custom punctuation filter in order to allow the ampersand
// character which would otherwise be stripped by the standard tokenizer
module.exports.tests.punctuationCharFilter = function(test, common) {
  test('has punctuation char_filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.char_filter.punctuation, 'object', 'there is a punctuation char_filter');
    var char_filter = s.analysis.char_filter.punctuation;
    t.equal(char_filter.type, 'mapping');
    t.true(Array.isArray(char_filter.mappings));
    t.equal(char_filter.mappings.length, 50);
    t.end();
  });
};

// remove non alphanumeric characters
module.exports.tests.alphanumericCharFilter = function(test, common) {
  test('has alphanumeric char_filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.char_filter.alphanumeric, 'object', 'there is a alphanumeric char_filter');
    var char_filter = s.analysis.char_filter.alphanumeric;
    t.equal(char_filter.type, 'pattern_replace');
    t.equal(char_filter.pattern, '[^a-zA-Z0-9]');
    t.equal(char_filter.replacement, '');
    t.end();
  });
};

// replace non-numeric chars with a space
module.exports.tests.numericCharFilter = function(test, common) {
  test('has numeric char_filter', function(t) {
    var s = settings();
    t.equal(typeof s.analysis.char_filter.numeric, 'object', 'there is a numeric char_filter');
    var char_filter = s.analysis.char_filter.numeric;
    t.equal(char_filter.type, 'pattern_replace');
    t.equal(char_filter.pattern, '[^0-9]');
    t.equal(char_filter.replacement, ' ');
    t.end();
  });
};

// -- etc --

// index should always be set
module.exports.tests.index = function(test, common) {
  test('has index settings', function(t) {
    var s = settings();
    t.equal(typeof s.index, 'object', 'index specified');
    t.equal(s.index.number_of_replicas, "0", 'replicas will increase index time');
    t.equal(s.index.number_of_shards, "1", 'sharding is only required in a distributed env');
    t.equal(s.index.index_concurrency, "10", 'number of concurrent threads that are allowed to perform indexing at the same time');
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

    s = settings();
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
