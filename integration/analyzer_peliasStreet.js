
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'Max-Beer-Straße', ['max-beer-strasse']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Street', ['foo st'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Road', ['foo rd'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Crescent', ['foo cres'] );
    assertAnalysis( 'keyword_compass', 'north foo', ['n foo'] );
    assertAnalysis( 'keyword_compass', 'SouthWest foo', ['sw foo'] );
    assertAnalysis( 'remove_ordinals', '1st 2nd 3rd 4th 5th', ['1 2 3 4 5'] );
    assertAnalysis( 'remove_ordinals', 'Ast th 101st', ['ast th 101'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'USA address', 'west 26th street', [ 'w 26 st' ]);
    assertAnalysis( 'USA address', 'West 26th Street', [ 'w 26 st' ]);
    assertAnalysis( 'USA address', 'w 26th st', [ 'w 26 st' ]);
    assertAnalysis( 'USA address', 'WEST 26th STREET', [ 'w 26 st' ]);
    assertAnalysis( 'USA address', 'WEST 26th ST', [ 'w 26 st' ]);

    suite.run( t.end );
  });
};

module.exports.tests.normalize_punctuation = function(test, common){
  test( 'normalize punctuation', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'single space', 'Chapala Street',    [ 'chapala st' ]);
    assertAnalysis( 'double space', 'Chapala  Street',   [ 'chapala st' ]);
    assertAnalysis( 'triple space', 'Chapala   Street',  [ 'chapala st' ]);
    assertAnalysis( 'quad space',   'Chapala    Street', [ 'chapala st' ]);

    suite.run( t.end );
  });
};

module.exports.tests.remove_ordinals = function(test, common){
  test( 'remove ordinals', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'ordindals', "1st", ["1"] );
    assertAnalysis( 'ordindals', "22nd", ["22"] );
    assertAnalysis( 'ordindals', "333rd", ["333"] );
    assertAnalysis( 'ordindals', "4444th", ["4444"] );
    assertAnalysis( 'ordindals', "2500th", ["2500"] );

    assertAnalysis( 'uppercase', "1ST", ["1"] );
    assertAnalysis( 'uppercase', "22ND", ["22"] );
    assertAnalysis( 'uppercase', "333RD", ["333"] );
    assertAnalysis( 'uppercase', "4444TH", ["4444"] );

    assertAnalysis( 'autocomplete', "26", ["26"] );
    assertAnalysis( 'autocomplete', "26t", ["26"] );
    assertAnalysis( 'autocomplete', "26th", ["26"] );
    assertAnalysis( 'autocomplete', "3", ["3"] );
    assertAnalysis( 'autocomplete', "3r", ["3"] );
    assertAnalysis( 'autocomplete', "3rd", ["3"] );

    assertAnalysis( 'wrong suffix (do nothing)', "0th", ["0th"] );
    assertAnalysis( 'wrong suffix (do nothing)', "26s", ["26s"] );
    assertAnalysis( 'wrong suffix (do nothing)', "26st", ["26st"] );
    assertAnalysis( 'wrong suffix (do nothing)', "31t", ["31t"] );
    assertAnalysis( 'wrong suffix (do nothing)', "31th", ["31th"] );
    assertAnalysis( 'wrong suffix (do nothing)', "21r", ["21r"] );
    assertAnalysis( 'wrong suffix (do nothing)', "21rd", ["21rd"] );
    assertAnalysis( 'wrong suffix (do nothing)', "29n", ["29n"] );
    assertAnalysis( 'wrong suffix (do nothing)', "29nd", ["29nd"] );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasStreet: ' + name, testFunction);
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
