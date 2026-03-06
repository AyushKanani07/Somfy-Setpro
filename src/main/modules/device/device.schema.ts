// import { Joi } from 'celebrate';


// export const getDeviceSchema = Joi.object().keys({
//     device_id: Joi.number().required(),
// });

// export const updateDeviceSchema = Joi.object().keys({
//     device_id: Joi.number().required(),
//     address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
//     device_type: Joi.string().allow('motor', 'keypad', 'rts-reciever', 'rts-transmitter', 'rs485-setting'),
//     name: Joi.string().allow(null, ""),
//     cur_pos: Joi.number().required(),
//     sub_node_id: Joi.number().required().allow(null, ""),
//     model_no: Joi.number().required().allow(null, ""),
//     direction: Joi.number().required().allow(0, 1),
//     app_mode: Joi.number().required().allow(0, 1, 2, 3),
//     down_limit: Joi.number().required(),
//     speed: Joi.array().items(Joi.number()).allow(null),
//     ip: Joi.array().items({
//         index: Joi.number().required().min(0).max(16),
//         pulse: Joi.number().required().min(0).max(65535),
//     }).max(16),
//     group: Joi.array().items({
//         index: Joi.number().required().min(0).max(16),
//         address: Joi.string().regex(/^[0-9A-F]{6}/).required().min(0).max(65535),
//     }).max(16),
//     ramp: Joi.array().items(Joi.number()).allow(null),
//     network_lock: Joi.array().items(Joi.number()).allow(null),
//     network_config: Joi.array().items(Joi.number()).allow(null),
//     local_ui: Joi.array().items(Joi.number()).allow(null),
//     torque: Joi.array().items(Joi.number()).allow(null),
//     dct_mode: Joi.number().required().allow(0, 1, 2),
//     touch_motion_sensitivity: Joi.array().items(Joi.number()).allow(null),
//     keypad_data: Joi.array().items(Joi.any()).allow(null),
//     individual_switch_group: Joi.array().items(Joi.any()).allow(null),
//     channel: Joi.array().items(Joi.any()).allow(null),
// });

// export const updateDeviceIdentitySchema = Joi.object().keys({
//     identity: Joi.array().items(Joi.number()).allow(null),
//     device_id: Joi.number().required()
// });