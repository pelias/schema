// http://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-root-object-type.html#_dynamic_templates

const Suite = require('../test/elastictest/Suite');
const config = require('pelias-config').generate();

module.exports.tests = {};

module.exports.tests.dynamic_templates_name = function(test, common){
  test( 'document->name', nameAssertion( 'peliasIndexOneEdgeGram', common ) );
};

module.exports.tests.dynamic_templates_phrase = function(test, common){
  test( 'document->phrase', phraseAssertion( 'peliasPhrase', common ) );
};

module.exports.tests.dynamic_templates_addendum = function(test, common){
  test( 'addendum', addendumAssertion( 'wikipedia', JSON.stringify({ slug: 'Wikipedia' }), common ) );
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('dynamic_templates: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};

function nameAssertion( analyzer, common ){
  return function(t){

    var suite = new Suite( common.clientOpts, common.create );

    // index a document from a normal document layer
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { name: { default: 'foo', alt: 'bar' } }
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( done => {

      suite.client.indices.getMapping({
        index: suite.props.index,
      }, (err, res) => {

        const properties = res[suite.props.index].mappings.properties;
        t.equal( properties.name.dynamic, 'true' );

        const nameProperties = properties.name.properties;
        t.equal( nameProperties.default.analyzer, analyzer );
        t.equal( nameProperties.alt.analyzer, analyzer );
        done();
      });
    });

    suite.run( t.end );
  };
}

function phraseAssertion( analyzer, common ){
  return function(t){

    const suite = new Suite( common.clientOpts, common.create );

    // index a document from a normal document layer
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { phrase: { default: 'foo', alt: 'bar' } }
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( done => {

      suite.client.indices.getMapping({
        index: suite.props.index,
      }, ( err, res ) => {

        const properties = res[suite.props.index].mappings.properties;
        t.equal( properties.phrase.dynamic, 'true' );

        const phraseProperties = properties.phrase.properties;
        t.equal( phraseProperties.default.analyzer, analyzer );
        t.equal( phraseProperties.alt.analyzer, analyzer );
        done();
      });
    });

    suite.run( t.end );
  };
}

function addendumAssertion( namespace, value, common ){
  return function(t){

    const suite = new Suite( common.clientOpts, common.create );

    // index a document including the addendum
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { addendum: { [namespace]: value } },
      }, done );
    });

    // check dynamically created mapping has
    // inherited from the dynamic_template
    suite.assert( done => {
      suite.client.indices.getMapping({
        index: suite.props.index,
      }, ( err, res ) => {

        const properties = res[suite.props.index].mappings.properties;
        t.equal( properties.addendum.dynamic, 'true' );

        const addendumProperties = properties.addendum.properties;

        t.true([
          'keyword' // elasticsearch 5.6
        ].includes( addendumProperties[namespace].type ));

        t.true([
          false // elasticsearch 5.6
        ].includes( addendumProperties[namespace].index ));

        // elasticsearch 5.6
        if( addendumProperties[namespace].doc_values ){
          t.equal( addendumProperties[namespace].doc_values, false );
        }

        done();
      });
    });

    // retrieve document and check addendum was stored verbatim
    suite.assert( done => {
      suite.client.get({
        index: suite.props.index,
        id: 1
      }, ( err, res ) => {
        t.false( err );
        t.equal( res._source.addendum[namespace], value );
        done();
      });
    });

    suite.run( t.end );
  };
}
