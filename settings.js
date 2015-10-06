
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
        "peliasAdmin": {
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
          "tokenizer":"keyword",
          "char_filter" : ["punctuation"],
          "filter": [
            "lowercase",
            "asciifolding",
            "keyword_street_suffix_avenue",
            "keyword_street_suffix_boulevard",
            "keyword_street_suffix_circle",
            "keyword_street_suffix_close",
            "keyword_street_suffix_court",
            "keyword_street_suffix_crescent",
            "keyword_street_suffix_drive",
            "keyword_street_suffix_esplanade",
            "keyword_street_suffix_highway",
            "keyword_street_suffix_lane",
            "keyword_street_suffix_parkway",
            "keyword_street_suffix_place",
            "keyword_street_suffix_road",
            "keyword_street_suffix_street",
            "keyword_street_suffix_suite",
            "keyword_street_suffix_terrace",
            "keyword_street_suffix_trail",
            "keyword_street_suffix_way",
            "keyword_compass_northwest",
            "keyword_compass_northeast",
            "keyword_compass_southwest",
            "keyword_compass_southeast",
            "keyword_compass_north",
            "keyword_compass_south",
            "keyword_compass_east",
            "keyword_compass_west",
            "remove_ordinals",
            "trim"
          ]
        },
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
        },
        "remove_ordinals" : {
          "type" : "pattern_replace",
          "pattern": "(([0-9])(st|nd|rd|th))",
          "replacement": "$2"
        },

        // street suffixes (replace text inside tokens)
        "keyword_street_suffix_avenue": {
          "type": "pattern_replace",
          "pattern": " avenue",
          "replacement": " ave"
        },
        "keyword_street_suffix_boulevard": {
          "type": "pattern_replace",
          "pattern": " boulevard",
          "replacement": " blvd"
        },
        "keyword_street_suffix_circle": {
          "type": "pattern_replace",
          "pattern": " circle",
          "replacement": " cir"
        },
        "keyword_street_suffix_close": {
          "type": "pattern_replace",
          "pattern": " close",
          "replacement": " cl"
        },
        "keyword_street_suffix_court": {
          "type": "pattern_replace",
          "pattern": " court",
          "replacement": " ct"
        },
        "keyword_street_suffix_crescent": {
          "type": "pattern_replace",
          "pattern": " crescent",
          "replacement": " cres"
        },
        "keyword_street_suffix_drive": {
          "type": "pattern_replace",
          "pattern": " drive",
          "replacement": " dr"
        },
        "keyword_street_suffix_esplanade": {
          "type": "pattern_replace",
          "pattern": " esplanade",
          "replacement": " esp"
        },
        "keyword_street_suffix_highway": {
          "type": "pattern_replace",
          "pattern": " highway",
          "replacement": " hwy"
        },
        "keyword_street_suffix_lane": {
          "type": "pattern_replace",
          "pattern": " lane",
          "replacement": " ln"
        },
        "keyword_street_suffix_parkway": {
          "type": "pattern_replace",
          "pattern": " parkway",
          "replacement": " pkwy"
        },
        "keyword_street_suffix_place": {
          "type": "pattern_replace",
          "pattern": " place",
          "replacement": " pl"
        },
        "keyword_street_suffix_road": {
          "type": "pattern_replace",
          "pattern": " road",
          "replacement": " rd"
        },
        "keyword_street_suffix_street": {
          "type": "pattern_replace",
          "pattern": " street",
          "replacement": " st"
        },
        "keyword_street_suffix_suite": {
          "type": "pattern_replace",
          "pattern": " suite",
          "replacement": " ste"
        },
        "keyword_street_suffix_terrace": {
          "type": "pattern_replace",
          "pattern": " terrace",
          "replacement": " terr"
        },
        "keyword_street_suffix_trail": {
          "type": "pattern_replace",
          "pattern": " trail",
          "replacement": " tr"
        },
        "keyword_street_suffix_way": {
          "type": "pattern_replace",
          "pattern": " way",
          "replacement": " wy"
        },

        // compass prefix (replace text inside tokens)
        "keyword_compass_north": {
          "type": "pattern_replace",
          "pattern": "north ",
          "replacement": "n "
        },
        "keyword_compass_south": {
          "type": "pattern_replace",
          "pattern": "south ",
          "replacement": "s "
        },
        "keyword_compass_east": {
          "type": "pattern_replace",
          "pattern": "east ",
          "replacement": "e "
        },
        "keyword_compass_west": {
          "type": "pattern_replace",
          "pattern": "west ",
          "replacement": "w "
        },
        "keyword_compass_northwest": {
          "type": "pattern_replace",
          "pattern": "northwest ",
          "replacement": "nw "
        },
        "keyword_compass_northeast": {
          "type": "pattern_replace",
          "pattern": "northeast ",
          "replacement": "ne "
        },
        "keyword_compass_southwest": {
          "type": "pattern_replace",
          "pattern": "southwest ",
          "replacement": "sw "
        },
        "keyword_compass_southeast": {
          "type": "pattern_replace",
          "pattern": "southeast ",
          "replacement": "se "
        }

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
