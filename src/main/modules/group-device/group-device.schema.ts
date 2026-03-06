import { Joi } from 'celebrate';

export const getGroupDeviceById = Joi.object().keys({
    device_id: Joi.number().required(),
    refresh: Joi.string().valid('true', 'false').optional(),
});

export const groupDeviceSchema = Joi.object().keys({
    group_id: Joi.number().required(),
    device_id: Joi.number().required(),
    index: Joi.number().min(1).max(5).optional()
});
export const new_group_device_schema = Joi.array().items({
    group_name: Joi.string().required(),
    group_address: Joi.string().required(),
    device_id: Joi.number().required(),
    device_group_pos: Joi.number().required(),
});
export const group_device_position_schema = Joi.array().items({
    device_id: Joi.number().required(),
    group_id: Joi.number().required(),
    device_group_pos: Joi.number().required(),
});
export const create_multiple_schema = Joi.object().keys({
    group_id: Joi.number().required(),
    device_id: Joi.array().items(Joi.number().integer()).min(1).required(),
});

export const delete_multiple_group_device_schema = Joi.object().keys({
    group_device_map_id: Joi.array().items(Joi.number()),
});

export const delete_group_device_schema = Joi.object().keys({
    group_id: Joi.number().required(),
    device_id: Joi.number().required(),
    // index: Joi.number().required()
})