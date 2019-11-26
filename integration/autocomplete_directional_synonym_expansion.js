// Tests to ensure no regressions in the way the autocomplete analyzers handle
// synonym expansions and the corresponding matching of those tokens.

// The greater issue is descriped in: https://github.com/pelias/pelias/issues/211
// The cases tested here are described in: https://github.com/pelias/schema/issues/105

const elastictest = require('elastictest');
const schema = require('../schema');
const config = require('pelias-config').generate();

module.exports.tests = {};

// index the name as 'north' and then retrieve with partially complete token 'nor'
module.exports.tests.index_and_retrieve_expanded_form = function(test, common){
  test( 'index and retrieve expanded form', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: { name: { default: 'north' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'nor'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQueryFullToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'north'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'n' and then retrieve with 'n'
module.exports.tests.index_and_retrieve_contracted_form = function(test, common){
  test( 'index and retrieve contracted form', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: { name: { default: 'n' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'n'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQueryFullToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'n'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'n' and then retrieve with partially complete token 'nor'
module.exports.tests.index_and_retrieve_mixed_form_1 = function(test, common){
  test( 'index and retrieve mixed form 1', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: { name: { default: 'n' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'nor'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQueryFullToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'north'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'north' and then retrieve with 'n'
module.exports.tests.index_and_retrieve_mixed_form_2 = function(test, common){
  test( 'index and retrieve mixed form 2', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: { name: { default: 'north' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'n'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQueryFullToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'n'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete directional synonym expansion: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
