export interface keypadScanningInfo {
    message: string;
    data?: discoverKeypadData;
    status: 'start' | 'stop' | 'error' | 'discover'
}

export interface discoverKeypadData {
    address: string;
    name: string;
    key_count: number;
}

export interface KeypadDataForEdit {
    device_id: number;
    name: string;
    address: string;
    key_count: number;
}

export interface KeypadItem {
    device_id: number;
    room_id: number | null;
    name: string;
    address: number;
    device_type: DeviceType;
    model_no: number;
    key_count: number | null;
    is_limit_set: boolean;
    group_count: number;
    sub_node_id: number;
    disp_order: number | null;
    firmware_version: string | null;
    app_version: string | null;
    stack_version: string | null;
    keypadData: KeypadData[];
}

export interface KeypadData {
    device_id: number;
    key_no: number;
    target_address: string;
    operation_type: string;
    addr_code: number;
    press_command: number;
    press_value: number;
    press_extra_value: number;
    hold_command: number;
    hold_value: number;
    hold_extra_value: number;
    release_command: number;
    release_value: number;
    release_extra_value: number;
    group_address: string;
}

export interface MotorByRoomWise {
    room_name: string;
    device: Device[]
}
export interface Device {
    id: number | string;
    name: string;
    address: string;
}

export interface KeypadActionDetail {
    id: number;
    name: string;
    selected: boolean;
    target_address: string;
    on_press: string;
    on_press_action: string;
    on_hold: string;
    on_hold_action: string;
    on_release: string;
    on_release_action: string;
    target_name: string;
    target_type: string;
    sequence: boolean;
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

export interface ConfigSchema {
    [x: string]: any;
    name: string;
    individualSwitchGroup: string[];
    keypad_data: SwitchSettings[];
}