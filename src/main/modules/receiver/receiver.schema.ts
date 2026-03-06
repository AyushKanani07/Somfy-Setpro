import { Joi } from 'celebrate';

export const Channel_Status_Schema = Joi.object({
    device_id: Joi.number().integer().required(),
    index: Joi.number().integer().min(1).max(5).required(),
    action: Joi.string().valid('config', 'delete', 'close-config').required()
});

export const Get_Channel_Status_Schema = Joi.object({
    index: Joi.number().integer().min(1).max(5).required(),
    refresh: Joi.boolean().optional()
});