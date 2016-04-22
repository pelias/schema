
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
  require('./partial-literal.js'),
  require('./partial-hash.js'),
  require('./settings.js')
];

tests.map(function(t) {
  t.all(tape, common);
});
