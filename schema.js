var doc = require('./mappings/document');

var schema = {
  settings: require('./settings')(),
  mappings: {
    _default_: doc
  }
};

module.exports = schema;
