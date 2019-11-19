// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'Max-Beer-Straße', ['0:max', '1:beer', '2:strasse', '2:str']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Street', ['0:foo', '1:street', '1:st'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Road', ['0:foo', '1:road', '1:rd'] );
    assertAnalysis( 'keyword_street_suffix', 'foo Crescent', ['0:foo', '1:crescent', '1:cres'] );
    assertAnalysis( 'keyword_compass', 'north foo', ['0:north', '0:n', '1:foo'] );
    assertAnalysis( 'keyword_compass', 'SouthWest foo', ['0:southwest', '0:sw', '1:foo'] );
    assertAnalysis( 'keyword_compass', 'foo SouthWest', ['0:foo', '1:southwest', '1:sw'] );
    assertAnalysis( 'remove_ordinals', '1st 2nd 3rd 4th 5th', ['1','2','3','4','5'] );
    assertAnalysis( 'remove_ordinals', 'Ast th 101st', ['ast','th','101'] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'USA address', 'west 26th street', [ '0:west', '0:w', '1:26', '2:street', '2:st' ]);
    assertAnalysis( 'USA address', 'West 26th Street', [ '0:west', '0:w', '1:26', '2:street', '2:st' ]);
    assertAnalysis( 'USA address', 'w 26th st', [ '0:w', '0:west', '1:26', '2:st', '2:street' ]);
    assertAnalysis( 'USA address', 'WEST 26th STREET', [ '0:west', '0:w', '1:26', '2:street', '2:st' ]);
    assertAnalysis( 'USA address', 'WEST 26th ST', [ '0:west', '0:w', '1:26', '2:st', '2:street' ]);

    suite.run( t.end );
  });
};

module.exports.tests.normalize_punctuation = function(test, common){
  test( 'normalize punctuation', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var expected = [ '0:chapala', '1:street', '1:st' ];

    assertAnalysis( 'single space', 'Chapala Street',    expected );
    assertAnalysis( 'double space', 'Chapala  Street',   expected );
    assertAnalysis( 'triple space', 'Chapala   Street',  expected );
    assertAnalysis( 'quad space',   'Chapala    Street', expected );

    suite.run( t.end );
  });
};

module.exports.tests.remove_ordinals = function(test, common){
  test( 'remove ordinals', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'ordindals', "1st", ["1"] );
    assertAnalysis( 'ordindals', "22nd", ["22"] );
    assertAnalysis( 'ordindals', "333rd", ["333"] );
    assertAnalysis( 'ordindals', "4444th", ["4444"] );
    assertAnalysis( 'ordindals', "2500th", ["2500"] );

    // teens
    assertAnalysis( 'teens', "11th", ["11"] );
    assertAnalysis( 'teens', "12th", ["12"] );
    assertAnalysis( 'teens', "13th", ["13"] );
    assertAnalysis( 'teens', "14th", ["14"] );
    assertAnalysis( 'teens', "15th", ["15"] );
    assertAnalysis( 'teens', "16th", ["16"] );
    assertAnalysis( 'teens', "17th", ["17"] );
    assertAnalysis( 'teens', "18th", ["18"] );
    assertAnalysis( 'teens', "19th", ["19"] );
    assertAnalysis( 'teens', "20th", ["20"] );

    // teens (hundreds)
    assertAnalysis( 'teens - hundreds', "111th", ["111"] );
    assertAnalysis( 'teens - hundreds', "112th", ["112"] );
    assertAnalysis( 'teens - hundreds', "113th", ["113"] );
    assertAnalysis( 'teens - hundreds', "114th", ["114"] );
    assertAnalysis( 'teens - hundreds', "115th", ["115"] );
    assertAnalysis( 'teens - hundreds', "116th", ["116"] );
    assertAnalysis( 'teens - hundreds', "117th", ["117"] );
    assertAnalysis( 'teens - hundreds', "118th", ["118"] );
    assertAnalysis( 'teens - hundreds', "119th", ["119"] );
    assertAnalysis( 'teens - hundreds', "120th", ["120"] );

    // teens (wrong suffix)
    assertAnalysis( 'teens - wrong suffix', "11st", ["11st"] );
    assertAnalysis( 'teens - wrong suffix', "12nd", ["12nd"] );
    assertAnalysis( 'teens - wrong suffix', "13rd", ["13rd"] );
    assertAnalysis( 'teens - wrong suffix', "111st", ["111st"] );
    assertAnalysis( 'teens - wrong suffix', "112nd", ["112nd"] );
    assertAnalysis( 'teens - wrong suffix', "113rd", ["113rd"] );

    // uppercase
    assertAnalysis( 'uppercase', "1ST", ["1"] );
    assertAnalysis( 'uppercase', "22ND", ["22"] );
    assertAnalysis( 'uppercase', "333RD", ["333"] );
    assertAnalysis( 'uppercase', "4444TH", ["4444"] );

    // autocomplete
    assertAnalysis( 'autocomplete', "26", ["26"] );
    assertAnalysis( 'autocomplete', "26t", ["26"] );
    assertAnalysis( 'autocomplete', "26th", ["26"] );
    assertAnalysis( 'autocomplete', "3", ["3"] );
    assertAnalysis( 'autocomplete', "3r", ["3"] );
    assertAnalysis( 'autocomplete', "3rd", ["3"] );

    // wrong suffix
    assertAnalysis( 'wrong suffix (do nothing)', "0th", ["0th"] );
    assertAnalysis( 'wrong suffix (do nothing)', "26s", ["26s"] );
    assertAnalysis( 'wrong suffix (do nothing)', "26st", ["26st"] );
    assertAnalysis( 'wrong suffix (do nothing)', "31t", ["31t"] );
    assertAnalysis( 'wrong suffix (do nothing)', "31th", ["31th"] );
    assertAnalysis( 'wrong suffix (do nothing)', "21r", ["21r"] );
    assertAnalysis( 'wrong suffix (do nothing)', "21rd", ["21rd"] );
    assertAnalysis( 'wrong suffix (do nothing)', "29n", ["29n"] );
    assertAnalysis( 'wrong suffix (do nothing)', "29nd", ["29nd"] );

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    var expected = [ '0:bedell', '1:street', '1:st', '2:133', '3:avenue', '3:ave', '3:av' ];

    // specify 2 streets with a delimeter
    assertAnalysis( 'forward slash', 'Bedell Street/133rd Avenue',   expected );
    assertAnalysis( 'forward slash', 'Bedell Street /133rd Avenue',  expected );
    assertAnalysis( 'forward slash', 'Bedell Street/ 133rd Avenue',  expected );
    assertAnalysis( 'back slash',    'Bedell Street\\133rd Avenue',  expected );
    assertAnalysis( 'back slash',    'Bedell Street \\133rd Avenue', expected );
    assertAnalysis( 'back slash',    'Bedell Street\\ 133rd Avenue', expected );
    assertAnalysis( 'comma',         'Bedell Street,133rd Avenue',   expected );
    assertAnalysis( 'comma',         'Bedell Street ,133rd Avenue',  expected );
    assertAnalysis( 'comma',         'Bedell Street, 133rd Avenue',  expected );

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite( common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind( null, suite, t, 'peliasStreet' );
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

module.exports.tests.germanic_street_suffixes = function (test, common) {
  test('germanic_street_suffixes', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, {
      schema: schema,
      create: { include_type_name: true }
    });
    var assertAnalysis = common.analyze.bind(null, suite, t, 'peliasStreet');
    suite.action(function (done) { setTimeout(done, 500); }); // wait for es to bring some shards up

    // Germanic street suffixes
    assertAnalysis('straße', 'straße', ['0:strasse', '0:str']);
    assertAnalysis('strasse', 'strasse', ['0:strasse', '0:str']);
    assertAnalysis('str.', 'str.', ['0:str', '0:strasse']);
    assertAnalysis('str', 'str', ['0:str', '0:strasse']);
    assertAnalysis('brücke', 'brücke', [ '0:bruecke', '0:brucke', '0:br' ]);
    assertAnalysis('bruecke', 'bruecke', [ '0:bruecke', '0:brucke', '0:br' ]);
    assertAnalysis('brucke', 'brucke', ['0:brucke', '0:bruecke', '0:br']);
    assertAnalysis('br.', 'br.', ['0:br', '0:branch', '0:bruecke', '0:brucke']);
    assertAnalysis('br', 'br', ['0:br', '0:branch', '0:bruecke', '0:brucke']);

    suite.run(t.end);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('peliasStreet: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
