const child_process = require('child_process');
const http = require('http');

const config = require('pelias-config').generate();
const logger = require('pelias-logger').get('schema');
const es = require('elasticsearch');

const cli = require('./cli');
const schema = require('../schema');

const client = new es.Client(config.esclient);

// check mandatory plugins are installed before continuing
try {
  child_process.execSync( 'node ' + __dirname + '/check_plugins.js' );
} catch( e ){
  console.error( "please install mandatory plugins before continuing.\n");
  process.exit(1);
}

cli.header("create index");
const indexName = config.schema.indexName;

client.indices.create( { index: indexName, body: schema }, function( err, res ){
  if( err ){
    if( err.message.indexOf('index_already_exists_exception') > -1){
      console.log( '[put mapping]: Index Already Exists', '\t', indexName, '\n' );
      process.exit(0);
    } else {
      console.error( err.message || err, '\n' );
      process.exit(1);
    }
  }
  console.log( '[put mapping]', '\t', indexName, res, '\n' );
  process.exit( !!err );
});
