
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'FA', ['fa']);
    assertAnalysis( 'asciifolding', 'lé', ['le']);
    assertAnalysis( 'asciifolding', 'ß', ['ss']);
    assertAnalysis( 'asciifolding', 'æ', ['ae']);
    assertAnalysis( 'asciifolding', 'łA', ['la']);
    assertAnalysis( 'asciifolding', 'ɰA', ['ma']);
    assertAnalysis( 'trim', ' fA ', ['fa'] );

    // full_token_address_suffix_expansion
    assertAnalysis( 'full_token_address_suffix_expansion', 'rd', ['ro','roa','road'] );
    assertAnalysis( 'full_token_address_suffix_expansion', 'ctr', ['ce','cen','cent','cente','center'] );

    assertAnalysis( 'ampersand', 'aa and bb', ['aa','bb'] );
    assertAnalysis( 'ampersand', 'land', ['la','lan','land'] ); // should not replace inside tokens

    // note, this functionality could be changed in the future in
    // order to allow the following cases to pass:
    // assertAnalysis( 'ampersand', 'aa and bb', ['aa','&','bb'] );
    // assertAnalysis( 'ampersand', 'aa & bb', ['aa','&','bb'] );
    // assertAnalysis( 'ampersand', 'aa and & and bb', ['aa','&','bb'] );

    assertAnalysis( 'peliasIndexTwoEdgeGramFilter', '1 a ab abc abcdefghij', ['1', 'ab','abc','abcd','abcde','abcdef','abcdefg','abcdefgh','abcdefghi','abcdefghij'] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '0002 00011', ['2', '11'] );
    assertAnalysis( 'unique', '11 11 11', ['11'] );
    assertAnalysis( 'notnull', ' / / ', [] );

    assertAnalysis( 'kstem', 'mcdonalds', ['mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald'] );
    assertAnalysis( 'kstem', 'McDonald\'s', ['mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald'] );
    assertAnalysis( 'kstem', 'peoples', ['pe', 'peo', 'peop', 'peopl', 'people'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['-&'] );

    // ensure that single grams are not created
    assertAnalysis( '1grams', 'a aa b bb 1 11', ['aa','bb','1','11'] );

    // for directionals (north/south/east/west) we allow single grams
    assertAnalysis( 'direction_synonym_contraction_keep_original', 'a', [] );
    assertAnalysis( 'direction_synonym_contraction_keep_original', 'n', ['no','nor','nort','north','n'] );
    // note the single gram created below
    assertAnalysis( 'direction_synonym_contraction_keep_original', 'north', ['no','nor','nort','north','n'] );

    // ensure that very large grams are created
    assertAnalysis( 'largeGrams', 'grolmanstrasse', [
      'gr','gro','grol','grolm','grolma','grolman','grolmans','grolmanst',
      'grolmanstr','grolmanstra','grolmanstras','grolmanstrass',
      'grolmanstrasse'
    ]);

    suite.run( t.end );
  });
};

// address suffix expansions should only performed in a way that is
// safe for 'partial tokens'.
module.exports.tests.address_suffix_expansions = function(test, common){
  test( 'address suffix expansions', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'safe expansions', 'aly', [
      'al', 'all', 'alle', 'alley'
    ]);

    assertAnalysis( 'safe expansions', 'xing', [
      'cr', 'cro', 'cros', 'cross', 'crossi', 'crossin', 'crossing'
    ]);

    assertAnalysis( 'safe expansions', 'rd', [
      'ro', 'roa', 'road'
    ]);

    assertAnalysis( 'unsafe expansion', 'ct st', [
      'ct', 'st'
    ]);

    suite.run( t.end );
  });
};

// stop words should be disabled so that the entire street prefix is indexed as ngrams
module.exports.tests.stop_words = function(test, common){
  test( 'stop words', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street suffix', 'AB street', [
      'ab', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    assertAnalysis( 'street suffix (abbreviation)', 'AB st', [
      'ab', 'st'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'tr', 'tri', 'trin', 'trini', 'trinid', 'trinida', 'trinidad', 'to', 'tob', 'toba', 'tobag', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      'to', 'toy', 'us'
    ]);

    assertAnalysis( 'address', '101 mapzen place', [
      '10', '101', 'ma', 'map', 'mapz', 'mapze', 'mapzen', 'pl', 'pla', 'plac', 'place'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.address_suffix_expansions = function(test, common){
  test( 'address suffix expansion', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street', 'FOO rd', [
      'fo', 'foo', 'ro', 'roa', 'road'
    ]);

    assertAnalysis( 'place', 'Union Sq', [
      'un', 'uni', 'unio', 'union', 'sq'
    ]);

    suite.run( t.end );
  });
};

// handle special cases for numerals
module.exports.tests.numerals = function(test, common){
  test( 'numerals', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasIndexTwoEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // allow single grams for single digit numbers
    assertAnalysis( 'single digit', '1 2', [ '1', '2' ]);

    // do not produce single grams for 2+ digit numbers
    assertAnalysis( 'multi digits', '12 999', [ '12', '99', '999' ]);

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasIndexTwoEdgeGram: ' + name, testFunction);
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
