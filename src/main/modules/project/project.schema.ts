import { Joi } from 'celebrate';

export const projectSchema = Joi.object().keys({
    name: Joi.string().required(),
    building_type_id: Joi.number().required(),
    address: Joi.string().allow("").allow(null),
});

export const startFirmwareUpdateSchema = Joi.object().keys({
    device_id: Joi.number().required(),
    isBricked: Joi.boolean().required(),
    file_name: Joi.string().required(),
});

export const exportRetrySchema = Joi.object().keys({
    device_id: Joi.number().required(),
    step: Joi.string().valid('ip', 'group', 'setting').required(),
});

export const importRetrySchema = Joi.object().keys({
    device_id: Joi.number().required(),
    step: Joi.string().valid('ip', 'group', 'setting').required(),
});

export const importProjectSchema = Joi.object().keys({
    file: Joi.any().required(),
    version: Joi.number().required(),
});

export const lastGroupAddressSchema = Joi.object().keys({
    address: Joi.string().pattern(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/)
        .custom((value, helpers) => {
            const segments = value.split('.').map(Number);
            if (segments.length !== 3) return helpers.error('any.invalid');
            for (const segment of segments) {
                if (!Number.isInteger(segment) || segment < 0 || segment > 255) {
                    return helpers.error('any.invalid');
                }
            }
            return value;
        }).required()
        .messages({
            'string.pattern.base': 'last_group_address must be in the format X.X.X',
            'any.invalid': 'last_group_address must be in the format X.X.X where X is between 0 and 255',
            'any.required': 'last_group_address is required'
        })
});