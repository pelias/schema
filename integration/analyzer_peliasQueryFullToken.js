// validate analyzer is behaving as expected

const elastictest = require('elastictest');
const schema = require('../schema');
const punctuation = require('../punctuation');
const config = require('pelias-config').generate();

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
    assertAnalysis('ampersand', 'a and b', ['0:a', '1:and', '1:&', '2:b']);
    assertAnalysis('ampersand', 'a & b', ['0:a', '1:&', '1:and', '1:und', '2:b']);
    assertAnalysis('ampersand', 'a and & and b', [
      '0:a',
      '1:and', '1:&',
      '2:&', '2:and', '2:und',
      '3:and', '3:&',
      '4:b'
    ]);
    assertAnalysis('ampersand', 'land', ['land'] ); // should not replace inside tokens

    assertAnalysis('keyword_street_suffix', 'foo Street', ['0:foo', '1:street', '1:st'] );
    assertAnalysis('keyword_street_suffix', 'foo Road', ['0:foo', '1:road', '1:rd'] );
    assertAnalysis('keyword_street_suffix', 'foo Crescent', ['0:foo', '1:crescent', '1:cres'] );
    assertAnalysis('keyword_compass', 'north foo', ['0:north', '0:n', '1:foo'] );
    assertAnalysis('keyword_compass', 'SouthWest foo', ['0:southwest', '0:sw', '1:foo'] );
    assertAnalysis('keyword_compass', 'foo SouthWest', ['0:foo', '1:southwest', '1:sw'] );

    assertAnalysis( 'peliasQueryFullTokenFilter', '1 a ab abc abcdefghij', ['1','a','ab','abc','abcdefghij'] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '00001', ['1'] );
    assertAnalysis( 'unique', '1 1 1', ['1','1','1'] );
    assertAnalysis( 'notnull', ' / / ', [] );

    assertAnalysis( 'no kstem', 'mcdonalds', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'McDonald\'s', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'peoples', ['peoples'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['0:&', '0:and', '0:und'] );

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

    assertAnalysis('safe expansions', 'aly', ['0:aly', '0:alley' ]);

    assertAnalysis('safe expansions', 'xing', ['0:xing', '0:crossing' ]);

    assertAnalysis('safe expansions', 'rd', ['0:rd', '0:road' ]);

    assertAnalysis('safe expansion', 'ct st', ['0:ct', '0:court', '1:st', '1:street' ]);

    suite.run( t.end );
  });
};

// stop words should be disabled so that the entire token is used
module.exports.tests.stop_words = function(test, common){
  test( 'stop words', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street suffix', 'AB street', [ '0:ab', '1:street', '1:st' ]);

    assertAnalysis( 'street suffix (abbreviation)', 'AB st', [ '0:ab', '1:st', '1:street' ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      '0:trinidad', '1:and', '1:&', '2:tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      '0:toys', '1:r', '2:us'
    ]);

    assertAnalysis( 'address', '101 mapzen place', [
      '0:101', '1:mapzen', '2:place', '2:pl'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQueryFullToken' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    const expected = ['0:bedell', '1:street', '1:st', '2:133', '3:avenue', '3:ave', '3:av'];

    // specify 2 streets with a delimeter
    assertAnalysis( 'forward slash', 'Bedell Street/133rd Avenue',   expected);
    assertAnalysis( 'forward slash', 'Bedell Street /133rd Avenue',  expected);
    assertAnalysis( 'forward slash', 'Bedell Street/ 133rd Avenue',  expected);
    assertAnalysis( 'back slash',    'Bedell Street\\133rd Avenue',  expected);
    assertAnalysis( 'back slash',    'Bedell Street \\133rd Avenue', expected);
    assertAnalysis( 'back slash',    'Bedell Street\\ 133rd Avenue', expected);
    assertAnalysis( 'comma',         'Bedell Street,133rd Avenue',   expected);
    assertAnalysis( 'comma',         'Bedell Street ,133rd Avenue',  expected);
    assertAnalysis( 'comma',         'Bedell Street, 133rd Avenue',  expected);

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
        type: config.schema.typeName,
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
        type: config.schema.typeName,
        body: { query: { match_phrase: {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'query': 'Görlitzer Straße 52',
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
      '0:101', '1:mapzen', '2:place', '2:pl'
    ]);

    assertAnalysis( 'address', '30 w 26 st', [
      '0:30', '1:w', '1:west', '2:26', '3:st', '3:street'
    ]);

    assertAnalysis( 'address', '4B 921 83 st', [
      '0:4b', '1:921', '2:83', '3:st', '3:street'
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
