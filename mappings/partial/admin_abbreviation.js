const _ = require('lodash');
const admin = require('./admin.json');

// this partial is the same as 'admin.json'
// with the addition of the key 'index_options=docs'
// note: this prevents document frequencies from being indexed, this has the effect of
// preventing term frequencies from affecting scoring when multiple terms are indexed.
// https://www.elastic.co/guide/en/elasticsearch/reference/current/index-options.html

module.exports = _.merge(admin, {
  "index_options": "docs",
  "fields": {
    "ngram": {
      "index_options": "docs"
    }
  }
});
