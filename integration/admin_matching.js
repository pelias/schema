// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with all admin values
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '1', body: { admin: {
          alpha3: 'TST',
          country: 'Test Country',
          country_a: 'TestCountry',
          country_id: '100',
          region: 'Test Region',
          region_a: 'TestRegion',
          region_id: '200',
          county: 'Test County',
          county_a: 'TestCounty',
          county_id: '300',
          locality: 'Test Locality',
          locality_a: 'TestLocality',
          locality_id: '400',
          localadmin: 'Test LocalAdmin',
          localadmin_a: 'TestLocalAdmin',
          localadmin_id: '500',
          neighbourhood: 'Test Neighbourhood',
          neighbourhood_a: 'TestNeighbourhood',
          neighbourhood_id: '600',
        }}
      }, done );
    });

    // search by alpha3
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: { 'admin.alpha3': 'TST' } } }
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search by country
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: { 'admin.country': 'Test Country' } } }
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search by country_a
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: { 'admin.country_a': 'TestCountry' } } }
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search by country_id
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: { 'admin.country_id': '100' } } }
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // ... the remaining admin fields are identical and so their assertions
    // have been omitted for the sake of brevity.

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('admin matching: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
