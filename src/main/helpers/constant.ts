import type { NodeType } from "../interface/command.interface.ts";

export const lstNodeType: NodeType[] = [
    { node_id: 0, node_type_name: 'All Devices', type: 'keypad' },
    { node_id: 2, node_type_name: '30 DC', type: 'motor', getSubnode: true },
    { node_id: 5, node_type_name: 'RTS tansmitter', type: 'master' },
    { node_id: 6, node_type_name: 'Glydea-Drape', type: 'keypad' },
    { node_id: 7, node_type_name: 'LSU50AC', type: 'motor' },
    { node_id: 8, node_type_name: 'ST50DC', type: 'motor' },
    { node_id: 9, node_type_name: 'LSU40AC', type: 'motor' },
    { node_id: 10, node_type_name: 'ST40DC', type: 'motor' },
    { node_id: 14, node_type_name: 'DECOFLEX Keypad', type: 'keypad' },
    { node_id: 15, node_type_name: 'Master-RS485', type: 'master' },
];
export const lstSubNodeType = [
    { node_id: 2, sub_node_id: 5063313, hardware_id: 5063280, sub_node_name: '30 DC' },
    { node_id: 2, sub_node_id: 5157730, hardware_id: 5042038, sub_node_name: '30 DC' },
    { node_id: 7, sub_node_id: 5071757, hardware_id: 5069300, sub_node_name: 'LSU50 AC' },
    { node_id: 9, sub_node_id: 5132734, hardware_id: 5144064, sub_node_name: 'LSU40 AC' },
    { node_id: 8, sub_node_id: 5123276, hardware_id: 5114041, sub_node_name: 'ST50 DC' },
    { node_id: 15, sub_node_id: 5102155, hardware_id: 5100906, sub_node_name: 'Setting Tool Rev A/B' },
    { node_id: 15, sub_node_id: 5151114, hardware_id: 5148098, sub_node_name: 'Setting Tool Rev C' },
    { node_id: 6, sub_node_id: 5039367, hardware_id: 5034231, sub_node_name: 'Glydea Ultra' }
];

export const FIRMWARE_HEADER_TYPE = [
    { id: 0x50424C00, content: 'Bootloader data', name: 'bootloader' },
    { id: 0x50424C56, content: 'Bootloader version', name: 'bootloader_version' },
    { id: 0x504B4552, content: 'Kernel data', name: 'kernel' },
    { id: 0x50524653, content: 'Rootfs data', name: 'rootfs' },
    { id: 0x46575600, content: 'Firmware version', name: 'firmware_version' },
    { id: 0x46575601, content: 'Hardware compatibility', name: 'hw_compat' },
    { id: 0x44455A43, content: 'Package description', name: 'description' },
    { id: 0x50415050, content: 'Application', name: 'app' },
    { id: 0x504D4F54, content: 'Motor software', name: 'motor' },
];

export const ST30DC_SUB_NODE_ID = 5063313;
export const QT30DC_SUB_NODE_ID = 5157730;
export const LSU50_SUB_NODE_ID = 5071757;
export const LSU40_SUB_NODE_ID = 5132734;
export const ST50DC_SUB_NODE_ID = 5123276;
export const GLYDEA_SUB_NODE_ID = 5039367;

export const nACK_status_code_map = new Map([
    [0x0, { message: 'ACTION_COMPLETED' }],
    [0x01, { message: 'DATA_ERROR - Value is not within MIN/MAX range' }],
    [0x02, { message: 'WAITING_TIMEOUT' }],
    [0x10, { message: 'UNKNOWN_MESSAGE - Device doesn’t support the message' }],
    [0x11, { message: 'MESSAGE_LENGTH_ERROR - Message length shorter than expected' }],
    [0x20, { message: 'NODE_IS_LOCKED' }],
    [0x21, { message: 'WRONG_POSITION - Current position in not consistent with the order received' }],
    [0x22, { message: 'END_LIMITS_NOT_SET - motor limits are not set' }],
    [0x23, { message: 'IP_NOT_SET - Sent if the IP is not set' }],
    [0x24, { message: 'TARGET_POSITION_OUT_OF_RANGE - Requested position in a CTRL_xxx cannot be reached' }],
    [0x25, { message: 'FEATURE_NOT_SUPPORTED - Device cannot handle the requested function (ex: Tilting in Roller mode)' }],
    [0x26, { message: 'IN_MOTION - Cannot execute order when moving' }],
    [0x27, { message: 'IN_SECURITY - Stopped by thermal protection or obstacle detection' }],
    [0x28, { message: 'LAST_IP_REACHED - Sent in case of CTRL_MOVEOF with next IP down or UP when we are above or below the last IP' }],
    [0x29, { message: 'THRESHOLD_REACHED - Sent if we try to give/reach a value above or below the normal operation range. Not used for position.' }],
    [0x2A, { message: 'LOW_PRIORITY - Sent if the Priority of Request isn’t sufficient.' }],
    [0x2B, { message: 'WINK_IN_PROGRESS' }],
    [0x2C, { message: 'NOT_IN_APP_SETTINGS - Switch to application-specific setting mode to adjust parameters (e.g. Tilting mode to adjust tilting parameters on a Venetian Blind) ' }],
    [0x2D, { message: 'DIAG_NOT_AVAILABLE - Sent if a diag requested by GET_DIAG_BY_ID is not available' }],
    [0x2E, { message: 'POWER_FAIL - Sent if power voltage is not correct' }],
    [0x2F, { message: 'END_LIMIT_SET - Motor limits are partially or totally set and can’t execute command' }],
    [0xFF, { message: 'BUSY – Cannot process message' }]
]);


export const Socket_Events = {
    REQUEST_PORT_STATUS: 'PortStatus',
    ON_PORT_STATUS: 'onPortStatus',
    ON_PORT_ERROR: 'onPortError',
    START_DEVICE_DISCOVERY: 'StartDeviceDiscovery',
    DEVICE_DISCOVERY_INFO: 'DeviceDiscoveryInfo',
    DEVICE_DISCOVERY_PROGRESS: 'DeviceDiscoveryProgress',
    STOP_DEVICE_DISCOVERY: 'StopDeviceDiscovery',
    COMMUNICATION_LOG: 'CommunicationLog',
    GET_MOTOR_POSITION: 'GetMotorPosition',
    POST_MOTOR_POSITION: 'PostMotorPosition',
    START_GROUP_DISCOVERY: 'StartGroupDiscovery',
    STOP_GROUP_DISCOVERY: 'StopGroupDiscovery',
    GROUP_DISCOVERY_INFO: 'GroupDiscoveryInfo',
    GET_KEYPAD_SWITCH_SETTINGS: 'GetKeypadSwitchSettings',
    POST_KEYPAD_SWITCH_SETTINGS: 'PostKeypadSwitchSettings',
    WINK_MOTOR: 'WinkMotor',
    POST_MOTOR_IP: 'PostMotorIp',
    FIRMWARE_UPDATE_INFO: 'FirmwareUpdateInfo',
    FIRMWARE_UPDATE_PROGRESS: 'FirmwareUpdateProgress',
    ON_FIRMWARE_USER_ACTION: 'OnFirmwareUserAction',
    IMPORT_DEVICE_INFO: 'ImportDeviceInfo',
    IMPORT_DEVICES: 'ImportDevices',
    IMPORT_PROGRESS: 'ImportProgress',
    EXPORT_DEVICE_INFO: 'ExportDeviceInfo',
    EXPORT_DEVICES: 'ExportDevices',
    EXPORT_PROGRESS: 'ExportProgress',
    DECODE_COMMAND_FRAME: 'DecodeCommandFrame',
    ON_DECODE_COMMAND_FRAME: 'OnDecodeCommandFrame',
    ENCODE_COMMAND_FRAME: 'EncodeCommandFrame',
    ON_ENCODE_COMMAND_FRAME: 'OnEncodeCommandFrame',
    SEND_COMMAND_FRAME: 'SendCommandFrame',
    ON_SEND_COMMAND_FRAME: 'OnSendCommandFrame',
    KEYPAD_DISCOVERY_INFO: 'KeypadDiscoveryInfo',
    START_KEYPAD_DISCOVERY: 'StartKeypadDiscovery',
    STOP_KEYPAD_DISCOVERY: 'StopKeypadDiscovery',
    ON_POST_CHANNEL_STATUS: 'OnPostChannelStatus',

}

export const OFFLINE_SUPPORTED_COMMANDS = [
    "CTRL_MOVEOF", "SET_MOTOR_IP", "SET_FACTORY_DEFAULT", "SET_MOTOR_IP",
    "CTRL_MOVETO", "SET_GROUP_ADDR", "SET_APP_MODE", "SET_MOTOR_DIRECTION",
    "SET_MOTOR_ROLLING_SPEED", "SET_MOTOR_SOFT_START_STOP", "SET_LOCAL_UI",
    "SET_NETWORK_LOCK", "SET_NODE_LABEL"
]