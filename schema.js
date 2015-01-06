
var schema = {
  'settings':           require('./settings')(),
  'mappings': {

    // osm
    'osmnode':          require('./mappings/poi'),
    'osmway':           require('./mappings/poi'),

    // geoname
    'geoname':          require('./mappings/poi'),

    // addresses
    'openaddresses':    require('./mappings/poi'),

    // admin boundaries
    'admin0':           require('./mappings/boundary'),
    'admin1':           require('./mappings/boundary'),
    'admin2':           require('./mappings/boundary'),
    'local_admin':      require('./mappings/boundary'),
    'locality':         require('./mappings/boundary'),
    'neighborhood':     require('./mappings/boundary')
  }
};

module.exports = schema;