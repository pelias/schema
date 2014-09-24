
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
          "filter": "lowercase"
        },
        "pelias": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": ["lowercase","ampersand", "word_delimiter", "synonym"]
        }
      },
      "filter" : {
        "synonym" : {
          "type" : "synonym",
          "synonyms_path" : moduleDir + "/analysis/synonyms.txt"
        },
        "ampersand" :{
          "type" : "pattern_replace",
          "pattern" : "[&]",
          "replacement" : " and "
        }
      }
    },
    "index": {
      "number_of_replicas": "0",
      "number_of_shards": "8",
      "index.index_concurrency": "32"
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
