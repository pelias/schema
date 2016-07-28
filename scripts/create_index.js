var es = require('elasticsearch');
var client = new es.Client();
var schema = require('../schema');

client.indices.create( { index: 'pelias', body: schema }, function( err, res ){
  console.log( '[put mapping]', '\t', 'pelias', err || '\t', res );
  process.exit( !!err );
});
