// Tests to ensure no regressions in the way the autocomplete analyzers handle
// synonym expansions and the corresponding matching of those tokens.

// The greater issue is descriped in: https://github.com/pelias/pelias/issues/211
// The cases tested here are described in: https://github.com/pelias/schema/issues/105

const Suite = require('../test/elastictest/Suite');
const config = require('pelias-config').generate();

const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

// index the name as 'center' and then retrieve with partially complete token 'cent'
module.exports.tests.index_and_retrieve_expanded_form = (test, common) => {
  test( 'index and retrieve expanded form', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { name: { default: 'center' } }
      }, done);
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'cent'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'center'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'ctr' and then retrieve with 'ctr'
module.exports.tests.index_and_retrieve_contracted_form = (test, common) => {
  test( 'index and retrieve contracted form', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { name: { default: 'ctr' } }
      }, done);
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'ctr'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'ctr' and then retrieve with partially complete token 'cent'
module.exports.tests.index_and_retrieve_mixed_form_1 = (test, common) => {
  test( 'index and retrieve mixed form 1', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { name: { default: 'ctr' } }
      }, done);
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'cent'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'center'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

// index the name as 'center' and then retrieve with 'ctr'
module.exports.tests.index_and_retrieve_mixed_form_2 = (test, common) => {
  test( 'index and retrieve mixed form 2', t => {

    const suite = new Suite( common.clientOpts, common.create );
    suite.action( done => { setTimeout( done, 500 ); }); // wait for es to bring some shards up

    // index a document with a name which contains a synonym (center)
    suite.action( done => {
      suite.client.index({
        index: suite.props.index,
        id: '1',
        body: { name: { default: 'center' } }
      }, done);
    });

    // search using 'peliasQuery'
    suite.assert( done => {
      suite.client.search({
        index: suite.props.index,
        body: { query: { match: {
          'name.default': {
            'analyzer': 'peliasQuery',
            'query': 'ctr'
          }
        }}}
      }, (err, res) => {
        t.equal( err, undefined );
        t.equal( getTotalHits(res.hits), 1, 'document found' );
        done();
      });
    });

    suite.run( t.end );
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('autocomplete street synonym expansion: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
