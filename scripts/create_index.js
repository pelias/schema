var config = require('pelias-config').generate();
var es = require('elasticsearch');
var child_process = require('child_process');
var client = new es.Client(config.esclient);
var cli = require('./cli');
var schema = require('../schema');

// check mandatory plugins are installed before continuing
// ES service always has icu plugin enabled
//try {
  //child_process.execSync( 'node ./scripts/check_plugins.js' );
//} catch( e ){
  //console.error( "please install mandatory plugins before continuing.\n");
  //process.exit(1);
//}

cli.header("create index");
var indexName = config.schema.indexName;

client.indices.create( { index: indexName, body: schema }, function( err, res ){
  if( err ){
    console.error( err.message || err, '\n' );
    process.exit(1);
  }
  console.log( '[put mapping]', '\t', indexName, res, '\n' );
  process.exit( !!err );
});
