const config = require('pelias-config').generate();
const es = require('elasticsearch');
const client = new es.Client(config.esclient);
const targetIndex = getTargetIndex();


async function stats(targetIndex) {
    try {
        const response = await client.search({
            index: targetIndex,
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
        console.log("Results for index \"" + targetIndex + "\":")
        console.log(JSON.stringify(response, null, 2));
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(!!err);
    }
};

function getTargetIndex() {
    if (process.argv.length > 2 && ['--api', '-a'].indexOf(process.argv[2]) > -1) {
        return config.api.indexName; //If none is set the value from pelias/config/config/defaults.json will be used ('pelias')
    }
    return config.schema.indexName;
}
stats(targetIndex);