const admin = require('./partial/admin');
const postalcode = require('./partial/postalcode');
const hash = require('./partial/hash');
const multiplier = require('./partial/multiplier');
const keyword = require('./partial/keyword');
const keyword_with_doc_values = require('./partial/keyword_with_doc_values');

var schema = {
  properties: {

    // data partitioning
    source: keyword_with_doc_values,
    layer: keyword_with_doc_values,

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
          type: 'text',
          analyzer: 'keyword',
          search_analyzer: 'keyword',
          similarity: 'peliasDefaultSimilarity'
        },
        unit: {
          type: 'text',
          analyzer: 'peliasUnit',
          search_analyzer: 'peliasUnit',
          similarity: 'peliasDefaultSimilarity'
        },
        number: {
          type: 'text',
          analyzer: 'peliasHousenumber',
          search_analyzer: 'peliasHousenumber',
          similarity: 'peliasDefaultSimilarity'
        },
        street: {
          type: 'text',
          analyzer: 'peliasStreet',
          search_analyzer: 'peliasStreet',
          similarity: 'peliasDefaultSimilarity'
        },
        cross_street: {
          type: 'text',
          analyzer: 'peliasStreet',
          search_analyzer: 'peliasStreet',
          similarity: 'peliasDefaultSimilarity'
        },
        zip: {
          type: 'text',
          analyzer: 'peliasZip',
          search_analyzer: 'peliasZip',
          similarity: 'peliasDefaultSimilarity'
        },
      }
    },

    // hierarchy
    parent: {
      type: 'object',
      dynamic: 'strict',
      properties: {
        // https://github.com/whosonfirst/whosonfirst-placetypes#continent
        continent: admin,
        continent_a: admin,
        continent_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#ocean
        ocean: admin,
        ocean_a: admin,
        ocean_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#empire
        empire: admin,
        empire_a: admin,
        empire_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#country
        country: admin,
        country_a: admin,
        country_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#dependency
        dependency: admin,
        dependency_a: admin,
        dependency_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#marinearea
        marinearea: admin,
        marinearea_a: admin,
        marinearea_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macroregion
        macroregion: admin,
        macroregion_a: admin,
        macroregion_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#region
        region: admin,
        region_a: admin,
        region_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#macrocounty
        macrocounty: admin,
        macrocounty_a: admin,
        macrocounty_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#county
        county: admin,
        county_a: admin,
        county_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#locality
        locality: admin,
        locality_a: admin,
        locality_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#borough
        borough: admin,
        borough_a: admin,
        borough_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#localadmin
        localadmin: admin,
        localadmin_a: admin,
        localadmin_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#neighbourhood
        neighbourhood: admin,
        neighbourhood_a: admin,
        neighbourhood_id: keyword,

        // https://github.com/whosonfirst/whosonfirst-placetypes#postalcode
        postalcode: postalcode,
        postalcode_a: postalcode,
        postalcode_id: keyword
      }
    },

    // geography
    center_point: require('./partial/centroid'),
    shape: require('./partial/shape'),
    bounding_box: require('./partial/boundingbox'),

    // meta info
    source_id: keyword,
    category: keyword,
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
        type: 'text',
        analyzer: 'peliasIndexOneEdgeGram',
        search_analyzer: 'peliasQuery',
        similarity: 'peliasDefaultSimilarity'
      }
    },
  },{
    phrase: {
      path_match: 'phrase.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'text',
        analyzer: 'peliasPhrase',
        search_analyzer: 'peliasQuery',
        similarity: 'peliasDefaultSimilarity'
      }
    }
  },{
    addendum: {
      path_match: 'addendum.*',
      match_mapping_type: 'string',
      mapping: {
        type: 'keyword',
        index: false,
        doc_values: false
      }
    }
  }],
  _source: {
    excludes : ['shape','phrase']
  },
  dynamic: 'strict'
};

module.exports = schema;
