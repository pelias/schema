// validate analyzer is behaving as expected

var tape = require('tape'),
    Suite = require('../test/elastictest/Suite'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQuery' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis('asciifolding', 'é', ['e']);
    assertAnalysis('asciifolding', 'ß', ['ss']);
    assertAnalysis('asciifolding', 'æ', ['ae']);
    assertAnalysis('asciifolding', 'ł', ['l']);
    assertAnalysis('asciifolding', 'ɰ', ['m']);
    assertAnalysis('lowercase', 'F', ['f']);
    assertAnalysis('trim', ' f ', ['f']);
    assertAnalysis('remove_ordinals', '26t', ['26']);
    assertAnalysis('remove_ordinals', '26th', ['26']);
    assertAnalysis('removeAllZeroNumericPrefix', '00001', ['1']);
    assertAnalysis('unique', '1 1 1', ['1','1','1']);
    assertAnalysis('notnull', ' / / ', []);

    // no stemming is applied
    assertAnalysis('no kstem', 'mcdonalds', ['mcdonalds']);
    assertAnalysis('no kstem', 'McDonald\'s', ['mcdonalds']);
    assertAnalysis('no kstem', 'peoples', ['peoples']);

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), ['&'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQuery' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [ 'trinidad', 'and', 'tobago' ]);
    assertAnalysis( 'place', 'Toys "R" Us!', [ 'toys', 'r', 'us' ]);
    assertAnalysis( 'address', '101 mapzen place', [ '101', 'mapzen', 'place' ]);

     // complicated tokenization for some Asian languages
     assertAnalysis('thai_address1', 'ซอยเพชรบุรี๑', ['ซอย', 'เพชรบุรี1'] );
     assertAnalysis('thai_address2', 'ซอยเพชรบุรี๑foo', ['ซอย', 'เพชรบุรี1', 'foo'] );
     assertAnalysis('thai_address3', 'บ้านเลขที่๑๒๓ถนนสุขุมวิทแขวงคลองตันเหนือเขตวัฒนา กรุงเทพมหานคร๑๐๑๑๐', ["บาน", "เลข", "ที123ถนน", "สุขุมวิท", "แขวง", "คลองตัน", "เหนือ", "เขต", "วัฒนา", "กรุงเทพมหานคร10110"]);
     assertAnalysis('chinese_address', '北京市朝阳区东三环中路1号国际大厦A座1001室', 
       ['北京市', '朝阳', '区', '东', '三', '环', '中路', '1', '号', '国际', '大厦', 'a', '座', '1001', '室']);
     assertAnalysis('japanese_address', '東京都渋谷区渋谷２丁目２１−１渋谷スクランブルスクエア４階', ["東京", "都", "渋谷", "区", "渋谷", "2", "丁目", "21", "1", "渋谷", "スクランフル", "スクエア", "4", "階"]);
     assertAnalysis('khmer_address', 'ផ្ទះលេខ១២៣ផ្លូវព្រះសីហនុសង្កាត់ទន្លេបាសាក់ខណ្ឌចំការមនរាជធានីភ្នំពេញ', ["ផទះលេខ123ផលូវ", "ពរះសីហនុ", "សងកាត", "ទនលេបាសាក", "ខណឌចំការមន", "រាជធានី", "ភនំពេញ"]);
     assertAnalysis('lao_address', 'ບ້ານເລກທີ່໑໕໕ຖະໜົນທ່ານຊານຂອງເຂດຈັນທະບູລີນະຄອນວຽງຈັນ', ["ບານ", "ເລກ", "ທີ155ຖະຫນົນ", "ທານ", "ຊານ", "ຂອງ", "ເຂດ", "ຈັນທະ", "ບູ", "ລີ", "ນະຄອນ", "ວຽງຈັນ"]);
 
    suite.run( t.end );
  });
};

module.exports.tests.address = function(test, common){
  test( 'address', function(t){

    var suite = new Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQuery' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'address', '101 mapzen place', [
      '101', 'mapzen', 'place'
    ]);

    assertAnalysis( 'address', '30 w 26 st', [
      '30', 'w', '26', 'st'
    ]);

    assertAnalysis( 'address', '4B 921 83 st', [
      '4b', '921', '83', 'st'
    ]);

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new Suite( common.clientOpts, common.create );
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasQuery' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var latin_large_letter_e_with_acute = String.fromCodePoint(0x00C9);
    var latin_small_letter_e_with_acute = String.fromCodePoint(0x00E9);
    var combining_acute_accent = String.fromCodePoint(0x0301);
    var latin_large_letter_e = String.fromCodePoint(0x0045);
    var latin_small_letter_e = String.fromCodePoint(0x0065);

    // Chambéry (both forms appear the same)
    var composed = "Chamb" + latin_small_letter_e_with_acute + "ry";
    var decomposed = "Chamb" + combining_acute_accent + latin_small_letter_e + "ry"

    assertAnalysis( 'composed', composed, ['chambery'] );
    assertAnalysis( 'decomposed', decomposed, ['chambery'] );

    // Één (both forms appear the same)
    var composed = latin_large_letter_e_with_acute + latin_small_letter_e_with_acute + "n";
    var decomposed = combining_acute_accent + latin_large_letter_e + combining_acute_accent + latin_small_letter_e + "n"

    assertAnalysis( 'composed', composed, ['een'] );
    assertAnalysis( 'decomposed', decomposed, ['een'] );

    suite.run( t.end );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasQuery: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
