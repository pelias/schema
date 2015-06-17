
// http://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-root-object-type.html#_dynamic_templates

var tape = require('tape'),
    elastictest = require('elastictest'),
    schema = require('../schema');

module.exports.tests = {};

// 'admin' mappings have a different 'name' dynamic_template to the other types
module.exports.tests.dynamic_templates_name = function(test, common){
  test( 'admin->name', nameAssertion( 'admin0', 'peliasOneEdgeGram' ) );
  test( 'document->name', nameAssertion( 'myType', 'peliasTwoEdgeGram' ) );
};

// all types share the same shingle mapping
module.exports.tests.dynamic_templates_shingle = function(test, common){
  test( 'admin->shingle', shingleAssertion( 'admin0', 'peliasShingles' ) );
  test( 'document->shingle', shingleAssertion( 'myType', 'peliasShingles' ) );
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('dynamic_templates: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};

function nameAssertion( type, analyzer ){
  return function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );

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

function shingleAssertion( type, analyzer ){
  return function(t){

    var suite = new elastictest.Suite( null, { schema: schema } );

    // index a document from a normal document layer
    suite.action( function( done ){
      suite.client.index({
        index: suite.props.index,
        type: type,
        id: '1',
        body: { shingle: { default: 'foo', alt: 'bar' } }
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( function( done ){
      suite.client.indices.getMapping({ index: suite.props.index, type: type }, function( err, res ){

        var properties = res[suite.props.index].mappings[type].properties;
        t.equal( properties.shingle.dynamic, 'true' );

        var shingleProperties = properties.shingle.properties;
        t.equal( shingleProperties.default.analyzer, analyzer );
        t.equal( shingleProperties.alt.analyzer, analyzer );
        done();
      });
    });

    suite.run( t.end );
  };
}