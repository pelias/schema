// validate analyzer is behaving as expected

const tape = require('tape'), Suite = require('../test/elastictest/Suite'), punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = (test, common) => {
  test( 'analyze', t => {

    const suite = new Suite( common.clientOpts, common.create );
    const assertAnalysis = common.analyze.bind( null, suite, t, 'peliasHousenumber' );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'keyword', '100 100', ['100','100']);
    assertAnalysis( 'numeric', '1a', ['1'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = (test, common) => {
  test( 'functional', t => {

    const suite = new Suite( common.clientOpts, common.create );
    const assertAnalysis = common.analyze.bind( null, suite, t, 'peliasHousenumber' );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'apt no (generic)', '101a', [ '101' ]);

    assertAnalysis( 'apt no (france)', '219-241', [ '219', '241' ]);
    assertAnalysis( 'apt no (brazil)', '112, ap. 31', [ '112', '31' ]);
    assertAnalysis( 'apt no (denmark)', '5, 4', [ '5', '4' ]);
    assertAnalysis( 'apt no (poland)', '4/6', [ '4', '6' ]);

    suite.run( t.end );
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('peliasHousenumber: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
