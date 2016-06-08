
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
        "goldbergianPeliasHousenumber": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "surround_single_characters_with_!s",
            "house_number_word_delimiter",
            "remove_single_characters",
            "surround_house_numbers_with_!s",
            "peliasOneEdgeGramFilter",
            "eliminate_tokens_starting_with_!",
            "remove_encapsulating_!s",
            "notnull",
            "unique"
          ]
          // eg: 14a w main st
          // surround_single_characters_with_!s  -> [14a, !w!, main, st]
          // house_number_word_delimiter         -> [14, 14a, a, !w!, main, st]
          // remove_single_characters            -> [14, 14a, !w!, main, st]
          // surround_house_numbers_with_!s      -> [!14!, !14a!, !w!, main, st]
          // peliasOneEdgeGramFilter             -> [!, !1, !14, !14!, !, !1, !14, !14a, !14a!, !, !w, !w!, m, ma, mai, main, s, st]
          // eliminate_tokens_starting_with_!    -> ["", "", "", !14!, "", "", "", "", !14a!, "", "", w, m, ma, mai, main, s, st]
          // remove_encapsulating_!s             -> ["", "", "", 14, "", "", "", "", 14a, "", "", w, m, ma, mai, main, s, st]
          // notnull                             -> [14, 14a, w, m, ma, mai, main, s, st]
          // unique                              -> [14, 14a, w, m, ma, mai, main, s, st]

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
        },
        // START OF COMPLICATED FILTERS TO ANALYZE HOUSE NUMBERS
        "surround_single_characters_with_!s":{
          "description": "wraps single characters with !s, needed to protect valid single characters and not those extracted from house numbers (14a creates an 'a' token)",
          "type": "pattern_replace",
          "pattern": "^([a-z0-9])$",
          "replacement": "!$1!"
        },
        "house_number_word_delimiter": {
          "description": "splits on letter-to-number transition and vice versa, splits 14a -> [14, 14a, a]",
          "type": "word_delimiter",
          "split_on_numerics": "true",
          "preserve_original": "true"
        },
        "remove_single_characters": {
          "description": "removes single characters created from house_number_word_delimiter, removes the letter portion of a house number",
          "type": "length",
          "min": 2
        },
        "surround_house_numbers_with_!s": {
          "description": "surrounds house numbers with !'s', needed to protect whole house numbers from elimination step after prefix n-gramming",
          "type": "pattern_replace",
          "pattern": "^([0-9]+[a-z]?)$",
          "replacement": "!$1!"
        },
        "eliminate_tokens_starting_with_!": {
          "description": "remove tokens starting but not ending with !'s', saves whole house numbers wrapped in !s",
          "type": "pattern_replace",
          "pattern": "^!(.*[^!])?$",
          "replacement": ""
        },
        "remove_encapsulating_!s": {
          "description": "extract the stuff between the !'s', extract 14 from !14! since we're done the prefix n-gramming step",
          "type": "pattern_replace",
          "pattern": "^!(.*)!$",
          "replacement": "$1"
        }
        // END OF COMPLICATED FILTERS TO ANALYZE HOUSE NUMBERS

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
