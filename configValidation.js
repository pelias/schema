const Joi = require('@hapi/joi');

// Schema Configuration
// schema.indexName: populated by defaults if not overridden
// schema.icuTokenizer: boolean, optional, defaults to false
// schema.sourceExcludedFields: array of field paths to index but omit from _source, optional
// schema.unmappedFields: array of field paths to remove from the mapping, optional
// esclient: object, validation performed by elasticsearch module
const schema = Joi.object().required().keys({
  schema: Joi.object().required().keys({
    indexName: Joi.string().required(),
    icuTokenizer: Joi.boolean().optional(),
    sourceExcludedFields: Joi.array().items(Joi.string()).optional(),
    unmappedFields: Joi.array().items(Joi.string()).optional()
  }),
  esclient: Joi.object().required()
}).unknown(true);

module.exports = {
  validate: function validate(config) {
    const validated = schema.validate(config);
    if (validated.error) {
      throw new Error(validated.error.details[0].message);
    }
  }
};
