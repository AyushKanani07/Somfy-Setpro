import { Joi } from 'celebrate';

export const connectComPortSchema = Joi.object().keys({
    port: Joi.string().required(),
});