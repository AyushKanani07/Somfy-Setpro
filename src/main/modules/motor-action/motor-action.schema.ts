import { Joi } from 'celebrate';

export const Motor_Move_Schema = Joi.object({
    device_id: Joi.number().required(),
    direction: Joi.string().valid('up', 'down').required(),
    duration: Joi.number().required(),
    speed: Joi.string().valid('up', 'down', 'slow').required(),
    isACK: Joi.boolean().required()
})

export const Move_To_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().required(),
    isACK: Joi.boolean().required(),
    value_position: Joi.number().optional(),
    value_tilt: Joi.number().optional(),
});

export const All_Move_To_Schema = Joi.object({
    function_type: Joi.string().valid('up', 'down', 'pos_per').required(),
    value_position: Joi.number().optional(),
});

// export const Get_Motor_Position_Schema = Joi.object({
//     device_id: Joi.number().required(),
//     isACK: Joi.boolean().required()
// });

export const Set_Motor_Ip_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().required(),
    ip_index: Joi.number().required(),
    value_position: Joi.number().optional(),
    value_tilt: Joi.number().optional(),
});

export const Set_Motor_Ip_Auto_Schema = Joi.object({
    device_id: Joi.number().required(),
    ip_count: Joi.number().max(16).min(1).required(),
});

export const Stop_Motor_Schema = Joi.object({
    device_id: Joi.number().required(),
    isACK: Joi.boolean().required()
});

export const Wink_Motor_Schema = Joi.object({
    device_id: Joi.number().required(),
    isACK: Joi.boolean().required()
});

export const Set_App_Mode = Joi.object({
    device_id: Joi.number().required(),
    app_mode: Joi.number().required()
});

export const Motor_Move_Of_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().required(),
    isACK: Joi.boolean().required(),
    value_position: Joi.number().optional(),
});

export const Set_Direction_Schema = Joi.object({
    device_id: Joi.number().required(),
    direction: Joi.string().valid('forward', 'reverse').required()
});

export const Set_Motor_Limit_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().valid('top', 'bottom', 'pulse').required(),
    value_position: Joi.number().optional()
});

export const Set_Motor_Tilt_Limit_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().required(),
    value_tilt: Joi.number().optional()
});

export const Set_Rolling_Speed_Schema = Joi.object({
    device_id: Joi.number().required(),
    up: Joi.number().required(),
    down: Joi.number().required(),
    slow: Joi.number().required()
});

export const Default_Ramp_Time_Schema = Joi.object({
    device_id: Joi.number().required(),
    function_type: Joi.string().valid('start_up', 'stop_up', 'start_down', 'stop_down').required(),
});

export const Save_Ramp_Time_Schema = Joi.object({
    device_id: Joi.number().required(),
    start_up: Joi.object({
        enabled: Joi.boolean().required(),
        value: Joi.number().required()
    }).required(),
    start_down: Joi.object({
        enabled: Joi.boolean().required(),
        value: Joi.number().required()
    }).required(),
    stop_up: Joi.object({
        enabled: Joi.boolean().required(),
        value: Joi.number().required()
    }).required(),
    stop_down: Joi.object({
        enabled: Joi.boolean().required(),
        value: Joi.number().required()
    }).required()
});

export const Set_Led_Status_Schema = Joi.object({
    device_id: Joi.number().required(),
    status: Joi.string().valid('on', 'off').required()
});

export const Network_Lock_Schema = Joi.object({
    device_id: Joi.number().required(),
    isLocked: Joi.boolean().required(),
    priority: Joi.number().required()
});

export const Set_Motor_Label_Schema = Joi.object({
    device_id: Joi.number().required(),
    label: Joi.string().max(16).required()
});