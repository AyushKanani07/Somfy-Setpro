export interface DeviceIP {
  index: number;
  pulse: number;
}

export interface DeviceGroup {
  index: number;
  address: string;
}

export interface Device {
  id: number;
  device_id: number;
  room_id: number;
  device_type: string; // "motor"
  address: string;
  name: string | null; // "" or null
  model_no: number;
  cur_pos: number;
  sub_node_id: number;
  sub_node_name: string; // added dynamically
  model_name?: string; // added dynamically
  direction: number; // 0 / 1
  app_mode: number;
  down_limit: number;
  up_limit: number;

  speed: number[]; // [25,25,15]
  ip: DeviceIP[]; // array of {index,pulse}
  group: DeviceGroup[]; // array of {index,address}

  ramp: number[]; // [0,150,0,150]
  network_lock: number[]; // [0,0,0,0,0]
  network_config: number[]; // [1,0,0,0,0,0]

  local_ui: any[]; // unknown structure
  torque: number[]; // [1,0]

  dct_mode: number;
  touch_motion_sensitivity: any[]; // unknown structure

  identity: any | null;
  keypad_data: any[];
  individual_switch_group: any[];
  channel: any[];

  is_limit_set: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface DeviceScanningInfo {
  message: string;
  new_device?: SocketNewMotor;
  count?: number;
  device_id?: number;
  address?: string;
  limit?: {
    down_limit: number;
    up_limit: number;
  };
  label?: string;
  totalMotors?: number;
  status: DeviceScanningInfoStatus;
}

export interface SocketNewMotor {
  address: string;
  device_id: number;
  model_no: number;
  sub_node_id: number;
}

export type DeviceScanningInfoStatus =
  | "error"
  | "start"
  | "completed"
  | "progress"
  | "new_device"
  | "stopped"
  | "motor_limit"
  | "device_label";

export interface DeviceScanningProgress {
  progress: number;
  message: string;
}
