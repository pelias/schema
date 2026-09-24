const _ = require('lodash');

// convert a dotted field path such as 'parent.county_a' into its location in a mapping
const mappingPath = (field) => _.flatMap(field.split('.'), (part) => ['properties', part]);

/**
 * apply field configuration from `schema` section of pelias config to a mapping
 *
 * sourceExcludedFields: fields that are indexed but omitted from _source
 * unmappedFields: fields removed from the mapping entirely
 */
function configureFields(mapping, schemaConfig) {
  const sourceExcluded = _.get(schemaConfig, 'sourceExcludedFields', []);
  const unmapped = _.get(schemaConfig, 'unmappedFields', []);

  const configured = _.cloneDeep(mapping);

  if (!_.isEmpty(sourceExcluded)) {
    const excludes = _.get(configured, '_source.excludes', []);
    _.set(configured, '_source.excludes', _.union(excludes, sourceExcluded));
  }

  unmapped.forEach((field) => _.unset(configured, mappingPath(field)));

  return configured;
}

module.exports = configureFields;
