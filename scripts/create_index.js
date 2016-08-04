var config = require('pelias-config').generate();
var es = require('elasticsearch');
var client = new es.Client(config.esclient);
var schema = require('../schema');

var indexName = config.schema.indexName;

client.indices.create( { index: indexName, body: schema }, function( err, res ){
  console.log( '[put mapping]', '\t', indexName, err || '\t', res );
  process.exit( !!err );
});
