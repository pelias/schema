module.exports = function(config) {

var es_version = config && config.esclient && config.esclient.apiVersion;

// @ref: http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/mapping-geo-point-type.html
var schema = { 'type': 'geo_point' };

// The enclosed options are required for es versions earlier than 5.x
// Using `!es_version || ` because right now recommended version is 2.3
// HACK: I want to use semver but check the following link:
//       https://github.com/mojombo/semver/issues/237
// This lexicographical ordering should be fine until major version 10
if(!es_version || es_version < '5.0') {
  /* `lat_lon` enabled since both the geo distance and bounding box filters can either be executed using in memory checks, or using the indexed lat lon values */
  schema['lat_lon'] = true;

  /* store geohashes (with prefixes) in order to facilitate the geohash_cell filter */
  schema['geohash'] = true;
  schema['geohash_prefix'] = true;
  schema['geohash_precision'] = 18;
}

return schema;

};
