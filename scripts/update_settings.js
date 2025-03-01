const config = require('pelias-config').generate();
const es = require('elasticsearch');
const client = new es.Client(config.esclient);
const schema = require('../schema');

const _index = config.schema.indexName;

// Error: ElasticsearchIllegalArgumentException[can't change the number of shards for an index
if( schema.settings.hasOwnProperty('index') &&
    schema.settings.index.hasOwnProperty('number_of_shards') ){
  delete schema.settings.index.number_of_shards;
  delete schema.settings.index.number_of_replicas;
}

client.indices.close( { index: _index }, (err, res) => {
  console.log( '[close index]', '\t', _index, err || '\t', res );
  client.indices.putSettings( { index: _index, body: schema.settings }, (err, res) => {
    console.log( '[put settings]', '\t', _index, err || '\t', res );
    client.indices.open( { index: _index }, (err, res) => {
      console.log( '[open index]', '\t', _index, err || '\t', res );
      process.exit( !!err );
    });
  });
});
