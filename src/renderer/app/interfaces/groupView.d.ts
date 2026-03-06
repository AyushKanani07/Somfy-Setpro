export interface GroupData {
  group_id: number;
  name: string;
  address: string;
  disp_order: number | null;
}

export interface GroupDeviceData {
  group_device_map_id: number;
  group_id: number;
  device_id: number;
  device_group_pos: number;
  tbl_group: {
    group_id: number;
    name: string;
    address: string;
  };
  tbl_device: {
    device_id: number;
    name: string;
    address: string;
    model_no: number;
    device_type: "motor" | "keypad";
  };
}

export interface CreateMutipleDevice {
  group_id: number;
  device_id: number[];
}

export interface DeleteGroupDevice {
  group_id: number;
  device_id: number;
}

export interface GroupScanningInfo {
  message: string;
  status: 'error' | 'start' | 'progress' | 'stopped' | 'completed'
}

export interface groupDeviceData {
  index: number;
  address: string;
  name: string;
  group_id: number;
}

export interface Group {
    group_id?: number,
    name: string;
    address: string;
}