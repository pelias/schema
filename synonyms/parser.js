var fs = require('fs');

// https://www.elastic.co/guide/en/elasticsearch/reference/2.4/analysis-synonym-tokenfilter.html

function parser( filename ){

  // path not specified / file does not exist
  try {
    if( !fs.lstatSync(filename).isFile() ){
      throw new Error( 'invalid file' );
    }
  } catch(e){
    throw new Error( 'file not found' );
  }

  // parse solr synonyms format
  return fs.readFileSync( filename, 'utf8' )
                .split('\n')
                .map( line => {
                  return line.trim()                          // trim whitespace
                             .replace( /\s\s+/g, ' ' )        // squash double spaces
                             .replace(/(^,)|(,$)/g, '')       // trim commas
                             .replace(/(\s*,\s*)/g,',')       // trim spaces around commas
                             .replace(/(\s*=>\s*)/g,' => ');  // trim spaces around arrows
                })
                .filter( line => line.length > 0 )            // remove empty lines
                .filter( line => '#' !== line[0] );           // remove comments
}

module.exports = parser;
