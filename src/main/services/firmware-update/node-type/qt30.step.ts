import { Socket_Events } from "../../../helpers/constant.ts";
import type { DeviceModel } from "../../../interface/device.ts";
import { type DeviceConfig, type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import SocketService from "../../socket.service.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class QT30FirmwareStep extends GenericFirmwareStep {


    protected FIRMWARE_SEQUENCE: FirmwareStep[] = [
        FirmwareStep.PROCESS_NETWORK_COMMANDS,
        FirmwareStep.GET_IDENTITY,
        FirmwareStep.PROCESS_READ,
        FirmwareStep.PROCESS_WRITE_ROBUST,
        FirmwareStep.PROCESS_ERASE,
        FirmwareStep.PROCESS_WRITE,
        FirmwareStep.PROCESS_RESTART,
        FirmwareStep.START_OTHER_BOARD,
        FirmwareStep.GET_IDENTITY,
        FirmwareStep.PROCESS_READ,
        FirmwareStep.PROCESS_WRITE_ROBUST,
        FirmwareStep.PROCESS_ERASE,
        FirmwareStep.PROCESS_WRITE,
        FirmwareStep.PROCESS_RESTART,
        FirmwareStep.GET_APP_VERSION,
        FirmwareStep.CLOSE_PROCESS
    ];

    public async startFirmwareUpdate(device_data: DeviceModel, isBricked: boolean, file_name: string) {
        try {

            const startStep = isBricked ? FirmwareStep.GET_IDENTITY : FirmwareStep.PROCESS_NETWORK_COMMANDS;

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
                deviceData: device_data,
                isSecondMotor: true
            };

            await this.validateFirmwareFile(ctx);

            this.run(ctx, startStep);
        } catch (error) {
            throw error;
        }
    }

    protected async validateFirmwareFile(ctx: FirmwareContext) {
        try {
            const firmwareValidationResult = await this.firmwareFileValidateService.validateFirmwareFile(ctx.fileName, ctx.deviceData!.sub_node_id, true);
            ctx.firmwareFileVersion = firmwareValidationResult.file_firmware_version;
            if (!firmwareValidationResult.decryptedData2) throw new Error('Firmware file corrupted: Missing second firmware data for QT30DC');
            ctx.decryptedData = firmwareValidationResult.decryptedData;
            ctx.decryptedData2 = firmwareValidationResult.decryptedData2;
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

    protected getWriteData(ctx: FirmwareContext, start_data_area: number, end_data_area: number) {
        return ctx.decryptedData!.subarray(start_data_area, end_data_area);
    }

    private async startOtherBoard(ctx: FirmwareContext) {
        try {
            ctx.eraseIndex = 1;
            ctx.writeIndex = 1;
            ctx.command = {
                total: 500,
                completed: 0
            }
            ctx.decryptedData = ctx.decryptedData2;
            ctx.isSecondMotor = false;
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