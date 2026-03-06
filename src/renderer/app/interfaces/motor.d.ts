///#region motor item interface
export interface MotorItem {
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
  // current_position: number | null;
  // current_position_percentage: number | null;
  // tilting_percentage: number | null;
  tbl_motor: TblMotor;
}

export interface TblMotor {
  device_id: number;
  ip_data: MotorIpData[] | null;
  direction: string | null;
  up_limit: number | null;
  down_limit: number | null;
  up_speed: number | null;
  down_speed: number | null;
  slow_speed: number | null;
  ramp: {
    start_status_up: boolean;
    start_value_up: number;
    start_status_down: boolean;
    start_value_down: number;
    stop_status_up: boolean;
    stop_value_up: number;
    stop_status_down: boolean;
    stop_value_down: number;
  } | null;
  pos_per: number | null;
  pos_pulse: number | null;
  pos_tilt_per: number | null;
  pos_tilt_pulse: number | null;
  app_mode: number | null;
  network_lock: {
    isLocked: boolean;
    priority: number;
  } | null;
  network_config: number[] | null;
  local_ui: {
    status: string;
  } | null;
  move_count: number | null;
  revolution_count: number | null;
  thermal_count: number | null;
  post_thermal_count: number | null;
  obstacle_count: number | null;
  post_obstacle_count: number | null;
  power_cut_count: number | null;
  reset_count: number | null;
  fw_version: string | null;
  network_stats: NetworkStats | null;
  network_error_stats: NetworkErrorStats | null;
}

export interface UpdateMotorPayload {
  motorId: number;
  name: string | null;
}

//#region wink motor payload
export interface WinkMotorPayload {
  device_id: number;
  isACK: boolean;
}

export interface MoveMotorPayload {
  device_id: number;
  direction: "up" | "down";
  duration: number;
  speed: 'up' | 'down' | 'slow';
  isACK: boolean;
}

//#region device type
export type DeviceType = "motor" | "keypad";

//#region motor socket get position response
export interface MotorSocketGetPositionResponse {
  message: string;
  isError: boolean;
  status: string;
  data: {
    ip: number | null;
    position_percentage: number | null;
    position_pulse: number | null;
    tilting_percentage: number | null;
  };
}

//#region move motor to payload
export type MoveFunctionType =
  | "up"
  | "down"
  | "ip"
  | "pos_pulse"
  | "pos_per"
  | "pos_angle_pulse"
  | "curr_pos_angle_pulse"
  | "curr_pos_angle_per";

export interface MotorMoveToPayload {
  device_id: number;
  function_type: MoveFunctionType;
  isACK: boolean;
  value_position?: number;
}

export interface MotorMoveToAllPayload {
  function_type: "up" | "down" | "pos_per";
  value_position?: number;
}

//#region move motor of payload
export type MoveOfFunctionType =
  | "up"
  | "down"
  | "ip_up"
  | "ip_down"
  | "pos_pulse"
  | "jog_down_pulse"
  | "jog_up_pulse"
  | "jog_down_ms"
  | "jog_up_ms"
  | "jog_down_per"
  | "jog_up_per"
  | "tilt_down_deg"
  | "tilt_up_deg"
  | "tilt_down_pulse"
  | "tilt_up_pulse"
  | "tilt_down_per"
  | "tilt_up_per";

export interface MotorMoveOfPayload {
  device_id: number;
  function_type: MoveOfFunctionType;
  isACK: boolean;
  value_position?: number;
}

//#region motor IP payload
export interface MotorIpData {
  index: number;
  pulse: number | null;
  percentage: number | null;
  angle_pulse?: number | null;
  angle_percentage?: number | null;
  angle_degree?: number | null;
}

export type IpFunctionType =
  | "auto"
  | "delete"
  | "curr_pos"
  | "pos_pulse"
  | "pos_per"
  | "curr_pos_angle"
  | "pos_angle_pulse"
  | "pos_pulse_angle_per"
  | "pos_pulse_angle_deg"
  | "pos_per_angle_pulse"
  | "pos_angle_per"
  | "pos_per_angle_deg"
  | "angle_pulse"
  | "angle_per";

export interface MotorIpPayload {
  device_id: number;
  function_type: IpFunctionType;
  ip_index: number;
  value_position?: number;
}

export interface SetMotorLimitPayload {
  device_id: number;
  function_type: "top" | "bottom" | "pulse";
  value_position?: number;
}

export type SpeedType = "up" | "down" | "slow";
export type range = {
  up: { min: number; max: number };
  down: { min: number; max: number };
  slow: { min: number; max: number };
}

export interface SetRollingSpeedPayload {
  device_id: number;
  up: number;
  down: number;
  slow: number;
}

export type rampValuesKey = 'start_up' | 'start_down' | 'stop_up' | 'stop_down';

export interface SetRampTimePayload {
  device_id: number;
  start_up: {
    enabled: boolean;
    value: number;
  },
  start_down: {
    enabled: boolean;
    value: number;
  },
  stop_up: {
    enabled: boolean;
    value: number;
  },
  stop_down: {
    enabled: boolean;
    value: number;
  },
}

export interface SetTiltLimitPayload {
  device_id: number;
  function_type: "initial" | "delete" | "current_pos" | "flat_current_pos" | "jog_up_pulse" | "jog_up_ms" | "pos_pulse";
  value_position?: number;
}

interface NetworkStats {
  maxRetry: number;
  sentFrames: number;
  receivedFrames: number;
  seenFrames: number;
  busy: number;
  maxSlot: number;
  supervisionFailures: number;
}

interface NetworkErrorStats {
  txFailures: number;
  collisions: number;
  rxDataError: number;
  unknownMessage: number;
  messageLengthError: number;
  rxFifoFull: number;
  txFifoFull: number;
  crcError: number;
  bundleSizeError: number;
}