
var merge = require('merge');

var schema = {
  'properties': {
    'name':             require('./partial/hash'),
    'address':          merge( {}, require('./partial/hash'), { 'index': 'no' } ),
    'type':             merge( {}, require('./partial/admin'), { 'store': 'no' } ),
    'alpha3':           require('./partial/admin'),
    'admin0':           require('./partial/admin'),
    'admin1':           require('./partial/admin'),
    'admin1_abbr':      require('./partial/admin'),
    'admin2':           require('./partial/admin'),
    'local_admin':      require('./partial/admin'),
    'locality':         require('./partial/admin'),
    'neighborhood':     require('./partial/admin'),
    'center_point':     require('./partial/centroid'),
    'population':       require('./partial/multiplier'),
    'suggest':          require('./partial/suggest')
  },
  '_all': {
    'enabled':          false
  },
  'dynamic':            'strict'
};

module.exports = schema;