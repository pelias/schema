const schema = {
  settings: require('./settings')(),
  mappings: require('./mappings/document'),
};

module.exports = schema;
