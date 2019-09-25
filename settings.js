var fs = require('fs');
var path = require('path');
var merge = require('lodash.merge');
var peliasConfig = require('pelias-config');
var punctuation = require('./punctuation');
var synonymFile = require('./synonyms/parser');

// load synonyms from disk
var synonyms = fs.readdirSync(path.join(__dirname, 'synonyms'))
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
            "word_delimiter",
            "custom_admin",
            "notnull"
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
            "surround_single_characters_with_word_markers",
            "house_number_word_delimiter",
            "remove_single_characters",
            "surround_house_numbers_with_word_markers",
            "peliasOneEdgeGramFilter",
            "eliminate_tokens_starting_with_word_marker",
            "remove_encapsulating_word_markers",
            "unique_only_same_position",
            "notnull"
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
        "peliasUnit": {
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
            "trim"
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

        // START OF COMPLICATED FILTERS TO ANALYZE HOUSE NUMBERS
        // @see: https://github.com/pelias/schema/pull/133
        // note: we use \x02 (start-of-text) and \x03 (end-of-text) characters to mark word borders
        "surround_single_characters_with_word_markers":{
          "description": "wraps single characters with markers, needed to protect valid single characters and not those extracted from house numbers (14a creates an 'a' token)",
          "type": "pattern_replace",
          "pattern": "^(.{1})$",
          "replacement": "\x02$1\x03"
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
        "surround_house_numbers_with_word_markers": {
          "description": "surrounds house numbers with markers, needed to protect whole house numbers from elimination step after prefix n-gramming",
          "type": "pattern_replace",
          "pattern": "^([0-9]+[a-z]?)$",
          "replacement": "\x02$1\x03"
        },
        "eliminate_tokens_starting_with_word_marker": {
          "description": "remove tokens starting but not ending with markers, saves whole house numbers wrapped in markers",
          "type": "pattern_replace",
          "pattern": "^\x02(.*[^\x03])?$",
          "replacement": ""
        },
        "remove_encapsulating_word_markers": {
          "description": "extract the stuff between the markers, extract 14 from \x0214\x03 since we're done the prefix n-gramming step",
          "type": "pattern_replace",
          "pattern": "^\x02(.*)\x03$",
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
    return merge({}, settings, config.elasticsearch.settings);
  }

  return settings;
}

module.exports = generate;
