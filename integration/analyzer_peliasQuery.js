// validate analyzer is behaving as expected
const elastictest = require('elastictest')
const punctuation = require('../punctuation')

module.exports.tests = {}

module.exports.tests.analyze = function (test, common) {
  test('analyze', function (t) {
    var suite = new elastictest.Suite(common.clientOpts, common.create)
    var assertAnalysis = common.analyze.bind(null, suite, t, 'peliasQuery')
    suite.action(function (done) { setTimeout(done, 500) }) // wait for es to bring some shards up

    assertAnalysis('asciifolding', 'é', ['e'])
    assertAnalysis('asciifolding', 'ß', ['ss'])
    assertAnalysis('asciifolding', 'æ', ['ae'])
    assertAnalysis('asciifolding', 'ł', ['l'])
    assertAnalysis('asciifolding', 'ɰ', ['m'])
    assertAnalysis('lowercase', 'F', ['f'])
    assertAnalysis('trim', ' f ', ['f'])
    assertAnalysis('remove_ordinals', '26t', ['26'])
    assertAnalysis('remove_ordinals', '26th', ['26'])
    assertAnalysis('removeAllZeroNumericPrefix', '00001', ['1'])
    assertAnalysis('unique', '1 1 1', ['1', '1', '1'])
    assertAnalysis('notnull', ' / / ', [])

    // no stemming is applied
    assertAnalysis('no kstem', 'mcdonalds', ['mcdonalds'])
    assertAnalysis('no kstem', 'McDonald\'s', ['mcdonalds'])
    assertAnalysis('no kstem', 'peoples', ['peoples'])

    // remove punctuation (handled by the char_filter)
    assertAnalysis('punctuation', punctuation.all.join(''), ['&'])

    suite.run(t.end)
  })
}

module.exports.tests.functional = function (test, common) {
  test('functional', function (t) {
    var suite = new elastictest.Suite(common.clientOpts, common.create)
    var assertAnalysis = common.analyze.bind(null, suite, t, 'peliasQuery')
    suite.action(function (done) { setTimeout(done, 500) }) // wait for es to bring some shards up

    assertAnalysis('country', 'Trinidad and Tobago', [ 'trinidad', 'and', 'tobago' ])
    assertAnalysis('place', 'Toys "R" Us!', [ 'toys', 'r', 'us' ])
    assertAnalysis('address', '101 mapzen place', [ '101', 'mapzen', 'place' ])

    suite.run(t.end)
  })
}

module.exports.tests.address = function (test, common) {
  test('address', function (t) {
    var suite = new elastictest.Suite(common.clientOpts, common.create)
    var assertAnalysis = common.analyze.bind(null, suite, t, 'peliasQuery')
    suite.action(function (done) { setTimeout(done, 500) }) // wait for es to bring some shards up

    assertAnalysis('address', '101 mapzen place', [
      '101', 'mapzen', 'place'
    ])

    assertAnalysis('address', '30 w 26 st', [
      '30', 'w', '26', 'st'
    ])

    assertAnalysis('address', '4B 921 83 st', [
      '4b', '921', '83', 'st'
    ])

    suite.run(t.end)
  })
}

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function (test, common) {
  test('normalization', function (t) {
    var suite = new elastictest.Suite(common.clientOpts, common.create)
    var assertAnalysis = common.analyze.bind(null, suite, t, 'peliasQuery')
    suite.action(function (done) { setTimeout(done, 500) }) // wait for es to bring some shards up

    const latinLargeLetterEWithAcute = String.fromCodePoint(0x00C9)
    const latinSmallLetterEWithAcute = String.fromCodePoint(0x00E9)
    const combiningAcuteAccent = String.fromCodePoint(0x0301)
    const latinLargeLetterE = String.fromCodePoint(0x0045)
    const latinSmallLetterE = String.fromCodePoint(0x0065)

    // Chambéry (both forms appear the same)
    let composed = 'Chamb' + latinSmallLetterEWithAcute + 'ry'
    let decomposed = 'Chamb' + combiningAcuteAccent + latinSmallLetterE + 'ry'

    assertAnalysis('composed', composed, ['chambery'])
    assertAnalysis('decomposed', decomposed, ['chambery'])

    // Één (both forms appear the same)
    composed = latinLargeLetterEWithAcute + latinSmallLetterEWithAcute + 'n'
    decomposed = combiningAcuteAccent + latinLargeLetterE + combiningAcuteAccent + latinSmallLetterE + 'n'

    assertAnalysis('composed', composed, ['een'])
    assertAnalysis('decomposed', decomposed, ['een'])

    suite.run(t.end)
  })
}

module.exports.all = function (tape, common) {
  function test (name, testFunction) {
    return tape('peliasQuery: ' + name, testFunction)
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common)
  }
}
