const peliasConfig = require('pelias-config');
const config = peliasConfig.generate()
require('./configValidation').validate(config);

const schema = {
  settings: require('./settings')(),
  mappings: require('./mappings/document')(config),
};

module.exports = schema;
