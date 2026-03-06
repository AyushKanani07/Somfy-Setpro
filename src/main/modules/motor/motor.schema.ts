import { Joi } from 'celebrate';


export const createMotorSchema = Joi.object().keys({
        room_id: Joi.number().required(),
        name: Joi.string().allow(null, ""),
        address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sub_node_id: Joi.number().required(),
        is_limit_set: Joi.boolean().required(),
    });
    export const updateMotorSchema = Joi.object().keys({
        room_id: Joi.number().allow(null),
    });
    export const createMultipleMotorSchema = Joi.array().items({
        room_id: Joi.number().required(),
        name: Joi.any(),
        address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        model_no: Joi.number().required().allow(null, ""),
        key_count: Joi.number().allow(8, 6, null, ""),
        device_type: Joi.any(),
        action_type: Joi.any(),
        disp_order: Joi.any(),
    });
    export const updateMultipleMotorSchema = Joi.array().items({
        device_id: Joi.number().required(),
        name: Joi.string().allow(null, ""),
    });
    export const unassignedDevicesSchema = Joi.array().items({
        name: Joi.any(),
        address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        model_no: Joi.number().allow(null).required(),
        device_type: Joi.string().required().allow('motor', 'keypad'),
    });
    export const detailSchema = Joi.object().keys({
        ip_data: Joi.array().items({
            pulse: Joi.number().required().min(0).max(65535),
            percentage: Joi.number().required().min(0).max(100),
            index: Joi.number().required().min(0).max(16),
            angle: Joi.number(),
            selected: Joi.boolean()
        }),
        direction: Joi.string().allow('forward', 'reverse', null),
        up_limit: Joi.number().allow(null),
        down_limit: Joi.number().allow(null),
        up_speed: Joi.number().allow(null),
        down_speed: Joi.number(),
        slow_speed: Joi.number(),
        up_ramp: Joi.number(),
        down_ramp: Joi.number(),
        move_count: Joi.number(),
        revolution_count: Joi.number(),
        obstacle_count: Joi.number(),
        post_obstacle_count: Joi.number(),
        thermal_count: Joi.number(),
        post_thermal_count: Joi.number(),
        power_cut_count: Joi.number(),
        reset_count: Joi.number(),
    });
    export const saveMotorLimitSchema = Joi.array().items({
        up_limit: Joi.number().allow(null).required(),
        down_limit: Joi.number().allow(null).required(),
        address: Joi.string().required(),
        is_limit_set: Joi.boolean().required(),
    });
    export const saveNodeStackSchema = Joi.array().items({
        sub_node_id: Joi.number().required().allow(null, ""),
        address: Joi.string().required(),
    });