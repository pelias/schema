const config = require('pelias-config').generate();
const es = require('elasticsearch');
const client = new es.Client(config.esclient);

async function stats() {
    try {
        const response = await client.search({
            index: config.schema.indexName,
            body: {
                aggs: {
                    sources: {
                        terms: {
                            field: 'source',
                            size: 100
                        },
                        aggs: {
                            layers: {
                                terms: {
                                    field: "layer",
                                    size: 100
                                }
                            }
                        }
                    }
                },
                size: 0,
            },
            timeout: '10s',
            request_cache: true,
            maxRetries: 1,
        });
        console.log("Results for index \""+config.schema.indexName+"\":")
        console.log(JSON.stringify(response, null, 2));
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(!!err);
    }
}
stats();