// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasHousenumber' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'keyword', '100 100', ['100','100']);
    assertAnalysis( 'numeric', '1a', ['1'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasHousenumber' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'apt no (generic)', '101a', [ '101' ]);

    assertAnalysis( 'apt no (france)', '219-241', [ '219', '241' ]);
    assertAnalysis( 'apt no (brazil)', '112, ap. 31', [ '112', '31' ]);
    assertAnalysis( 'apt no (denmark)', '5, 4', [ '5', '4' ]);
    assertAnalysis( 'apt no (poland)', '4/6', [ '4', '6' ]);

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasHousenumber: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
