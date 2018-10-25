// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'lowercase', 'F', ['f']);
    assertAnalysis( 'asciifolding', 'é', ['e']);
    assertAnalysis( 'asciifolding', 'ß', ['ss']);
    assertAnalysis( 'asciifolding', 'æ', ['ae']);
    assertAnalysis( 'asciifolding', 'ł', ['l']);
    assertAnalysis( 'asciifolding', 'ɰ', ['m']);
    assertAnalysis( 'trim', ' f ', ['f'] );
    assertAnalysis( 'stop_words (disabled)', 'a st b ave c', ['a','st','b','ave','c'] );
    assertAnalysis( 'ampersand', 'a and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a & b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'a and & and b', ['a','&','b'] );
    assertAnalysis( 'ampersand', 'land', ['land'] ); // should not replace inside tokens

    // @todo: handle multiple consecutive 'and'
    // assertAnalysis( 'ampersand', 'a and & and b', ['a &','& b'] );

    assertAnalysis( 'no kstem', 'mcdonalds', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'McDonald\'s', ['mcdonalds'] );
    assertAnalysis( 'no kstem', 'peoples', ['peoples'] );

    assertAnalysis( 'peliasShinglesFilter', '1 a ab abc abcdefghijk', ['1','a','ab','abc','abcdefghijk'] );
    assertAnalysis( 'unique', '1 1 1', ['1'] );
    assertAnalysis( 'notnull', ' ^ ', [] );

    assertAnalysis( 'stem street suffixes', 'streets avenue', ['streets','ave'] );
    assertAnalysis( 'stem street suffixes', 'boulevard roads', ['blvd','roads'] );

    assertAnalysis( 'stem direction synonyms', 'south by southwest', ['s','by','sw'] );
    assertAnalysis( 'stem direction synonyms', '20 bear road northeast', ['20','bear','rd','ne'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), [ '-&' ] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'trinidad', '&', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      'toys', 'r', 'us'
    ]);

    assertAnalysis( 'address', '101 mapzen pl', [
      '101', 'mapzen', 'pl'
    ]);

    // both terms should map to same tokens
    var expected1 = [ '325', 'n', '12th', 'st' ];
    assertAnalysis( 'address', '325 N 12th St', expected1 );
    assertAnalysis( 'address', '325 North 12th Street', expected1 );

    // both terms should map to same tokens
    var expected2 = [ '13509', 'colfax', 'ave', 's' ];
    assertAnalysis( 'address', '13509 Colfax Ave S', expected2 );
    assertAnalysis( 'address', '13509 Colfax Avenue South', expected2 );

    // both terms should map to same tokens
    var expected3 = [ '100', 's', 'lake', 'dr' ];
    assertAnalysis( 'address', '100 S Lake Dr', expected3 );
    assertAnalysis( 'address', '100 South Lake Drive', expected3 );

    // both terms should map to same tokens
    var expected4 = [ '100', 'nw', 'hwy' ];
    assertAnalysis( 'address', '100 northwest highway', expected4 );
    assertAnalysis( 'address', '100 nw hwy', expected4 );

    suite.run( t.end );
  });
};

module.exports.tests.tokenizer = function(test, common){
  test( 'tokenizer', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // specify 2 parts with a delimeter
    assertAnalysis( 'forward slash', 'Bedell Street/133rd Avenue',   [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'forward slash', 'Bedell Street /133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'forward slash', 'Bedell Street/ 133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'back slash',    'Bedell Street\\133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'back slash',    'Bedell Street \\133rd Avenue', [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'back slash',    'Bedell Street\\ 133rd Avenue', [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'comma',         'Bedell Street,133rd Avenue',   [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'comma',         'Bedell Street ,133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'comma',         'Bedell Street, 133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'space',         'Bedell Street,133rd Avenue',   [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'space',         'Bedell Street ,133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);
    assertAnalysis( 'space',         'Bedell Street, 133rd Avenue',  [ 'bedell', 'st', '133rd', 'ave' ]);

    suite.run( t.end );
  });
};

// @ref: https://www.elastic.co/guide/en/elasticsearch/guide/current/phrase-matching.html
// @ref: https://www.elastic.co/guide/en/elasticsearch/guide/current/slop.html
module.exports.tests.slop = function(test, common){
  test( 'slop', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // no index-time slop operations performed
    assertAnalysis( 'place', 'Lake Cayuga', [ 'lake', 'cayuga' ]);
    assertAnalysis( 'place', 'Cayuga Lake', [ 'cayuga', 'lake' ]);

    suite.run( t.end );
  });
};

// balance scoring for similar terms 'Lake Cayuga', 'Cayuga Lake' and '7991 Lake Cayuga Dr'
// @ref: https://www.elastic.co/guide/en/elasticsearch/guide/current/phrase-matching.html
// @ref: https://www.elastic.co/guide/en/elasticsearch/guide/current/slop.html
module.exports.tests.slop_query = function(test, common){
  test( 'slop query', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index 'Lake Cayuga'
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'mytype',
        id: '1',
        body: { name: { default: 'Lake Cayuga' }, phrase: { default: 'Lake Cayuga' } }
      }, done );
    });

    // index 'Cayuga Lake'
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'mytype',
        id: '2',
        body: { name: { default: 'Cayuga Lake' }, phrase: { default: 'Cayuga Lake' } }
      }, done );
    });

    // index '7991 Lake Cayuga Dr'
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'mytype',
        id: '3',
        body: { name: { default: '7991 Lake Cayuga Dr' }, phrase: { default: '7991 Lake Cayuga Dr' } }
      }, done );
    });

    function buildQuery( i ){
      return {
        'query': {
          'bool': {
            'must': [
              {
                'match': {
                  'name.default': {
                    'query': i
                  }
                }
              }
            ],
            'should': [
              {
                'match': {
                  'phrase.default': {
                    'query': i,
                    'type': 'phrase',
                    'slop': 2
                  }
                }
              }
            ]
          }
        }
      };
    }

    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'mytype',
        searchType: 'dfs_query_then_fetch',
        body: buildQuery('Lake Cayuga')
      }, function( err, res ){
        t.equal( res.hits.total, 3 );
        var hits = res.hits.hits;

        t.equal( hits[0]._source.name.default, 'Lake Cayuga' );

        // This behaviour changed between elasticsearch 2.4 & 5.6
        // In 2.4 the sloppy exact match ranked higher, after upgrading
        // to 5.6 the correctly-oriented-yet-longer query comes second.
        // There seems to be a penatly applied to sloppy matches but we
        // were unable to find it in the lucene documentation.
        // t.equal( hits[1]._source.name.default, 'Cayuga Lake' );
        // t.equal( hits[2]._source.name.default, '7991 Lake Cayuga Dr' );

        t.true( hits[0]._score >= hits[1]._score );
        t.true( hits[1]._score >= hits[2]._score );
        done();
      });
    });

    suite.run( t.end );
  });
};

// test the minimum amount of slop required to retrieve address documents
module.exports.tests.slop = function(test, common){
  test( 'slop', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: 'test',
        id: '1',
        body: { name: { default: '52 Görlitzer Straße' } }
      }, done);
    });

    // search using 'peliasPhrase'
    // in this case we require a slop of 3 to return the same
    // record with the street number and street name reversed.
    // (as is common in European countries, such as Germany).
    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'test',
        searchType: 'dfs_query_then_fetch',
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasPhrase',
            'query': 'Görlitzer Straße 52',
            'type': 'phrase',
            'slop': 3,
          }
        }}}
      }, function( err, res ){
        t.equal( err, undefined );
        t.equal( res.hits.total, 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// @see: https://github.com/pelias/api/issues/600
module.exports.tests.unicode = function(test, common){
  test( 'normalization', function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
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
    return tape('peliasPhrase: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};

function analyze( suite, t, analyzer, comment, text, expected ){
  suite.assert( function( done ){
    suite.client.indices.analyze({
      index: suite.props.index,
      analyzer: analyzer,
      text: text
    }, function( err, res ){
      if( err ) console.error( err );
      t.deepEqual( simpleTokens( res.tokens ), expected, comment );
      done();
    });
  });
}

function simpleTokens( tokens ){
  return tokens.map( function( t ){
    return t.token;
  });
}
