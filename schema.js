var doc = require('./mappings/document');

var oneGramMapping = {
  dynamic_templates: [{
    nameGram: {
      path_match: 'name.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasOneEdgeGram',
        fielddata : {
          format : 'fst',
          loading: 'eager_global_ordinals'
        }
      }
    }
  }]
};

var schema = {
  settings: require('./settings')(),
  mappings: {
    _default_: doc,

    admin0: oneGramMapping,
    admin1: oneGramMapping,
    admin2: oneGramMapping
  }
};

module.exports = schema;
