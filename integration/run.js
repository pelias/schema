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
  simpleTokens: ( tokens, includePosition ) => {
    return tokens.map( t => {
      return (!!includePosition ? t.position + ':' : '') + t.token;
    });
  },
  analyze: ( suite, t, analyzer, comment, text, expected, includePosition ) => {
    suite.assert( done => {
      suite.client.indices.analyze({
        index: suite.props.index,
        analyzer: analyzer,
        text: text
      }, ( err, res ) => {
        if( err ){ console.error( err ); }
        t.deepEqual( common.simpleTokens( res.tokens, includePosition ), expected, comment );
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
