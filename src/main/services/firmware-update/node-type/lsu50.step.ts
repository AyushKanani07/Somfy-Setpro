import { Socket_Events } from "../../../helpers/constant.ts";
import { buffer2string, bufferToSignedInt, sleep, toByteHex } from "../../../helpers/util.ts";
import type { DeviceModel } from "../../../interface/device.ts";
import { type DeviceConfig, type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import SocketService from "../../socket.service.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class LSU50FirmwareStep extends GenericFirmwareStep {

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

    protected async parseIdentityResponse(ctx: FirmwareContext, data: Buffer) {
        try {
            ctx.motorIdentity = {
                protocol_version: data[1],
                no_prog_area: data[2],
                start_reprogram_area: bufferToSignedInt(data.subarray(3, 5)),
                end_reprogram_area: bufferToSignedInt(data.subarray(5, 7)),
                erase_page_size: bufferToSignedInt(data.subarray(11, 13)),
                write_page_size: bufferToSignedInt(data.subarray(13, 15)) > 256 ? 256 : bufferToSignedInt(data.subarray(13, 15)),
                hardware_version: buffer2string(data.subarray(15, 31)),
                software_version: buffer2string(data.subarray(31, 47)),
                param_start: bufferToSignedInt(data.subarray(47, 49)),
                param_end: bufferToSignedInt(data.subarray(49, 51)),
                node_id: data[1] >= 0x83 ? Array.from(data.subarray(51, 55)) : [0xFF, 0xFA],
                endianness: data[1] >= 0x83 ? data[55] : null
            }

            ctx.motorWriteCalc = {
                application_area_size: ctx.motorIdentity.end_reprogram_area - ctx.motorIdentity.start_reprogram_area,
                max_page_write_required: Math.ceil((ctx.motorIdentity.end_reprogram_area - ctx.motorIdentity.start_reprogram_area) / ctx.motorIdentity.write_page_size),
                actual_page_write_required: Math.ceil((ctx.decryptedData?.length ?? 0) / ctx.motorIdentity.write_page_size),
                page_erase_required: Math.ceil((ctx.decryptedData?.length ?? 0) / ctx.motorIdentity.erase_page_size),
            }

        } catch (error) {
            throw error;
        }
    }

    protected getStartWriteAreaInHex(number: number) {
        return toByteHex(number, 2);
    }

    protected getStartEraseAreaInHex(number: number) {
        return toByteHex(number, 2);
    }

    protected async restoreExtendedMotorParameters(ctx: FirmwareContext, deviceConfig: DeviceConfig) {
        try {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Calibration`, status: 'progress' });

            const calibrationData = await this.motorActionService.setCalibration(ctx.deviceData);
            if (calibrationData.isError) throw new Error(`Motor parameter restoring failed: ${calibrationData.message}`);

        } catch (error) {
            throw error;
        }
    }

    protected async restoreMotorPosition(ctx: FirmwareContext) {
        try {
            await sleep(3000);
            await this.motorActionService.stopMotor(ctx.deviceData, true);
            await sleep(1000);

            await super.restoreMotorPosition(ctx);

        } catch (error) {
            throw error;
        }
    }
}