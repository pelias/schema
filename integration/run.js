const _ = require('lodash');
const tape = require('tape');
const config = require('pelias-config').generate();

const common = {
  clientOpts: {
    host: 'localhost:9200',
    keepAlive: true,
    apiVersion: config.esclient.apiVersion
  },
  summaryMap: (res) => {
    return res.hits.hits.map(h => {
      return {
        _id: h._id,
        _score: h._score,
        name: h._source.name
      };
    });
  },
  summary: (res) => {
    common.summaryMap( res )
          .forEach( console.dir );
  },
  bucketTokens: tokens => {
    const positions = {};
    tokens.forEach((t, i) => {
      // format returned by elasticsearch
      if (_.isPlainObject(t)) {
        const pos = '@pos' + t.position;
        if (!positions[pos]) { positions[pos] = []; }
        positions[pos].push(t.token);
      }
      // 'simple tokens' format
      // eg '1:foo'
      else if (_.isString(t)) {
        const match = t.match(/^(\d+):(.+)$/);
        let pos = '@pos' + i;
        if (match) {
          pos = '@pos' + match[1];
          t = match[2];
        }
        if (!positions[pos]) { positions[pos] = []; }
        positions[pos].push(t);
      }
    });
    // sort all the arrays so that order is irrelevant
    for (var attr in positions){
      positions[attr] = positions[attr].sort();
    }
    return positions;
  },
  analyze: (suite, t, analyzer, comment, text, expected) => {
    suite.assert(done => {
      suite.client.indices.analyze({
        index: suite.props.index,
        body: {
          analyzer: analyzer,
          text: text.toString()
        }
      }, (err, res) => {
        if (err) { console.error(err); }
        t.deepEqual(common.bucketTokens(res.tokens), common.bucketTokens(expected), comment);
        done();
      });
    });
  }
};

var tests = [
  require('./validate.js'),
  require('./dynamic_templates.js'),
  require('./analyzer_peliasIndexOneEdgeGram.js'),
  require('./analyzer_peliasQuery.js'),
  require('./analyzer_peliasQueryPartialToken.js'),
  require('./analyzer_peliasQueryFullToken.js'),
  require('./analyzer_peliasPhrase.js'),
  require('./analyzer_peliasAdmin.js'),
  require('./analyzer_peliasHousenumber.js'),
  require('./analyzer_peliasZip.js'),
  require('./analyzer_peliasStreet.js'),
  require('./address_matching.js'),
  require('./admin_matching.js'),
  require('./source_layer_sourceid_filtering.js'),
  require('./bounding_box.js'),
  require('./autocomplete_street_synonym_expansion.js'),
  require('./autocomplete_directional_synonym_expansion.js'),
  require('./autocomplete_abbreviated_street_names.js')
];

tests.map(function(t) {
  t.all(tape, common);
});
