'use strict';

const Joi = require('joi');

const schema = Joi.object().keys({
  schema: {
    indexName: Joi.string()
  },
  esclient: Joi.object()
}).requiredKeys('schema', 'schema.indexName', 'esclient').unknown(true);

module.exports = {
  validate: function validate(config) {
    Joi.validate(config, schema, (err, value) => {
      if (err) {
        throw new Error(err.details[0].message);
      }
    });
  }

};
