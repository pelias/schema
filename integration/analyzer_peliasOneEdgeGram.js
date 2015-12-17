
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'é', ['e']);
    assertAnalysis( 'asciifolding', 'ß', ['s','ss']);
    assertAnalysis( 'asciifolding', 'æ', ['a','ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'stop_words', 'a street b avenue c', ['a','b','c'] );
    assertAnalysis( 'ampersand', 'a and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a & b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a and & and b', ['a','&','b'] );
    assertAnalysis( 'peliasOneEdgeGramFilter', '1 a ab abc abcdefghij', ['1','a','ab','abc','abcd','abcde','abcdef','abcdefg','abcdefgh','abcdefghi','abcdefghij'] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '00001', ['1'] );
    assertAnalysis( 'unique', '1 1 1', ['1'] );
    assertAnalysis( 'notnull', 'avenue street', [] );

    assertAnalysis( 'kstem', 'mcdonalds', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald'] );
    assertAnalysis( 'kstem', 'McDonald\'s', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald'] );
    assertAnalysis( 'kstem', 'peoples', ['p', 'pe', 'peo', 'peop', 'peopl', 'people'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['-','-&'] );

    // ensure that very large grams are created
    assertAnalysis( 'largeGrams', 'grolmanstrasse', [
      'g','gr','gro','grol','grolm','grolma','grolman','grolmans','grolmanst',
      'grolmanstr','grolmanstra','grolmanstras','grolmanstrass',
      'grolmanstrasse'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      't', 'tr', 'tri', 'trin', 'trini', 'trinid', 'trinida', 'trinidad', '&', 'to', 'tob', 'toba', 'tobag', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      't', 'to', 'toy', 'r', 'u', 'us'
    ]);

    assertAnalysis( 'address', '101 mapzen place', [
      '1', '10', '101', 'm', 'ma', 'map', 'mapz', 'mapze', 'mapzen'
    ]);

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasOneEdgeGram: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};

function analyze( suite, t, analyzer, comment, text, expected ){
  suite.assert( function( done ){
    suite.client.indices.analyze({
      index: suite.props.index,
      analyzer: analyzer,
      text: text
    }, function( err, res ){
      if( err ) console.error( err );
      t.deepEqual( simpleTokens( res.tokens ), expected, comment );
      done();
    });
  });
}

function simpleTokens( tokens ){
  return tokens.map( function( t ){
    return t.token;
  });
}
