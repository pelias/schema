
// validate bounding box behaves as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.index_and_retrieve = function(test, common){
  test( 'index and retrieve', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a bbox
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index, type: 'test',
        id: '1', body: {
          bounding_box: {
            type: 'envelope',
            coordinates: [
              [21.212121, 13.131313],
              [31.313131, 12.121212]
            ]
          }
      }
      }, done );
    });

    // retrieve document by id
    suite.assert( function( done ){
      suite.client.get({
        index: suite.props.index,
        type: 'test',
        id: '1'
      }, function( err, res ){
        t.equal( err, undefined );
        t.deepEqual( res._source.bounding_box, {
          type: 'envelope',
          coordinates: [
            [21.212121, 13.131313],
            [31.313131, 12.121212]
          ]
        });
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('bounding box: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
