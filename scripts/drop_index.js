const colors = require('colors/safe');
const config = require('pelias-config').generate();
const es = require('elasticsearch');
const client = new es.Client(config.esclient);
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// use -f or --force-yes to skip the prompt
if (isForced()) { drop(); }
else { prompt(drop, fail); }

function drop() {
  const req = { index: config.schema.indexName };
  client.indices.delete(req, (err, res) => {
    console.log('\n[delete mapping]', '\t', config.schema.indexName, err || '\t', res);
    process.exit(!!err);
  });
}

// check all hosts to see if any is not localhost
function warnIfNotLocal() {
  if (config.esclient.hosts.some((env) => { return env.host !== 'localhost'; })) {
    console.log(colors.red(`WARNING: DROPPING SCHEMA NOT ON LOCALHOST: ${config.esclient.hosts[0].host}`));
  }
}

function prompt(yes, no) {
  warnIfNotLocal();
  rl.question(`Are you sure you want to drop the ${config.schema.indexName} index and delete ALL records? `, answer => {
    if (!answer.match(/^y(es)?$/i)) { return no(); }
    return yes();
  });
}

function fail() {
  console.log(`you must answer 'y' to confirm. aborting.`);
  process.exit(0);
}

function isForced() {
  return process.argv.length > 2 && ['--force-yes', '-f'].indexOf(process.argv[2]) > -1;
}