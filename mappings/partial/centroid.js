module.exports = function(settings) {

// @ref: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-geo-point-type.html
var schema = {
  'type': 'geo_point',

  /* `lat_lon` enabled since both the geo distance and bounding box filters can either be executed using in memory checks, or using the indexed lat lon values */
  'lat_lon': true,

  /* store geohashes (with prefixes) in order to facilitate the geohash_cell filter */
  'geohash': true,
  'geohash_prefix': true,
  'geohash_precision': 18
};

return schema;

};
