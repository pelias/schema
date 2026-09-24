const _ = require('lodash');

// convert a dotted field path such as 'parent.county_a' into its location in a mapping
const mappingPath = (field) => _.flatMap(field.split('.'), (part) => ['properties', part]);

/**
 * apply field configuration from `schema` section of pelias config to a mapping
 *
 * unstoredFields: fields that are indexed but omitted from _source
 * excludedFields: fields removed from the mapping entirely
 */
function configureFields(mapping, schemaConfig) {
  const unstored = _.get(schemaConfig, 'unstoredFields', []);
  const excluded = _.get(schemaConfig, 'excludedFields', []);

  const configured = _.cloneDeep(mapping);

  if (!_.isEmpty(unstored)) {
    const excludes = _.get(configured, '_source.excludes', []);
    _.set(configured, '_source.excludes', _.union(excludes, unstored));
  }

  excluded.forEach((field) => _.unset(configured, mappingPath(field)));

  return configured;
}

module.exports = configureFields;
