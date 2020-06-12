const _ = require('lodash');
const logger = require('pelias-logger').get('schema');
const punctuation = require('../punctuation');

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

    _.each(lines, line => {
      logger.debug(`[line] ${line}`);

      // split the lines by delimeter
      let tokens = line.split(/,|=>/g).map(t => t.trim());

      // strip blacklisted punctuation from synonyms
      // the 'punctuation.blacklist' contains a list of characters which are
      // stripped from the tokens before indexing.
      tokens = _.map(tokens, token => {
        _.each(punctuation.blacklist, (char) => {
          let replacement = token.split(char).join('');
          if(replacement.length != token.length){
            logger.warn(`punctunation removed: ${token} --> ${replacement}`);
          }
          token = replacement;
        });
        return token
      });

      letterCasing(line, tokens);
      tokensSanityCheck(line, tokens);
      // multiWordCheck(line, tokens);
    })
  })
}

function letterCasing(line){
  if (line.toLowerCase() !== line) {
    logger.warn(`should be lowercase:`, line);
  }
}

function tokensSanityCheck(line, tokens) {
  switch (tokens.length){
    case 0:
      return logger.warn(`no tokens:`, line);
    case 1:
      return logger.warn(`only one token:`, line);
    default:
      let dupes = _.filter(tokens, (val, i, t) => _.includes(t, val, i + 1));
      if (dupes.length){
        logger.warn(`duplicate tokens:`, dupes);
      }
  }
}

function multiWordCheck(line, tokens) {
  _.each(tokens, token => {
    if (/\s/.test(token)){
      logger.warn(`multi word synonyms may cause issues with phrase queries:`, token);
    }
  });
}

module.exports = linter
