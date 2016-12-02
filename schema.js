var config = require('pelias-config').generate().export(),
    settings = require('./settings')(config),
    doc = require('./mappings/document')(config);

var schema = {
  settings: settings,
  mappings: {
    /**
      the _default_ mapping is applied to all new _type dynamically added after
      the index was created, see comment below for more info.
    **/
    _default_: doc,

    /**
      these `_type`s are created when the index is created, while all other `_type`
      are dynamically created as required at run time due to:

      creating at least one _type will avoid errors when searching against
      an empty database. Having at least one _type means that 0 documents are
      returned instead of a error from elasticsearch.

      querying against non-existant _types will result in errors.
    **/
    country: doc,
    dependency: doc,
    macroregion: doc,
    region: doc,
    macrocounty: doc,
    county: doc,
    localadmin: doc,
    locality: doc,
    borough: doc
  }
};

module.exports = schema;
