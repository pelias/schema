const _ = require('lodash');
const logger = require('pelias-logger').get('schema-synonyms');
const punctuation = require('../punctuation');

// same tokenizer regex as the schema
const TOKENIZER_REGEX = new RegExp('[\\s,/\\\\-]+');
const DEMIMETER_REGEX = /,|=>/g
const REPLACEMENT_REGEX = /=>/

/**
 * The synonyms linter attempts to warn the user when making
 * common mistakes with synonyms.
 *
 * Warnings:
 *  - Puntuation: Synonyms should not contain characters in the punctuation blacklist
 *  - Letter Casing: Synonyms should be lowercase
 *  - Sanity Checks: At least one synonym should exist, duplicates should be removed
 *  - Multi Word: Multi-word synonyms can generate unexpected token positions
 */

function linter(synonyms) {
  _.each(synonyms, (lines, filename) => {
    logger.debug(`[lint] ${filename}`);

    lines.forEach((line, idx) => {
      const logprefix = `[${filename} line ${idx+1}]`;
      logger.debug(`[line] ${line}`);

      // split the lines by delimeter
      let tokens = line.split(DEMIMETER_REGEX).map(t => t.trim());

      // strip blacklisted punctuation from synonyms
      // the 'punctuation.blacklist' contains a list of characters which are
      // stripped from the tokens before indexing.
      tokens = _.map(tokens, token => {
        punctuation.blacklist.forEach(char => {
          let replacement = token.split(char).join('');
          if(replacement.length != token.length){
            logger.warn(`${logprefix} punctunation removed: ${token} --> ${replacement}`);
          }
          token = replacement;
        });
        return token
      });

      letterCasing(line, logprefix, tokens);
      tokensSanityCheck(line, logprefix, tokens);
      multiWordCheck(line, logprefix, tokens);
      tokenReplacementCheck(line, logprefix);
      // tokenLengthCheck(line, logprefix, tokens);
    })
  })
}

function letterCasing(line, logprefix){
  if (line.toLowerCase() !== line) {
    logger.warn(`${logprefix} should be lowercase:`, line);
  }
}

function tokensSanityCheck(line, logprefix, tokens) {
  switch (tokens.length){
    case 0:
      return logger.warn(`${logprefix} no tokens:`, line);
    case 1:
      return logger.warn(`${logprefix} only one token:`, line);
    default:
      let dupes = _.filter(tokens, (val, i, t) => _.includes(t, val, i + 1));
      if (dupes.length){
        logger.warn(`${logprefix} duplicate tokens:`, dupes);
      }
  }
}

function multiWordCheck(line, logprefix, tokens) {
  _.each(tokens, token => {
    if (TOKENIZER_REGEX.test(token)){
      logger.warn(`${logprefix} multi word synonyms may cause issues with phrase queries:`, token);
    }
  });
}

function tokenReplacementCheck(line, logprefix) {
  if (REPLACEMENT_REGEX.test(line)) {
    logger.warn(`${logprefix} synonym rule '=>' is not supported, use ',' instead`);
  }
}

function tokenLengthCheck(line, logprefix, tokens) {
  _.each(tokens, token => {
    if (token.length <= 1) {
      logger.warn(`${logprefix} short token:`, token);
    }
  });
}

module.exports = linter
