const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const peliasConfig = require('pelias-config');
const punctuation = require('./punctuation');
const synonymFile = require('./synonyms/parser');

// load synonyms from disk
const synonyms = fs.readdirSync(path.join(__dirname, 'synonyms'))
                 .sort()
                 .filter( f => f.match(/\.txt$/) )
                 .reduce(( acc, cur ) => {
                   acc[cur.replace('.txt','')] = synonymFile(
                     path.join(__dirname, 'synonyms', cur)
                   );
                   return acc;
                 }, {});

require('./configValidation').validate(peliasConfig.generate());

function generate(){
  var config = peliasConfig.generate();

  // Default settings
  var settings = {
    "analysis": {
      "tokenizer": {
        "peliasNameTokenizer": {
          "type": "pattern",
          "pattern": "[\\s,/\\\\-]+"
        },
        "peliasStreetTokenizer": {
          "type": "pattern",
          "pattern": "[\\s,/\\\\-]+"
        }
      },
      "analyzer": {
        "peliasAdmin": {
          "type": "custom",
          "tokenizer": "peliasNameTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "custom_admin",
            "word_delimiter",
            "unique_only_same_position",
            "notnull",
            "flatten_graph"
          ]
        },
        "peliasIndexOneEdgeGram" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "custom_name",
            "street_suffix",
            "directionals",
            "ampersand",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "peliasOneEdgeGramFilter",
            "unique_only_same_position",
            "notnull",
            "flatten_graph"
          ]
        },
        "peliasQuery": {
          "type": "custom",
          "tokenizer": "peliasNameTokenizer",
          "char_filter": ["punctuation", "nfkc_normalizer"],
          "filter": [
            "icu_folding",
            "lowercase",
            "trim",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasQueryPartialToken" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "partial_token_address_suffix_expansion",
            "ampersand",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasQueryFullToken" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "remove_ordinals",
            "street_suffix",
            "directionals",
            "ampersand",
            "removeAllZeroNumericPrefix",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasPhrase": {
          "type": "custom",
          "tokenizer":"peliasNameTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "remove_duplicate_spaces",
            "ampersand",
            "custom_name",
            "street_suffix",
            "directionals",
            "icu_folding",
            "remove_ordinals",
            "unique_only_same_position",
            "notnull",
            "flatten_graph"
          ]
        },
        "peliasZip": {
          "type": "custom",
          "tokenizer":"keyword",
          "char_filter" : ["alphanumeric"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasUnit": {
          "type": "custom",
          "tokenizer":"keyword",
          "char_filter" : ["alphanumeric"],
          "filter": [
            "lowercase",
            "icu_folding",
            "trim",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasHousenumber": {
          "type": "custom",
          "tokenizer":"standard",
          "char_filter" : ["numeric"]
        },
        "peliasStreet": {
          "type": "custom",
          "tokenizer":"peliasStreetTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "remove_duplicate_spaces",
            "custom_street",
            "street_suffix",
            "directionals",
            "icu_folding",
            "remove_ordinals",
            "trim",
            "unique_only_same_position",
            "notnull",
            "flatten_graph"
          ]
        }
      },
      "filter" : {
        "notnull" :{
          "type" : "length",
          "min" : 1
        },
        "unique_only_same_position": {
          "type": "unique",
          "only_on_same_position": "true"
        },
        "peliasOneEdgeGramFilter": {
          "type" : "edgeNGram",
          "min_gram" : 1,
          "max_gram" : 24
        },
        "removeAllZeroNumericPrefix" :{
          "type" : "pattern_replace",
          "pattern" : "^(0*)",
          "replacement" : ""
        },
        "remove_ordinals" : {
          "type" : "pattern_replace",
          "pattern": "(?i)((^| )((1)st?|(2)nd?|(3)rd?|([4-9])th?)|(([0-9]*)(1[0-9])th?)|(([0-9]*[02-9])((1)st?|(2)nd?|(3)rd?|([04-9])th?))($| ))",
          "replacement": "$2$4$5$6$7$9$10$12$14$15$16$17$18"
        },
        "remove_duplicate_spaces" : {
          "type" : "pattern_replace",
          "pattern": " +",
          "replacement": " "
        },
        // more generated below
      },
      "char_filter": {
        "punctuation" : {
          "type" : "mapping",
          "mappings" : punctuation.blacklist.map(function(c){
            return c + '=>';
          })
        },
        "alphanumeric" : {
          "type" : "pattern_replace",
          "pattern": "[^a-zA-Z0-9]",
          "replacement": ""
        },
        "numeric" : {
          "type" : "pattern_replace",
          "pattern": "[^0-9]",
          "replacement": " "
        },
        "nfkc_normalizer": {
          "type": "icu_normalizer",
          "name": "nfkc",
          "mode": "compose"
        }
      }
    }
  };

  // dynamically create filters for all synonym files in the ./synonyms directory.
  // each filter is given the same name as the file, minus the extension.
  for( var key in synonyms ){
    settings.analysis.filter[key] = {
      "type": "synonym",
      "synonyms": !!synonyms[key].length ? synonyms[key] : ['']
    };
  }

  // Merge settings from pelias/config
  if( 'object' === typeof config &&
      'object' === typeof config.elasticsearch &&
      'object' === typeof config.elasticsearch.settings ){
    return _.merge({}, settings, config.elasticsearch.settings);
  }

  return settings;
}

module.exports = generate;
