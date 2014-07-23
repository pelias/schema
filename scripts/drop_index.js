
var readline = require('readline'),
    rl = readline.createInterface({ input: process.stdin, output: process.stdout }),
    client = require('pelias-esclient')(),
    schema = require('../schema');

rl.question( 'Are you sure you want to drop the pelias index and delete ALL records? ', function( answer ){
  if( !answer.match(/^y(es)?$/i) ){
    console.log( 'you must answer \'y\' to confirm. aborting.' )
    process.exit(0);
  }
  client.indices.delete( { index: 'pelias' }, function( err, res ){
    console.log( '\n[delete mapping]', '\t', 'pelias', err || '\t', res );
    process.exit( !!err );
  });
});