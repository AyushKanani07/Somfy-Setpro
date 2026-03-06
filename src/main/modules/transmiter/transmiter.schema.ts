import { Joi } from 'celebrate';

export const Channel_Mode_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel_number: Joi.number().integer().min(0).max(15).required(),
    frequency_mode: Joi.string().valid('us', 'ce').required(),
    application_mode: Joi.string().valid('rolling', 'tilting').required(),
    feature_set_mode: Joi.string().valid('modulis', 'normal').required()
});

export const Get_Channel_Mode_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required()
});

export const Rts_Address_Schema = Get_Channel_Mode_Schema;

export const Ip_Schema = Get_Channel_Mode_Schema;

export const Get_Tilt_Frame_Count_Schema = Get_Channel_Mode_Schema;

export const Get_Dim_Frame_Count_Schema = Get_Channel_Mode_Schema;

export const Set_Channel_Schema = Get_Channel_Mode_Schema;

export const Set_OpenProg_Schema = Get_Channel_Mode_Schema;

export const Set_RTSAddress_Schema = Get_Channel_Mode_Schema;

export const Tilt_Frame_Count_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required(),
    tilt_frame_us: Joi.number().integer().min(4).max(255).required(),
    tilt_frame_ce: Joi.number().integer().min(2).max(13).required()
});

export const Dim_Frame_Count_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required(),
    dim_frame: Joi.number().integer().min(4).max(255).required()
});

export const Sun_Auto_Schema = Joi.object({
    device_id: Joi.number().required(),
    sun_mode: Joi.string().valid('on', 'off').required()
});

export const Control_Position_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required(),
    function_type: Joi.string().required()
});

export const Tilt_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required(),
    function_type: Joi.string().valid('up', 'down').required(),
    tilt_amplitude: Joi.number().integer().min(1).max(127).required()
});

export const Dim_Schema = Joi.object({
    device_id: Joi.number().required(),
    channel: Joi.number().integer().min(0).max(15).required(),
    function_type: Joi.string().valid('up', 'down').required(),
    dim_amplitude: Joi.number().integer().min(1).max(127).required()
});

export const Set_Dct_Lock_Schema = Joi.object({
    device_id: Joi.number().required(),
    index: Joi.number().integer().min(1).max(5).required(),
    isLocked: Joi.boolean().required()
});