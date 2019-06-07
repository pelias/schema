// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'á', ['a']);
    assertAnalysis( 'asciifolding', 'ß', ['ss']);
    assertAnalysis( 'asciifolding', 'æ', ['ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'ampersand', 'a and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a & b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a and & and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'land', ['land'] ); // should not replace inside tokens

    assertAnalysis( 'keyword_street_suffix', 'foo Street', ['foo', 'street', 'st'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Road', ['foo', 'road', 'rd']);
    assertAnalysis( 'keyword_street_suffix', 'foo Crescent', ['foo', 'crescent', 'cres'] );
    assertAnalysis( 'keyword_compass', 'north foo', ['north', 'n', 'foo'] );
    assertAnalysis( 'keyword_compass', 'SouthWest foo', ['southwest', 'sw', 'foo'] );
    assertAnalysis( 'keyword_compass', 'foo SouthWest', ['foo', 'southwest', 'sw'] );

    assertAnalysis( 'peliasQueryFullTokenFilter', '1 a ab abc abcdefghij', ['1','a','ab','abc','abcdefghij'] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '00001', ['1'] );
    assertAnalysis( 'unique', '1 1 1', ['1'] );
    assertAnalysis( 'notnull', ' / / ', [] );

    assertAnalysis( 'no kstem', 'mcdonalds', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'McDonald\'s', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'peoples', ['peoples'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['-&'] );

    // ensure that very large tokens are created
    assertAnalysis( 'largeGrams', 'grolmanstrasse', [ 'grolmanstrasse' ]);

    suite.run( t.end );
  });
};

module.exports.tests.address_suffix_expansions = function(test, common){
  test( 'address suffix expansions', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'safe expansions', 'aly', [ 'aly', 'alley' ]);

    assertAnalysis( 'safe expansions', 'xing', [ 'xing', 'crossing' ]);

    assertAnalysis( 'safe expansions', 'rd', [ 'rd', 'road' ]);

    assertAnalysis( 'safe expansion', 'ct st', [ 'ct', 'court', 'st', 'street' ]);

    suite.run( t.end );
  });
};

// stop words should be disabled so that the entire token is used
module.exports.tests.stop_words = function(test, common){
  test( 'stop words', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street suffix', 'AB street', [ 'ab', 'street', 'st' ]);

    assertAnalysis( 'street suffix (abbreviation)', 'AB st', [ 'ab', 'st', 'street' ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'trinidad', '&', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      'toys', 'r', 'us'
    ]);

    assertAnalysis( 'address', '101 mapzen place', [
      '101', 'mapzen', 'place', 'pl'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // specify 2 streets with a delimeter
    assertAnalysis( 'forward slash', 'Bedell Street/133rd Avenue',   [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'forward slash', 'Bedell Street /133rd Avenue',  [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'forward slash', 'Bedell Street/ 133rd Avenue',  [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'back slash',    'Bedell Street\\133rd Avenue',  [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'back slash',    'Bedell Street \\133rd Avenue', [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'back slash',    'Bedell Street\\ 133rd Avenue', [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'comma',         'Bedell Street,133rd Avenue',   [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'comma',         'Bedell Street ,133rd Avenue',  [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);
    assertAnalysis( 'comma',         'Bedell Street, 133rd Avenue',  [ 'bedell', 'street', 'st', '133', 'avenue', 'ave', 'av' ]);

    suite.run( t.end );
  });
};

// test the minimum amount of slop required to retrieve address documents
module.exports.tests.slop = function(test, common){
  test( 'slop', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'test',
        id: '1',
        body: { name: { default: '52 Görlitzer Straße' } }
      }, done);
    });

    // search using 'peliasQueryFullToken'
    // in this case we require a slop of 3 to return the same
    // record with the street number and street name reversed.
    // (as is common in European countries, such as Germany).
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'Görlitzer Straße 52',
            'type': 'phrase',
            'slop': 3,
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

module.exports.tests.address = function(test, common){
  test( 'address', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'address', '101 mapzen place', [
      '101', 'mapzen', 'place', 'pl'
    ]);

    assertAnalysis( 'address', '30 w 26 st', [
      '30', 'w', 'west', '26', 'st', 'street'
    ]);

    assertAnalysis( 'address', '4B 921 83 st', [
      '4b', '921', '83', 'st', 'street'
    ]);

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry"

    assertAnalysis( 'composed', composed, ['chambery'] );
    assertAnalysis( 'decomposed', decomposed, ['chambery'] );

    // Één (both forms appear the same)
    var composed = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    var decomposed = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n"

    assertAnalysis( 'composed', composed, ['een'] );
    assertAnalysis( 'decomposed', decomposed, ['een'] );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasQueryFullToken: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
