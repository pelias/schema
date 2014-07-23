
var schema = {
  'settings':           require('./settings'),
  'mappings': {

    // osm
    'osmnode':          require('./mappings/poi'),
    'osmway':           require('./mappings/poi'),
    'osmpoint':         require('./mappings/poi-noop'),

    // geoname
    'geoname':          require('./mappings/poi'),

    // quattroshapes
    'admin0':           require('./mappings/quattroshapes'),
    'admin1':           require('./mappings/quattroshapes'),
    'admin2':           require('./mappings/quattroshapes'),
    'local_admin':      require('./mappings/quattroshapes'),
    'locality':         require('./mappings/quattroshapes'),
    'neighborhood':     require('./mappings/quattroshapes')
  }
}

module.exports = schema;