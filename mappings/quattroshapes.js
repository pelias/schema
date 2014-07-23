
var schema = {
  'properties': {
    'gn_id':            require('./partial/foreignkey'),
    'woe_id':           require('./partial/foreignkey'),
    'boundaries':       require('./partial/shape'),
    'center_point':     require('./partial/centroid'),
    'suggest':          require('./partial/suggest')
  }
}

module.exports = schema;