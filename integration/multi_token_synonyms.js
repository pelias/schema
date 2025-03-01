// validate analyzer is behaving as expected

const Suite = require('../test/elastictest/Suite');
const config = require('pelias-config').generate();

module.exports.tests = {};

// simple test to cover the issue noted in:
// https://github.com/pelias/schema/issues/381#issuecomment-548305594
module.exports.tests.functional = (test, common) => {
  test('functional', t => {

    const suite = new Suite(common.clientOpts, common.create);
    suite.action(done => { setTimeout(done, 500); }); // wait for es to bring some shards up

    // index a document with all admin values
    // note: this will return an error if multi-token synonyms are
    // not supported on ES6+
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
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

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('multi token synonyms: ' + name, testFunction);
  }

  for (const testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
