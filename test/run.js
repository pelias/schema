var tape = require('tape'),
    diff = require('difflet')({ indent : 2, comment : true });

var common = {
  // a visual deep diff rendered using console.error()
  diff: function( actual, expected ){
    console.error( diff.compare( actual, expected ) );
  }
};

var tests = [
  require('./compile.js'),
  require('./document.js'),
  require('./partial-centroid.js'),
  require('./partial-admin.js'),
  require('./partial-keyword.js'),
  require('./partial-hash.js'),
  require('./settings.js'),
  require('./configValidation.js'),
  require('./synonyms/parser.js'),
];

tests.map(function(t) {
  t.all(tape, common);
});
