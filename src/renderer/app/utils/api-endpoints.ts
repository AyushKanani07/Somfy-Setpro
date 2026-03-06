export const API_ENDPOINTS = {
  PROJECT: {
    BASE: "/project",
    IMPORT: "/project/import",
    IMPORT_START: "/project/import/start",
    IMPORT_RETRY: "/project/import/retry",
    IMPORT_CLOSE: "/project/import/close",
    UPDATE_LAST_OPENED: "/project/update-last-opened",
    DASHBOARD_COUNT: "/project/dashboard/count",
    LAST_GROUP_ADDRESS: "/project/last-group-address",
    FIRMWARE_FILE: "/project/firmware/file",
    FIRMWARE_UPDATE: "/project/firmware/update",
    PROJECT_EXPORT: "/project/export",
    EXPORT_START: "/project/export/start",
    EXPORT_CLOSE: "/project/export/close",
    EXPORT_PAUSE: "/project/export/pause",
    EXPORT_RESUME: "/project/export/resume",
    EXPORT_RETRY: "/project/export/retry",
  },

  DEVICE: {
    BASE: "/device",
    GET_ALL_CLONE: "/device/get-all-clone",
    UNASSIGNED_DEVICES: "/device/unassigned",
    ASSIGNED_DEVICES: "/device/assigned",
    DELETE_UNASSIGNED_DEVICES: "/keypad/unassigned",
    APP_VERSION: "/device/app-version",
    FIRMWARE_VERSION: "/device/firmware-version",
    STACK_VERSION: "/device/stack-version",
  },

  COMPORT: {
    BASE: "/com-port",
    CONNECT: "/com-port/connect",
    DISCONNECT: "/com-port/disconnect",
  },

  FLOOR: {
    BASE: "/floor",
    CREATE_MULTIPLE: "/floor/multiple",
  },

  ROOM: {
    BASE: "/room",
    CREATE_MULTIPLE: "/room/multiple",
  },

  LOG: {
    COMMUNICATION_LOG: "/communication-log",
    COUNT: "/communication-log/count",
  },

  OFFLINE_COMMAND: {
    BASE: "/offline-command",
    EXECUTE: "/offline-command/execute",
  },

  MOTOR: {
    BASE: "/motor",
    MOTOR_ASSIGN: "/motor/assign",
    MOTOR_BY_ROOM: "/motor/by-room",
  },

  MOTOR_ACTION: {
    BASE: "/motor-action",
    WINK: "/motor-action/wink",
    WINK_ALL: "/motor-action/wink-all",
    MOTOR_MOVE: "/motor-action/move",
    MOTOR_MOVE_TO: "/motor-action/move-to",
    MOTOR_MOVE_TO_ALL: "/motor-action/move-to-all",
    MOTOR_MOVE_OF: "/motor-action/move-of",
    STOP_MOTOR: "/motor-action/stop",
    STOP_ALL: "/motor-action/stop-all",

    MOTOR_IP: "/motor-action/ip",
    SET_MOTOR_IP: "/motor-action/ip",
    ERASE_ALL_MOTOR_IPS: "/motor-action/erase-all-ip",
    AUTO_GENERATE_IPS: "/motor-action/ip-auto",

    MOTOR_LABEL: "/motor-action/label",
    MOTOR_LIMIT: "/motor-action/limit",
    MOTOR_POSITION: "/motor-action/position",
    MOTOR_DIRECTION: "/motor-action/direction",
    MOTOR_TILT_LIMIT: "/motor-action/tilt-limit",

    APP_MODE: "/motor-action/app-mode",
    LED_STATUS: "/motor-action/led-status",
    NETWORK_LOCK: "/motor-action/network-lock",

    ROLLING_SPEED: "/motor-action/rolling-speed",
    DEFAULT_ROLLING_SPEED: "/motor-action/default-rolling-speed",

    RAMP_TIME: "/motor-action/ramp-time",
    DEFAULT_RAMP_TIME: "/motor-action/default-ramp-time",

    RESET_MOTOR_LIMITS: "/motor-action/reset-motor-limits",
    FACTORY_RESET: "/motor-action/factory-reset",

    DIAG_MOVE_COUNT: "/motor-action/diag-move-count",
    DIAG_REV_COUNT: "/motor-action/diag-rev-count",
    DIAG_THERMAL_COUNT: "/motor-action/diag-thermal-count",
    DIAG_OBSTACLE_COUNT: "/motor-action/diag-obstacle-count",
    DIAG_POWER_COUNT: "/motor-action/diag-power-count",
    DIAG_RESET_COUNT: "/motor-action/diag-reset-count",

    NETWORK_STAT: "/motor-action/network-stat",
    NETWORK_ERROR_STAT: "/motor-action/network-error-stat",
    NETWORK_RESET: "/motor-action/network-reset",
  },

  GROUP: {
    BASE: "/group",
    WINK_GROUP: "/group/wink",
    MOVE_TO: "/group/move-to",
    STOP: "/group/stop",
  },

  GROUP_DEVICE: {
    BASE: "/group-device",
    ALL: "/group-device/all",
    DELETE: "/group-device/delete",
    CREATE: "/group-device/create/multiple",
  },

  KEYPAD: {
    BASE: "/keypad",
    KEYPAD_UNASSIGNED: "/keypad/unassigned",
    RESET: "/keypad/reset",
    TYPE: "/keypad/type",
    SWITCH_SETTING: "/keypad/switch-setting",
    CONFIG_SCHEMA: "/keypad/config/schema",
    SWITCH_GROUP: "/keypad/switch-group",
  },

  TRANSMITTER: {
    BASE: "/transmitter",
    CHANNEL: "/transmitter/channel",
    OPEN_PROG: "/transmitter/open-prog",
    RTS_ADDRESS: "/transmitter/rts-address",
    GET_RTS_ADDRESS: "/transmitter/get-rts-address",
    CHANNEL_MODE: "/transmitter/channel-mode",
    GET_CHANNEL_MODE: "/transmitter/get-channel-mode",
    TILT_FRAME_COUNT: "/transmitter/tilt-frame-count",
    GET_TILT_FRAME_COUNT: "/transmitter/get-tilt-frame-count",
    DIM_FRAME_COUNT: "/transmitter/dim-frame-count",
    GET_DIM_FRAME_COUNT: "/transmitter/get-dim-frame-count",
    SUN_MODE: "/transmitter/sun-mode",
    CONTROL_POSITION: "/transmitter/control-position",
    IP: "/transmitter/ip",
    TILT: "/transmitter/tilt",
    DIM: "/transmitter/dim",
    DCT_LOCK: "/transmitter/dct-lock",
  },

  RECEIVER: {
    BASE: "/receiver",
    FACTORY_RESET: "/receiver/factory-reset",
    CHANNEL_STATUS: "/receiver/channel-status",
    ALL_CHANNEL_STATUS: "/receiver/all-channel-status",
    REMOVE_ALL_CHANNELS: "/receiver/remove-all-channels",
  },

  REPORT: {
    BASE: "/report",
    COMMUNICATION_LOG: "/report/communication-log",
  }
};
