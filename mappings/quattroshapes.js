
var schema = {
  'properties': {
    'name':             require('./partial/hash'),
    'admin0':           require('./partial/admin'),
    'admin1':           require('./partial/admin'),
    'admin2':           require('./partial/admin'),
    'gn_id':            require('./partial/foreignkey'),
    'woe_id':           require('./partial/foreignkey'),
    'boundaries':       require('./partial/shape'),
    'center_point':     require('./partial/centroid'),
    'suggest':          require('./partial/suggest')
  },
  '_source' : {
    'excludes' : ['boundaries']
  },
  '_all': {
    'enabled':          false
  },
  'dynamic':            'strict'
};

module.exports = schema;