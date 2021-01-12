const fs = require('fs');
const path = require('path');
const iso3166 = require('iso3166-1');
const filename = path.join(__dirname, 'iso3166.txt');
const mapper = (row) => {
  const columns = [row.alpha2, row.alpha3];

  // comment-out synonyms where alpha2 is a prefix of alpha3
  // if (row.alpha3.startsWith(row.alpha2)){
  //   columns.unshift('#')
  // }

  // add UK as an informal synonym of GB
  if (row.alpha3 === 'GBR'){
    columns.push('UK');
  }

  return columns.join(',');
}

/**
 * generate a iso3166 alpha2 <> alpha3 country code synonyms
 * file compatible with elasticsearch.
 */

fs.writeFileSync(filename, '# iso3166 alpha2 <> alpha3 country code synonyms\n');
fs.appendFileSync(filename, iso3166.list().map(mapper).sort().join('\n'));
