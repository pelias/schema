
var tape = require('tape');
var common = {};

var tests = [
  require('./validate.js'),
  require('./dynamic_templates.js'),
  require('./analyzer_peliasOneEdgeGram.js'),
  require('./analyzer_peliasTwoEdgeGram.js'),
  require('./analyzer_peliasPhrase.js'),
  require('./analyzer_peliasSimple.js')
];

tests.map(function(t) {
  t.all(tape, common);
});
