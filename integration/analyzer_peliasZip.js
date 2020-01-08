// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasZip' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'alphanumeric', 'a-f g', ['afg'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasZip' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'usa zip', '10010', [ '10010' ]);
    assertAnalysis( 'usa zip', 10010, [ '10010' ]);
    assertAnalysis( 'usa zip - punctuation', '10-010', [ '10010' ]);
    assertAnalysis( 'usa zip - whitespace', '10  010', [ '10010' ]);
    assertAnalysis( 'uk postcode', 'E24DN', [ 'e24dn' ]);
    assertAnalysis( 'uk postcode - punctuation', 'E2-4DN', [ 'e24dn' ]);
    assertAnalysis( 'uk postcode - whitespace', 'E 24 DN', [ 'e24dn' ]);

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasZip: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
