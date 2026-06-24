const Joi = require('@hapi/joi');

// Schema Configuration
// schema.indexName: populated by defaults if not overridden
// esclient: object, validation performed by elasticsearch module
// featureFlags.icuTokenizer: boolean, optional, defaults to false
const schema = Joi.object().required().keys({
  schema: Joi.object().required().keys({
    indexName: Joi.string().required()
  }),
  esclient: Joi.object().required(),
  featureFlags: Joi.object().optional().keys({
    icuTokenizer: Joi.boolean().optional()
  }).unknown(true)
}).unknown(true);

module.exports = {
  validate: function validate(config) {
    const validated = schema.validate(config);
    if (validated.error) {
      throw new Error(validated.error.details[0].message);
    }
  }
};
