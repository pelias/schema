const config = require('pelias-config').generate();
const configureFields = require('./mappings/configureFields');

const schema = {
  settings: require('./settings')(),
  mappings: configureFields(require('./mappings/document'), config.schema),
};

module.exports = schema;
