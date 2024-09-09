declare module 'joi-objectid' {
    import Joi from 'joi';
    function joiObjectId(joi: typeof Joi): () => Joi.StringSchema;
    export = joiObjectId;
  }
  