import { Joi } from 'celebrate';

export const offlineCommandSchema = Joi.object().keys({
    command: Joi.string().required(),
    ack: Joi.string().required(),
    node_type: Joi.number().required().allow("", null),
    source: Joi.string().required(),
    destination: Joi.string().required(),
    data: Joi.array().items(Joi.number().allow("", null)),
});

export const executeCommandSchema = Joi.object().keys({
    ids: Joi.array().items(Joi.number().required()).required(),
});