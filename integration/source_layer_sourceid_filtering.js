// validate analyzer is behaving as expected

const Suite = require('../test/elastictest/Suite');
const config = require('pelias-config').generate();
const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

module.exports.tests.source_filter = (test, common) => {
  test( 'source filter', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index some docs
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1', body: { source: 'osm', layer: 'node', source_id: 'dataset/1' }
      }, done );
    });

    suite.action( done => {
      suite.client.index({
        index: suite.props.index, 
        id: '2', body: { source: 'osm', layer: 'address', source_id: 'dataset/2' }
      }, done );
    });

    suite.action( done => {
      suite.client.index({
        index: suite.props.index, 
        id: '3', body: { source: 'geonames', layer: 'address', source_id: 'dataset/1' }
      }, done );
    });

    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '4', body: { source: 'foo bar baz' }
      }, done );
    });

    // find all 'osm' sources
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            source: 'osm'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'address' layers
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            layer: 'address'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'shop' source_ids
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            source_id: 'dataset/1'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'shop' source_ids from 'osm' source
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { bool: { must: [
          { term: { source: 'osm' } },
          { term: { source_id: 'dataset/1' } }
        ]}}}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 1 );
        done();
      });
    });

    // case sensitive
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            source: 'OSM'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 0 );
        done();
      });
    });

    // keyword analysis - no partial matching
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            source: 'foo'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 0 );
        done();
      });
    });

    // keyword analysis - allows spaces
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: {
          term: {
            source: 'foo bar baz'
          }
        }}
      }, (err, res) => {
        t.equal( getTotalHits(res.hits), 1 );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('field filtering: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
