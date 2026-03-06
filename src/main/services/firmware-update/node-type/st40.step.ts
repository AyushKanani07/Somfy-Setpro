import { Socket_Events } from "../../../helpers/constant.ts";
import type { DeviceModel } from "../../../interface/device.ts";
import { type DeviceConfig, type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import SocketService from "../../socket.service.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class ST40FirmwareStep extends GenericFirmwareStep {

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

        } catch (error) {
            throw error;
        }
    }

}