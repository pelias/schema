var tape = require('tape'),
    diff = require('difflet')({ indent : 2, comment : true });

var common = {
  // a visual deep diff rendered using console.error()
  diff: function( actual, expected ){
    console.error( diff.compare( actual, expected ) );
  }
};

var tests = [
  require('./version/2.4/compile.js'),
  require('./version/2.4/document.js'),
  require('./version/2.4/partial-centroid.js'),
  require('./version/2.4/partial-admin.js'),
  require('./version/2.4/partial-literal.js'),
  require('./version/2.4/partial-hash.js'),
  require('./version/2.4/settings.js'),
  require('./configValidation.js'),
  require('./synonyms/parser.js'),
];

tests.map(function(t) {
  t.all(tape, common);
});
