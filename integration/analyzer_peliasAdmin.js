// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'é', ['e']);
    assertAnalysis( 'asciifolding', 'ß', ['ss']);
    assertAnalysis( 'asciifolding', 'æ', ['ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'word_delimiter', 'western-samoa', ['western','samoa'] );
    assertAnalysis( 'notnull', ' ^ ', [] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), [] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'trinidad', 'and', 'tobago'
    ]);

    assertAnalysis( 'country', 'Great Britain', [
      'great', 'britain'
    ]);

    assertAnalysis( 'city', 'New York', [
      'new', 'york'
    ]);

    // some more unusal places from:
    // ref: https://en.wikipedia.org/wiki/Wikipedia:Unusual_place_names

    assertAnalysis( 'place', 'Ala-Lemu', [
      'ala', 'lemu'
    ]);

    assertAnalysis( 'place', 'Båstad', [
      'bastad'
    ]);

    assertAnalysis( 'place', 'Paskalomatunturi', [
      'paskalomatunturi'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.synonyms = function(test, common){
  test( 'synonyms', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'place', 'Saint-Louis-du-Ha! Ha!', [
      '0:saint', '0:st', '1:louis', '2:du', '3:ha', '4:ha'
    ]);

    assertAnalysis( 'place', 'Sainte-Chapelle', [
      '0:sainte', '0:ste', '1:chapelle'
    ]);

    assertAnalysis( 'place', 'Mount Everest', [
      '0:mount', '0:mt', '1:everest'
    ]);

    assertAnalysis( 'place', 'Mont Blanc', [
      '0:mont', '0:mt', '1:blanc'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    const expected = ['0:trinidad', '1:tobago'];

    // specify 2 parts with a delimeter
    assertAnalysis( 'forward slash', 'Trinidad/Tobago',   expected);
    assertAnalysis( 'forward slash', 'Trinidad /Tobago',  expected);
    assertAnalysis( 'forward slash', 'Trinidad/ Tobago',  expected);
    assertAnalysis( 'back slash',    'Trinidad\\Tobago',  expected);
    assertAnalysis( 'back slash',    'Trinidad \\Tobago', expected);
    assertAnalysis( 'back slash',    'Trinidad\\ Tobago', expected);
    assertAnalysis( 'comma',         'Trinidad,Tobago',   expected);
    assertAnalysis( 'comma',         'Trinidad ,Tobago',  expected);
    assertAnalysis( 'comma',         'Trinidad, Tobago',  expected);
    assertAnalysis( 'space',         'Trinidad,Tobago',   expected);
    assertAnalysis( 'space',         'Trinidad ,Tobago',  expected);
    assertAnalysis( 'space',         'Trinidad, Tobago',  expected);

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry";

    assertAnalysis( 'composed', composed, ['chambery'] );
    assertAnalysis( 'decomposed', decomposed, ['chambery'] );

    // Één (both forms appear the same)
    composed = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    decomposed = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n";

    assertAnalysis( 'composed', composed, ['een'] );
    assertAnalysis( 'decomposed', decomposed, ['een'] );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasAdmin: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
