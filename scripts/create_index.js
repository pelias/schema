
var client = require('pelias-esclient')(),
    schema = require('../schema');

client.indices.create( { index: 'pelias_ngram', body: schema }, function( err, res ){
  console.log( '[put mapping]', '\t', 'pelias', err || '\t', res );
  process.exit( !!err );
});