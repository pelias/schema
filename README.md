>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias Elasticsearch Schema Definition

This package defines the Elasticsearch schema used by Pelias. Pelias requires quite a few settings for performance and accuracy. This repository contains those settings as well as useful tools to ensure they are applied correctly.

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/schema.svg)](https://greenkeeper.io/)
[![NPM](https://nodei.co/npm/pelias-schema.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-schema)
[![Build Status](https://travis-ci.org/pelias/schema.png?branch=master)](https://travis-ci.org/pelias/schema)
## Installation

```bash
$ npm install pelias-schema
```


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

#### user customizable synonyms files

You may provide your own custom synonyms by editing files in the `./synonyms/` directory.

```bash
$ ls -1 synonyms/custom_*
synonyms/custom_admin.txt
synonyms/custom_name.txt
synonyms/custom_street.txt
```

You must edit the files **before** running `create_index.js`, any changes made to the files will require you to drop and recreate the index before those synonyms are available.

Synonyms are only used at index-time. The filename contains the name of the elasticsearch field which the synonyms will apply. ie. `custom_name` will apply to the `name.*` fields, `custom_street` will apply to the `address_parts.name` field and `custom_admin` will apply to the `parent.*` fields.

see: https://github.com/pelias/schema/pull/273 for more info.

With great power comes great responsibility. Synonyms files are often used as a hammer when a scalpel is required. Please take care with their use and make maintainers aware that you are using custom synonyms when you open support tickets.

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
$ npm run integration
```

### Running elasticsearch in Docker (for testing purposes)

Download the image and start an elasticsearch docker container:

```bash
$ docker run --rm --name elastic-test -p 9200:9200 pelias/elasticsearch
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

Travis tests every release against all supported Node.js versions.
