const colors = require('colors/safe');
const config = require('pelias-config').generate();
const buildClient = require('pelias-elasticsearch');
const client = buildClient(config.esclient);
const cli = require('./cli');

// mandatory plugins
const required = ['analysis-icu'];

// list of failures
let failures = [];

cli.header("checking elasticsearch plugins");
client.nodes.info((err, { body }) => {

  if( err ){
    console.error(err);
    process.exit(1);
  }

  if( !body || !body.nodes ){
    console.error("no nodes found");
    process.exit(1);
  }

  // iterate over all nodes in cluster
  for( const uid in body.nodes ){

    const node = body.nodes[uid];

    // Amazon's hosted Elasticsearch does not have the plugins property
    // but has the plugins we need
    if (!node.plugins) {
      continue;
    }

    console.log( colors.bold(`node '${node.name}' [${uid}]`) );

    // per node failures
    let node_failures = [];

    // iterate over all required plugins
    required.forEach(plugin => {

      // bool, is the plugin currently installed?
      const isInstalled = node.plugins.some(installed => installed.name === plugin);

      // output status to terminal
      console.log( ` checking plugin '${plugin}': ${isInstalled ? cli.status.success : cli.status.failure}` );

      // record this plugin as not installed yet
      if( !isInstalled ){
        node_failures.push(plugin);
      }
    });

    // node had at least one failure
    if( node_failures.length ){
      failures.push({ node: node, plugins: node_failures });
    }
  }

  // pretty print error message
  if( failures.length ){
    console.error( colors.red(`${failures.length} required plugin(s) are not installed on the node(s) shown above.` ) );
    console.error( "you must install the plugins before continuing with the installation.");
    failures.forEach(failure => {
      console.error( `\nyou can install the missing packages on '${failure.node.name}' [${failure.node.ip}] with the following command(s):\n` );
      failure.plugins.forEach(plugin => {
        console.error( colors.green( `sudo ${failure.node.settings.path.home}/bin/elasticsearch-plugin install ${plugin}`) );
      });
    });
    console.error( colors.white("\nnote:") + "some plugins may require you to restart elasticsearch.\n");
    process.exit(1)
  }

  console.log();
});
