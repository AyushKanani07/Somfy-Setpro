import { Socket_Events } from "../../../helpers/constant.ts";
import type { DeviceModel } from "../../../interface/device.ts";
import { type DeviceConfig, type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import SocketService from "../../socket.service.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class GlydeaFirmwareStep extends GenericFirmwareStep {

    protected FIRMWARE_SEQUENCE: FirmwareStep[] = [
        FirmwareStep.SAVE_MOTOR_CONFIG,
        FirmwareStep.MOVE_MOTOR_TO_TOP,
        FirmwareStep.PROCESS_NETWORK_COMMANDS,
        FirmwareStep.GET_IDENTITY,
        FirmwareStep.PROCESS_READ,
        FirmwareStep.PROCESS_WRITE_ROBUST,
        FirmwareStep.PROCESS_ERASE,
        FirmwareStep.PROCESS_WRITE,
        FirmwareStep.PROCESS_RESTART,
        FirmwareStep.GET_APP_VERSION,
        FirmwareStep.RESTORE_MOTOR_PARAMETERS,
        FirmwareStep.RESTORE_MOTOR_POSITION,
        FirmwareStep.CLOSE_PROCESS
    ];

    public async startFirmwareUpdate(device_data: DeviceModel, isBricked: boolean, file_name: string) {
        try {

            const startStep = isBricked ? FirmwareStep.GET_IDENTITY : FirmwareStep.SAVE_MOTOR_CONFIG;

            const ctx: FirmwareContext = {
                deviceId: device_data.device_id,
                fileName: file_name,
                isBricked,
                currentStep: startStep,
                restartStep: startStep,
                command: {
                    total: 500,
                    completed: 0
                },
                eraseIndex: 1,
                writeIndex: 1,
                deviceData: device_data
            };

            await this.validateFirmwareFile(ctx);

            this.run(ctx, startStep);
        } catch (error) {
            throw error;
        }
    }

    protected async extendedMotorConfig(ctx: FirmwareContext): Promise<void> {
        try {
            const rollingSpeedData = await this.motorActionService.getMotorRollingSpeed(ctx.deviceData);
            if (rollingSpeedData.isError) throw new Error('Failed to get motor rolling speed');

            const localUIData = (await this.motorActionService.getMotorLedStatus(ctx.deviceData));
            if (localUIData.isError) throw new Error('Failed to get motor LED status');

            const dctModeData = (await this.motorActionService.getDCTMode(ctx.deviceData));
            if (dctModeData.isError) throw new Error('Failed to get DCT mode');

            const touchMotionSensitivityData = (await this.motorActionService.getTouchMotionSensitivity(ctx.deviceData));
            if (touchMotionSensitivityData.isError) throw new Error('Failed to get touch motion sensitivity');

        } catch (error) {
            throw error;
        }
    }

    protected async restoreExtendedMotorParameters(ctx: FirmwareContext, deviceConfig: DeviceConfig) {
        try {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Rolling Speed`, status: 'progress' });
            if (deviceConfig.up_speed && deviceConfig.down_speed && deviceConfig.slow_speed) {
                const { up_speed, down_speed, slow_speed } = deviceConfig;
                const rollingSpeedData = await this.motorActionService.setMotorRollingSpeed(ctx.deviceData, up_speed, down_speed, slow_speed);
                if (rollingSpeedData.isError) throw new Error(`Motor parameter restoring failed: ${rollingSpeedData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Local UI`, status: 'progress' });
            if (deviceConfig.local_ui?.length && deviceConfig.local_ui.length === 3) {
                const parseLocalUI = deviceConfig.local_ui;
                const localUIPayload = {
                    status: parseLocalUI[0],
                    priority: parseLocalUI[2]
                };
                const localUIData = await this.motorActionService.setMotorLedStatus(ctx.deviceData, localUIPayload.status, localUIPayload.priority);
                if (localUIData.isError) throw new Error(`Motor parameter restoring failed: ${localUIData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: DCT Mode`, status: 'progress' });
            if (deviceConfig.dct_mode !== null && deviceConfig.dct_mode !== undefined) {
                const dctModeData = await this.motorActionService.setDCTMode(ctx.deviceData, deviceConfig.dct_mode);
                if (dctModeData.isError) throw new Error(`Motor parameter restoring failed: ${dctModeData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Touch Motion Sensitivity`, status: 'progress' });
            if (deviceConfig.touch_motion_sensitivity?.length && deviceConfig.touch_motion_sensitivity.length === 2) {
                const parseTouchMotion = deviceConfig.touch_motion_sensitivity;
                const touchMotionPayload = {
                    mode: parseTouchMotion[0],
                    value: parseTouchMotion[1]
                };
                const touchMotionSensitivityData = await this.motorActionService.setTouchMotionSensitivity(ctx.deviceData, touchMotionPayload.mode, touchMotionPayload.value);
                if (touchMotionSensitivityData.isError) throw new Error(`Motor parameter restoring failed: ${touchMotionSensitivityData.message}`);
            }

        } catch (error) {
            throw error;
        }
    }

}