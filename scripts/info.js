const config = require('pelias-config').generate().esclient;
const es = require('elasticsearch');
const client = new es.Client(config);

client.info( {}, console.log.bind(console) );
