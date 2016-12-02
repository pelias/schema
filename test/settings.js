var path = require('path');

// set the PELIAS_CONFIG env var
process.env['PELIAS_CONFIG'] = path.resolve( __dirname + '/fixtures/config.json' );

var config = require('pelias-config').generate().export(),
    settings = require('../settings'),
    fs = require('fs');

process.env['PELIAS_CONFIG'] = path.resolve( __dirname + '/fixtures/alt_config.json' );
var alt_config = require('pelias-config').generate().export();

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof settings, 'function', 'settings is a function');
    t.end();
  });
};

module.exports.tests.compile = function(test, common) {
  test('valid settings file', function(t) {
    var s = settings(config);
    t.equal(typeof s, 'object', 'settings generated');
    t.equal(Object.keys(s).length>0, true, 'settings has body');
    t.end();
  });
};

// analysis should always be set
module.exports.tests.analysis = function(test, common) {
  test('has analysis settings', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis, 'object', 'analysis specified');
    t.end();
  });
};

// -- analyzers --

module.exports.tests.peliasAdminAnalyzer = function(test, common) {
  test('has pelias admin analyzer', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasAdmin, 'object', 'there is a pelias admin analyzer');
    var analyzer = s.analysis.analyzer.peliasAdmin;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
};

module.exports.tests.peliasIndexOneEdgeGramAnalyzer = function(test, common) {
  test('has peliasIndexOneEdgeGram analyzer', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasIndexOneEdgeGram, 'object', 'there is a peliasIndexOneEdgeGram analyzer');
    var analyzer = s.analysis.analyzer.peliasIndexOneEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation","nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasIndexOneEdgeGram token filters', function(t) {
    var analyzer = settings(config).analysis.analyzer.peliasIndexOneEdgeGram;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "icu_folding",
      "trim",
      "full_token_address_suffix_expansion",
      "ampersand",
      "remove_ordinals",
      "removeAllZeroNumericPrefix",
      "surround_single_characters_with_word_markers",
      "house_number_word_delimiter",
      "remove_single_characters",
      "surround_house_numbers_with_word_markers",
      "peliasOneEdgeGramFilter",
      "eliminate_tokens_starting_with_word_marker",
      "remove_encapsulating_word_markers",
      "unique",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasIndexTwoEdgeGramAnalyzer = function(test, common) {
  test('has peliasIndexTwoEdgeGram analyzer', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasIndexTwoEdgeGram, 'object', 'there is a peliasIndexTwoEdgeGram analyzer');
    var analyzer = s.analysis.analyzer.peliasIndexTwoEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation","nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasIndexTwoEdgeGram token filters', function(t) {
    var analyzer = settings(config).analysis.analyzer.peliasIndexTwoEdgeGram;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "icu_folding",
      "trim",
      "full_token_address_suffix_expansion",
      "ampersand",
      "remove_ordinals",
      "removeAllZeroNumericPrefix",
      "prefixZeroToSingleDigitNumbers",
      "peliasTwoEdgeGramFilter",
      "removeAllZeroNumericPrefix",
      "direction_synonym_contraction_keep_original",
      "unique",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasPhraseAnalyzer = function(test, common) {
  test('has peliasPhrase analyzer', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasPhrase, 'object', 'there is a peliasPhrase analyzer');
    var analyzer = s.analysis.analyzer.peliasPhrase;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation","nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasPhrase token filters', function(t) {
    var analyzer = settings(config).analysis.analyzer.peliasPhrase;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "icu_folding",
      "trim",
      "ampersand",
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
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasZip, 'object', 'there is a peliasZip analyzer');
    var analyzer = s.analysis.analyzer.peliasZip;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["alphanumeric"], 'alphanumeric filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasZip token filters', function(t) {
    var analyzer = settings(config).analysis.analyzer.peliasZip;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "trim"
    ]);
    t.end();
  });
};

module.exports.tests.peliasHousenumberAnalyzer = function(test, common) {
  test('has peliasHousenumber analyzer', function(t) {
    var s = settings(config);
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
    var s = settings(config);
    t.equal(typeof s.analysis.analyzer.peliasStreet, 'object', 'there is a peliasStreet analyzer');
    var analyzer = s.analysis.analyzer.peliasStreet;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["punctuation","nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasStreet token filters', function(t) {
    var analyzer = settings(config).analysis.analyzer.peliasStreet;
    t.equal( analyzer.filter.length, 133, 'lots of filters' );
    t.end();
  });
};

// cycle through all analyzers and ensure the corrsponding token filters are defined
module.exports.tests.allTokenFiltersPresent = function(test, common) {
  var ES_INBUILT_FILTERS = [
    'lowercase', 'icu_folding', 'trim', 'word_delimiter', 'unique'
  ];
  test('all token filters present', function(t) {
    var s = settings(config);
    for( var analyzerName in s.analysis.analyzer ){
      var analyzer = s.analysis.analyzer[analyzerName];
      if( Array.isArray( analyzer.filter ) ){
        analyzer.filter.forEach( function( tokenFilterName ){
          var filterExists = s.analysis.filter.hasOwnProperty( tokenFilterName );
          if( !filterExists && -1 < ES_INBUILT_FILTERS.indexOf( tokenFilterName ) ){
            filterExists = true;
          }
          t.true( filterExists, 'token filter exists: ' + tokenFilterName );
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
    var s = settings(config);
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
    var s = settings(config);
    t.equal(typeof s.analysis.filter.ampersand, 'object', 'there is a ampersand filter');
    var filter = s.analysis.filter.ampersand;
    t.equal(filter.type, 'synonym');
    t.deepEqual(filter.synonyms, [ "and => &" ]);
    t.end();
  });
};

// this filter simply removes empty tokens which can occur when other
// filters do weird things, so just to be sure, we explicitly get rid of them
module.exports.tests.notnullFilter = function(test, common) {
  test('has notnull filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.notnull, 'object', 'there is a notnull filter');
    var filter = s.analysis.filter.notnull;
    t.equal(filter.type, 'length');
    t.equal(filter.min, 1);
    t.end();
  });
};

// this filter creates edgeNGrams with the minimum size of 1
module.exports.tests.peliasOneEdgeGramFilter = function(test, common) {
  test('has peliasIndexOneEdgeGram filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.peliasOneEdgeGramFilter, 'object', 'there is a peliasIndexOneEdgeGram filter');
    var filter = s.analysis.filter.peliasOneEdgeGramFilter;
    t.equal(filter.type, 'edgeNGram');
    t.equal(filter.min_gram, 1);
    t.equal(filter.max_gram, 18);
    t.end();
  });
};

// this filter creates edgeNGrams with the minimum size of 2
module.exports.tests.peliasTwoEdgeGramFilter = function(test, common) {
  test('has peliasIndexTwoEdgeGram filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.peliasTwoEdgeGramFilter, 'object', 'there is a peliasIndexTwoEdgeGram filter');
    var filter = s.analysis.filter.peliasTwoEdgeGramFilter;
    t.equal(filter.type, 'edgeNGram');
    t.equal(filter.min_gram, 2);
    t.equal(filter.max_gram, 18);
    t.end();
  });
};

// this filter removed leading 0 characters. eg. 0001 -> 1
module.exports.tests.removeAllZeroNumericPrefixFilter = function(test, common) {
  test('has removeAllZeroNumericPrefix filter', function(t) {
    var s = settings(config);
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
    var s = settings(config);
    t.equal(typeof s.analysis.filter.address_stop, 'object', 'there is an address_stop filter');
    var filter = s.analysis.filter.address_stop;
    t.equal(filter.type, 'stop');
    t.deepEqual(filter.stopwords, [
      "alley", "annex", "avenue",
      "bay", "bayou", "beach", "beltway", "bend", "bluff", "bluffs", "boulevard", "bottom", "branch", "bridge", "brook", "bypass",
      "canyon", "cape", "causeway", "center", "channel", "circle", "cliff", "club", "common", "commons", "connector", "corridor",
      "course", "cove", "creek", "crescent", "crest", "crossing", "crossroad", "crossroads", "curve",
      "dale", "dam", "drive",
      "esplanade", "expressway", "extended",
      "falls", "ferry", "field", "fields", "flat", "flats", "ford", "forest", "forge", "fork", "forks", "freeway",
      "garden", "gardens", "gateway", "glen", "glenn", "green", "grove",
      "harbor", "haven", "heights", "highway", "hill", "hills", "hollow",
      "isle",
      "junction",
      "key", "keys", "knoll", "knolls",
      "landing", "lane", "light", "lights", "lock", "locks",
      "manor", "meadow", "meadows", "mews", "mill", "mills", "mountain", "motorway",
      "neck",
      "orchard",
      "parade", "parkway", "passage", "pier", "pike", "pine", "pines", "place", "plaza", "promenade",
      "ranch", "ridge", "ridges", "river", "road", "route", "row",
      "shore", "shores", "skyway", "spring", "springs", "square", "street",
      "terrace", "trail", "trafficway", "tunnel", "turnpike",
      "valley", "vista", "village", "viaduct",
      "way"
    ]);
    t.end();
  });
};

// this filter stems common street suffixes
// eg. road=>rd and street=>st
module.exports.tests.streetSynonymFilter = function(test, common) {
  test('has street_synonym filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.street_synonym, 'object', 'there is an street_synonym filter');
    var filter = s.analysis.filter.street_synonym;
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 120);
    t.end();
  });
};

// this filter stems common directional terms
// eg. north=>n and south=>s
module.exports.tests.directionSynonymFilter = function(test, common) {
  test('has direction_synonym filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.direction_synonym, 'object', 'there is an direction_synonym filter');
    var filter = s.analysis.filter.direction_synonym;
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 8);
    t.end();
  });
};

// this filter removes number ordinals
// eg. 26th => 26, 1st => 1
module.exports.tests.removeOrdinalsFilter = function(test, common) {
  test('has remove_ordinals filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.filter.remove_ordinals, 'object', 'there is an remove_ordinals filter');
    var filter = s.analysis.filter.remove_ordinals;
    t.equal(filter.type, 'pattern_replace');
    t.equal(filter.pattern, '(?i)((^| )((1)st?|(2)nd?|(3)rd?|([4-9])th?)|(([0-9]*)(1[0-9])th?)|(([0-9]*[02-9])((1)st?|(2)nd?|(3)rd?|([04-9])th?))($| ))');
    t.equal(filter.replacement, '$2$4$5$6$7$9$10$12$14$15$16$17$18');
    t.end();
  });
};

// -- char filters --

// we use a custom punctuation filter in order to allow the ampersand
// character which would otherwise be stripped by the standard tokenizer
module.exports.tests.punctuationCharFilter = function(test, common) {
  test('has punctuation char_filter', function(t) {
    var s = settings(config);
    t.equal(typeof s.analysis.char_filter.punctuation, 'object', 'there is a punctuation char_filter');
    var char_filter = s.analysis.char_filter.punctuation;
    t.equal(char_filter.type, 'mapping');
    t.true(Array.isArray(char_filter.mappings));
    t.equal(char_filter.mappings.length, 47);
    t.end();
  });
};

// remove non alphanumeric characters
module.exports.tests.alphanumericCharFilter = function(test, common) {
  test('has alphanumeric char_filter', function(t) {
    var s = settings(config);
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
    var s = settings(config);
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
    var s = settings(config);
    t.equal(typeof s.index, 'object', 'index specified');
    t.equal(s.index.number_of_replicas, "0", 'replicas will increase index time');
    t.equal(s.index.number_of_shards, "1", 'sharding is only required in a distributed env');
    t.end();
  });
};

// allow overrides from pelias/config
module.exports.tests.overrides = function(test, common) {
  test('override defaults', function(t) {

    var s = settings(config);
    t.equal(s.index['number_of_replicas'], '0', 'unchanged');

    s = settings(alt_config);
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
