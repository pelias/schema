const _ = require('lodash');
const peliasConfig = require('pelias-config');
const punctuation = require('./punctuation');
const synonyms = require('./synonyms/loader').load();

require('./configValidation').validate(peliasConfig.generate());

function generate(){
  var config = peliasConfig.generate();

  // Default settings
  var settings = {
    "index": {
      "similarity": {
        "peliasDefaultSimilarity": {
          "type": "BM25",
          "k1": 1.2,
          "b": 0.75
        }
      }
    },
    "analysis": {
      "tokenizer": {
        "peliasTokenizer": {
          "type": "pattern",
          "pattern": "[\\s,/\\\\-]+"
        }
      },
      "analyzer": {
        "peliasAdmin": {
          "type": "custom",
          "tokenizer": "peliasTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "synonyms/custom_admin/multiword",
            "admin_synonyms_multiplexer",
            "icu_folding",
            "word_delimiter",
            "unique_only_same_position",
            "notnull",
            "flatten_graph"
          ]
        },
        "peliasIndexOneEdgeGram" : {
          "type": "custom",
          "tokenizer" : "peliasTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "synonyms/custom_name/multiword",
            "name_synonyms_multiplexer",
            "icu_folding",
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
          "tokenizer": "peliasTokenizer",
          "char_filter": ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "icu_folding",
            "remove_ordinals",
            "removeAllZeroNumericPrefix",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasPhrase": {
          "type": "custom",
          "tokenizer":"peliasTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "remove_duplicate_spaces",
            "synonyms/custom_name/multiword",
            "name_synonyms_multiplexer",
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
          "char_filter": ["alphanumeric", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "icu_folding",
            "unique_only_same_position",
            "notnull"
          ]
        },
        "peliasUnit": {
          "type": "custom",
          "tokenizer":"keyword",
          "char_filter": ["alphanumeric", "nfkc_normalizer"],
          "filter": [
            "lowercase",
            "trim",
            "icu_folding",
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
          "tokenizer":"peliasTokenizer",
          "char_filter" : ["punctuation", "nfkc_normalizer"],
          "filter": [
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
          ]
        }
      },
      "filter" : {
        "street_synonyms_multiplexer": {
          "type": "multiplexer",
          "preserve_original": false,
          "filters": [
            "synonyms/custom_street",
            "synonyms/personal_titles",
            "synonyms/streets",
            "synonyms/directionals"
          ]
        },
        "name_synonyms_multiplexer": {
          "type": "multiplexer",
          "preserve_original": false,
          "filters": [
            "synonyms/custom_name",
            "synonyms/personal_titles",
            "synonyms/place_names",
            "synonyms/streets",
            "synonyms/directionals",
            "synonyms/punctuation"
          ]
        },
        "admin_synonyms_multiplexer": {
          "type": "multiplexer",
          "preserve_original": false,
          "filters": [
            "synonyms/custom_admin",
            "synonyms/personal_titles",
            "synonyms/place_names"
          ]
        },
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
  // each filter is given the same name as the file, paths separators are replaced with
  // underscores and the file extension is removed.
  // note: if no synonym entries are present in the list we use an array
  // containing an empty space to avoid elasticsearch schema parsing errors.
  _.each(synonyms, (entries, name) => {

    // same tokenizer regex as above except without comma
    // (which is a delimeter within the synonym files)
    const tokenizerRegex = new RegExp('[\\s/\\\\-]+');
    const singleWordEntries = entries.filter(e => !tokenizerRegex.test(e))
    const multiWordEntries = entries.filter(e => tokenizerRegex.test(e))

    // generate a filter containing single-word synonyms
    settings.analysis.filter[`synonyms/${name}`] = {
      "type": "synonym",
      "synonyms": !_.isEmpty(singleWordEntries) ? singleWordEntries : ['']
    };

    // generate a filter containing multi-word synonyms
    settings.analysis.filter[`synonyms/${name}/multiword`] = {
      "type": "synonym",
      "synonyms": !_.isEmpty(multiWordEntries) ? multiWordEntries : ['']
    };
  });

  // Merge settings from pelias/config
  settings = _.merge({}, settings, _.get(config, 'elasticsearch.settings', {}));

  return settings;
}

module.exports = generate;
