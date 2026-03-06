export interface TransmitterItem {
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
    sun_mode: "on" | "off" | null;
    dct_lock: dctLockData[] | null;
    channelData: ChannelData[];
}

export interface dctLockData {
    index: number;
    isLocked: boolean;
}

export interface ChannelData {
    channel_no: number;
    rts_address?: string;
    frequency_mode?: "us" | "ce";
    application_mode?: "rolling" | "tilting";
    feature_set_mode?: "modulis" | "normal";
    tilt_frame_us?: number;
    tilt_frame_ce?: number;
    dim_frame?: number;
}

export type ControlPositionFunctionType = "up" | "down" | "stop" | "ip";