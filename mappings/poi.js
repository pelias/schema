
var merge = require('merge');

var schema = {
  'properties': {
    'name':             require('./partial/hash'),
    'address':          merge( {}, require('./partial/hash'), { 'index': 'no' } ),
    'type':             merge( {}, require('./partial/admin'), { 'store': 'no' } ),
    'admin0':           require('./partial/admin'),
    'admin1':           require('./partial/admin'),
    'admin2':           require('./partial/admin'),
    'center_point':     require('./partial/centroid'),
    'suggest':          require('./partial/suggest'),
    'tags':             merge( {}, require('./partial/hash'), { 'index': 'no' } )
  }
}

module.exports = schema;