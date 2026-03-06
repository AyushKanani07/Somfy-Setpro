export interface DeviceModel {
    device_id: number;
    name: string;
    address: string;
    device_type: string;
    model_no: number;
    sub_node_id: number;
}

export interface DeviceResponse {
    id: number;
    name: string;
    address: string;
    type: string;
    model_no: number;
    sub_node_id: number;
    child: DeviceResponse[];
}