// validate analyzer is behaving as expected

const elastictest = require('elastictest');
const config = require('pelias-config').generate();
const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index some docs
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
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
        index: suite.props.index,
        type: config.schema.typeName,
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
        index: suite.props.index,
        type: config.schema.typeName,
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
        index: suite.props.index,
        type: config.schema.typeName,
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
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.number': 30 } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'match street number' );
        done();
      });
    });

    // search by street name - case insensitive
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match_phrase: { 'address_parts.street': 'west 26th street' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 2, 'match street name' );
        done();
      });
    });

    // search by street name - using abbreviations
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match_phrase: { 'address_parts.street': 'W 26th ST' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 2, 'match street name - abbr' );
        done();
      });
    });

    // search by zip - numeric zip
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '10010' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 3, 'match zip - numeric' );
        done();
      });
    });

    // search by zip - string zip
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'e24dn' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'match zip - string' );
        done();
      });
    });

    // search by zip - numeric zip - with punctuation
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '100-10' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 3, 'match zip - numeric - punct' );
        done();
      });
    });

    // search by zip - numeric zip - with whitespace
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': '10 0 10' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 3, 'match zip - numeric - whitespace' );
        done();
      });
    });

    // search by zip - string zip - with punctuation
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'E2-4DN' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'match zip - string - punct' );
        done();
      });
    });

    // search by zip - string zip - with whitespace
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { bool: { must: [
          { match: { 'address_parts.zip': 'E2  4DN' } }
        ]}}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'match zip - string - whitespace' );
        done();
      });
    });

    suite.run( t.end );
  });
};


module.exports.tests.venue_vs_address = function(test, common){
  test( 'venue_vs_address', function(t){
    // This test shows that partial matching addresses score higher than exact matching
    // venues with the same name.

    // I would prefer that the venue scored highest, but this is not possible due to the
    // addresses matching on all three fields (name,street,phrase) while the venue only
    // matches on two fields (name,phrase).

    // Unfortunately there seems to be no easy way of fixing this, it's an artifact of us
    // storing the street names in the name.default field.

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a venue
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1', body: {
          name: { default: 'Union Square' },
          phrase: { default: 'Union Square' }
        }
      }, done );
    });

    // index multiple streets, having many in the index is important
    // because it influences the 'norms' and TF/IDF scoring
    const testFactory = function(i){
      return function( done ){
        let id = i + 100; // id offset
        suite.client.index({
          index: suite.props.index,
          type: config.schema.typeName,
          id: String(id),
          body: {
            name: { default: `${id} Union Square` },
            phrase: { default: `${id} Union Square` },
            address_parts: {
              number: String(i),
              street: 'Union Square'
            }
          }
        }, done);
      };
    };

    const TOTAL_ADDRESS_DOCS=9;
    for( var i=0; i<TOTAL_ADDRESS_DOCS; i++ ){
      suite.action( testFactory(i) );
    }

    // autocomplete-style query to assert which result is scored higher,
    // the exact matching venue, or the partial matching address.
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        size: TOTAL_ADDRESS_DOCS+1,
        body: {
          'query': {
            'bool': {
              'must': [
                {
                  'match_phrase': {
                    'name.default': {
                      'analyzer': 'peliasQuery',
                      'boost': 1,
                      'slop': 3,
                      'query': 'union square'
                    }
                  }
                }
              ],
              'should': [
                {
                  'match': {
                    'address_parts.street': {
                      'analyzer': 'peliasStreet',
                      'boost': 5,
                      'query': 'union square'
                    }
                  }
                },
                {
                  'match_phrase': {
                    'phrase.default': {
                      'analyzer': 'peliasPhrase',
                      'boost': 1,
                      'slop': 3,
                      'query': 'union square'
                    }
                  }
                }
              ]
            }
          }
        }
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), TOTAL_ADDRESS_DOCS+1, 'matched all docs' );
        t.equal( res.hits.hits[TOTAL_ADDRESS_DOCS]._id, '1', 'exact name match first' );
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
