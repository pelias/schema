var colors = require('colors/safe');
var config = require('pelias-config').generate();
var readline = require('readline'),
    rl = readline.createInterface({ input: process.stdin, output: process.stdout }),
    client = require('pelias-esclient')(),
    schema = require('../schema');

// use -f or --force-yes to skip the prompt
if( isForced() ) drop();
else prompt( drop, fail );

function drop(){
  client.indices.delete( { index: 'pelias' }, function( err, res ){
    console.log( '\n[delete mapping]', '\t', 'pelias', err || '\t', res );
    process.exit( !!err );
  });
}

function warnIfNotLocal() {
  if(config.esclient.hosts[0].host !== "localhost") {
    console.log(colors.red("WARNING: DROPPING SCHEMA NOT ON LOCALHOST"));
  }
}

function prompt( yes, no ){
  warnIfNotLocal();
  rl.question( 'Are you sure you want to drop the pelias index and delete ALL records? ', function( answer ){
    if( !answer.match(/^y(es)?$/i) ) return no();
    return yes();
  });
}

function fail(){
  console.log( 'you must answer \'y\' to confirm. aborting.' );
  process.exit(0);
}

function isForced(){
  return process.argv.length > 2 && [ '--force-yes', '-f' ].indexOf( process.argv[2] ) > -1;
}
