const tape = require('tape');

const configValidation = require('../configValidation');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('config without schema should throw error', t => {
    const config = {
      esclient: {}
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"schema" is required/, 'schema should exist');
    t.end();

  });

  test('config without schema.indexName should throw error', t => {
    const config = {
      schema: {},
      esclient: {}
    };

    t.throws(() => {
      configValidation.validate(config);
    }, /"schema.indexName" is required/, 'schema.indexName should exist');
    t.end();

  });

  test('config with non-string schema.indexName should throw error', t => {
    [null, 17, {}, [], false].forEach((value) => {
      const config = {
        schema: {
          indexName: value,
        },
        esclient: {}
      };

      t.throws(() => {
        configValidation.validate(config);
      }, /"schema.indexName" must be a string/, 'schema.indexName should be a string');

    });

    t.end();

  });

  test('config with non-object esclient should throw error', t => {
    [null, 17, [], 'string', true].forEach((value) => {
      const config = {
        schema: {
          indexName: 'example_index',
        },
        esclient: value
      };

      t.throws(() => {
        configValidation.validate(config);
      }, /"esclient" must be of type object/, 'esclient should be an object');

    });

    t.end();

  });

  test('config with string schema.indexName and object esclient should not throw error', t => {
    const config = {
      schema: {
        indexName: 'example_index',
      },
      esclient: {}
    };

    t.doesNotThrow(() => {
      configValidation.validate(config);
    }, 'no error should have been thrown');

    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`configValidation: ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
