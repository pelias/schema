// validate analyzer is behaving as expected

var tape = require('tape'),
  elastictest = require('elastictest'),
  schema = require('../schema'),
  punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function (test, common) {
  test('analyze', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    var assertAnalysis = analyze.bind(null, suite, t, 'peliasIndexStreetOneEdgeGram');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    assertAnalysis('lowercase', 'F', ['f']);
    assertAnalysis('asciifolding', 'á', ['a']);
    assertAnalysis('asciifolding', 'ß', ['s', 'ss']);
    assertAnalysis('asciifolding', 'æ', ['a', 'ae']);
    assertAnalysis('asciifolding', 'ł', ['l']);
    assertAnalysis('asciifolding', 'ɰ', ['m']);
    assertAnalysis('trim', ' f ', ['f']);

    // full_token_address_suffix_expansion
    assertAnalysis('full_token_address_suffix_expansion', 'rd', ['r', 'rd', 'ro', 'roa', 'road']);
    assertAnalysis('full_token_address_suffix_expansion', 'ctr', ['c', 'ct', 'ctr', 'ce', 'cen', 'cent', 'cente', 'center']);

    assertAnalysis('peliasIndexStreetOneEdgeGramFilter', '1 a ab abc abcdefghij', ['1', 'a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef', 'abcdefg', 'abcdefgh', 'abcdefghi', 'abcdefghij']);
    assertAnalysis('removeAllZeroNumericPrefix', '00001', ['1']);

    assertAnalysis('unique', '1 1 1', ['1']);
    assertAnalysis('notnull', ' / / ', []);

    assertAnalysis('no kstem', 'mcdonalds', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald', 'mcdonalds']);
    assertAnalysis('no kstem', 'McDonald\'s', ['m', 'mc', 'mcd', 'mcdo', 'mcdon', 'mcdona', 'mcdonal', 'mcdonald', 'mcdonalds']);
    assertAnalysis('no kstem', 'peoples', ['p', 'pe', 'peo', 'peop', 'peopl', 'people', 'peoples']);

    // remove punctuation (handled by the char_filter)
    assertAnalysis('punctuation', punctuation.all.join(''), ['-', '-&']);

    // ensure that very large grams are created
    assertAnalysis('largeGrams', 'grolmanstrasse', [
      'g', 'gr', 'gro', 'grol', 'grolm', 'grolma', 'grolman', 'grolmans', 'grolmanst',
      'grolmanstr', 'grolmanstra', 'grolmanstras', 'grolmanstrass',
      'grolmanstrasse'
    ]);
    assertAnalysis('largeGrams2', 'Flughafeninformation', ['f', 'fl', 'flu',
      'flug', 'flugh', 'flugha', 'flughaf', 'flughafe', 'flughafen', 'flughafeni',
      'flughafenin', 'flughafeninf', 'flughafeninfo', 'flughafeninfor',
      'flughafeninform', 'flughafeninforma', 'flughafeninformat', 'flughafeninformati',
      'flughafeninformatio', 'flughafeninformation'
    ]);

    suite.run(t.end);
  });
};

// address suffix expansions should only performed in a way that is
// safe for 'partial tokens'.
module.exports.tests.address_suffix_expansions = function (test, common) {
  test('address suffix expansions', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    var assertAnalysis = analyze.bind(null, suite, t, 'peliasIndexStreetOneEdgeGram');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    assertAnalysis('safe expansions', 'aly', [
      'a', 'al', 'aly', 'all', 'alle', 'alley'
    ]);

    assertAnalysis('safe expansions', 'xing', [
      'x', 'xi', 'xin', 'xing', 'c', 'cr', 'cro', 'cros', 'cross', 'crossi', 'crossin', 'crossing'
    ]);

    assertAnalysis('safe expansions', 'rd', [
      'r', 'rd', 'ro', 'roa', 'road'
    ]);

    assertAnalysis('unsafe expansion', 'ct st', [
      'c', 'ct', 'co', 'cou', 'cour', 'court', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run(t.end);
  });
};

// stop words should be disabled so that the entire street prefix is indexed as ngrams
module.exports.tests.stop_words = function (test, common) {
  test('stop words', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    var assertAnalysis = analyze.bind(null, suite, t, 'peliasIndexStreetOneEdgeGram');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    assertAnalysis('street suffix', 'AB street', [
      'a', 'ab', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    assertAnalysis('street suffix (abbreviation)', 'AB st', [
      'a', 'ab', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run(t.end);
  });
};

module.exports.tests.street = function (test, common) {
  test('street', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    var assertAnalysis = analyze.bind(null, suite, t, 'peliasIndexStreetOneEdgeGram');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    assertAnalysis('street', 'mapzen place', [
      'm', 'ma', 'map', 'mapz', 'mapze', 'mapzen', 'p', 'pl', 'pla', 'plac', 'place'
    ]);

    assertAnalysis('street', 'w 26 st', [
      'w', 'we', 'wes', 'west', '26', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    assertAnalysis('street', '83 st', [
      '83', 's', 'st', 'str', 'stre', 'stree', 'street'
    ]);

    suite.run(t.end);
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function (test, common) {
  test('normalization', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, { schema: schema });
    var assertAnalysis = analyze.bind(null, suite, t, 'peliasIndexStreetOneEdgeGram');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry"

    assertAnalysis('composed', composed, ['c', 'ch', 'cha', 'cham', 'chamb', 'chambe', 'chamber', 'chambery']);
    assertAnalysis('decomposed', decomposed, ['c', 'ch', 'cha', 'cham', 'chamb', 'chambe', 'chamber', 'chambery']);

    // Één (both forms appear the same)
    var composed = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    var decomposed = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n"

    assertAnalysis('composed', composed, ['e', 'ee', 'een']);
    assertAnalysis('decomposed', decomposed, ['e', 'ee', 'een']);

    suite.run(t.end);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasIndexStreetOneEdgeGram: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};

function analyze(suite, t, analyzer, comment, text, expected) {
  suite.assert(function (done) {
    suite.client.indices.analyze({
      index: suite.props.index,
      analyzer: analyzer,
      text: text
    }, function (err, res) {
      if (err) console.error(err);
      t.deepEqual(simpleTokens(res.tokens), expected, comment);
      done();
    });
  });
}

function simpleTokens(tokens) {
  return tokens.map(function (t) {
    return t.token;
  });
}
