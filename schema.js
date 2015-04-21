var doc = require('./mappings/document');

var schema = {
  settings: require('./settings')(),
  mappings: {

    // openstreetmap points-of-interest
    osmnode: doc,
    osmway: doc,

    // geonames
    geoname: doc,

    // addresses
    osmaddress: doc,
    openaddresses: doc,

    // admin boundaries
    admin0: doc,
    admin1: doc,
    admin2: doc,
    local_admin: doc,
    locality: doc,
    neighborhood: doc
  }
};

module.exports = schema;
