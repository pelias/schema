
// @ref: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-geo-point-type.html
var schema = {
  'type': 'geo_point',

  /* `lat_lon` enabled since both the geo distance and bounding box filters can either be executed using in memory checks, or using the indexed lat lon values */
  'lat_lon': true,

  // 'geohash': true,
  // 'geohash_prefix': true,
  // 'geohash_precision': 20,

  /* `precision: 3m` option allows us to trade precision for memory. */
  'fielddata' : {
    'format' : 'compressed',
    'precision' : '3m'
  }
}

module.exports = schema;