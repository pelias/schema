var schema = require( '../schema' );
var path = require( 'path' );
var fs = require( 'fs' );
var keypress = require( 'keypress' );

keypress( process.stdin );

console.log(
  'Are you SURE you want to update the schema fixture file? You must be ' +
  'ABSOLUTELY sure the new schema is good to go. Enter `y` to continue.'
);
process.stdin.once( 'keypress', function ( key ){
  if( key === 'y' ){
    var fixturePath = path.join( __dirname, 'fixtures/full_schema.json' );
    fs.writeFileSync( fixturePath, JSON.stringify( schema ) );
    console.log( 'Schema fixture overwritten.' );
  }
  else {
    console.log( 'Canceling.' );
  }
  process.stdin.pause();
});

process.stdin.setRawMode(true);
process.stdin.resume();
