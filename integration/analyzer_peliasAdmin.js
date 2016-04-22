
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasAdmin' );
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

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasAdmin' );
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

    assertAnalysis( 'place', 'Saint-Louis-du-Ha! Ha!', [
      'saint', 'louis', 'du', 'ha', 'ha'
    ]);

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasAdmin' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // specify 2 parts with a delimeter
    assertAnalysis( 'forward slash', 'Trinidad/Tobago',   [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'forward slash', 'Trinidad /Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'forward slash', 'Trinidad/ Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'back slash',    'Trinidad\\Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'back slash',    'Trinidad \\Tobago', [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'back slash',    'Trinidad\\ Tobago', [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'comma',         'Trinidad,Tobago',   [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'comma',         'Trinidad ,Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'comma',         'Trinidad, Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'space',         'Trinidad,Tobago',   [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'space',         'Trinidad ,Tobago',  [ 'trinidad', 'tobago' ]);
    assertAnalysis( 'space',         'Trinidad, Tobago',  [ 'trinidad', 'tobago' ]);

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
