const tape = require('tape');

const configValidation = require('../configValidation');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('config without schema should throw error', function(t) {
    var config = {
      esclient: {}
    };

    t.throws(function() {
      configValidation.validate(config);
    }, /"schema" is required/, 'schema should exist');
    t.end();

  });

  test('config without schema.indexName should throw error', function(t) {
    var config = {
      schema: { typeName: 'example_type' },
      esclient: {}
    };

    t.throws(function() {
      configValidation.validate(config);
    }, /"schema.indexName" is required/, 'schema.indexName should exist');
    t.end();

  });

  test('config without schema.typeName should throw error', function (t) {
    var config = {
      schema: { indexName: 'example_index' },
      esclient: {}
    };

    t.throws(function () {
      configValidation.validate(config);
    }, /"schema.typeName" is required/, 'schema.typeName should exist');
    t.end();

  });

  test('config with non-string schema.indexName should throw error', function(t) {
    [null, 17, {}, [], false].forEach((value) => {
      var config = {
        schema: {
          indexName: value,
          typeName: 'example_type'
        },
        esclient: {}
      };

      t.throws(function() {
        configValidation.validate(config);
      }, /"schema.indexName" must be a string/, 'schema.indexName should be a string');

    });

    t.end();

  });

  test('config with non-string schema.typeName should throw error', function (t) {
    [null, 17, {}, [], false].forEach((value) => {
      var config = {
        schema: {
          indexName: 'example_index',
          typeName: value
        },
        esclient: {}
      };

      t.throws(function () {
        configValidation.validate(config);
      }, /"schema.typeName" must be a string/, 'schema.typeName should be a string');

    });

    t.end();

  });

  test('config with non-object esclient should throw error', function(t) {
    [null, 17, [], 'string', true].forEach((value) => {
      var config = {
        schema: {
          indexName: 'example_index',
          typeName: 'example_type'
        },
        esclient: value
      };

      t.throws(function() {
        configValidation.validate(config);
      }, /"esclient" must be of type object/, 'esclient should be an object');

    });

    t.end();

  });

  test('config with string schema.indexName and object esclient should not throw error', function(t) {
    var config = {
      schema: {
        indexName: 'example_index',
        typeName: 'example_type'
      },
      esclient: {}
    };

    t.doesNotThrow(function() {
      configValidation.validate(config);
    }, 'no error should have been thrown');

    t.end();

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('configValidation: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
