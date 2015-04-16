
var tape = require('tape');
var common = {};

var tests = [
  require('./compile.js'),
  require('./document.js'),
  require('./partial-suggest.js'),
  require('./partial-centroid.js'),
  require('./partial-admin.js'),
  require('./partial-category.js'),
  require('./partial-hash.js'),
  require('./settings.js'),
  require('./full_schema.js')
];

tests.map(function(t) {
  t.all(tape, common);
});
