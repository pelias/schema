// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index some docs
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '1', body: { address_parts: {
          name: 'Mapzen HQ',
          number: 30,
          street: 'West 26th Street',
          zip: 10010
        }}
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '2', body: { address_parts: {
          name: 'Fake Venue',
          number: 300,
          street: 'west 26th street',
          zip: '100 10'
        }}
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '3', body: { address_parts: {
          name: 'Mock British Address',
          number: 3000,
          street: 'Buckinghamshire Street',
          zip: 'E2 4DN'
        }}
      }, done );
    });

    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '4', body: { address_parts: {
          name: 'Mystery Location',
          number: 300,
          street: 'east 26th street',
          zip: '100 10'
        }}
      }, done );
    });

    // search by street number
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.number': 30 } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'match street number' );
        done();
      });
    });

    // search by street name - case insensitive
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match_phrase: { 'address_parts.street': 'west 26th street' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 2, 'match street name' );
        done();
      });
    });

    // search by street name - using abbreviations
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match_phrase: { 'address_parts.street': 'W 26th ST' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 2, 'match street name - abbr' );
        done();
      });
    });

    // search by zip - numeric zip
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '10010' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 3, 'match zip - numeric' );
        done();
      });
    });

    // search by zip - string zip
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'e24dn' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'match zip - string' );
        done();
      });
    });

    // search by zip - numeric zip - with punctuation
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '100-10' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 3, 'match zip - numeric - punct' );
        done();
      });
    });

    // search by zip - numeric zip - with whitespace
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '10 0 10' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 3, 'match zip - numeric - whitespace' );
        done();
      });
    });

    // search by zip - string zip - with punctuation
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'E2-4DN' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'match zip - string - punct' );
        done();
      });
    });

    // search by zip - string zip - with whitespace
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'E2  4DN' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'match zip - string - whitespace' );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('address matching: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
