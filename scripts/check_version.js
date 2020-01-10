const _ = require('lodash');
const semver = require('semver');
const es = require('elasticsearch');
const colors = require('colors/safe');
const config = require('pelias-config').generate();
const client = new es.Client(config.esclient);
const cli = require('./cli');

// helper strings for output
const success = colors.green('✔');
const failure = colors.red('✖');

// pass target elastic version semver as the first CLI arg
const targetVersion = process.argv[2];
if(!targetVersion){
  console.error('you must pass a target elasticsearch version semver as the first argument');
  process.exit(1);
}

cli.header(`checking elasticsearch server version matches "${targetVersion}"`);
client.info(null, (err, res) => {

  if (err) {
    console.error(err);
    process.exit(1);
  }

  let version = _.get(res, 'version.number', '0.0.0');

  // pretty print error message
  if (!semver.satisfies(version, targetVersion)) {
    console.log(`${failure} ${version}\n`);
    process.exit(1)
  }

  console.log(`${success} ${version}\n`);
  console.log();
});
