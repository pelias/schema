
var Mergeable = require('mergeable');
var peliasConfig = require('pelias-config');

var moduleDir = require('path').dirname("../");

function generate(){
  var config = peliasConfig.generate().export();

  // Default settings
  var settings = {
    "analysis": {
      "analyzer": {
        "suggestions": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase", "asciifolding"]
        },
        "pelias": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase", "asciifolding","ampersand","word_delimiter"]
        },
        "plugin": {
          "type": "pelias-analysis"
        }
      },
      "filter" : {
        "ampersand" :{
          "type" : "pattern_replace",
          "pattern" : "[&]",
          "replacement" : " and "
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
