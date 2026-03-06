import { Joi } from 'celebrate';

export const groupSchema = Joi.object().keys({
    address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
    name: Joi.string().required(),
});

export const groupUpdateSchema = Joi.object().keys({
    name: Joi.string().required(),
});

export const winkGroupSchema = Joi.object().keys({
    group_id: Joi.number().integer().required(),
});

export const groupMoveToSchema = Joi.object().keys({
    group_id: Joi.number().integer().required(),
    action: Joi.string().valid('up', 'down').required(),
});

export const groupStopSchema = Joi.object().keys({
    group_id: Joi.number().integer().required(),
});