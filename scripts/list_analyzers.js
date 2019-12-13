const _ = require('lodash')
const colors = require('colors')
const cli = require('./cli');
const config = require('pelias-config').generate();
const schema = require('../schema');
const DEFAULT_ANALYZER = 'standard';
const NOT_APPLICABLE_ANALYZER = 'n/a';
const DEFAULT_NORMALIZER = '{none}';
const NOT_APPLICABLE_NORMALIZER = 'n/a';

const defaultAnalyzerFor = function(mapping){
  switch (mapping.type){
    case 'text': return DEFAULT_ANALYZER;
    case 'string': return DEFAULT_ANALYZER;
  }
  return NOT_APPLICABLE_ANALYZER;
}

const defaultNormalizerFor = function (mapping) {
  switch (mapping.type) {
    case 'keyword': return DEFAULT_NORMALIZER;
  }
  return NOT_APPLICABLE_ANALYZER;
}

// pretty print a single analyzer/normalizer label
const pretty = function(analyzer){
  if (analyzer === DEFAULT_ANALYZER) {
    return colors.blue(analyzer)
  }
  if (analyzer === NOT_APPLICABLE_ANALYZER) {
    return colors.white(analyzer)
  }
  if (analyzer.startsWith('pelias')) {
    return colors.green(analyzer)
  }
  return colors.yellow(analyzer)
}

// pretty print a single line
const print = function(vals) {
  console.error(
    colors.brightBlue(vals.field.padEnd(32)),
    vals.type.padEnd(32),
    pretty(vals.analyzer).padEnd(35),
    pretty(vals.search_analyzer).padEnd(35),
    pretty(vals.normalizer).padEnd(35)
  );
}

// pretty print an error
const error = function(vals) {
  console.error(Object.values(vals).map(v => colors.red(v)).join(' | '));
}

// parse mapping
const mapping = schema.mappings[config.schema.typeName];
const dynamic = mapping.dynamic_templates.map(t => _.first(_.map(t, v => v)));

// process and single mapping property (recursively)
const property = function(prop, field){
  // properties with subfields
  if (prop.type === 'object') {
    // recurse the object properties
    if (_.isPlainObject(prop.properties)) {
      _.each(prop.properties, (subprop, subfield) => {
        property(subprop, `${field}.${subfield}`)
      })
    } else {
      // analyzer may be defined in dynamic_templates
      const matches = dynamic.filter(t => field.startsWith(t.path_match.replace('.*', '')))

      // a dynamic template matches
      if (matches.length === 1){
        let prop = matches[0].mapping
        print({
          field: matches[0].path_match,
          type: prop.type,
          analyzer: prop.analyzer || defaultAnalyzerFor(prop),
          search_analyzer: prop.search_analyzer || prop.analyzer || defaultAnalyzerFor(prop),
          normalizer: prop.normalizer || defaultNormalizerFor(prop)
        })

      // more than one dynamic template matches
      } else if (matches.length > 1) {
        error({
          field: field,
          message: 'multiple dynamic_templates matched'
        })

      // no properties object or dynamic template matched
      } else {
        error({
          field: field,
          message: 'missing object properties'
        })
      }
    }
  } else {
    // scalar property definition
    print({
      field: field,
      type: prop.type,
      analyzer: prop.analyzer || defaultAnalyzerFor(prop),
      search_analyzer: prop.search_analyzer || prop.analyzer || defaultAnalyzerFor(prop),
      normalizer: prop.normalizer || defaultNormalizerFor(prop)
    })
  }
}

cli.header("list analyzers");
console.error(
  colors.bgWhite([
    colors.black('field').padEnd(43),
    colors.black('type').padEnd(43),
    colors.black('analyzer').padEnd(36),
    colors.black('search_analyzer').padEnd(36),
    colors.black('normalizer').padEnd(36)
  ].join(''))
);

_.each(mapping.properties, property);
console.log()
