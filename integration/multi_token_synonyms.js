// validate analyzer is behaving as expected

const elastictest = require('elastictest');
const schema = require('../schema');
const config = require('pelias-config').generate();

module.exports.tests = {};

// simple test to cover the issue noted in:
// https://github.com/pelias/schema/issues/381#issuecomment-548305594
module.exports.tests.functional = function (test, common) {
  test('functional', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    // index a document with all admin values
    // note: this will return an error if multi-token synonyms are
    // not supported on ES6+
    suite.action(function (done) {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1', body: {
          name: { default: 'set' },
          phrase: { default: 'set' },
          address_parts: {
            name: 'set',
            street: 'set'
          },
          parent: {
            country: 'set'
          }
        }
      }, done);
    });

    suite.run(t.end);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('multi token synonyms: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
