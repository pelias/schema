var config = require('pelias-config').generate().esclient;
var es = require('elasticsearch');
var client = new es.Client(config);

client.info( {}, console.log.bind(console) );
