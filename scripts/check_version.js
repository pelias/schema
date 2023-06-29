const _ = require('lodash');
const semver = require('semver');
const buildClient = require('pelias-elasticsearch');
const config = require('pelias-config').generate();
const client = buildClient(config.esclient);
const cli = require('./cli');

// pass target elastic version semver as the first CLI arg
const targetVersion = process.argv[2];
if(!targetVersion){
  console.error('you must pass a target elasticsearch version semver as the first argument');
  process.exit(1);
}

cli.header(`checking elasticsearch server version matches "${targetVersion}"`);
client.info((err, { body }) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const version = _.get(body, 'version.number', '0.0.0');

  // pretty print error message
  if (!semver.satisfies(version, targetVersion)) {
    console.log(`${cli.status.failure} ${version}\n`);
    process.exit(1)
  }

  console.log(`${cli.status.success} ${version}\n`);
  console.log();
});
