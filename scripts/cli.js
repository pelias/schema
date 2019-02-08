
var util = require('util');

module.exports.header = function( text ){
  var rule = new Array( text.length + 3 ).join("-");
  console.log( util.format("\n\033[0;33m%s\n %s \n%s\033[0m\n", rule, text, rule ) );
};
