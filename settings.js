
var Mergeable = require('mergeable');
var peliasConfig = require('pelias-config');
var punctuation = require('./punctuation');
var street_suffix = require('./street_suffix');

var moduleDir = require('path').dirname("../");

function generate(){
  var config = peliasConfig.generate().export();

  // Default settings
  var settings = {
    "analysis": {
      "tokenizer": {
        "peliasNameTokenizer": {
          "type": "pattern",
          "pattern": "[\\s,/\\\\]+"
        },
        "peliasStreetTokenizer": {
          "type": "pattern",
          "pattern": "[,/\\\\]+"
        }
      },
      "analyzer": {
        "peliasAdmin": {
          "type": "custom",
          "tokenizer": "peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "word_delimiter",
            "notnull"
          ]
        },
        "peliasIndexOneEdgeGram" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "full_token_address_suffix_expansion",
            "ampersand",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "kstem",
            "peliasOneEdgeGramFilter",
            "unique",
            "notnull"
          ]
        },
        "peliasIndexTwoEdgeGram" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "full_token_address_suffix_expansion",
            "ampersand",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "kstem",
            "prefixZeroToSingleDigitNumbers",
            "peliasTwoEdgeGramFilter",
            "removeAllZeroNumericPrefix",
            "direction_synonym_contraction_keep_original",
            "unique",
            "notnull"
          ]
        },
        "peliasQueryPartialToken" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "partial_token_address_suffix_expansion",
            "ampersand",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "kstem",
            "unique",
            "notnull"
          ]
        },
        "peliasQueryFullToken" : {
          "type": "custom",
          "tokenizer" : "peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "remove_ordinals",
            "full_token_address_suffix_expansion",
            "ampersand",
            "removeAllZeroNumericPrefix",
            "kstem",
            "unique",
            "notnull"
          ]
        },
        "peliasPhrase": {
          "type": "custom",
          "tokenizer":"peliasNameTokenizer",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "ampersand",
            "kstem",
            "street_synonym",
            "direction_synonym",
            "unique",
            "notnull"
          ]
        },
        "peliasZip": {
          "type": "custom",
          "tokenizer":"keyword",
          "char_filter" : ["alphanumeric"],
          "filter": [
            "lowercase",
            "trim"
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
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "remove_duplicate_spaces",
          ].concat( street_suffix.synonyms.map( function( synonym ){
            return "keyword_street_suffix_" + synonym.split(' ')[0];
          })).concat( street_suffix.direction_synonyms.map( function( synonym ){
            return "keyword_compass_" + synonym.split(' ')[0];
          })).concat([
            "remove_ordinals",
            "trim"
          ])
        }
      },
      "filter" : {
        "ampersand" :{
          "type": "synonym",
          "synonyms": [ "and => &" ]
        },
        "notnull" :{
          "type" : "length",
          "min" : 1
        },
        "peliasOneEdgeGramFilter": {
          "type" : "edgeNGram",
          "min_gram" : 1,
          "max_gram" : 18
        },
        "peliasTwoEdgeGramFilter": {
          "type" : "edgeNGram",
          "min_gram" : 2,
          "max_gram" : 18
        },
        "prefixZeroToSingleDigitNumbers" :{
          "type" : "pattern_replace",
          "pattern" : "^([0-9])$",
          "replacement" : "0$1"
        },
        "removeAllZeroNumericPrefix" :{
          "type" : "pattern_replace",
          "pattern" : "^(0*)",
          "replacement" : ""
        },
        "address_stop": {
          "type": "stop",
          "stopwords": street_suffix.terms
        },
        "street_synonym": {
          "type": "synonym",
          "synonyms": street_suffix.synonyms
        },
        "partial_token_address_suffix_expansion": {
          "type": "synonym",
          "synonyms": street_suffix.partial_token_safe_expansions
        },
        "full_token_address_suffix_expansion": {
          "type": "synonym",
          "synonyms": street_suffix.full_token_safe_expansions
        },
        "direction_synonym": {
          "type": "synonym",
          "synonyms": street_suffix.direction_synonyms
        },
        "direction_synonym_contraction_keep_original": {
          "type": "synonym",
          "synonyms": street_suffix.direction_synonyms_keep_original
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
        }
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
        }
      }
    },
    "index": {
      "number_of_replicas": "0",
      "number_of_shards": "1",

      // A safe default can be 65% of the number of bounded cores (bounded at 32), with a minimum of 8 (which is the default in Lucene).
      "index_concurrency": "10"
    }
  };

  // dynamically create filters which can replace text *inside* a token.
  // we are not able to re-use the synonym functionality in elasticsearch
  // because it only matches whole tokens, not strings *within* tokens.
  // eg. synonyms are capable of ['street'] => ['st'] but not
  // ['sesame street'] => ['sesame st']

  // street suffix filters (replace text inside tokens)
  // based off synonym list
  street_suffix.synonyms.forEach( function( synonym ){
    var split = synonym.split(' ');
    settings.analysis.filter[ "keyword_street_suffix_" + split[0] ] = {
      "type": "pattern_replace",
      "pattern": " " + split[0],
      "replacement": " " + split[2]
    }
  });

  // compass prefix filters (replace text inside tokens)
  // based off direction_synonyms list
  street_suffix.direction_synonyms.forEach( function( synonym ){
    var split = synonym.split(' ');
    settings.analysis.filter[ "keyword_compass_" + split[0] ] = {
      "type": "pattern_replace",
      "pattern": split[0] + " ",
      "replacement": split[2] + " "
    }
  });

  // Merge settings from pelias/config
  if( 'object' == typeof config &&
      'object' == typeof config.elasticsearch &&
      'object' == typeof config.elasticsearch.settings ){
    var defaults = new Mergeable( settings );
    defaults.deepMerge( config.elasticsearch.settings );
    return defaults.export();
  }

  return settings;
}

module.exports = generate;
