// simply validate that the schema doesn't error when inserted in to
// your local elasticsearch server, useful to sanity check version upgrades.

const Suite = require('../test/elastictest/Suite');

module.exports.tests = {};

module.exports.tests.validate = (test, common) => {
  test( 'schema', t => {

    const suite = new Suite( common.clientOpts, common.create );

    suite.assert( done => {
      suite.client.info({}, ( err, res, status ) => {
        t.equal( status, 200 );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('validate: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
