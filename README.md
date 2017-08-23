## Installation

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/schema.svg)](https://greenkeeper.io/)

```bash
$ npm install pelias-schema
```

[![NPM](https://nodei.co/npm/pelias-schema.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-schema)

## Usage

#### create index

```bash
node scripts/create_index.js;               # quick start
```

#### drop index

```bash
node scripts/drop_index.js;                 # drop everything
node scripts/drop_index.js --force-yes;     # skip warning prompt
```

#### reset a single type

This is useful when you want to reset a single `type` without wiping the rest of your `index`.

```bash
node scripts/reset_type.js mytype;          # reset a single type
```

#### update settings on an existing index

This is useful when you want to add a new analyser or filter to an existing index.

**note:** it is impossible to change the `number_of_shards` for an existing index, this will require a full re-index.

```bash
node scripts/update_settings.js;          # update index settings
```

#### output schema file

Use this script to pretty-print the whole schema file or a single mapping to stdout.

```bash
node scripts/output_mapping.js mytype;          # single type mapping
node scripts/output_mapping.js;                 # whole schema file
```

#### check all mandatory elasticsearch plugins are correctly installed

Print a list of which plugins are installed and how to install any that are missing.

```bash
node scripts/check_plugins.js;
```

## NPM Module

The `pelias-schema` npm module can be found here:

[https://npmjs.org/package/pelias-schema](https://npmjs.org/package/pelias-schema)

You can pull down a versioned copy of the pelias schema from npm:

```javascript
var schema = require('pelias-schema');

console.log( JSON.stringify( schema, null, 2 ) );
```
## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

### Running Unit Tests

```bash
$ npm test
```

### Running Integration Tests

Requires a running elasticsearch server (no other setup required)

```bash
# start a clean elasticsearch server to test against
$ docker run -d -p 9200:9200 pelias/elasticsearch

# run the integration tests
$ npm run integration
```

### Running elasticsearch in Docker (for testing purposes)

Download the image and start an elasticsearch docker container:

```bash
$ docker run --name elastic-test -p 9200:9200 elasticsearch:2
```

Once the service has started you will need to ensure the plugins are installed, in a new window:

```bash
$ node scripts/check_plugins.js

--------------------------------
 checking elasticsearch plugins
--------------------------------

node 'Nebulon' [x5sGjG6lSc2lWMf_hd6NwA]
 checking plugin 'analysis-icu': ✖

1 required plugin(s) are not installed on the node(s) shown above.
you must install the plugins before continuing with the installation.

you can install the missing packages on 'Nebulon' [172.17.0.2] with the following command(s):

 sudo /usr/share/elasticsearch/bin/plugin install analysis-icu

note: some plugins may require you to restart elasticsearch.
```

While the docker container is still running, execute this in another window:

```bash
$ docker exec -it elastic-test /usr/share/elasticsearch/bin/plugin install analysis-icu
-> Installing analysis-icu...
Trying https://download.elastic.co/elasticsearch/release/org/elasticsearch/plugin/analysis-icu/2.4.5/analysis-icu-2.4.5.zip ...
Downloading .............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................DONE
Verifying https://download.elastic.co/elasticsearch/release/org/elasticsearch/plugin/analysis-icu/2.4.5/analysis-icu-2.4.5.zip checksums if available ...
Downloading .DONE
Installed analysis-icu into /usr/share/elasticsearch/plugins/analysis-icu
```

The plugin has been installed, you will now need to restart the elasticsearch service:

```bash
# use ctrl+c to exit and then:

$ docker start elastic-test
```

The restarted server should now pass the `node scripts/check_plugins.js` check, you are good to go.

### Continuous Integration

Travis tests every release against Node.js versions 4` and `6`.

[![Build Status](https://travis-ci.org/pelias/schema.png?branch=master)](https://travis-ci.org/pelias/schema)
