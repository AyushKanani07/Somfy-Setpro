import { Joi } from 'celebrate';

export const floorSchema = Joi.object().keys({
    name: Joi.string().required(),
});
export const dispOrderSchema = Joi.object().keys({
    type: Joi.string().required().allow('floor', 'room', 'device'),
    data: Joi.array().items(Joi.object().keys({
        id: Joi.number().required(),
        disp_order: Joi.number().required()
    }))
});
export const multipleFloorSchema = Joi.object().keys({
    no_of_floors: Joi.number().required().min(1),
    floor_prefix: Joi.string().required(),
    start_from: Joi.number().required().min(1)
})