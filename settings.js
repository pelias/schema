
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
      "analyzer": {
        "peliasSimple": {
          "type": "custom",
          "tokenizer": "whitespace",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "word_delimiter",
            "notnull"
          ]
        },
        "peliasOneEdgeGram" : {
          "type": "custom",
          "tokenizer" : "whitespace",
          "char_filter" : ["punctuation"],
          "filter": [
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
          ]
        },
        "peliasTwoEdgeGram" : {
          "type": "custom",
          "tokenizer" : "whitespace",
          "char_filter" : ["punctuation"],
          "filter": [
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
          ]
        },
        "peliasPhrase": {
          "type": "custom",
          "tokenizer":"whitespace",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "trim",
            "ampersand",
            "kstem",
            "street_synonym",
            "direction_synonym",
            "peliasShinglesFilter",
            "unique",
            "notnull"
          ]
        }
      },
      "filter" : {
        "ampersand" :{
          "type" : "pattern_replace",
          "pattern" : "and",
          "replacement" : "&"
        },
        "notnull" :{
          "type" : "length",
          "min" : 1
        },
        "peliasOneEdgeGramFilter": {
          "type" : "edgeNGram",
          "min_gram" : 1,
          "max_gram" : 10
        },
        "peliasTwoEdgeGramFilter": {
          "type" : "edgeNGram",
          "min_gram" : 2,
          "max_gram" : 10
        },
        "removeAllZeroNumericPrefix" :{
          "type" : "pattern_replace",
          "pattern" : "^(0*)",
          "replacement" : ""
        },
        "peliasShinglesFilter": {
          "type": "shingle",
          "min_shingle_size": 2,
          "max_shingle_size": 2,
          "output_unigrams": false
        },
        "address_stop": {
          "type": "stop",
          "stopwords": street_suffix.terms
        },
        "street_synonym": {
          "type": "synonym",
          "synonyms": street_suffix.synonyms
        },
        "direction_synonym": {
          "type": "synonym",
          "synonyms": street_suffix.direction_synonyms
        }
      },
      "char_filter": {
        "punctuation" : {
          "type" : "mapping",
          "mappings" : punctuation.blacklist.map(function(c){
            return c + '=>';
          })
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
