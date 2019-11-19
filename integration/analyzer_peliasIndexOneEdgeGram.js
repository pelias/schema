// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'á', ['a']);
    assertAnalysis( 'asciifolding', 'ß', ['0:s','0:ss']);
    assertAnalysis( 'asciifolding', 'æ', ['0:a','0:ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis('ampersand', 'a and b', [
      '0:a',
      '1:a', '1:an', '1:and', '1:&',
      '2:b'
    ]);
    assertAnalysis('ampersand', 'a & b', [
      '0:a',
      '1:&', '1:a', '1:an', '1:and', '1:u', '1:un', '1:und',
      '2:b'
    ]);
    assertAnalysis('ampersand', 'a and & and b', [
      '0:a',
      '1:a', '1:an', '1:and', '1:&',
      '2:&', '2:a', '2:an', '2:and', '2:u', '2:un', '2:und',
      '3:a', '3:an', '3:and', '3:&',
      '4:b'
    ]);
    assertAnalysis( 'ampersand', 'land', ['0:l','0:la','0:lan','0:land'] ); // should not replace inside tokens

    // keyword_street_suffix
    assertAnalysis( 'keyword_street_suffix', 'rd', ['0:r','0:rd','0:ro','0:roa','0:road'] );
    assertAnalysis( 'keyword_street_suffix', 'ctr', ['0:c', '0:ct', '0:ctr', '0:ce', '0:cen', '0:cent', '0:cente', '0:center'] );

    assertAnalysis( 'peliasIndexOneEdgeGramFilter', '1 a ab abc abcdefghij', [
      '0:1',
      '1:a',
      '2:a', '2:ab',
      '3:a', '3:ab', '3:abc',
      '4:a', '4:ab', '4:abc', '4:abcd', '4:abcde', '4:abcdef',
      '4:abcdefg', '4:abcdefgh', '4:abcdefghi', '4:abcdefghij'
    ] );
    assertAnalysis( 'removeAllZeroNumericPrefix', '00001', ['1'] );

    assertAnalysis( 'unique', '1 1 1', ['1','1','1'] );
    assertAnalysis( 'notnull', ' / / ', [] );

    assertAnalysis( 'no kstem', 'mcdonalds', [
      '0:m', '0:mc', '0:mcd', '0:mcdo', '0:mcdon', '0:mcdona', '0:mcdonal', '0:mcdonald', '0:mcdonalds'
    ]);
    assertAnalysis( 'no kstem', 'McDonald\'s', [
      '0:m', '0:mc', '0:mcd', '0:mcdo', '0:mcdon', '0:mcdona', '0:mcdonal', '0:mcdonald', '0:mcdonalds'
    ]);
    assertAnalysis( 'no kstem', 'peoples', [
      '0:p', '0:pe', '0:peo', '0:peop', '0:peopl', '0:people', '0:peoples'
    ]);

    // remove punctuation (handled by the char_filter)
    assertAnalysis('punctuation', punctuation.all.join(''), ['0:&', '0:a', '0:an', '0:and', '0:u', '0:un', '0:und'] );
    assertAnalysis( 'punctuation', 'Hawai‘i', ['0:h', '0:ha', '0:haw', '0:hawa', '0:hawai', '0:hawaii'] );

    // ensure that very large grams are created
    assertAnalysis( 'largeGrams', 'grolmanstrasse', [
      '0:g', '0:gr', '0:gro', '0:grol', '0:grolm', '0:grolma', '0:grolman', '0:grolmans',
      '0:grolmanst', '0:grolmanstr', '0:grolmanstra', '0:grolmanstras', '0:grolmanstrass',
      '0:grolmanstrasse'
    ]);
    assertAnalysis( 'largeGrams2', 'Flughafeninformation', [ '0:f', '0:fl', '0:flu',
      '0:flug', '0:flugh', '0:flugha', '0:flughaf', '0:flughafe', '0:flughafen', '0:flughafeni',
      '0:flughafenin', '0:flughafeninf', '0:flughafeninfo', '0:flughafeninfor', '0:flughafeninform',
      '0:flughafeninforma', '0:flughafeninformat', '0:flughafeninformati',
      '0:flughafeninformatio', '0:flughafeninformation'
    ]);

    suite.run( t.end );
  });
};

// address suffix expansions should only performed in a way that is
// safe for 'partial tokens'.
module.exports.tests.address_suffix_expansions = function(test, common){
  test( 'address suffix expansions', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'safe expansions', 'aly', [
      '0:a', '0:al', '0:aly', '0:all', '0:alle', '0:alley'
    ]);

    assertAnalysis( 'safe expansions', 'xing', [
      '0:x', '0:xi', '0:xin', '0:xing',
      '0:c', '0:cr', '0:cro', '0:cros', '0:cross', '0:crossi', '0:crossin', '0:crossing'
    ]);

    assertAnalysis( 'safe expansions', 'rd', [
      '0:r', '0:rd', '0:ro', '0:roa', '0:road'
    ]);

    assertAnalysis( 'unsafe expansion', 'ct st', [
      '0:c', '0:ct', '0:co', '0:cou', '0:cour', '0:court',
      '1:s', '1:st', '1:str', '1:stre', '1:stree', '1:street'
    ]);

    suite.run( t.end );
  });
};

// stop words should be disabled so that the entire street prefix is indexed as ngrams
module.exports.tests.stop_words = function(test, common){
  test( 'stop words', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'street suffix', 'AB street', [
      '0:a', '0:ab',
      '1:s', '1:st', '1:str', '1:stre', '1:stree', '1:street'
    ]);

    assertAnalysis( 'street suffix (abbreviation)', 'AB st', [
      '0:a', '0:ab',
      '1:s', '1:st', '1:str', '1:stre', '1:stree', '1:street'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis('country', 'Trinidad and Tobago', [
      '0:t', '0:tr', '0:tri', '0:trin', '0:trini', '0:trinid', '0:trinida', '0:trinidad',
      '1:a', '1:an', '1:and', '1:&',
      '2:t', '2:to', '2:tob', '2:toba', '2:tobag', '2:tobago'
    ]);

    assertAnalysis('place', 'Toys "R" Us!', [
      '0:t', '0:to', '0:toy', '0:toys', '1:r', '2:u', '2:us'
    ]);

    assertAnalysis('address', '101 mapzen place', [
      '0:1', '0:10', '0:101', '1:m', '1:ma', '1:map', '1:mapz', '1:mapze', '1:mapzen', '2:p', '2:pl', '2:pla', '2:plac', '2:place'
    ]);

    suite.run( t.end );
  });
};

// unique token filter should only remove duplicate tokens at same position
module.exports.tests.unique = function(test, common){
  test( 'unique', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // if 'only_on_same_position' is not used the '1:a' token is erroneously removed
    assertAnalysis( 'unique', 'a ab', [ '0:a', '1:a', '1:ab' ]);

    suite.run( t.end );
  });
};

module.exports.tests.address = function(test, common){
  test( 'address', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'address', '101 mapzen place', [
      '0:1', '0:10', '0:101',
      '1:m', '1:ma', '1:map', '1:mapz', '1:mapze', '1:mapzen',
      '2:p', '2:pl', '2:pla', '2:plac', '2:place'
    ]);

    assertAnalysis( 'address', '30 w 26 st', [
      '0:3', '0:30',
      '1:w', '1:we', '1:wes', '1:west',
      '2:2', '2:26',
      '3:s', '3:st', '3:str', '3:stre', '3:stree', '3:street'
    ]);

    assertAnalysis( 'address', '4B 921 83 st', [
      '0:4', '0:4b',
      '1:9', '1:92', '1:921',
      '2:8', '2:83',
      '3:s', '3:st', '3:str', '3:stre', '3:stree', '3:street'
    ]);

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasIndexOneEdgeGram' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry"

    assertAnalysis( 'composed', composed, [
      '0:c', '0:ch', '0:cha', '0:cham', '0:chamb', '0:chambe', '0:chamber', '0:chambery'
    ] );
    assertAnalysis( 'decomposed', decomposed, [
      '0:c', '0:ch', '0:cha', '0:cham', '0:chamb', '0:chambe', '0:chamber', '0:chambery'
    ] );

    // Één (both forms appear the same)
    var composed = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    var decomposed = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n"

    assertAnalysis('composed', composed, ['0:e', '0:ee', '0:een']);
    assertAnalysis('decomposed', decomposed, ['0:e', '0:ee', '0:een']);

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
