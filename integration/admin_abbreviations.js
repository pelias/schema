const elastictest = require('elastictest');
const config = require('pelias-config').generate();
const getTotalHits = require('./_hits_total_helper');

module.exports.tests = {};

/**
 * this test ensures that 'admin_abbreviation' fields
 * include a synonym mapping for country code abbreviations
 * which maps between alpha2 and alpha3 variants.
*/
module.exports.tests.synonyms = function (test, common) {
  test('synonyms - alpha3 does not share a prefix with alpha2', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, common.create);
    suite.action(done => setTimeout(done, 500)); // wait for es to bring some shards up

    // index document 1 with country_a='MEX'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: {
          parent: {
            country_a: ['MEX']
          }
        }
      }, done);
    });

    // index document 2 with country_a='MX'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '2',
        body: {
          parent: {
            country_a: ['MX']
          }
        }
      }, done);
    });

    // search for 'MEX' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'mex'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'MX' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'mx'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'MEX' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'mex'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'MX' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'mx'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    suite.run(t.end);
  });

  test('synonyms - alpha3 shares a prefix with alpha2', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, common.create);
    suite.action(done => setTimeout(done, 500)); // wait for es to bring some shards up

    // index document 1 with country_a='NZL'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: {
          parent: {
            country_a: ['NZL']
          }
        }
      }, done);
    });

    // index document 2 with country_a='NZ'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '2',
        body: {
          parent: {
            country_a: ['NZ']
          }
        }
      }, done);
    });

    // search for 'NZL' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZ' on 'parent.country_a'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a': {
                'query': 'nz'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZL' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nzl'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    // search for 'NZ' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            match: {
              'parent.country_a.ngram': {
                'query': 'nz'
              }
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    suite.run(t.end);
  });

  test('synonyms - additional synonyms do not increase field length', function (t) {

    var suite = new elastictest.Suite(common.clientOpts, common.create);
    suite.action(done => setTimeout(done, 500)); // wait for es to bring some shards up

    // index document 1 with country_a='NZL'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '1',
        body: {
          parent: {
            country_a: ['NZL']
          }
        }
      }, done);
    });

    // index document 2 with country_a='GBR'
    suite.action(done => {
      suite.client.index({
        index: suite.props.index,
        type: config.schema.typeName,
        id: '2',
        body: {
          parent: {
            country_a: ['GBR']
          }
        }
      }, done);
    });

    // search for 'NZL' or 'GBR' on 'parent.country_a.ngram'
    suite.assert(done => {
      suite.client.search({
        index: suite.props.index,
        type: config.schema.typeName,
        searchType: 'dfs_query_then_fetch',
        body: {
          query: {
            bool: {
              should: [{
                match: {
                  'parent.country_a.ngram': {
                    'query': 'nzl',
                    'analyzer': 'peliasQuery'
                  }
                }
              }, {
                match: {
                  'parent.country_a.ngram': {
                    'query': 'gbr',
                    'analyzer': 'peliasQuery'
                  }
                }
              }]
            }
          }
        }
      }, (err, res) => {
        t.equal(err, undefined);
        t.equal(getTotalHits(res.hits), 2, 'matches both documents');
        t.equal(res.hits.hits[0]._score, res.hits.hits[1]._score, 'scores match');
        done();
      });
    });

    suite.run(t.end);
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('multi token synonyms: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
