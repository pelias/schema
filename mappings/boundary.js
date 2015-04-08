var admin = require('./partial/admin');
var foreignkey = require('./partial/foreignkey');

var schema = {
  'properties': {
    'name': require('./partial/hash'),
    'alpha3': admin,
    'admin0': admin,
    'admin1': admin,
    'admin1_abbr': admin,
    'admin2': admin,
    'gn_id': foreignkey,
    'woe_id': foreignkey,
    'boundaries': require('./partial/shape'),
    'center_point': require('./partial/centroid'),
    'category': require('./partial/category'),
    'suggest': require('./partial/suggest')
  },
  '_source' : {
    'excludes' : ['boundaries']
  },
  '_all': {
    'enabled': false
  },
  'dynamic': 'strict'
};

module.exports = schema;
