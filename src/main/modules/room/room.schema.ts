import { Joi } from 'celebrate';

export const roomSchema = Joi.object().keys({
    floor_id: Joi.number().required(),
    name: Joi.string().required(),
});
export const multiple_room_schema = Joi.object().keys({
    floor_id: Joi.number().required(),
    no_of_rooms: Joi.number().required().min(1),
    room_prefix: Joi.string().required(),
    start_from: Joi.number().required().min(1)
})