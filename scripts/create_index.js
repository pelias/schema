const child_process = require('child_process');
const config = require('pelias-config').generate();
const es = require('elasticsearch');
const SUPPORTED_ES_VERSIONS = '>=7.4.2';

const cli = require('./cli');
const schema = require('../schema');

// Check that the shape_type property has been defined in the schema.js file
// This must be set to either 'shape' or 'polygon', if not exit
if(shapeType === 'shape' || shapeType === 'polygon'){
  console.log('\n Creating an ES index with schema shape type: ' + shapeType + '.');
}else {
  console.error("The global.shapeType property in the schema.js file has not been correctly configured. Please set this value to 'shape' or 'polygon' and try again.");
  process.exit(1);
}

cli.header("create index");

const client = new es.Client(config.esclient);

// check minimum elasticsearch versions before continuing
try {
  child_process.execSync(`node ${__dirname}/check_version.js "${SUPPORTED_ES_VERSIONS}"`);
} catch (e) {
  console.error(`unsupported elasticsearch version. try: ${SUPPORTED_ES_VERSIONS}\n`);
  process.exit(1);
}

// check mandatory plugins are installed before continuing
try {
  child_process.execSync(`node ${__dirname}/check_plugins.js`);
} catch (e) {
  console.error("please install mandatory plugins before continuing.\n");
  process.exit(1);
}

const indexName = config.schema.indexName;
const req = {
  index: indexName,
  body: schema,
  include_type_name: false
};

client.indices.create(req, (err, res) => {
  if (err) {
    console.error(err.message || err, '\n');
    process.exit(1);
  }
  console.log('[put mapping]', '\t', indexName, res, '\n');
  process.exit(!!err);
});
