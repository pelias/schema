const config = require('pelias-config').generate();

const schema = {
  settings: require('./settings')(),
  mappings: {
    [config.schema.typeName]: require('./mappings/document'),
  }
};

module.exports = schema;
