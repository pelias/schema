# pelias schema files and tooling

An Elasticsearch Backend with support for Streaming Bulk Indexing

# Installation

```bash
$ npm install pelias-schema
```

[![NPM](https://nodei.co/npm/pelias-schema.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-schema)

---

# Usage

You can pull down a versioned copy of the pelias schema from npm:

```javascript
var schema = require('pelias-schema');

console.log( JSON.stringify( schema, null, 2 ) );
```

## Scripts

### Creating the required pelias mappings in elasticsearch:

```bash
node scripts/create_index.js;               # quick start
```

### Drop all pelias mappings in elasticsearch:

```bash
node scripts/drop_index.js;                 # drop everything
```

### Reset a single type:

This is useful when you want to reset a single `type` without wiping the rest of your `index`.

```bash
node scripts/reset_type.js mytype;          # reset a single type
```

### Output schema file:

Use this script to pretty-print the whole schema file or a single mapping to stdout.

```bash
node scripts/reset_type.js mytype;          # single type mapping
node scripts/reset_type.js;                 # whole schema file
```

## NPM Module

The `pelias-schema` npm module can be found here:

[https://npmjs.org/package/pelias-schema](https://npmjs.org/package/pelias-schema)

## Contributing

Please fork and pull request against upstream master on a feature branch.

Pretty please; provide unit tests and script fixtures in the `test` directory.

### Running Unit Tests

```bash
$ npm test
```

### Continuous Integration

Travis tests every release against node version `0.10`

[![Build Status](https://travis-ci.org/pelias/schema.png?branch=master)](https://travis-ci.org/pelias/schema)