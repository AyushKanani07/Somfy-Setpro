import type { DeviceModel } from "./device.ts";
import type { PostMotorIP } from "./motor.interface.ts";

export const FirmwareStep = {
    SAVE_MOTOR_CONFIG: 'SAVE_MOTOR_CONFIG',
    MOVE_MOTOR_TO_TOP: 'MOVE_MOTOR_TO_TOP',
    PROCESS_NETWORK_COMMANDS: 'PROCESS_NETWORK_COMMANDS',
    GET_IDENTITY: 'GET_IDENTITY',
    PROCESS_READ: 'PROCESS_READ',
    PROCESS_WRITE_ROBUST: 'PROCESS_WRITE_ROBUST',
    PROCESS_ERASE: 'PROCESS_ERASE',
    PROCESS_WRITE: 'PROCESS_WRITE',
    PROCESS_RESTART: 'PROCESS_RESTART',
    GET_APP_VERSION: 'GET_APP_VERSION',
    RESTORE_MOTOR_PARAMETERS: 'RESTORE_MOTOR_PARAMETERS',
    RESTORE_MOTOR_POSITION: 'RESTORE_MOTOR_POSITION',
    CLOSE_PROCESS: 'CLOSE_PROCESS',
    START_OTHER_BOARD: 'START_OTHER_BOARD'
} as const;

export type FirmwareStep =
    typeof FirmwareStep[keyof typeof FirmwareStep];

export interface FirmwareContext {
    deviceId: number;
    fileName: string;
    isBricked: boolean;

    currentStep: FirmwareStep;
    restartStep: FirmwareStep;

    deviceData: DeviceModel;
    command: {
        total: number;
        completed: number;
    };
    firmwareFileVersion?: string;
    decryptedData?: Buffer;
    decryptedData2?: Buffer;

    motorInitPos?: number;
    motorCurrentPos?: number;

    motorIdentity?: MotorIdentity;
    motorWriteCalc?: MotorWriteCalc

    eraseIndex: number;
    writeIndex: number;

    errorMessage?: string;
    cancelled?: boolean;
    isCompleted?: boolean;
    isSecondMotor?: boolean;
}

interface MotorWriteCalc {
    application_area_size: number,
    page_erase_required: number,
    max_page_write_required: number,
    actual_page_write_required: number
}

interface MotorIdentity {
    protocol_version: number;
    no_prog_area: number;
    start_reprogram_area: number;
    end_reprogram_area: number;
    erase_page_size: number;
    write_page_size: number;
    hardware_version: string;
    software_version: string;
    param_start: number;
    param_end: number;
    node_id: number[];
    endianness: number | null;
}


export interface DeviceConfig {
    pos_per: number | null;
    ip_data: PostMotorIP[];
    direction: 'forward' | 'reverse' | null;
    down_limit: number | null;
    app_mode: number | null;
    up_speed: number | null;
    down_speed: number | null;
    slow_speed: number | null;
    ramp: any[];
    network_lock: any[];
    network_config: any[];
    local_ui: any[];
    torque: any[];
    dct_mode: number | null;
    touch_motion_sensitivity: any[];
}