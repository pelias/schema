// http://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-root-object-type.html#_dynamic_templates

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema');

module.exports.tests = {};

// 'admin' mappings have a different 'name' dynamic_template to the other types
module.exports.tests.dynamic_templates_name = function(test, common){
  test( 'admin->name', nameAssertion( 'country', 'peliasIndexOneEdgeGram', common ) );
  test( 'document->name', nameAssertion( 'myType', 'peliasIndexOneEdgeGram', common ) );
};

// all types share the same phrase mapping
module.exports.tests.dynamic_templates_phrase = function(test, common){
  test( 'admin->phrase', phraseAssertion( 'country', 'peliasPhrase', common ) );
  test( 'document->phrase', phraseAssertion( 'myType', 'peliasPhrase', common ) );
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('dynamic_templates: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};

function nameAssertion( type, analyzer, common ){
  return function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );

    // index a document from a normal document layer
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: type,
        id: '1',
        body: { name: { default: 'foo', alt: 'bar' } }
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( function( done ){
      suite.client.indices.getMapping({ index: suite.props.index, type: type }, function( err, res ){

        var properties = res[suite.props.index].mappings[type].properties;
        t.equal( properties.name.dynamic, 'true' );

        var nameProperties = properties.name.properties;
        t.equal( nameProperties.default.analyzer, analyzer );
        t.equal( nameProperties.alt.analyzer, analyzer );
        done();
      });
    });

    suite.run( t.end );
  };
}

function phraseAssertion( type, analyzer, common ){
  return function(t){

    var suite = new elastictest.Suite( common.clientOpts, { schema: schema } );

    // index a document from a normal document layer
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: type,
        id: '1',
        body: { phrase: { default: 'foo', alt: 'bar' } }
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( function( done ){
      suite.client.indices.getMapping({ index: suite.props.index, type: type }, function( err, res ){

        var properties = res[suite.props.index].mappings[type].properties;
        t.equal( properties.phrase.dynamic, 'true' );

        var phraseProperties = properties.phrase.properties;
        t.equal( phraseProperties.default.analyzer, analyzer );
        t.equal( phraseProperties.alt.analyzer, analyzer );
        done();
      });
    });

    suite.run( t.end );
  };
}
