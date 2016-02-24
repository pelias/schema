var admin = require('./partial/admin');
var hash = require('./partial/hash');
var multiplier = require('./partial/multiplier');
var literal = require('./partial/literal');

var schema = {
  properties: {

    // data partitioning
    source: literal,
    layer: literal,
    alpha3: admin,

    // place name (ngram analysis)
    name: hash,

    // place name (phrase analysis)
    phrase: hash,

    // address data
    address: {
      type: 'object',
      dynamic: true,
      properties: {
        name: {
          type: 'string',
          index_analyzer: 'keyword',
          search_analyzer: 'keyword'
        },
        number: {
          type: 'string',
          index_analyzer: 'peliasHousenumber',
          search_analyzer: 'peliasHousenumber',
        },
        street: {
          type: 'string',
          index_analyzer: 'peliasStreet',
          search_analyzer: 'peliasStreet'
        },
        zip: {
          type: 'string',
          index_analyzer: 'peliasZip',
          search_analyzer: 'peliasZip'
        }
      }
    },

    // quattroshapes (legacy) hierarchy
    admin0: admin,
    admin1: admin,
    admin1_abbr: admin,
    admin2: admin,
    local_admin: admin,
    locality: admin,
    neighborhood: admin,

    // hierarchy
    parent: {
      type: 'object',
      dynamic: true,
      properties: {

        // https://github.com/whosonfirst/whosonfirst-placetypes#country
        country: admin,
        country_abbr: admin,
        country_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#region
        region: admin,
        region_abbr: admin,
        region_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#county
        county: admin,
        county_abbr: admin,
        county_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#locality
        locality: admin,
        locality_abbr: admin,
        locality_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#localadmin
        localadmin: admin,
        localadmin_abbr: admin,
        localadmin_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#neighbourhood
        neighbourhood: admin,
        neighbourhood_abbr: admin,
        neighbourhood_id: literal
      }
    },

    // geography
    center_point: require('./partial/centroid'),
    shape: require('./partial/shape'),
    bounding_box: require('./partial/boundingbox'),

    // meta info
    source_id: literal,
    category: literal,
    population: multiplier,
    popularity: multiplier
  },
  dynamic_templates: [{
    nameGram: {
      path_match: 'name.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasOneEdgeGram',
        fielddata : {
          loading: 'eager_global_ordinals'
        }
      }
    },
  },{
    phrase: {
      path_match: 'phrase.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasPhrase',
        fielddata : {
          loading: 'eager_global_ordinals'
        }
      }
    }
  }],
  _source: {
    excludes : ['shape','phrase']
  },
  _all: {
    enabled: false
  },
  dynamic: 'true'
};

module.exports = schema;
