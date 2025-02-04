const _ = require('lodash');

/**
 * This module contains modifications to the Pelias schema to adopt the elastic ICU tokenizer.
 * This tokenizer improves word-splitting of non-latin alphabets (particularly Asian languages).
 * 
 * It can be enabled by setting `config.schema.icuTokenizer` in your `pelias.json` config.
 * Note: this must be set *before* you create your elasticsearch index or it will have no effect.
 * 
 * This feature is considered beta, we encourage testing & feedback from the community in order 
 * to adopt the ICU tokenizer as our default.
 * 
 * https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu-tokenizer.html
 * https://github.com/pelias/schema/pull/498
 */

module.exports = (settings) => {

  // replace pattern tokenizer with icu_tokenizer
  _.set(settings, 'analysis.tokenizer.peliasTokenizer', {
    'type': 'icu_tokenizer'
  });

  // add ampersand_replacer filter
  // replaces ampersand placeholders back to `&` (see `ampersand_mapper` char_filter)
  _.set(settings, 'analysis.filter.ampersand_replacer', {
    'type': 'pattern_replace',
    'pattern': 'AMPERSANDPLACEHOLDER',
    'replacement': '&'
  });

  // add ampersand_mapper char_filter
  // icu-tokenizer treats ampersands as a word boundary, so we replace them with a placeholder to avoid it,
  // as we want to handle them separately, we replace them back after tokenization (see `ampersand_replacer` filter)
  _.set(settings, 'analysis.char_filter.ampersand_mapper', {
    'type': 'pattern_replace',
    'pattern': '&',
    'replacement': ' AMPERSANDPLACEHOLDER '
  });

  // prepend ampersand mapper/replacer to each analyzer
  _.forEach(_.get(settings, 'analysis.analyzer'), (block) => {
    if (block?.tokenizer !== 'peliasTokenizer') { return; }
    block.filter.unshift('ampersand_replacer');
    block.char_filter.unshift('ampersand_mapper');
  });

  return settings;
}