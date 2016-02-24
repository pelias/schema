var doc = require('./mappings/document');

var schema = {
  settings: require('./settings')(),
  mappings: {
    /**
      the _default_ mapping is applied to all new _type dynamically added after
      the index was created.
    **/
    _default_: doc,

    /**
      creating at least one _type to avoid errors when searching against
      an empty database. Having at least one _type means that 0 documents are
      returned instead of a error from elasticsearch.

    **/
    country: doc
  }
};

module.exports = schema;
