var merge = require('merge');
var admin = require('./partial/admin');
var hash = require('./partial/hash');
var multiplier = require('./partial/multiplier');

var schema = {
  properties: {
    name: hash,
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
    boundaries: require('./partial/shape'),
    category: require('./partial/category'),
    population: multiplier,
    popularity: multiplier,
    suggest: require('./partial/suggest')
  },
  _source : {
    excludes : ['boundaries']
  },
  _all: {
    enabled: false
  },
  dynamic: 'strict'
};

module.exports = schema;
