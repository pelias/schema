const fs = require('fs');
const path = require('path');
const iso3166 = require('iso3166-1');
const mapper = (row) => `${row.alpha2},${row.alpha3}`;
const filename = path.join(__dirname, 'iso3166.txt');

/**
 * generate a iso3166 alpha2 <> alpha3 country code synonyms
 * file compatible with elasticsearch.
 */

fs.writeFileSync(filename, '# iso3166 alpha2 <> alpha3 country code synonyms\n');
fs.appendFileSync(filename, iso3166.list().map(mapper).sort().join('\n'));
