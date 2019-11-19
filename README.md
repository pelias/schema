>This repository is part of the [Pelias](https://github.com/pelias/pelias)
>project. Pelias is an open-source, open-data geocoder originally sponsored by
>[Mapzen](https://www.mapzen.com/). Our official user documentation is
>[here](https://github.com/pelias/documentation).

# Pelias Elasticsearch Schema Definition

This package defines the Elasticsearch schema used by Pelias. Pelias requires quite a few settings for performance and accuracy. This repository contains those settings as well as useful tools to ensure they are applied correctly.

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/schema.svg)](https://greenkeeper.io/)
[![NPM](https://nodei.co/npm/pelias-schema.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-schema)
[![Build Status](https://travis-ci.org/pelias/schema.png?branch=master)](https://travis-ci.org/pelias/schema)

## Requirements

See [Pelias Software requirements](https://github.com/pelias/documentation/blob/master/requirements.md) for general Pelias requirements.

## Installation

```bash
$ npm install pelias-schema
```


## Usage

#### create index

```bash
./bin/create_index                          # quick start
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
$ docker run --rm --name elastic-test -p 9200:9200 pelias/elasticsearch:7.4.2
```

### Continuous Integration

Travis tests every release against all supported Node.js versions.
