
var client = require('pelias-esclient')(),
    schema = require('../schema');

var _index = ( process.argv.length > 3 ) ? process.argv[3] : 'pelias';
var _type = ( process.argv.length > 2 ) ? process.argv[2] : null; // get type from cli args

if( !_type ){
  console.log( JSON.stringify( schema, null, 2 ) );
  process.exit(0);
}

var mapping = schema.mappings[_type];
if( !mapping ){
  console.error( 'could not find a mapping in the schema file for', _index+'/'+_type );
  process.exit(1);
}

console.log( JSON.stringify( mapping, null, 2 ) );
