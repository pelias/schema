var doc = require('./mappings/document');

var schema = {
  settings: require('./settings')(),
  mappings: {
    doc: doc,
  }
};

module.exports = schema;
