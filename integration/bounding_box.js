// validate bounding box behaves as expected

const Suite = require('../test/elastictest/Suite');
const config = require('pelias-config').generate();

module.exports.tests = {};

module.exports.tests.index_and_retrieve = (test, common) => {
  test( 'index and retrieve', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a bbox
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: {
          bounding_box: '{"min_lat":-47.75,"max_lat":-33.9,"min_lon":163.82,"max_lon":179.42}'
        }
      }, done);
    });

    // retrieve document by id
    suite.assert( done => {
      suite.client.get(
        {
          index: suite.props.index,
          id: '1'
        },
        (err, res) => {
          t.equal(err, undefined);
          t.deepEqual(res._source.bounding_box, '{"min_lat":-47.75,"max_lat":-33.9,"min_lon":163.82,"max_lon":179.42}');
          done();
        }
      );
    });

    suite.run( t.end );
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('bounding box: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
