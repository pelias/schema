
var schema = {
  'type': 'geo_point',
  'lat_lon': true,
  // 'geohash': true,
  // 'geohash_prefix': true,
  // 'geohash_precision': 20,
  'fielddata' : {
    'format' : 'compressed',
    'precision' : '3m'
  }
}

module.exports = schema;