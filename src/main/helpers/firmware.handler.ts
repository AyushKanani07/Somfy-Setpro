import { FirmwareStep } from "../interface/firmware.interface.ts";

export const STEP_HANDLERS: Record<
    FirmwareStep,
    string
> = {
    [FirmwareStep.SAVE_MOTOR_CONFIG]: 'saveMotorConfig',
    [FirmwareStep.MOVE_MOTOR_TO_TOP]: 'moveMotorToTop',
    [FirmwareStep.PROCESS_NETWORK_COMMANDS]: 'processNetworkCommands',
    [FirmwareStep.GET_IDENTITY]: 'getIdentity',
    [FirmwareStep.PROCESS_READ]: 'processRead',
    [FirmwareStep.PROCESS_WRITE_ROBUST]: 'processWriteRobust',
    [FirmwareStep.PROCESS_ERASE]: 'processErase',
    [FirmwareStep.PROCESS_WRITE]: 'processWrite',
    [FirmwareStep.PROCESS_RESTART]: 'processRestart',
    [FirmwareStep.GET_APP_VERSION]: 'getAppVersion',
    [FirmwareStep.RESTORE_MOTOR_PARAMETERS]: 'restoreMotorParameters',
    [FirmwareStep.RESTORE_MOTOR_POSITION]: 'restoreMotorPosition',
    [FirmwareStep.CLOSE_PROCESS]: 'closeProcess',
    [FirmwareStep.START_OTHER_BOARD]: 'startOtherBoard'
};