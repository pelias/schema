const child_process = require('child_process');
const config = require('pelias-config').generate();
const es = require('elasticsearch');

const cli = require('./cli');
const schema = require('../schema');

const client = new es.Client(config.esclient);

// check mandatory plugins are installed before continuing
try {
  child_process.execSync(`node ${__dirname}/check_plugins.js`);
} catch (e) {
  console.error("please install mandatory plugins before continuing.\n");
  process.exit(1);
}

cli.header("create index");

const indexName = config.schema.indexName;
const req = { index: indexName, body: schema };

client.indices.create(req, (err, res) => {
  if (err) {
    console.error(err.message || err, '\n');
    process.exit(1);
  }
  console.log('[put mapping]', '\t', indexName, res, '\n');
  process.exit(!!err);
});
