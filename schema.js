var doc = require('./mappings/document');

var oneGramMapping = {
  dynamic_templates: [{
    nameGram: {
      path_match: 'name.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasIndexOneEdgeGram',
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
    /**
      the _default_ mapping is applied to all new _type dynamically added after
      the index was created, see comment below for more info.
    **/
    _default_: doc,

    /**
      these `_type`s are created when the index is created, while all other `_type`
      are dynamically created as required at run time, this served two purposes:

      1) creating at least one _type will avoid errors when searching against
         an empty database. Having at least one _type means that 0 documents are
         returned instead of a error from elasticsearch.

      2) allows us to define their analysis differently from the other `_type`s.
         in this case, we will elect to use the $oneGramMapping so that these
         _type can be searched with a single character. doing so on *all* _type
         would result in much larger indeces and decreased search performance.
    **/
    country: oneGramMapping,
    macroregion: oneGramMapping,
    region: oneGramMapping,
    macrocounty: oneGramMapping,
    county: oneGramMapping,
    localadmin: oneGramMapping,
    locality: oneGramMapping,
    borough: oneGramMapping
  }
};

module.exports = schema;
