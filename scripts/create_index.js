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

if (http.maxHeaderSize === undefined) {
  logger.warning('You are using a version of Node.js that does not support the --max-http-header-size option.' +
    'You may experience issues when using Elasticsearch 5.' +
    'See https://github.com/pelias/schema#compatibility for more details.');
}

if (http.maxHeaderSize < 16384) {
  logger.error('Max header size is below 16384 bytes. ' +
    'Be sure to use the provided wrapper script in \'./bin\' rather than calling this script directly.' +
    'Otherwise, you may experience issues when using Elasticsearch 5.' +
    'See https://github.com/pelias/schema#compatibility for more details.');
  process.exit(1);
}

cli.header("create index");
const indexName = config.schema.indexName;

client.indices.create( { index: indexName, body: schema }, function( err, res ){
  if( err ){
    console.error( err.message || err, '\n' );
    process.exit(1);
  }
  console.log( '[put mapping]', '\t', indexName, res, '\n' );
  process.exit( !!err );
});
