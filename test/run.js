
var tape = require('tape');
var common = {};

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
