<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/api?style=flat&color=orange" /></a>
<a href="https://hub.docker.com/u/pelias"><img src="https://img.shields.io/docker/pulls/pelias/api?style=flat&color=informational" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you’re able to turn your users’ place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias Elasticsearch Schema Definition

This package defines the Elasticsearch schema used by Pelias. Pelias requires quite a few settings for performance and accuracy. This repository contains those settings as well as useful tools to ensure they are applied correctly.

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
node scripts/drop_index.js                 # drop everything
node scripts/drop_index.js --force-yes     # skip warning prompt
```

#### update settings on an existing index

This is useful when you want to add a new analyser or filter to an existing index.

**note:** it is impossible to change the `number_of_shards` for an existing index, this will require a full re-index.

```bash
node scripts/update_settings.js          # update index settings
```

#### output schema file

Use this script to pretty-print the whole schema file or a single mapping to stdout.

```bash
node scripts/output_mapping.js
```

#### check all mandatory elasticsearch plugins are correctly installed

Print a list of which plugins are installed and how to install any that are missing.

```bash
node scripts/check_plugins.js
```

## Configuration

### Settings from `pelias.json`

Like the rest of Pelias, the Pelias schema can be configured through a `pelias.json` file read by [pelias-config](https://github.com/pelias/config).

#### `schema.indexName`

This allows configuring the name of the index created in Elasticsearch. The default is `pelias`.

**Note:** All Pelias importers also use this configuration value to determine what index to _write_ to. Additionally, the Pelias API uses the related [`api.indexName`](https://github.com/pelias/api#configuration-via-pelias-config) parameter to determine where to _read_ from.

### user customizable synonyms files

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
$ docker run --rm --name elastic-test -p 9200:9200 pelias/elasticsearch:7.5.1
```

### Continuous Integration

Travis tests every release against all supported Node.js versions.
