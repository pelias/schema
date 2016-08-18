var config = require('pelias-config').generate();
var es = require('elasticsearch');
var client = new es.Client(config.esclient);
var schema = require('../schema');

var _index = ( process.argv.length > 3 ) ? process.argv[3] : config.schema.indexName;
var _type = ( process.argv.length > 2 ) ? process.argv[2] : null; // get type from cli args

// print out mapping for just one type
if ( _type ) {
  var mapping = schema.mappings[_type];
  if( !mapping ){
    console.error( 'could not find a mapping in the schema file for', _index+'/'+_type );
    process.exit(1);
  }
  console.log( JSON.stringify( mapping, null, 2 ) );
//print out the entire schema mapping
} else {
  console.log( JSON.stringify( schema, null, 2 ) );
}

