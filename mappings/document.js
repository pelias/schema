var merge = require('merge');
var admin = require('./partial/admin');
var hash = require('./partial/hash');
var multiplier = require('./partial/multiplier');

var schema = {
  properties: {
    name: hash,
    shingle: hash,
    address: merge( {}, hash, { 'index': 'no' } ),
    alpha3: admin,
    admin0: admin,
    admin1: admin,
    admin1_abbr: admin,
    admin2: admin,
    local_admin: admin,
    locality: admin,
    neighborhood: admin,
    center_point: require('./partial/centroid'),
    shape: require('./partial/shape'),
    category: require('./partial/category'),
    population: multiplier,
    popularity: multiplier,
    suggest: require('./partial/suggest')
  },
  dynamic_templates: [{
    nameGram: {
      path_match: 'name.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasTwoEdgeGram',
        fielddata : {
          format : 'fst',
          loading: 'eager_global_ordinals'
        }
      }
    },
  },{
    shingle: {
      path_match: 'shingle.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasShingles',
        fielddata : {
          loading: 'eager_global_ordinals'
        }
      }
    }
  }],
  _source: {
    excludes : ['shape','shingle']
  },
  _all: {
    enabled: false
  },
  dynamic: 'true'
};

module.exports = schema;
