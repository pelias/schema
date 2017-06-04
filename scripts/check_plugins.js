var config = require('pelias-config').generate();
var util = require('util');
var es = require('elasticsearch');
var client = new es.Client(config.esclient);
var cli = require('./cli');
var schema = require('../schema');

// mandatory plugins
var plugins = [ 'analysis-icu' ];

// list of failures
var failures = [];

cli.header("checking elasticsearch plugins");
client.nodes.info( null, function( err, res ){

  if( err ){
    console.error(err);
    process.exit(1);
  }

  if( !res || !res.nodes ){
    console.error("no nodes found");
    process.exit(1);
  }

  // iterate over all nodes in cluster
  for( var uid in res.nodes ){

    var node = res.nodes[uid];

    // Amazon's hosted Elasticsearch does not have the plugins property
    // but has the plugins we need
    if (!node.plugins) {
      continue;
    }

    console.log( util.format( "\033[1;37mnode '%s' [%s]\033[0m", node.name, uid ) );

    // per node failures
    var node_failures = [];

    // iterate over all installed plugins on this node
    plugins.forEach( function( plugin ){

      // bool, is the plugin currently installed?
      var isInstalled = !!node.plugins.filter( function( installedPlugin ){
        return installedPlugin.name == plugin;
      }).length;

      // output status to terminal
      console.log( util.format( " checking plugin '%s': %s", plugin, isInstalled ? '\033[1;32m✔\033[0m' : '\033[1;31m✖\033[0m' ) );

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
    console.error( util.format( "\n\033[0;31m%s required plugin(s) are not installed on the node(s) shown above.", failures.length ) );
    console.error( "you must install the plugins before continuing with the installation.\033[0m");
    failures.forEach( function( failure ){
      console.error( util.format( "\nyou can install the missing packages on '%s' [%s] with the following command(s):\n", failure.node.name, failure.node.ip ) );
      failure.plugins.forEach( function( plugin ){
        console.error( util.format( "\033[0;32m sudo %s/bin/elasticsearch-plugin install %s\033[0m", failure.node.settings.path.home, plugin ) );
      });
    });
    console.error( "\n\033[1;37mnote:\033[0m some plugins may require you to restart elasticsearch.\n");
    process.exit(1)
  }

  console.log();
});
