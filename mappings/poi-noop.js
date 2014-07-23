
var merge = require('merge');

var schema = {
  'properties': {
    'name':             merge( {}, require('./partial/hash'), { 'index': 'no' } ),
    'address':          merge( {}, require('./partial/hash'), { 'index': 'no' } ),
    'type':             merge( {}, require('./partial/admin'), { 'store': 'no', 'index': 'no' } ),
    'admin0':           merge( {}, require('./partial/admin'), { 'index': 'no' } ),
    'admin1':           merge( {}, require('./partial/admin'), { 'index': 'no' } ),
    'admin2':           merge( {}, require('./partial/admin'), { 'index': 'no' } ),
    'center_point':     { 'type': 'geo_point', 'index': 'no' },
    'tags':             merge( {}, require('./partial/hash'), { 'index': 'no' } )
  }
}

module.exports = schema;