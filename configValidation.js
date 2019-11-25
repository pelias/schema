const Joi = require('@hapi/joi');

// Schema Configuration
// schema.indexName: populated by defaults if not overridden
// esclient: object, validation performed by elasticsearch module
const schema = Joi.object().keys({
  schema: {
    indexName: Joi.string(),
    typeName: Joi.string()
  },
  esclient: Joi.object()
}).requiredKeys(
  'schema', 'schema.indexName', 'schema.typeName', 'esclient'
).unknown(true);

module.exports = {
  validate: function validate(config) {
    Joi.validate(config, schema, err => {
      if (err) {
        throw new Error(err.details[0].message);
      }
    });
  }
};
