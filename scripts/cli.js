/* eslint no-octal-escape: "error" */
const util = require('util')
const colors = require('colors/safe')

module.exports.header = function (text) {
  var rule = new Array(text.length + 3).join('-')
  console.log(util.format('\n\x1b[0;33m%s\n %s \n%s\x1b[0m\n', rule, text, rule))
}

module.exports.status = {
  success: colors.green('✔'),
  failure: colors.red('✖')
}
