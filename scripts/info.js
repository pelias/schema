var es = require('elasticsearch');
var client = new es.Client();

client.info( {}, console.log.bind(console) );
