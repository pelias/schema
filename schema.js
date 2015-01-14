
var schema = {
  'settings':           require('./settings')(),
  'mappings': {

    // openstreetmap points-of-interest
    'osmnode':          require('./mappings/poi'),
    'osmway':           require('./mappings/poi'),

    // geonames
    'geoname':          require('./mappings/poi'),

    // addresses
    'osmaddress':       require('./mappings/poi'),
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