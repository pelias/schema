// validate analyzer is behaving as expected

const elastictest = require('elastictest');
const schema = require('../schema');
const config = require('pelias-config').generate();
const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

module.exports.tests.source_filter = function(test, common){
  test( 'source filter', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index some docs
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: config.schema.typeName,
        id: '1', body: { source: 'osm', layer: 'node', source_id: 'dataset/1' }
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: config.schema.typeName,
        id: '2', body: { source: 'osm', layer: 'address', source_id: 'dataset/2' }
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: config.schema.typeName,
        id: '3', body: { source: 'geonames', layer: 'address', source_id: 'dataset/1' }
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: config.schema.typeName,
        id: '4', body: { source: 'foo bar baz' }
      }, done );
    });

    // find all 'osm' sources
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            source: 'osm'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'address' layers
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            layer: 'address'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'shop' source_ids
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            source_id: 'dataset/1'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 2 );
        done();
      });
    });

    // find all 'shop' source_ids from 'osm' source
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { term: { source: 'osm' } },
          { term: { source_id: 'dataset/1' } }
        ]}}}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 1 );
        done();
      });
    });

    // case sensitive
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            source: 'OSM'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 0 );
        done();
      });
    });

    // keyword analysis - no partial matching
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            source: 'foo'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 0 );
        done();
      });
    });

    // keyword analysis - allows spaces
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: {
          term: {
            source: 'foo bar baz'
          }
        }}
      }, function( err, res ){
        t.equal( getTotalHits(res.hits), 1 );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('field filtering: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
