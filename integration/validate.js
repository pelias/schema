// simply validate that the schema doesn't error when inserted in to
// your local elasticsearch server, useful to sanity check version upgrades.

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema');

module.exports.tests = {};

module.exports.tests.validate = function(test, common){
  test( 'schema', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );

    suite.assert( function( done ){
      suite.client.info({}, function( err, res, status ){
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
