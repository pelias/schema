
// validate analyzer is behaving as expected

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema'),
    punctuation = require('../punctuation');

module.exports.tests = {};

module.exports.tests.analyze = function(test, common){
  test( 'analyze', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
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

    assertAnalysis( 'kstem', 'mcdonalds restaurant', ['mcdonald','restaurant'] );
    assertAnalysis( 'kstem', 'McDonald\'s Restaurant', ['mcdonald','restaurant'] );
    assertAnalysis( 'kstem', 'walking peoples', ['walking','people'] );

    assertAnalysis( 'peliasShinglesFilter', '1 a ab abc abcdefghijk', ['1','a','ab','abc','abcdefghijk'] );
    assertAnalysis( 'unique', '1 1 1', ['1'] );
    assertAnalysis( 'notnull', ' ^ ', [] );

    assertAnalysis( 'stem street suffixes', 'streets avenue', ['st','ave'] );
    assertAnalysis( 'stem street suffixes', 'boulevard roads', ['blvd','rd'] );

    assertAnalysis( 'stem direction synonyms', 'south by southwest', ['s','by','sw'] );
    assertAnalysis( 'stem direction synonyms', '20 bear road northeast', ['20','bear','rd','ne'] );

    // remove punctuation (handled by the char_filter)
    assertAnalysis( 'punctuation', punctuation.all.join(''), [ '-&' ] );

    suite.run( t.end );
  });
};

module.exports.tests.functional = function(test, common){
  test( 'functional', function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );
    var assertAnalysis = analyze.bind( null, suite, t, 'peliasPhrase' );
    suite.action( function( done ){ setTimeout( done, 500 ); }); // wait for es to bring some shards up

    assertAnalysis( 'country', 'Trinidad and Tobago', [
      'trinidad', '&', 'tobago'
    ]);

    assertAnalysis( 'place', 'Toys "R" Us!', [
      'toy', 'r', 'us'
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

    var suite = new elastictest.Suite( null, { schema: schema } );
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

    var suite = new elastictest.Suite( null, { schema: schema } );
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

    var suite = new elastictest.Suite( null, { schema: schema } );
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
        "query": {
          "filtered": {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "name.default": {
                        "query": i
                      }
                    }
                  }
                ],
                "should": [
                  {
                    "match": {
                      "phrase.default": {
                        "query": i,
                        "type": "phrase",
                        "slop": 2
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      };
    }

    suite.assert( function( done ){
      suite.client.search({
        index: suite.props.index,
        type: 'mytype',
        body: buildQuery('Lake Cayuga')
      }, function( err, res ){
        t.equal( res.hits.total, 3 );
        var hits = res.hits.hits;

        t.equal( hits[0]._source.name.default, 'Lake Cayuga' );
        t.equal( hits[1]._source.name.default, 'Cayuga Lake' );
        t.equal( hits[2]._source.name.default, '7991 Lake Cayuga Dr' );

        t.true( hits[0]._score > hits[1]._score );
        t.true( hits[1]._score > hits[2]._score );
        done();
      });
    });

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
