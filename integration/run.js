
var tape = require('tape');
var common = {};

var tests = [
  require('./analyzer_peliasAutocompleteQuery.js'),
  // require('./validate.js'),
  // require('./dynamic_templates.js'),
  // require('./analyzer_peliasOneEdgeGram.js'),
  // require('./analyzer_peliasTwoEdgeGram.js'),
  // require('./analyzer_peliasPhrase.js'),
  // require('./analyzer_peliasAdmin.js'),
  // require('./analyzer_peliasHousenumber.js'),
  // require('./analyzer_peliasZip.js'),
  // require('./analyzer_peliasStreet.js'),
  // require('./address_matching.js'),
  // require('./source_layer_sourceid_filtering.js'),
  // require('./bounding_box.js')
];

tests.map(function(t) {
  t.all(tape, common);
});
