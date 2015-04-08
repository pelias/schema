var poi = require('./mappings/poi');
var boundary = require('./mappings/boundary');

var schema = {
  settings: require('./settings')(),
  mappings: {

    // openstreetmap points-of-interest
    osmnode: poi,
    osmway: poi,

    // geonames
    geoname: poi,

    // addresses
    osmaddress: poi,
    openaddresses: poi,

    // admin boundaries
    admin0: boundary,
    admin1: boundary,
    admin2: boundary,
    local_admin: boundary,
    locality: boundary,
    neighborhood: boundary
  }
};

module.exports = schema;
