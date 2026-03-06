import { Socket_Events } from "../../../helpers/constant.ts";
import { buffer2string, bufferToSignedInt } from "../../../helpers/util.ts";
import type { RampSetting } from "../../../interface/command.interface.ts";
import type { DeviceModel } from "../../../interface/device.ts";
import { type DeviceConfig, type FirmwareContext, FirmwareStep } from "../../../interface/firmware.interface.ts";
import SocketService from "../../socket.service.ts";
import { GenericFirmwareStep } from "./generic.step.ts";


export class ST50FirmwareStep extends GenericFirmwareStep {

    protected FIRMWARE_SEQUENCE: FirmwareStep[] = [
        FirmwareStep.PROCESS_NETWORK_COMMANDS,
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
                start_reprogram_area: bufferToSignedInt(data.subarray(3, 7)),
                end_reprogram_area: bufferToSignedInt(data.subarray(7, 11)),
                erase_page_size: bufferToSignedInt(data.subarray(19, 21)),
                write_page_size: bufferToSignedInt(data.subarray(21, 23)) > 256 ? 256 : bufferToSignedInt(data.subarray(21, 23)),
                hardware_version: buffer2string(data.subarray(23, 39)),
                software_version: buffer2string(data.subarray(39, 55)),
                param_start: bufferToSignedInt(data.subarray(55, 59)),
                param_end: bufferToSignedInt(data.subarray(59, 63)),
                node_id: data[1] >= 0x83 ? Array.from(data.subarray(63, 67)) : [0x00, 0x00, 0xAF, 0xFA],
                endianness: data[1] >= 0x83 ? data[67] : null
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

    protected async extendedMotorConfig(ctx: FirmwareContext): Promise<void> {
        try {
            const rollingSpeedData = await this.motorActionService.getMotorRollingSpeed(ctx.deviceData);
            if (rollingSpeedData.isError) throw new Error('Failed to get motor rolling speed');

            const getRampTime = await this.motorActionService.getMotorRampTime(ctx.deviceData);
            if (getRampTime.isError) throw new Error('Failed to get motor ramp time');

            const getTorqueLimit = await this.motorActionService.getTorqueLimitation(ctx.deviceData);
            if (getTorqueLimit.isError) throw new Error('Failed to get motor torque limitation');

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

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Ramp Time`, status: 'progress' });
            if (deviceConfig.ramp?.length && deviceConfig.ramp.length === 8) {
                const parseRamp = deviceConfig.ramp;
                const rampTimePayload = {
                    start_status_up: parseRamp[0],
                    start_value_up: parseRamp[1],
                    stop_status_up: parseRamp[2],
                    stop_value_up: parseRamp[3],
                    start_status_down: parseRamp[4],
                    start_value_down: parseRamp[5],
                    stop_status_down: parseRamp[6],
                    stop_value_down: parseRamp[7]
                };
                const startUp: RampSetting = {
                    enabled: rampTimePayload.start_status_up,
                    value: rampTimePayload.start_value_up,
                    ramp_key: 'start_up'
                }
                const rampTimeData = await this.motorActionService.saveMotorRampTime(ctx.deviceData, startUp);
                if (rampTimeData.isError) throw new Error(`Motor parameter restoring failed: ${rampTimeData.message}`);

                const stopUp: RampSetting = {
                    enabled: rampTimePayload.stop_status_up,
                    value: rampTimePayload.stop_value_up,
                    ramp_key: 'stop_up'
                }
                const rampTimeData2 = await this.motorActionService.saveMotorRampTime(ctx.deviceData, stopUp);
                if (rampTimeData2.isError) throw new Error(`Motor parameter restoring failed: ${rampTimeData2.message}`);

                const startDown: RampSetting = {
                    enabled: rampTimePayload.start_status_down,
                    value: rampTimePayload.start_value_down,
                    ramp_key: 'start_down'
                }
                const rampTimeData3 = await this.motorActionService.saveMotorRampTime(ctx.deviceData, startDown);
                if (rampTimeData3.isError) throw new Error(`Motor parameter restoring failed: ${rampTimeData3.message}`);

                const stopDown: RampSetting = {
                    enabled: rampTimePayload.stop_status_down,
                    value: rampTimePayload.stop_value_down,
                    ramp_key: 'stop_down'
                }
                const rampTimeData4 = await this.motorActionService.saveMotorRampTime(ctx.deviceData, stopDown);
                if (rampTimeData4.isError) throw new Error(`Motor parameter restoring failed: ${rampTimeData4.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Torque Limitation`, status: 'progress' });
            if (deviceConfig.torque?.length && deviceConfig.torque.length === 2) {
                const parseTorque = deviceConfig.torque;
                const torqueLimitationPayload = {
                    status: parseTorque[0],
                    level: parseTorque[1]
                };
                const torqueLimitationData = await this.motorActionService.setTorqueLimitation(ctx.deviceData, torqueLimitationPayload.status, torqueLimitationPayload.level);
                if (torqueLimitationData.isError) throw new Error(`Motor parameter restoring failed: ${torqueLimitationData.message}`);
            }

        } catch (error) {
            throw error;
        }
    }

}