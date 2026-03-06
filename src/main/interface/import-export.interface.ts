import type { IndividualSwitchGroup, SwitchSettings } from "./keypad.interface.ts";

type CommandStatus = 'success' | 'failed' | 'pending' | 'n/a';


export interface ExportDeviceContext {
    device_id: number;
    device_type: string;
    name: string;
    address: string;
    model_no: number;
    sub_node_id: number;
    status: {
        ip: CommandStatus;
        group: CommandStatus;
        setting: CommandStatus;
    }
}

export interface ImportDeviceContext extends ExportDeviceContext {
}

export interface motorDataObj {
    pos_per: number | null;
    direction: string | null;
    app_mode: number | null;
    down_limit: number | null;
    up_speed: number | null;
    down_speed: number | null;
    slow_speed: number | null;
    ramp: number[];
    network_lock: number[];
    network_config: number[];
    local_ui: number[];
    torque: number[];
    dct_mode: number | null;
    touch_motion_sensitivity: number[];
}

export interface keypadDataObj {
    keypad_data: SwitchSettings[];
    individual_switch_group: IndividualSwitchGroup;
}

type jobStatus = 'running' | 'pause' | 'close' | 'complete';
export interface ImportExportJob {
    status: jobStatus;
    currentIndex: number;
    devices: ImportDeviceContext[] | ExportDeviceContext[];
}