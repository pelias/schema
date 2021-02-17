const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const iso3166 = require('iso3166-1');
const filename = path.join(__dirname, 'iso3166.txt');
const comparer = (a, b) => {
  var aa = a.replace(/^#/, '')
  var bb = b.replace(/^#/, '')
  if (aa < bb){ return -1; }
  if (aa > bb){ return 1; }
  return 0;
}
const nonstandard = {
  'GBR': 'UK' // add UK as an informal synonym of GBR
}
const mapper = (row) => {
  const columns = [row.alpha3, row.alpha2];
  var prefix = '';

  // comment-out synonyms where alpha2 is a prefix of alpha3
  // if (row.alpha3.startsWith(row.alpha2)){
  //   prefix = '#';
  // }

  // add informal synonyms
  var ns = _.get(nonstandard, columns[0])
  if (ns){
    if (prefix === ''){
      // set as 3rd synonym
      columns.push(ns);
    } else {
      // override 2nd synonym
      prefix = '';
      columns[1] = ns;
    }
  }

  return prefix + columns.join(',');
}

/**
 * generate a iso3166 alpha2 <> alpha3 country code synonyms
 * file compatible with elasticsearch.
 */

fs.writeFileSync(filename, '# iso3166 alpha2 <> alpha3 country code synonyms\n');
fs.appendFileSync(filename, iso3166.list().map(mapper).sort(comparer).join('\n'));
