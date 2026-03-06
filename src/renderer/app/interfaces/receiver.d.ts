
export interface ReceiverItem {
    device_id: number;
    room_id: number | null;
    name: string;
    address: number;
    device_type: DeviceType;
    model_no: number;
    is_limit_set: boolean;
    group_count: number;
    sub_node_id: number;
    disp_order: number | null;
    firmware_version: string | null;
    channelConfigData: ChannelConfigData[];
}

export interface ChannelConfigData {
    index: number;
    config: boolean;
}