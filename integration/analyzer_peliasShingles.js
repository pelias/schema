
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasShingles' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F f', ['f f']);
    assertAnalysis( 'asciifolding', 'é é', ['e e']);
    assertAnalysis( 'asciifolding', 'ß ß', ['ss ss']);
    assertAnalysis( 'asciifolding', 'æ æ', ['ae ae']);
    assertAnalysis( 'asciifolding', 'ł ł', ['l l']);
    assertAnalysis( 'asciifolding', 'ɰ ɰ', ['m m']);
    assertAnalysis( 'trim', ' f f ', ['f f'] );
    assertAnalysis( 'stop_words (disabled)', 'a st b ave c', ['a st', 'st b', 'b ave', 'ave c'] );
    assertAnalysis( 'ampersand', 'a and b', ['a &','& b'] );
    assertAnalysis( 'ampersand', 'a & b', ['a &','& b'] );

    // @todo: handle multiple consecutive 'and'
    // assertAnalysis( 'ampersand', 'a and & and b', ['a &','& b'] );

    assertAnalysis( 'kstem', 'mcdonalds restaurant', ['mcdonald restaurant'] );
    assertAnalysis( 'kstem', 'McDonald\'s Restaurant', ['mcdonald restaurant'] );
    assertAnalysis( 'kstem', 'walking peoples', ['walking people'] );
    
    assertAnalysis( 'peliasShinglesFilter', '1 a ab abc abcdefghijk', ['1 a', 'a ab', 'ab abc', 'abc abcdefghijk'] );
    assertAnalysis( 'unique', '1 1 1', ['1 1'] );
    assertAnalysis( 'notnull', ' a ', [] );

    assertAnalysis( 'stem street suffixes', 'streets avenue', ['st ave'] );
    assertAnalysis( 'stem street suffixes', 'boulevard roads', ['blvd rd'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), [] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasShingles' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'trinidad &', '& tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      'toy r', 'r us'
    ]);

    assertAnalysis( 'address', '101 mapzen pl', [
      '101 mapzen', 'mapzen pl'
    ]);

    // both terms should map to same tokens
    var expected1 = [ '325 n', 'n 12th', '12th st' ];
    assertAnalysis( 'address', '325 N 12th St', expected1 );
    assertAnalysis( 'address', '325 North 12th Street', expected1 );

    // both terms should map to same tokens
    var expected2 = [ '13509 colfax', 'colfax ave', 'ave s' ];
    assertAnalysis( 'address', '13509 Colfax Ave S', expected2 );
    assertAnalysis( 'address', '13509 Colfax Avenue South', expected2 );

    // both terms should map to same tokens
    var expected3 = [ '100 s', 's lake', 'lake dr' ];
    assertAnalysis( 'address', '100 S Lake Dr', expected3 );
    assertAnalysis( 'address', '100 South Lake Drive', expected3 );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasShingles: ' + name, testFunction);
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