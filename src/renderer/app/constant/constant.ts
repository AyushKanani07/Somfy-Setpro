export interface SubNodeType {
  node_id: number;
  key?: 'qt_30' | 'st_30' | 'lsu_50_ac' | 'lsu_40_ac' | 'st_50_dc' | 'rs485_setting_tool' | 'glydea';
  sub_node_id: number;
  hardware_id: number;
  sub_node_name: string;
}

export interface NodeType {
  node_id: number;
  key?: '30_dc' | 'glydea' | 'lsu_50_ac' | 'lsu_40_ac' | 'st_50_dc' | 'st_40_dc' | 'all' | 'rts_transmitter' | 'rts_receiver' | 'decoflex_keypad' | 'rs485_setting_tool';
  node_type_name: string;
  type: string;
  key_count?: number;
}

export interface KeypadConfigLst {
  id: number,
  name: string;
}

export const environment = {
  production: import.meta.env.VITE_PRODUCTION === "true",
  environment: import.meta.env.VITE_ENVIRONMENT,
  schema_version: Number(import.meta.env.VITE_SCHEMA_VERSION)
};

export const SELECTED_PROJECT_KEY = "selectedProjectId";

export const ICON_FILL_COLOR = "#808080";

export const ICON_WARNING_FILL_COLOR = "#f59e0b";

export const lstNodeType: NodeType[] = [
  { node_id: 0, key: 'all', node_type_name: "All Devices", type: "keypad" },
  { node_id: 2, key: '30_dc', node_type_name: "30 DC", type: "motor" },
  { node_id: 5, key: 'rts_transmitter', node_type_name: "RTS tansmitter", type: "master" },
  { node_id: 6, key: 'glydea', node_type_name: "Glydea", type: "motor" },
  { node_id: 7, key: 'lsu_50_ac', node_type_name: "LSU50AC", type: "motor" },
  { node_id: 8, key: 'st_50_dc', node_type_name: "ST50DC", type: "motor" },
  { node_id: 9, key: 'lsu_40_ac', node_type_name: "LSU40AC", type: "motor" },
  { node_id: 10, key: 'st_40_dc', node_type_name: "ST40DC", type: "motor" },
  { node_id: 13, key: 'rts_receiver', node_type_name: "RTS Receiver", type: "motor" },
  { node_id: 14, key: 'decoflex_keypad', node_type_name: "DECOFLEX Keypad", type: "keypad" },
  { node_id: 15, key: 'rs485_setting_tool', node_type_name: "RS485 Setting Tool", type: "master" },
];

export const lstSubNodeType: SubNodeType[] = [
  {
    node_id: 2,
    key: 'st_30',
    sub_node_id: 5063313,
    hardware_id: 5063280,
    sub_node_name: "30 DC",
  },
  {
    node_id: 2,
    key: 'qt_30',
    sub_node_id: 5157730,
    hardware_id: 5042038,
    sub_node_name: "30 DC",
  },
  {
    node_id: 7,
    key: 'lsu_50_ac',
    sub_node_id: 5071757,
    hardware_id: 5069300,
    sub_node_name: "LSU50 AC",
  },
  {
    node_id: 9,
    key: 'lsu_40_ac',
    sub_node_id: 5132734,
    hardware_id: 5144064,
    sub_node_name: "LSU40 AC",
  },
  {
    node_id: 8,
    key: 'st_50_dc',
    sub_node_id: 5123276,
    hardware_id: 5114041,
    sub_node_name: "ST50 DC",
  },
  {
    node_id: 15,
    key: 'rs485_setting_tool',
    sub_node_id: 5102155,
    hardware_id: 5100906,
    sub_node_name: "Setting Tool Rev A/B",
  },
  {
    node_id: 15,
    key: 'rs485_setting_tool',
    sub_node_id: 5151114,
    hardware_id: 5148098,
    sub_node_name: "Setting Tool Rev C",
  },
  {
    node_id: 6,
    key: 'glydea',
    sub_node_id: 5039367,
    hardware_id: 5034231,
    sub_node_name: "Glydea Ultra",
  },
];

export const SOCKET_COMMAND = {
  DEVICE_DISCOVERY: {
    START: "StartDeviceDiscovery",
    STOP: "StopDeviceDiscovery",
    INFO: "DeviceDiscoveryInfo",
    PROGRESS: "DeviceDiscoveryProgress",
  },

  MOTOR_ACTIONS: {
    GET_MOTOR_POSITION: "GetMotorPosition",
    POST_MOTOR_POSITION: "PostMotorPosition",
    POST_MOTOR_IP: "PostMotorIp",
  },

  GROUP_DISCOVERY: {
    START: 'StartGroupDiscovery',
    STOP: 'StopGroupDiscovery',
    INFO: 'GroupDiscoveryInfo'
  },

  COM_PORT: {
    REQUEST_PORT_STATUS: 'PortStatus',
    ON_PORT_STATUS: 'onPortStatus',
  },

  KEYPAD_DISCOVERY: {
    START: "StartKeypadDiscovery",
    STOP: "StopKeypadDiscovery",
    INFO: "KeypadDiscoveryInfo",
  },

  FIRMWARE_UPDATE: {
    INFO: "FirmwareUpdateInfo",
    PROGRESS: "FirmwareUpdateProgress",
    USER_ACTION: "OnFirmwareUserAction",
    ON_USER_ACTION: "OnFirmwareUserAction",
  },

  EXPORT: {
    EXPORT_DEVICE_INFO: 'ExportDeviceInfo',
    EXPORT_DEVICES: 'ExportDevices',
    EXPORT_PROGRESS: 'ExportProgress',
  },
  IMPORT: {
    IMPORT_DEVICE_INFO: 'ImportDeviceInfo',
    IMPORT_DEVICES: 'ImportDevices',
    IMPORT_PROGRESS: 'ImportProgress',
  },

  RECEIVER: {
    ON_POST_CHANNEL_STATUS: 'OnPostChannelStatus',
  },

  COMMUNICATION_LOG: {
    COMMUNICATION_LOG: 'CommunicationLog',
    SEND_COMMAND_FRAME: 'SendCommandFrame',
    ON_SEND_COMMAND_FRAME: 'OnSendCommandFrame',
    DECODE_COMMAND_FRAME: 'DecodeCommandFrame',
    ON_DECODE_COMMAND_FRAME: 'OnDecodeCommandFrame',
    ENCODE_COMMAND_FRAME: 'EncodeCommandFrame',
    ON_ENCODE_COMMAND_FRAME: 'OnEncodeCommandFrame',
  }
};

export const DEVICE_MOTOR_LIMIT = 65535;

export const keypadConfigLst: KeypadConfigLst[] = [
  { id: 0x1, name: "Up" },
  { id: 0x2, name: "Down" },
  { id: 0x3, name: "Stop" },
  { id: 0x4, name: "Go To IP#" },
  { id: 0x5, name: "Next IP Up" },
  { id: 0x6, name: "Next IP Down" },
  { id: 0x8, name: "Go To Pulse#" },
  { id: 0x0A, name: "Jog Up X 10 ms" },
  { id: 0x0B, name: "Jog Down X 10 ms" },
  { id: 0x0C, name: "Jog Up Pulse" },
  { id: 0x0D, name: "Jog Down Pulse" },
  { id: 0x10, name: "Go To %" },
  { id: 0x20, name: "Lock @ Current" },
  { id: 0x21, name: "Lock @ Up" },
  { id: 0x22, name: "Lock @ Down" },
  { id: 0x23, name: "Lock @ IP#" },
  { id: 0x24, name: "Unlock" },
  { id: 0x25, name: "Set IP#" },
  { id: 0x11, name: "Group" },
];


// Predefined keypad templates as JSON objects
export const predefinedSchemas = [
  {
    name: '6-Button - 25/50/75+STOP+DOWN+UP',
    // name: '6-Button: 25%, 50%, 75%, STOP, DOWN, UP',
    keypad_data: [
      { id: 1, press_command: 0x10, press_value: 25, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 2, press_command: 0x10, press_value: 50, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 3, press_command: 0x10, press_value: 75, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 4, press_command: 0, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 5, press_command: 0, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 6, press_command: 0x03, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 7, press_command: 0x02, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 8, press_command: 0x01, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 }
    ],
    individualSwitchGroup: ['000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000']
  },
  {
    name: '6-Button - 15/50/85+STOP+DOWN+UP',
    // name: '6-Button: 15%, 50%, 85%, STOP, DOWN, UP',
    keypad_data: [
      { id: 1, press_command: 0x10, press_value: 15, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 2, press_command: 0x10, press_value: 50, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 3, press_command: 0x10, press_value: 85, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 4, press_command: 0, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 5, press_command: 0, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 6, press_command: 0x03, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 7, press_command: 0x02, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 8, press_command: 0x01, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 }
    ],
    individualSwitchGroup: ['000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000']
  },
  {
    name: '8-Button - 20/40/50/60/80+STOP+DOWN+UP',
    // name: '8-Button: 20%, 40%, 50%, 60%, 80%, STOP, DOWN, UP',
    keypad_data: [
      { id: 1, press_command: 0x10, press_value: 20, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 2, press_command: 0x10, press_value: 40, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 3, press_command: 0x10, press_value: 50, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 4, press_command: 0x10, press_value: 60, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 5, press_command: 0x10, press_value: 80, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 6, press_command: 0x03, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 7, press_command: 0x02, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 8, press_command: 0x01, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 }
    ],
    individualSwitchGroup: ['000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000']
  },
  {
    name: '8-Button - 20/35/50/65/80+STOP+DOWN+UP',
    // name: '8-Button: 20%, 35%, 50%, 65%, 80%, STOP, DOWN, UP',
    keypad_data: [
      { id: 1, press_command: 0x10, press_value: 20, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 2, press_command: 0x10, press_value: 35, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 3, press_command: 0x10, press_value: 50, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 4, press_command: 0x10, press_value: 65, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 5, press_command: 0x10, press_value: 80, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 6, press_command: 0x03, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 7, press_command: 0x02, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 },
      { id: 8, press_command: 0x01, press_value: 0, press_extra_value: 0, press_target_addr: '', press_addr_code: 2, hold_command: 0, hold_value: 0, hold_extra_value: 0, hold_target_addr: '', hold_addr_code: 2, release_command: 0, release_value: 0, release_extra_value: 0, release_target_addr: '', release_addr_code: 2 }
    ],
    individualSwitchGroup: ['000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000']
  }
] as const;

export const RAMPS_TYPE = [
  { id: 0, name: 'Both, Soft Start and Soft Stop in up & down direction' },
  { id: 1, name: 'Soft Start only in up & down direction' },
  { id: 2, name: 'Soft Stop only in up & down direction' },
  { id: 3, name: 'Both, Soft Start and Soft Stop in up direction' },
  { id: 4, name: 'Soft Start only in up direction' },
  { id: 5, name: 'Soft Stop only in up direction' },
  { id: 6, name: 'Both, Soft Start and Soft Stop in down direction' },
  { id: 7, name: 'Soft Start only in down direction' },
  { id: 8, name: 'Soft Stop only in down direction' },
];

export const TILT_LIMITS = [
  { id: 0, name: 'Delete all tilt values' },
  { id: 1, name: 'Set Tilt limit at current position' },
  { id: 2, name: 'Set Tilt limit at specified position from DEL in pulses' },
  { id: 3, name: 'Set Tilt flat position at current position' },
  { id: 4, name: 'Jog UP (in pulses)' },
  { id: 5, name: 'Jog UP (in ms)' },
  { id: 6, name: 'Set Tilt range in pulses' },
  { id: 7, name: 'Set Upward backlash (in pulses)' },
  { id: 8, name: 'Set Downward backlash (in pulses)' },
  { id: 9, name: 'Set Upward backlash (in ms)' },
  { id: 10, name: 'Set Downward backlash (in ms)' },
  { id: 11, name: 'Set Min angle (in degrees)' },
  { id: 12, name: 'Set Max angle (in degrees)' },
  { id: 16, name: 'SET_START_TILTING' },
  { id: 17, name: 'CANCEL_ADJUSTMENT' },
];

export const AllCommandsLst = [
  "GET_NODE_ADDR",
  "GET_MOTOR_LIMITS",
  "GET_NODE_LABEL",
  "GET_NODE_APP_VERSION",
  "GET_MOTOR_ROLLING_SPEED",
  "GET_MOTOR_SOFT_START_STOP",
  "GET_NETWORK_LOCK",
  "GET_NETWORK_CONFIG",
  "DIAG_GET_TOTAL_MOVE_COUNT",
  "DIAG_POST_TOTAL_MOVE_COUNT",
  "DIAG_GET_TOTAL_REV_COUNT",
  "DIAG_POST_TOTAL_REV_COUNT",
  "DIAG_GET_THERMAL_COUNT",
  "DIAG_POST_THERMAL_COUNT",
  "DIAG_GET_OBSTACLE_COUNT",
  "DIAG_POST_OBSTACLE_COUNT",
  "DIAG_GET_POWER_COUNT",
  "DIAG_POST_POWER_COUNT",
  "DIAG_GET_RESET_COUNT",
  "DIAG_POST_RESET_COUNT",
  "GET_NETWORK_STAT",
  "GET_NETWORK_ERROR_STAT",
  "GET_MOTOR_DIRECTION",
  "GET_MOTOR_IP",
  "GET_LOCAL_UI",
  "GET_GROUP_ADDR",
  "POST_GROUP_ADDR",
  "GET_FACTORY_DEFAULT",
  "GET_APP_MODE",
  "SET_APP_MODE",
  "SET_MOTOR_LIMITS",
  "SET_MOTOR_DIRECTION",
  "SET_MOTOR_ROLLING_SPEED",
  "SET_MOTOR_TILTING_SPEED",
  "SET_MOTOR_IP",
  "SET_NETWORK_LOCK",
  "SET_LOCAL_UI",
  "SET_TILT_LIMITS",
  "SET_FACTORY_DEFAULT",
  "SET_NODE_DISCOVERY",
  "SET_GROUP_ADDR",
  "SET_NODE_LABEL",
  "SET_NETWORK_CONFIG",
  "SET_NETWORK_STAT",
  "SET_MOTOR_SOFT_START_STOP",
  "CTRL_MOVE",
  "CTRL_STOP",
  "CTRL_MOVETO",
  "CTRL_MOVEOF",
  "CTRL_WINK",
  "CTRL_NETWORK_LOCK",
  "GET_MOTOR_POSITION",
  "POST_MOTOR_POSITION",
  "POST_MOTOR_STATUS",
  "POST_APP_MODE",
  "POST_MOTOR_LIMITS",
  "POST_MOTOR_DIRECTION",
  "POST_MOTOR_ROLLING_SPEED",
  "POST_MOTOR_TILTING_SPEED",
  "POST_MOTOR_IP",
  "POST_NETWORK_LOCK",
  "POST_LOCAL_UI",
  "POST_TILT_LIMITS",
  "POST_FACTORY_DEFAULT",
  "POST_NODE_ADDR",
  "POST_NODE_LABEL",
  "POST_NETWORK_CONFIG",
  "POST_NODE_SERIAL_NUMBER",
  "POST_NETWORK_ERROR_STAT",
  "POST_NETWORK_STAT",
  "POST_NODE_STACK_VERSION",
  "POST_NODE_APP_VERSION",
  "POST_MOTOR_SOFT_START_STOP",
  "ACK",
  "nACK"
];
