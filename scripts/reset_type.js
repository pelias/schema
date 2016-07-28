var config = require('pelias-config').generate().esclient;
var es = require('elasticsearch');
var client = new es.Client(config);
var schema = require('../schema');

var _index = ( process.argv.length > 3 ) ? process.argv[3] : config.schema.indexName;
var _type = ( process.argv.length > 2 ) ? process.argv[2] : null; // get type from cli args

if( !_type ){
  console.error( 'you must provide the target es \'type\' as the first cli argument' );
  process.exit(1);
}

var mapping = schema.mappings[_type];
if( !mapping ){
  console.error( 'could not find a mapping in the schema file for', _index+'/'+_type );
  process.exit(1);
}

client.indices.deleteMapping( { index: _index, type: _type }, function( err, res ){
  console.log( '[delete mapping]', '\t', _index+'/'+_type, err || '\t', res );
  client.indices.putMapping( { index: _index, type: _type, body:mapping }, function( err, res ){
    console.log( '[put mapping]', '\t\t', _index+'/'+_type, err || '\t', res );
    process.exit( !!err );
  });
});
