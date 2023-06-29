var config = require('pelias-config').generate().esclient;
var buildClient = require('pelias-elasticsearch');
var client = buildClient(config);

client.info( {}, console.log.bind(console) );
