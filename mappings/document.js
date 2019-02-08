const admin = require('./partial/admin');
const admin_ngram = require('./partial/admin_ngram');
const postalcode = require('./partial/postalcode');
const hash = require('./partial/hash');
const multiplier = require('./partial/multiplier');
const literal = require('./partial/literal');
const literal_with_doc_values = require('./partial/literal_with_doc_values');
const config = require('pelias-config').generate();
const merge = require('lodash.merge');

var schema = {
  properties: {

    // data partitioning
    source: literal_with_doc_values,
    layer: literal_with_doc_values,

    // place name (ngram analysis)
    name: hash,

    // place name (phrase analysis)
    phrase: hash,

    // address data
    address_parts: {
      type: 'object',
      dynamic: 'strict',
      properties: {
        name: {
          type: 'string',
          analyzer: 'keyword',
        },
        unit: {
          type: 'string',
          analyzer: 'peliasUnit',
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
      dynamic: 'strict',
      properties: {
        // https://github.com/whosonfirst/whosonfirst-placetypes#continent
        continent: merge({ copy_to: 'parent.continent_ngram' }, admin),
        continent_a: merge({ copy_to: 'parent.continent_ngram' }, admin),
        continent_id: literal,
        continent_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#ocean
        ocean: merge({ copy_to: 'parent.ocean_ngram' }, admin),
        ocean_a: merge({ copy_to: 'parent.ocean_ngram' }, admin),
        ocean_id: literal,
        ocean_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#empire
        empire: merge({ copy_to: 'parent.empire_ngram' }, admin),
        empire_a: merge({ copy_to: 'parent.empire_ngram' }, admin),
        empire_id: literal,
        empire_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#country
        country: merge({ copy_to: 'parent.country_ngram' }, admin),
        country_a: merge({ copy_to: 'parent.country_ngram' }, admin),
        country_id: literal,
        country_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#dependency
        dependency: merge({ copy_to: 'parent.dependency_ngram' }, admin),
        dependency_a: merge({ copy_to: 'parent.dependency_ngram' }, admin),
        dependency_id: literal,
        dependency_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#marinearea
        marinearea: merge({ copy_to: 'parent.marinearea_ngram' }, admin),
        marinearea_a: merge({ copy_to: 'parent.marinearea_ngram' }, admin),
        marinearea_id: literal,
        marinearea_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macroregion
        macroregion: merge({ copy_to: 'parent.macroregion_ngram' }, admin),
        macroregion_a: merge({ copy_to: 'parent.macroregion_ngram' }, admin),
        macroregion_id: literal,
        macroregion_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#region
        region: merge({ copy_to: 'parent.region_ngram' }, admin),
        region_a: merge({ copy_to: 'parent.region_ngram' }, admin),
        region_id: literal,
        region_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macrocounty
        macrocounty: merge({ copy_to: 'parent.macrocounty_ngram' }, admin),
        macrocounty_a: merge({ copy_to: 'parent.macrocounty_ngram' }, admin),
        macrocounty_id: literal,
        macrocounty_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#county
        county: merge({ copy_to: 'parent.county_ngram' }, admin),
        county_a: merge({ copy_to: 'parent.county_ngram' }, admin),
        county_id: literal,
        county_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#locality
        locality: merge({ copy_to: 'parent.locality_ngram' }, admin),
        locality_a: merge({ copy_to: 'parent.locality_ngram' }, admin),
        locality_id: literal,
        locality_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#borough
        borough: merge({ copy_to: 'parent.borough_ngram' }, admin),
        borough_a: merge({ copy_to: 'parent.borough_ngram' }, admin),
        borough_id: literal,
        borough_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#localadmin
        localadmin: merge({ copy_to: 'parent.localadmin_ngram' }, admin),
        localadmin_a: merge({ copy_to: 'parent.localadmin_ngram' }, admin),
        localadmin_id: literal,
        localadmin_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#neighbourhood
        neighbourhood: merge({ copy_to: 'parent.neighbourhood_ngram' }, admin),
        neighbourhood_a: merge({ copy_to: 'parent.neighbourhood_ngram' }, admin),
        neighbourhood_id: literal,
        neighbourhood_ngram: admin_ngram,

        // https://github.com/whosonfirst/whosonfirst-placetypes#postalcode
        postalcode: merge({ copy_to: 'parent.postalcode_ngram' }, postalcode),
        postalcode_a: merge({ copy_to: 'parent.postalcode_ngram' }, postalcode),
        postalcode_id: literal,
        postalcode_ngram: admin_ngram
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
    popularity: multiplier,

    // addendum (non-indexed supplimentary data)
    addendum: hash
  },
  dynamic_templates: [{
    nameGram: {
      path_match: 'name.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        analyzer: 'peliasIndexOneEdgeGram',
        fielddata : {
          format: 'disabled'
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
          format: 'disabled'
        }
      }
    }
  },{
    addendum: {
      path_match: 'addendum.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'string',
        index: 'no',
        doc_values: false,
        fielddata : {
          format: 'disabled'
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
  dynamic: 'strict'
};

module.exports = schema;
