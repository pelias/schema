const path = require('path'),
    settings = require('../settings'),
    fs = require('fs'),
    config = require('pelias-config').generate();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof settings, 'function', 'settings is a function');
    t.end();
  });
};

module.exports.tests.configValidation = (test, common) => {
  test('configValidation throwing error should rethrow', t => {
    t.throws(() => {
      const proxyquire = require('proxyquire').noCallThru();
      proxyquire('../settings', {
        './configValidation': {
          validate: () => {
            throw Error('config is not valid');
          }
        }
      })();

    }, /config is not valid/);

    t.end();

  });
};

module.exports.tests.compile = (test, common) => {
  test('valid settings file', t => {
    const s = settings();
    t.equal(typeof s, 'object', 'settings generated');
    t.equal(Object.keys(s).length>0, true, 'settings has body');
    t.end();
  });
};

// analysis should always be set
module.exports.tests.analysis = (test, common) => {
  test('has analysis settings', t => {
    const s = settings();
    t.equal(typeof s.analysis, 'object', 'analysis specified');
    t.end();
  });
};

function mayBeAmpersandMapper() {
  if (config.schema.icuTokenizer) {
    return ['ampersand_mapper'];
  }
  return [];
}

function mayBeAmpersandReplacer() {
  if (config.schema.icuTokenizer) {
    return ['ampersand_replacer'];
  }
  return [];
}

// -- analyzers --

module.exports.tests.peliasAdminAnalyzer = (test, common) => {
  test('has pelias admin analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasAdmin, 'object', 'there is a pelias admin analyzer');
    const analyzer = s.analysis.analyzer.peliasAdmin;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), 'punctuation', 'nfkc_normalizer'], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasAdmin token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasAdmin;
    t.deepEqual(analyzer.filter, [...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "synonyms/custom_admin/multiword",
      "admin_synonyms_multiplexer",
      "icu_folding",
      "word_delimiter",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

module.exports.tests.peliasIndexOneEdgeGramAnalyzer = (test, common) => {
  test('has peliasIndexOneEdgeGram analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasIndexOneEdgeGram, 'object', 'there is a peliasIndexOneEdgeGram analyzer');
    const analyzer = s.analysis.analyzer.peliasIndexOneEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), "punctuation","nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasIndexOneEdgeGram token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasIndexOneEdgeGram;
    t.deepEqual( analyzer.filter, [
      ...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "synonyms/custom_name/multiword",
      "synonyms/custom_street/multiword",
      "synonyms/custom_admin/multiword",
      "name_synonyms_multiplexer",
      "icu_folding",
      "remove_ordinals",
      "peliasOneEdgeGramFilter",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

module.exports.tests.peliasQueryAnalyzer = (test, common) => {
  test('has peliasQuery analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasQuery, 'object', 'there is a peliasQuery analyzer');
    const analyzer = s.analysis.analyzer.peliasQuery;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), 'punctuation', 'nfkc_normalizer'], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasQuery token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasQuery;
    t.deepEqual(analyzer.filter, [
      ...mayBeAmpersandReplacer(),
      'lowercase',
      'trim',
      'icu_folding',
      'remove_ordinals',
      'unique_only_same_position',
      'notnull'
    ]);
    t.end();
  });
};

module.exports.tests.peliasPhraseAnalyzer = (test, common) => {
  test('has peliasPhrase analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasPhrase, 'object', 'there is a peliasPhrase analyzer');
    const analyzer = s.analysis.analyzer.peliasPhrase;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), "punctuation", "nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasPhrase token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasPhrase;
    t.deepEqual( analyzer.filter, [
      ...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "remove_duplicate_spaces",
      "synonyms/custom_name/multiword",
      "synonyms/custom_street/multiword",
      "synonyms/custom_admin/multiword",
      "name_synonyms_multiplexer",
      "icu_folding",
      "remove_ordinals",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

module.exports.tests.peliasZipAnalyzer = (test, common) => {
  test('has peliasZip analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasZip, 'object', 'there is a peliasZip analyzer');
    const analyzer = s.analysis.analyzer.peliasZip;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ['alphanumeric', 'nfkc_normalizer'], 'alphanumeric filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasZip token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasZip;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "trim",
      "icu_folding",
      "unique_only_same_position",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasUnitAnalyzer = (test, common) => {
  test('has peliasUnit analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasUnit, 'object', 'there is a peliasUnit analyzer');
    const analyzer = s.analysis.analyzer.peliasUnit;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ['alphanumeric', 'nfkc_normalizer'], 'alphanumeric filter specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasUnit token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasUnit;
    t.deepEqual( analyzer.filter, [
      "lowercase",
      "trim",
      "icu_folding",
      "unique_only_same_position",
      "notnull"
    ]);
    t.end();
  });
};

module.exports.tests.peliasHousenumberAnalyzer = (test, common) => {
  test('has peliasHousenumber analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasHousenumber, 'object', 'there is a peliasHousenumber analyzer');
    const analyzer = s.analysis.analyzer.peliasHousenumber;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, ["numeric"], 'numeric filter specified');
    t.false(Array.isArray(analyzer.filter), 'no filters specified');
    t.end();
  });
};

module.exports.tests.peliasStreetAnalyzer = (test, common) => {
  test('has peliasStreet analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasStreet, 'object', 'there is a peliasStreet analyzer');
    const analyzer = s.analysis.analyzer.peliasStreet;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), 'punctuation', 'nfkc_normalizer'], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasStreet token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasStreet;
    t.deepEqual( analyzer.filter, [...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "remove_duplicate_spaces",
      "synonyms/custom_street/multiword",
      "street_synonyms_multiplexer",
      "icu_folding",
      "remove_ordinals",
      "trim",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

module.exports.tests.peliasIndexCountryAbbreviation = (test, common) => {
  test('has peliasIndexCountryAbbreviation analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasIndexCountryAbbreviation, 'object', 'there is a peliasIndexCountryAbbreviation analyzer');
    const analyzer = s.analysis.analyzer.peliasIndexCountryAbbreviation;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), 'punctuation', 'nfkc_normalizer'], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasIndexCountryAbbreviation token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasIndexCountryAbbreviation;
    t.deepEqual(analyzer.filter, [...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "icu_folding",
      "country_abbreviation_synonyms_multiplexer",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

module.exports.tests.peliasIndexCountryAbbreviationOneEdgeGramAnalyzer = (test, common) => {
  test('has peliasIndexCountryAbbreviationOneEdgeGram analyzer', t => {
    const s = settings();
    t.equal(typeof s.analysis.analyzer.peliasIndexCountryAbbreviationOneEdgeGram, 'object', 'there is a peliasIndexCountryAbbreviationOneEdgeGram analyzer');
    const analyzer = s.analysis.analyzer.peliasIndexCountryAbbreviationOneEdgeGram;
    t.equal(analyzer.type, 'custom', 'custom analyzer');
    t.equal(typeof analyzer.tokenizer, 'string', 'tokenizer specified');
    t.deepEqual(analyzer.char_filter, [...mayBeAmpersandMapper(), "punctuation", "nfkc_normalizer"], 'character filters specified');
    t.true(Array.isArray(analyzer.filter), 'filters specified');
    t.end();
  });
  test('peliasIndexCountryAbbreviationOneEdgeGram token filters', t => {
    const analyzer = settings().analysis.analyzer.peliasIndexCountryAbbreviationOneEdgeGram;
    t.deepEqual(analyzer.filter, [
      ...mayBeAmpersandReplacer(),
      "lowercase",
      "trim",
      "icu_folding",
      "country_abbreviation_synonyms_multiplexer",
      "peliasOneEdgeGramFilter",
      "unique_only_same_position",
      "notnull",
      "flatten_graph"
    ]);
    t.end();
  });
};

// -- token filters --

// this multiplexer filter provides all the synonyms used by the peliasAdmin analyzer
// note: the multiplexer ensures than we do not virally generate synonyms of synonyms.
module.exports.tests.adminSynonymsMultiplexerFilter = (test, common) => {
  test('has admin_synonyms_multiplexer filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.admin_synonyms_multiplexer, 'object', 'there is a admin_synonyms_multiplexer filter');
    const filter = s.analysis.filter.admin_synonyms_multiplexer;
    t.equal(filter.type, 'multiplexer');
    t.deepEqual(filter.filters, [
      'synonyms/custom_admin',
      'synonyms/personal_titles',
      'synonyms/place_names'
    ]);
    t.end();
  });
};

// this multiplexer filter provides all the synonyms for country codes.
module.exports.tests.countryAbbreviationSynonymsMultiplexerFilter = (test, common) => {
  test('has country_abbreviation_synonyms_multiplexer filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.country_abbreviation_synonyms_multiplexer, 'object', 'there is a country_abbreviation_synonyms_multiplexer filter');
    const filter = s.analysis.filter.country_abbreviation_synonyms_multiplexer;
    t.equal(filter.type, 'multiplexer');
    t.deepEqual(filter.filters, [
      'synonyms/country_codes'
    ]);
    t.end();
  });
};

// this multiplexer filter provides all the synonyms used by the peliasPhrase and peliasIndexOneEdgeGram analyzers
// note: the multiplexer ensures than we do not virally generate synonyms of synonyms.
module.exports.tests.nameSynonymsMultiplexerFilter = (test, common) => {
  test('has name_synonyms_multiplexer filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.name_synonyms_multiplexer, 'object', 'there is a name_synonyms_multiplexer filter');
    const filter = s.analysis.filter.name_synonyms_multiplexer;
    t.equal(filter.type, 'multiplexer');
    t.deepEqual(filter.filters, [
      'synonyms/custom_name',
      'synonyms/custom_street',
      'synonyms/custom_admin',
      'synonyms/personal_titles',
      'synonyms/place_names',
      'synonyms/streets',
      'synonyms/directionals',
      'synonyms/punctuation',
      'synonyms/british_american_english'
    ]);
    t.end();
  });
};

// this multiplexer filter provides all the synonyms used by the peliasStreet analyzer
// note: the multiplexer ensures than we do not virally generate synonyms of synonyms.
module.exports.tests.streetSynonymsMultiplexerFilter = (test, common) => {
  test('has street_synonyms_multiplexer filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.street_synonyms_multiplexer, 'object', 'there is a street_synonyms_multiplexer filter');
    const filter = s.analysis.filter.street_synonyms_multiplexer;
    t.equal(filter.type, 'multiplexer');
    t.deepEqual(filter.filters, [
      'synonyms/custom_street',
      'synonyms/personal_titles',
      'synonyms/streets',
      'synonyms/directionals',
      'synonyms/british_american_english'
    ]);
    t.end();
  });
};

// cycle through all analyzers and ensure the corrsponding token filters are globally defined
module.exports.tests.allTokenFiltersPresent = (test, common) => {
  const ES_INBUILT_FILTERS = [
    'lowercase', 'icu_folding', 'trim', 'word_delimiter', 'unique', 'flatten_graph'
  ];
  test('all token filters present', t => {
    const s = settings();
    for( const analyzerName in s.analysis.analyzer ){
      const analyzer = s.analysis.analyzer[analyzerName];
      if( Array.isArray( analyzer.filter ) ){
        analyzer.filter.forEach( tokenFilterName => {
          const filterExists = (
            s.analysis.filter.hasOwnProperty( tokenFilterName ) ||
            ES_INBUILT_FILTERS.includes( tokenFilterName )
          );
          t.true( filterExists, 'token filter exists: ' + tokenFilterName );
        });
      }
    }
    t.end();
  });
};

// cycle through all analyzers and ensure the mandatory token filters are defined on each
module.exports.tests.mandatoryTokenFiltersPresent = (test, common) => {
  const MANDATORY_FILTERS = [
    'lowercase', 'icu_folding', 'trim', 'unique_only_same_position', 'notnull'
  ];
  test('mandatory filters present', t => {
    const s = settings();
    for (const analyzerName in s.analysis.analyzer) {
      const analyzer = s.analysis.analyzer[analyzerName];
      if (Array.isArray(analyzer.filter)) {
        MANDATORY_FILTERS.forEach(filterName => {
          t.true(
            analyzer.filter.includes(filterName),
            `mandatory token filter ${filterName} not defined on ${analyzerName}`
          );
        });
      }
    }
    t.end();
  });
};

// cycle through all analyzers and ensure the corrsponding character filters are defined
module.exports.tests.allCharacterFiltersPresent = (test, common) => {
  const ES_INBUILT_FILTERS = [];
  test('all character filters present', t => {
    const s = settings();
    for( const analyzerName in s.analysis.analyzer ){
      const analyzer = s.analysis.analyzer[analyzerName];
      if( Array.isArray( analyzer.char_filter ) ){
        analyzer.char_filter.forEach( charFilterName => {
          let filterExists = s.analysis.char_filter.hasOwnProperty( charFilterName );
          if( !filterExists && ES_INBUILT_FILTERS.includes(charFilterName) ){
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
module.exports.tests.punctuationFilter = (test, common) => {
  test('has punctuation filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/punctuation'], 'object', 'there is a punctuation filter');
    const filter = s.analysis.filter['synonyms/punctuation'];
    t.equal(filter.type, 'synonym');
    t.deepEqual(filter.synonyms, [
      "&,and",
      "&,und"
    ]);
    t.end();
  });
};

// this filter simply removes empty tokens which can occur when other
// filters do weird things, so just to be sure, we explicitly get rid of them
module.exports.tests.notnullFilter = (test, common) => {
  test('has notnull filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.notnull, 'object', 'there is a notnull filter');
    const filter = s.analysis.filter.notnull;
    t.equal(filter.type, 'length');
    t.equal(filter.min, 1);
    t.end();
  });
};

// this filter creates edgeNGrams with the minimum size of 1
module.exports.tests.peliasOneEdgeGramFilter = (test, common) => {
  test('has peliasIndexOneEdgeGram filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.peliasOneEdgeGramFilter, 'object', 'there is a peliasIndexOneEdgeGram filter');
    const filter = s.analysis.filter.peliasOneEdgeGramFilter;
    t.equal(filter.type, 'edge_ngram');
    t.equal(filter.min_gram, 1);
    t.equal(filter.max_gram, 24);
    t.end();
  });
};

// this filter provides synonyms for street suffixes
// eg. road=>rd
module.exports.tests.streetSynonymFilter = (test, common) => {
  test('has synonyms/streets filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/streets'], 'object', 'there is a synonyms/streets filter');
    const filter = s.analysis.filter['synonyms/streets'];
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 809);
    t.end();
  });
};

// this filter stems common directional terms
// eg. north=>n and south=>s
module.exports.tests.directionalSynonymFilter = (test, common) => {
  test('has directionals filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/directionals'], 'object', 'there is a synonyms/directionals filter');
    const filter = s.analysis.filter['synonyms/directionals'];
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 69);
    t.end();
  });
};

// this filter provides common synonyms for personal titles
// eg. doctor=>dr
module.exports.tests.personalTitleSynonymFilter = (test, common) => {
  test('has personal_titles filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/personal_titles'], 'object', 'there is a synonyms/personal_titles filter');
    const filter = s.analysis.filter['synonyms/personal_titles'];
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 191);
    t.end();
  });
};

// this filter provides common synonyms for place names
// eg. park=>pk
module.exports.tests.placeNameSynonymFilter = (test, common) => {
  test('has place_names filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/place_names'], 'object', 'there is a synonyms/place_names filter');
    const filter = s.analysis.filter['synonyms/place_names'];
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 314);
    t.end();
  });
};

// this filter removes number ordinals
// eg. 26th => 26, 1st => 1
module.exports.tests.removeOrdinalsFilter = (test, common) => {
  test('has remove_ordinals filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter.remove_ordinals, 'object', 'there is an remove_ordinals filter');
    const filter = s.analysis.filter.remove_ordinals;
    t.equal(filter.type, 'pattern_replace');
    t.equal(filter.pattern, '(?i)((^| )((1)st?|(2)nd?|(3)rd?|([4-9])th?)|(([0-9]*)(1[0-9])th?)|(([0-9]*[02-9])((1)st?|(2)nd?|(3)rd?|([04-9])th?))($| ))');
    t.equal(filter.replacement, '$2$4$5$6$7$9$10$12$14$15$16$17$18');
    t.end();
  });
};

// -- char filters --

// we use a custom punctuation filter in order to allow the ampersand
// character which would otherwise be stripped by the standard tokenizer
module.exports.tests.punctuationCharFilter = (test, common) => {
  test('has punctuation char_filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.char_filter.punctuation, 'object', 'there is a punctuation char_filter');
    const char_filter = s.analysis.char_filter.punctuation;
    t.equal(char_filter.type, 'mapping');
    t.true(Array.isArray(char_filter.mappings));
    t.equal(char_filter.mappings.length, 59);
    t.end();
  });
};

// remove non alphanumeric characters
module.exports.tests.alphanumericCharFilter = (test, common) => {
  test('has alphanumeric char_filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.char_filter.alphanumeric, 'object', 'there is a alphanumeric char_filter');
    const char_filter = s.analysis.char_filter.alphanumeric;
    t.equal(char_filter.type, 'pattern_replace');
    t.equal(char_filter.pattern, '[^a-zA-Z0-9]');
    t.equal(char_filter.replacement, '');
    t.end();
  });
};

// replace non-numeric chars with a space
module.exports.tests.numericCharFilter = (test, common) => {
  test('has numeric char_filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.char_filter.numeric, 'object', 'there is a numeric char_filter');
    const char_filter = s.analysis.char_filter.numeric;
    t.equal(char_filter.type, 'pattern_replace');
    t.equal(char_filter.pattern, '[^0-9]');
    t.equal(char_filter.replacement, ' ');
    t.end();
  });
};

// this filter provides british/american english synonyms
// eg. center<=>centre
module.exports.tests.britishAmericanEnglishSynonymFilter = (test, common) => {
  test('has british_american_english filter', t => {
    const s = settings();
    t.equal(typeof s.analysis.filter['synonyms/british_american_english'], 'object', 'there is a synonyms/british_american_english filter');
    const filter = s.analysis.filter['synonyms/british_american_english'];
    t.equal(filter.type, 'synonym');
    t.true(Array.isArray(filter.synonyms));
    t.equal(filter.synonyms.length, 255);
    t.end();
  });
};

// -- etc --

// index should always be set
module.exports.tests.index = (test, common) => {
  test('has index settings', t => {
    const s = settings();
    t.equal(typeof s.index, 'object', 'index specified');
    t.equal(s.index.number_of_replicas, "0", 'replicas will increase index time');
    t.equal(s.index.number_of_shards, "5", 'sharding value should use the elasticsearch default');
    t.end();
  });
};

// allow overrides from pelias/config
module.exports.tests.overrides = (test, common) => {
  test('override defaults', t => {

    process.env['PELIAS_CONFIG'] = path.resolve(__dirname + '/fixtures/empty.json');

    let s = settings();
    t.equal(s.index['number_of_replicas'], '0', 'unchanged');

    // set the PELIAS_CONFIG env var
    process.env['PELIAS_CONFIG'] = path.resolve( __dirname + '/fixtures/config.json' );

    s = settings();
    t.equal(s.index['number_of_replicas'], '999', 'changed');
    t.end();

    // unset the PELIAS_CONFIG env var
    delete process.env['PELIAS_CONFIG'];
  });
  test('override similarity', t => {

    process.env['PELIAS_CONFIG'] = path.resolve(__dirname + '/fixtures/empty.json');

    let s = settings();
    t.equal(s.index.similarity.peliasDefaultSimilarity.k1, 1.2, 'unchanged');

    // set the PELIAS_CONFIG env var
    process.env['PELIAS_CONFIG'] = path.resolve(__dirname + '/fixtures/similarity.json');

    s = settings();
    t.equal(s.index.similarity.peliasDefaultSimilarity.k1, 0, 'changed');
    t.equal(s.index.similarity.peliasDefaultSimilarity.b, 0.75, 'changed');
    t.end();

    // unset the PELIAS_CONFIG env var
    delete process.env['PELIAS_CONFIG'];
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('settings: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
