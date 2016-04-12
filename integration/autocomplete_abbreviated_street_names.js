
// Tests to ensure no regressions in the way the autocomplete analyzers handle
// synonym expansions and the corresponding matching of those tokens.

// The greater issue is descriped in: https://github.com/pelias/pelias/issues/211
// The cases tested here are described in: https://github.com/pelias/schema/issues/105

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

// index the name as 'Grolmanstraße' and then retrieve with partially complete token 'Grolmanstr.'
module.exports.tests.index_expanded_form_search_contracted = function(test, common){
  test( 'index and retrieve expanded form', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'test',
        id: '1',
        body: { name: { default: 'Grolmanstraße' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'Grolmanstr.'
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
        type: 'test',
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'Grolmanstr.'
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

// index the name as 'Grolmanstr.' and then retrieve with 'Grolmanstraße'
module.exports.tests.index_contracted_form_search_expanded = function(test, common){
  test( 'index and retrieve contracted form', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'test',
        id: '1',
        body: { name: { default: 'Grolmanstr.' } }
      }, done);
    });

    // search using 'peliasQueryPartialToken'
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryPartialToken',
            'query': 'Grolmanstraße'
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQueryFullToken'
    // @note: this case is currently not supported.
    // Please index your data in the expanded form.

    // suite.assert( function( done ){
    //   suite.client.search({
    //     index: suite.props.index,
    //     type: 'test',
    //     body: { query: { match: {
    //       'name.default': {
    //         'analyzer': 'peliasQueryFullToken',
    //         'query': 'Grolmanstraße'
    //       }
    //     }}}
    //   }, function( err, res ){
    //     t.equal( err, undefined );
    //     t.equal( res.hits.total, 1, 'document found' );
    //     done();
    //   });
    // });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete street synonym expansion: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
