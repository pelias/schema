module.exports = function(config) {

var admin = require('./partial/admin');
var hash = require('./partial/hash');
var multiplier = require('./partial/multiplier');
var literal = require('./partial/literal');

return {
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
    address_parts: {
      type: 'object',
      dynamic: true,
      properties: {
        name: {
          type: 'string',
          analyzer: 'keyword',
        },
        number: {
          type: 'string',
          analyzer: 'peliasHousenumber',
        },
        street: {
          type: 'string',
          analyzer: 'peliasStreet',
        },
        zip: {
          type: 'string',
          analyzer: 'peliasZip',
        }
      }
    },

    // hierarchy
    parent: {
      type: 'object',
      dynamic: true,
      properties: {

        // https://github.com/whosonfirst/whosonfirst-placetypes#country
        country: admin,
        country_a: admin,
        country_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#dependency
        dependency: admin,
        dependency_a: admin,
        dependency_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macroregion
        macroregion: admin,
        macroregion_a: admin,
        macroregion_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#region
        region: admin,
        region_a: admin,
        region_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macrocounty
        macrocounty: admin,
        macrocounty_a: admin,
        macrocounty_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#county
        county: admin,
        county_a: admin,
        county_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#locality
        locality: admin,
        locality_a: admin,
        locality_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#borough
        borough: admin,
        borough_a: admin,
        borough_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#localadmin
        localadmin: admin,
        localadmin_a: admin,
        localadmin_id: literal,

        // https://github.com/whosonfirst/whosonfirst-placetypes#neighbourhood
        neighbourhood: admin,
        neighbourhood_a: admin,
        neighbourhood_id: literal
      }
    },

    // geography
    center_point: require('./partial/centroid')(config),
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
        analyzer: 'peliasIndexOneEdgeGram',
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

};
