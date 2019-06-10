// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'á', ['a']);
    assertAnalysis( 'asciifolding', 'ß', ['s','ss']);
    assertAnalysis( 'asciifolding', 'æ', ['a','ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'ampersand', 'a and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a & b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a and & and b', ['a','&','&','&','b'] );
    assertAnalysis( 'ampersand', 'land', ['l','la','lan','land'] ); // should not replace inside tokens

    // keyword_street_suffix
    assertAnalysis( 'keyword_street_suffix', 'rd', ['r','rd','ro','roa','road'] );
    assertAnalysis( 'keyword_street_suffix', 'ctr', ['c', 'ct', 'ctr', 'ce', 'cen', 'cent', 'cente', 'center'] );

    assertAnalysis( 'peliasIndexOneEdgeGramFilter', '1 a ab abc abcdefghij', [
      '1', 'a', 'a', 'ab', 'a', 'ab', 'abc', 'a', 'ab', 'abc', 
      'abcd', 'abcde', 'abcdef', 'abcdefg', 'abcdefgh', 'abcdefghi', 'abcdefghij'
    ] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '00001', ['1'] );

    assertAnalysis( 'unique', '1 1 1', ['1','1','1'] );
    assertAnalysis( 'notnull', ' / / ', [] );

    assertAnalysis( 'no kstem', 'mcdonalds', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald', 'mcdonalds'] );
    assertAnalysis( 'no kstem', 'McDonald\'s', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald', 'mcdonalds'] );
    assertAnalysis( 'no kstem', 'peoples', ['p', 'pe', 'peo', 'peop', 'peopl', 'people', 'peoples'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['-','-&'] );
    assertAnalysis( 'punctuation', 'Hawai‘i', ['h', 'ha', 'haw', 'hawa', 'hawai', 'hawaii'] );

    // ensure that very large grams are created
    assertAnalysis( 'largeGrams', 'grolmanstrasse', [
      'g','gr','gro','grol','grolm','grolma','grolman','grolmans','grolmanst',
      'grolmanstr','grolmanstra','grolmanstras','grolmanstrass',
      'grolmanstrasse'
    ]);
    assertAnalysis( 'largeGrams2', 'Flughafeninformation', [ 'f', 'fl', 'flu',
      'flug', 'flugh', 'flugha', 'flughaf', 'flughafe', 'flughafen', 'flughafeni',
      'flughafenin', 'flughafeninf', 'flughafeninfo', 'flughafeninfor',
      'flughafeninform', 'flughafeninforma', 'flughafeninformat', 'flughafeninformati',
      'flughafeninformatio', 'flughafeninformation'
    ]);

    suite.run( t.end );
  });
};

// address suffix expansions should only performed in a way that is
// safe for 'partial tokens'.
module.exports.tests.address_suffix_expansions = function(test, common){
  test( 'address suffix expansions', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'safe expansions', 'aly', [
      'a', 'al', 'aly', 'all', 'alle', 'alley'
    ]);

    assertAnalysis( 'safe expansions', 'xing', [
      'x', 'xi', 'xin', 'xing', 'c', 'cr', 'cro', 'cros', 'cross', 'crossi', 'crossin', 'crossing'
    ]);

    assertAnalysis( 'safe expansions', 'rd', [
      'r', 'rd', 'ro', 'roa', 'road'
    ]);

    assertAnalysis( 'unsafe expansion', 'ct st', [
      'c', 'ct', 'co', 'cou', 'cour', 'court', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run( t.end );
  });
};

// stop words should be disabled so that the entire street prefix is indexed as ngrams
module.exports.tests.stop_words = function(test, common){
  test( 'stop words', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street suffix', 'AB street', [
      'a', 'ab', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    assertAnalysis( 'street suffix (abbreviation)', 'AB st', [
      'a', 'ab', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      't', 'tr', 'tri', 'trin', 'trini', 'trinid', 'trinida', 'trinidad', 
      '&', 't', 'to', 'tob', 'toba', 'tobag', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      't', 'to', 'toy', 'toys', 'r', 'u', 'us'
    ]);

    assertAnalysis( 'address', '101 mapzen place', [
      '101', 'm', 'ma', 'map', 'mapz', 'mapze', 'mapzen', 'p', 'pl', 'pla', 'plac', 'place'
    ]);

    suite.run( t.end );
  });
};

// unique token filter should only remove duplicate tokens at same position
module.exports.tests.unique = function(test, common){
  test( 'unique', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // if 'only_on_same_position' is not used the '1:a' token is erroneously removed
    assertAnalysis( 'unique', 'a ab', [ '0:a', '1:a', '1:ab' ], true);

    suite.run( t.end );
  });
};

module.exports.tests.address = function(test, common){
  test( 'address', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'address', '101 mapzen place', [
      '101', 'm', 'ma', 'map', 'mapz', 'mapze', 'mapzen', 'p', 'pl', 'pla', 'plac', 'place'
    ]);

    assertAnalysis( 'address', '30 w 26 st', [
      '30', 'w', 'we', 'wes', 'west', '26', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    assertAnalysis( 'address', '4B 921 83 st', [
      '4b', '921', '83', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry";

    assertAnalysis( 'composed', composed, ['c', 'ch', 'cha', 'cham', 'chamb', 'chambe', 'chamber', 'chambery'] );
    assertAnalysis( 'decomposed', decomposed, ['c', 'ch', 'cha', 'cham', 'chamb', 'chambe', 'chamber', 'chambery'] );

    // Één (both forms appear the same)
    var composed2 = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    var decomposed2 = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n";

    assertAnalysis( 'composed', composed2, ['e','ee','een'] );
    assertAnalysis( 'decomposed', decomposed2, ['e','ee','een'] );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasIndexOneEdgeGram: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
