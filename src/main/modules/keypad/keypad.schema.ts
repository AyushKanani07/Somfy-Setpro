import { Joi } from 'celebrate';

export const keypad_schema = Joi.object().keys({
    name: Joi.string().allow(null),
    address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
    key_count: Joi.number().required().allow(8, 6),
});
export const unassigned_schema = Joi.object().keys({
    name: Joi.string().allow(null),
    address: Joi.string().regex(/^[0-9A-F]{6}/).required(),
    key_count: Joi.number().required().allow(8, 6),
});
export const bulk_update_schema = Joi.array().items(Joi.object().keys({
    key_no: Joi.number().required().allow("", null),
    target_address: Joi.string().required().allow("", null),
    operation_type: Joi.string().required(),
    addr_code: Joi.string().required().allow('0', '128', '1', '2', '64', '192', '65', '66', "", null),
    press_command: Joi.number().required().allow("", null),
    press_value: Joi.number().required().allow("", null),
    press_extra_value: Joi.number().required().allow("", null),
    hold_command: Joi.number().required().allow("", null),
    hold_value: Joi.number().required().allow("", null),
    hold_extra_value: Joi.number().required().allow("", null),
    release_command: Joi.number().required().allow("", null),
    release_value: Joi.number().required().allow("", null),
    release_extra_value: Joi.number().required().allow("", null),
    group_address: Joi.string().required().allow("", null),
}));
export const updateSchema = Joi.object().keys({
    name: Joi.string().allow(null),
    // room_id: Joi.number().allow(null),
    key_count: Joi.number().required(),
});

export const switch_settings_schema = Joi.object().keys({
    keypad_id: Joi.number().required(),
    switch_data: Joi.object().keys({
        id: Joi.number().required(),
        press_command: Joi.number().required(),
        press_value: Joi.number().required(),
        press_extra_value: Joi.number().required(),
        press_addr_code: Joi.number().required(),
        press_target_addr: Joi.string().required(),
        hold_command: Joi.number().required(),
        hold_value: Joi.number().required(),
        hold_extra_value: Joi.number().required(),
        hold_addr_code: Joi.number().required(),
        hold_target_addr: Joi.string().required(),
        release_command: Joi.number().required(),
        release_value: Joi.number().required(),
        release_extra_value: Joi.number().required(),
        release_addr_code: Joi.number().required(),
        release_target_addr: Joi.string().required(),
    }).required(),
});

export const get_switch_setting_schema = Joi.object().keys({
    keypad_id: Joi.number().required(),
    button_id: Joi.number().required(),
});

export const set_individual_switch_group_schema = Joi.object().keys({
    keypad_id: Joi.number().required(),
    group_addresses: Joi.object().keys({
        sw1_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw2_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw3_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw4_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw5_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw6_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw7_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
        sw8_group_addr: Joi.string().regex(/^[0-9A-F]{6}/).required(),
    })
});

export const set_keypad_type_schema = Joi.object().keys({
    keypad_id: Joi.number().required(),
    type: Joi.number().required()
});