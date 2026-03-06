export interface SetSwitchAdd {
    address: string;
}

export interface SwitchSettings {
    id: number;
    press_command: number;
    press_value: number;
    press_extra_value: number;
    press_addr_code: number;
    press_target_addr: string;
    hold_command: number;
    hold_value: number;
    hold_extra_value: number;
    hold_addr_code: number;
    hold_target_addr: string;
    release_command: number;
    release_value: number;
    release_extra_value: number;
    release_addr_code: number;
    release_target_addr: string;
}

export interface IndividualSwitchGroup {
    sw1_group_addr: string;
    sw2_group_addr: string;
    sw3_group_addr: string;
    sw4_group_addr: string;
    sw5_group_addr: string;
    sw6_group_addr: string;
    sw7_group_addr: string;
    sw8_group_addr: string;
}

export interface PostFirmwareVersion {
    major_version: number;
    minor_version: number;
}

export type SwitchSettingType = 'up' | 'down' | 'stop' | 'go_to_ip' | 'next_ip_up' | 'next_ip_down' | 'go_to_pulse' | 'jog_up_ms' | 'jog_down_ms' | 'jog_up_pulse' | 'jog_down_pulse' | 'go_to_per' | 'lock_curr' | 'lock_up' | 'lock_down' | 'lock_ip' | 'unlock' | 'set_ip' | 'group';

export interface SetSwitchData {
    selected_entity: string;
    operation_type: 'sequence' | 'normal';
    button_id: number;
    device_id: number;
    group_id: number;
    cmd_press_data: keypadCommandData;
    cmd_hold_data: keypadCommandData;
    cmd_release_data: keypadCommandData;
}

export interface keypadCommandData {
    command: SwitchSettingType;
    value: number;
    priority: number;
}
