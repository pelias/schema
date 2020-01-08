// simply validate that the schema doesn't error when inserted in to
// your local elasticsearch server, useful to sanity check version upgrades.

const elastictest = require('elastictest');

module.exports.tests = {};

module.exports.tests.validate = function(test, common){
  test( 'schema', t => {

    var suite = new elastictest.Suite( common.clientOpts, common.create );

    suite.assert( done => {
      suite.client.info({}, ( err, res, status ) => {
        t.equal( status, 200 );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('validate: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
