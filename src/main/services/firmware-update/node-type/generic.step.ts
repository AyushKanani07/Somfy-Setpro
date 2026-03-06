import { GLYDEA_SUB_NODE_ID, LSU40_SUB_NODE_ID, LSU50_SUB_NODE_ID, QT30DC_SUB_NODE_ID, Socket_Events, ST30DC_SUB_NODE_ID, ST50DC_SUB_NODE_ID } from "../../../helpers/constant.ts";
import { eventBroker } from "../../../helpers/event.ts";
import { STEP_HANDLERS } from "../../../helpers/firmware.handler.ts";
import { buffer2string, bufferToSignedInt, dec2hex, sleep, toByteHex } from "../../../helpers/util.ts";
import type { FirmwareCommand } from "../../../interface/command.interface.ts";
import { type DeviceConfig, FirmwareStep, type FirmwareContext } from "../../../interface/firmware.interface.ts";
import type { NetworkConfigSetting } from "../../../interface/motor.interface.ts";
import { dbConfig } from "../../../models/index.ts";
import { CommanService } from "../../comman.service.ts";
import { GroupActionService } from "../../group-action.service.ts";
import { GroupDiscoveryService } from "../../group.discovery.service.ts";
import { MotorActionService } from "../../motor-action.service.ts";
import { SerialportConnectionService } from "../../serialport.connection.service.ts";
import SocketService from "../../socket.service.ts";
import { FirmwareCommandSenderService } from "../firmware-command.sender.service.ts";
import { FirmwareFileValidateService } from "../firmware-file-validate.service.ts";
import { FirmwareUpdateService } from "../firmware-update.service.ts";


export abstract class GenericFirmwareStep {

    commonService = new CommanService();
    motorActionService = new MotorActionService();
    groupActionService = new GroupActionService();
    groupDiscoveryService = new GroupDiscoveryService();
    firmwareFileValidateService = new FirmwareFileValidateService();
    serialportConnectionService = new SerialportConnectionService();
    firmwareCommandSender = new FirmwareCommandSenderService();
    socketService = new SocketService();

    protected abstract FIRMWARE_SEQUENCE: FirmwareStep[];

    protected async run(ctx: FirmwareContext, step: FirmwareStep,) {
        let index = this.FIRMWARE_SEQUENCE.indexOf(step);

        if (index === -1) {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Invalid step`, status: 'error' });
        }

        SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Starting firmware update process`, status: 'start' });

        while (index < this.FIRMWARE_SEQUENCE.length) {
            const step: FirmwareStep = this.FIRMWARE_SEQUENCE[index];
            console.log('step: ', step);

            try {
                await (this as any)[STEP_HANDLERS[step]](ctx);
            } catch (error) {
                console.log('error: ', error);
                SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: (error as Error).message, status: 'error' });
                const payload = {
                    message: (error as Error).message,
                    status: 'error'
                }
                const confirmed = await this.socketService.waitForFirmwareUserAction(payload, false);
                if (confirmed) {
                    const step = ctx.restartStep;
                    ctx.writeIndex = 1;
                    ctx.eraseIndex = 1;
                    index = this.FIRMWARE_SEQUENCE.indexOf(step);
                    continue;
                } else {
                    const step = FirmwareStep.CLOSE_PROCESS;
                    index = this.FIRMWARE_SEQUENCE.indexOf(step);
                    continue;
                }
            }
            index++;
        }

        FirmwareUpdateService.setFirmwareProcessingState(false);
    }

    protected updateCompletedCommand(ctx: FirmwareContext, value: number, mode: 'inc' | 'set' = 'inc') {
        if (mode === 'set') {
            ctx.command.completed = value;
        } else {
            ctx.command.completed += value;
        }

        const payload = {
            completed: ctx.command.completed,
            total: ctx.command.total
        }

        SocketService.emit(Socket_Events.FIRMWARE_UPDATE_PROGRESS, payload);
    }

    protected async validateFirmwareFile(ctx: FirmwareContext) {
        try {
            const firmwareValidationResult = await this.firmwareFileValidateService.validateFirmwareFile(ctx.fileName, ctx.deviceData!.sub_node_id, false);
            ctx.firmwareFileVersion = firmwareValidationResult.file_firmware_version;
            ctx.decryptedData = firmwareValidationResult.decryptedData;
        } catch (error) {
            throw error;
        }
    }

    protected async saveMotorConfig(ctx: FirmwareContext) {
        try {
            this.updateCompletedCommand(ctx, 5, 'set');
            ctx.restartStep = FirmwareStep.SAVE_MOTOR_CONFIG;
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Obtaining Motor Parameters`, status: 'progress' });

            await this.commonMotorConfig(ctx);

            await this.extendedMotorConfig(ctx);

            this.updateCompletedCommand(ctx, 10);
        } catch (error) {
            throw error;
        }
    }

    private async commonMotorConfig(ctx: FirmwareContext) {
        try {
            const labelData = (await this.motorActionService.getMotorLabel(ctx.deviceData));
            if (labelData.isError) throw new Error('Failed to get motor label');

            await this.motorActionService.getMotorIps(ctx.deviceData);

            await this.groupDiscoveryService.discoverGroupsForDevice(ctx.deviceId);

            const positionData = await this.motorActionService.getMotorPosition(ctx.deviceData);
            ctx.motorCurrentPos = positionData.data.position_percentage;
            if (positionData.isError) throw new Error('Failed to get motor position');

            const directionData = await this.motorActionService.getMotorDirection(ctx.deviceData);
            if (directionData.isError) throw new Error('Failed to get motor direction');

            const limitsData = await this.motorActionService.getMotorLimits(ctx.deviceData);
            if (limitsData.isError) throw new Error('Failed to get motor limits');

            const appModeData = (await this.motorActionService.getAppMode(ctx.deviceData));
            if (appModeData.isError) throw new Error('Failed to get app mode');

            const networkLockData = (await this.motorActionService.getNetworkLock(ctx.deviceData));
            if (networkLockData.isError) throw new Error('Failed to get network lock');

            const networkConfigData = (await this.motorActionService.getNetworkConfig(ctx.deviceData));
            if (networkConfigData.isError) throw new Error('Failed to get network config');

        } catch (error) {
            throw error;
        }
    }

    protected async extendedMotorConfig(ctx: FirmwareContext): Promise<void> { }

    protected async moveMotorToTop(ctx: FirmwareContext) {
        try {
            this.updateCompletedCommand(ctx, 15, 'set');
            ctx.restartStep = FirmwareStep.MOVE_MOTOR_TO_TOP;
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Moving Motor to Top`, status: 'progress' });

            const moveMotorResult = await this.motorActionService.motorMoveTo(ctx.deviceData, 'up', true, 0, 0);
            if (moveMotorResult.isError) throw new Error('Motor in thermal protection mode. Please wait for motor to cool down and retry.');

            const motorCurrPos = await this.motorActionService.getMotorPosition(ctx.deviceData);
            if (motorCurrPos.isError || motorCurrPos.data.position_pulse === ctx.motorInitPos) {
                throw new Error('Motor not responding to movement command. Check for obstructions or motor issues.');
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Monitoring motor movement...`, status: 'progress' });
            const motorReachedTop = await this.checkMotorPosition(ctx);
            if (!motorReachedTop) {
                throw new Error('Motor failed to reach top position. Firmware update cancelled to prevent incorrect limit positions.');
            }

            const motorFinalPos = await this.motorActionService.getMotorPosition(ctx.deviceData);
            if (motorFinalPos.data.position_pulse > 10) {
                throw new Error('Motor Movement Blocked. Please verify whether the motor is locked or in thermal protection mode.');
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Motor reached top position`, status: 'progress' });
            await sleep(100);
            this.updateCompletedCommand(ctx, 5);

        } catch (error) {
            throw error;
        }
    }

    protected async checkMotorPosition(ctx: FirmwareContext): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let count = 0;
            let prevPosition = ctx.motorInitPos;
            let interval = setInterval(async () => {
                const motorPosition = await this.motorActionService.getMotorPosition(ctx.deviceData);
                if (motorPosition.isError) reject(new Error('Failed to get motor position'));
                const currPosition = motorPosition.data.position_pulse;

                if (prevPosition == currPosition) {
                    count++;
                    if (count >= 3) {
                        clearInterval(interval);
                        resolve(true);
                    }
                } else {
                    prevPosition = currPosition;
                    count = 0;
                }
            }, 1000);
        });
    }

    protected async processNetworkCommands(ctx: FirmwareContext) {
        try {
            this.updateCompletedCommand(ctx, 25, 'set');
            ctx.restartStep = FirmwareStep.PROCESS_NETWORK_COMMANDS;

            /* Set all motor to deaf mode */
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Setting all motor to deaf mode`, status: 'progress' });
            const payload: NetworkConfigSetting = {
                brodcast_mode: 255,
                brodcast_random_value: 0,
                supervision_active: 255,
                supervision_timeperiod: 0,
                deaf_mode: 1,
                upload_requested: 255
            };
            const setNetworkConfigRes = await this.motorActionService.setNetworkConfig(ctx.deviceData, payload);
            if (setNetworkConfigRes.isError) throw new Error('Failed to set network config for deaf mode');
            await sleep(1500);
            this.updateCompletedCommand(ctx, 1);

            /* Set particular motor to normal from deaf mode*/
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Setting particular motor to normal mode`, status: 'progress' });
            const payload2: NetworkConfigSetting = {
                brodcast_mode: 255,
                brodcast_random_value: 255,
                supervision_active: 255,
                supervision_timeperiod: 0,
                deaf_mode: 0,
                upload_requested: 255
            };
            const setNetworkConfigRes2 = await this.motorActionService.setMotorConfig(ctx.deviceData, payload2);
            if (setNetworkConfigRes2.isError) throw new Error('Failed to set network config for normal mode');
            await sleep(100);
            this.updateCompletedCommand(ctx, 1);

            /* Set particular motor to bootloader mode */
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Setting particular motor to bootloader mode`, status: 'progress' });
            const payload3: NetworkConfigSetting = {
                brodcast_mode: 255,
                brodcast_random_value: 255,
                supervision_active: 255,
                supervision_timeperiod: 0,
                deaf_mode: 0,
                upload_requested: 1
            };
            this.motorActionService.setMotorConfig(ctx.deviceData, payload3);
            await sleep(2000);
            this.updateCompletedCommand(ctx, 1);

        } catch (error) {
            throw error;
        }
    }

    protected async getIdentity(ctx: FirmwareContext) {
        try {
            this.updateCompletedCommand(ctx, 30, 'set');
            ctx.restartStep = FirmwareStep.GET_IDENTITY;
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Establishing connection with the motor`, status: 'progress' });

            const updateBaudRate = await this.serialportConnectionService.updateBaudRate(true);
            if (updateBaudRate.isError) throw new Error('Failed to update baud rate');

            await sleep(5000);

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Getting Identity...`, status: 'progress' });

            const command: FirmwareCommand = {
                command: 'IDENTITY',
                data: [],
                retrieve_count: 3,
                event_timeout: 1000,
                isSecondMotor: ctx.isSecondMotor || false
            }

            const parseCommand = new Promise<any>((resolve, reject) => {
                eventBroker.once('parse_firmware_command', (data: any) => {
                    if (data && data.command === 'IDENTITY') {
                        resolve(data.data_frame);
                    } else {
                        reject(new Error('Invalid identity response'));
                    }
                });
            })

            this.firmwareCommandSender.sendFirmwareCommand(command);
            this.updateCompletedCommand(ctx, 1);

            let data = await parseCommand;

            if (!data[0]) {
                throw new Error('Identity Command Ack Error');
            }

            await this.parseIdentityResponse(ctx, data);

            ctx.command.total = 100 + Math.ceil(ctx.motorWriteCalc!.page_erase_required + ctx.motorWriteCalc!.actual_page_write_required);

            if (!ctx.motorIdentity!.software_version.includes(ctx.deviceData!.sub_node_id.toString())) {
                const payload = {
                    message: 'Software Version. The software version of the motor is not compatible with the selected sub-node. Do you still want to continue?',
                    status: 'warning'
                }
                const confirmed = await this.socketService.waitForFirmwareUserAction(payload);
                if (!confirmed) {
                    throw new Error('Firmware update cancelled by user due to software version mismatch.');
                }
            }

            if (ctx.motorWriteCalc!.actual_page_write_required > ctx.motorWriteCalc!.max_page_write_required) {
                throw new Error('File size is greater than the motor program area size');
            }

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
                node_id: data[1] >= 0x83 ? Array.from(data.subarray(63, 67)) : [0x08, 0x00, 0x2F, 0xFC],
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

    protected async processRead(ctx: FirmwareContext) {
        try {
            ctx.restartStep = FirmwareStep.GET_IDENTITY;
            await sleep(2000);
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Reading Node Id...`, status: 'progress' });

            const command: FirmwareCommand = {
                command: 'READ',
                data: ctx.motorIdentity!.node_id.concat([0x00, 0x03]),
                retrieve_count: 3,
                event_timeout: 1000
            };

            const parseCommand = new Promise<any>((resolve, reject) => {
                eventBroker.once('parse_firmware_command', (data: any) => {
                    if (data && data.command === 'READ') {
                        resolve(data.data_frame);
                    } else {
                        resolve(false);
                    }
                });
            });

            this.firmwareCommandSender.sendFirmwareCommand(command);
            this.updateCompletedCommand(ctx, 1);

            let read_data = await parseCommand;

            let confirmed = true;
            if (read_data[0]) {
                const addressInDec = ((read_data[4] << 16) | (read_data[3] << 8) | read_data[2]);
                const address = dec2hex(addressInDec, 6);

                if (ctx.motorIdentity!.protocol_version >= 0x83 && (address !== ctx.deviceData!.address)) {
                    const payload = {
                        message: 'Node Address mismatch, do you still want to continue?',
                        status: 'warning'
                    }
                    confirmed = await this.socketService.waitForFirmwareUserAction(payload);
                }
            } else {
                const payload = {
                    message: 'Node Id Read Error, Error Response While Reading Node Id . Do you still want to continue?',
                    status: 'warning'
                }
                confirmed = await this.socketService.waitForFirmwareUserAction(payload);
            }
            if (!confirmed) {
                throw new Error('Firmware update cancelled by user due to Node Id read error.');
            }

        } catch (error) {
            throw error;
        }
    }

    protected async processWriteRobust(ctx: FirmwareContext) {
        try {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Writing For Robustness...`, status: 'progress' });

            const robustnessData = this.getRobustnessData(ctx.deviceData!.sub_node_id);
            const finalData = robustnessData.concat([0x00, 0x02, 0x00, 0x00]);

            const command: FirmwareCommand = {
                command: 'WRITE',
                data: finalData,
                retrieve_count: 3,
                event_timeout: 1000
            };

            const parseCommand = new Promise<any>((resolve, reject) => {
                eventBroker.once('parse_firmware_command', (data: any) => {
                    if (data && data.command === 'WRITE') {
                        resolve(data.data_frame);
                    } else {
                        resolve(false);
                    }
                });
            });

            this.firmwareCommandSender.sendFirmwareCommand(command);
            this.updateCompletedCommand(ctx, 1);

            let data = await parseCommand;

            if (!data) {
                throw new Error('Write for robustness failed: No response from motor');
            }

        } catch (error) {
            throw error;
        }
    }

    protected getRobustnessData(subNodeId: number) {
        switch (subNodeId) {
            case ST30DC_SUB_NODE_ID: return [0x08, 0x03, 0xFF, 0xFE];
            case QT30DC_SUB_NODE_ID: return [0x08, 0x03, 0xFF, 0xFE];
            case LSU50_SUB_NODE_ID: return [0xDF, 0xFE];
            case LSU40_SUB_NODE_ID: return [0x00, 0x07, 0x97, 0x30];
            case ST50DC_SUB_NODE_ID: return [0x00, 0x01, 0x7F, 0xFE];
            case GLYDEA_SUB_NODE_ID: return [0x00, 0x01, 0x7F, 0xFE];
            default: return [];
        }
    }

    protected async processErase(ctx: FirmwareContext) {
        try {
            while (ctx.eraseIndex <= ctx.motorWriteCalc!.page_erase_required) {
                SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Erasing page ${ctx.eraseIndex} of ${ctx.motorWriteCalc!.page_erase_required}`, status: 'progress' });
                this.updateCompletedCommand(ctx, 1);

                const start_erase_area = ctx.motorIdentity!.start_reprogram_area + ((ctx.eraseIndex - 1) * ctx.motorIdentity!.erase_page_size);
                const erase_data = this.getStartEraseAreaInHex(start_erase_area);

                const command: FirmwareCommand = {
                    command: 'ERASE',
                    data: erase_data,
                    retrieve_count: 3,
                    event_timeout: 6000
                };

                const parseCommand = new Promise<any>((resolve, reject) => {
                    eventBroker.once('parse_firmware_command', (data: any) => {
                        if (data && data.state == 'error') {
                            reject(new Error(data.message));
                        } else if (data && data.command === 'ERASE') {
                            resolve(data.data_frame);
                        } else {
                            reject(new Error('Erase Command Timeout Error'));
                        }
                    });
                });

                this.firmwareCommandSender.sendFirmwareCommand(command);

                await parseCommand;
                ctx.eraseIndex++;
            }

        } catch (error) {
            throw error;
        }
    }

    protected async processWrite(ctx: FirmwareContext) {
        try {
            while (ctx.writeIndex <= ctx.motorWriteCalc!.actual_page_write_required) {
                SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Writing page ${ctx.writeIndex} of ${ctx.motorWriteCalc!.actual_page_write_required}`, status: 'progress' });
                this.updateCompletedCommand(ctx, 1);

                const start_data_area = (ctx.writeIndex - 1) * ctx.motorIdentity!.write_page_size;
                const end_data_area = start_data_area + ctx.motorIdentity!.write_page_size;

                const write_data = this.getWriteData(ctx, start_data_area, end_data_area);

                const page_size = write_data.length;
                const start_write_area = ctx.motorIdentity!.start_reprogram_area + ((ctx.writeIndex - 1) * ctx.motorIdentity!.write_page_size);

                const addrBytes = this.getStartWriteAreaInHex(start_write_area);
                const sizeBytes = toByteHex(page_size, 2);
                const finalData = Buffer.concat([Buffer.from(addrBytes), Buffer.from(sizeBytes), write_data]);

                const command: FirmwareCommand = {
                    command: 'WRITE',
                    data: finalData,
                    retrieve_count: 3,
                    event_timeout: 1000
                };

                const parseCommand = new Promise<any>((resolve, reject) => {
                    eventBroker.once('parse_firmware_command', (data: any) => {
                        if (data && data.state == 'error') {
                            reject(new Error(data.message));
                        } else if (data && data.command === 'WRITE') {
                            resolve(data.data_frame);
                        } else {
                            reject(new Error('Write Command Timeout Error'));
                        }
                    });
                });

                this.firmwareCommandSender.sendFirmwareCommand(command);

                await parseCommand;
                ctx.writeIndex++;
            }

        } catch (error) {
            throw error;
        }
    }

    protected getStartWriteAreaInHex(number: number) {
        return toByteHex(number, 4);
    }

    protected getStartEraseAreaInHex(number: number) {
        return toByteHex(number, 4);
    }

    protected getWriteData(ctx: FirmwareContext, start_data_area: number, end_data_area: number) {
        let write_data = ctx.decryptedData!.subarray(start_data_area, end_data_area);
        if (write_data.length < ctx.motorIdentity!.write_page_size) {
            const padding_size = ctx.motorIdentity!.write_page_size - write_data.length;
            write_data = Buffer.concat([write_data, Buffer.alloc(padding_size)]);
        }
        return write_data;
    }

    protected async processRestart(ctx: FirmwareContext) {
        try {
            const command: FirmwareCommand = {
                command: 'RESTART',
                data: [],
                retrieve_count: 3,
                event_timeout: 10000
            }

            const parseCommand = new Promise<any>((resolve, reject) => {
                eventBroker.once('parse_firmware_command', (data: any) => {
                    if (data && data.command === 'RESTART') {
                        resolve(data.data_frame);
                    } else {
                        reject(new Error('Invalid identity response'));
                    }
                });
            })

            this.firmwareCommandSender.sendFirmwareCommand(command);
            this.updateCompletedCommand(ctx, 1);

            await parseCommand;

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Waiting for motor to get back in SDN mode`, status: 'progress' });
            const updateBaudRate = await this.serialportConnectionService.updateBaudRate(false);
            if (updateBaudRate.isError) throw new Error('Failed to update baud rate');

            await sleep(5000);

            const payload: NetworkConfigSetting = {
                brodcast_mode: 255,
                brodcast_random_value: 0,
                supervision_active: 255,
                supervision_timeperiod: 0,
                deaf_mode: 0,
                upload_requested: 255
            };
            const setNetworkConfigRes = await this.motorActionService.setNetworkConfig(ctx.deviceData, payload);
            if (setNetworkConfigRes.isError) throw new Error('Failed to set network config for update to normal mode.');

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Motor is back in SDN mode`, status: 'progress' });
            this.updateCompletedCommand(ctx, 1);
            await sleep(1500);

        } catch (error) {
            throw new Error('To update firmware Power Cycle motor and retry');
        }
    }

    protected async getAppVersion(ctx: FirmwareContext) {
        try {
            ctx.restartStep = FirmwareStep.GET_APP_VERSION;

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Getting motor app version`, status: 'progress' });
            const appVersionData = await this.commonService.getNodeAppVersion(ctx.deviceData);
            if (appVersionData.isError) throw new Error('Failed to get motor app version');

            const firmware_version = appVersionData.data.app_version;
            console.log('firmware_version: ', firmware_version);

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Motor firmware updated successfully to ${firmware_version}`, status: 'success' });
            this.updateCompletedCommand(ctx, ctx.command.total, 'set');

        } catch (error) {
            throw error;
        }
    }

    protected async restoreMotorParameters(ctx: FirmwareContext) {
        try {
            ctx.restartStep = FirmwareStep.RESTORE_MOTOR_PARAMETERS;
            const deviceConfig: DeviceConfig = await dbConfig.dbInstance.motorModel.findOne({
                where: {
                    device_id: ctx.deviceId
                }
            });

            if (!deviceConfig) {
                ctx.isCompleted = true;
                SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Firmware upgrade successful. Unable to Restore motor parameters.`, status: 'success' });
                return;
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Direction`, status: 'progress' });
            if (deviceConfig.direction) {
                const directionData = await this.motorActionService.setMotorDirection(ctx.deviceData, deviceConfig.direction);
                if (directionData.isError) throw new Error(`Motor parameter restoring failed: ${directionData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Top Limit`, status: 'progress' });
            const topLimitData = await this.motorActionService.setMotorLimits(ctx.deviceData, 'top', undefined);
            if (topLimitData.isError) throw new Error(`Motor parameter restoring failed: ${topLimitData.message}`);

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Bottom Limit`, status: 'progress' });
            if (deviceConfig.down_limit) {
                const bottomLimitData = await this.motorActionService.setMotorLimits(ctx.deviceData, 'pulse', deviceConfig.down_limit);
                if (bottomLimitData.isError) throw new Error(`Motor parameter restoring failed: ${bottomLimitData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: IP`, status: 'progress' });
            for (let i = 0; i < deviceConfig.ip_data?.length; i++) {
                const ip_value = deviceConfig.ip_data[i];
                if (ip_value.pulse === 65535) continue; // skip unassigned IPs
                const ipData = await this.motorActionService.setMotorIp(ctx.deviceData, 'pos_pulse', ip_value.index, ip_value.pulse, undefined, false);
                if (ipData.isError) throw new Error(`Motor parameter restoring failed: ${ipData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Group`, status: 'progress' });
            const groupDeviceMap = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                attributes: ['group_id', 'device_id', 'device_group_pos'],
                where: { device_id: ctx.deviceId },
                include: [{
                    model: dbConfig.dbInstance.groupModel,
                    attributes: ['group_id', 'name', 'address']
                }]
            });
            for (const map of groupDeviceMap) {
                if (!map.tbl_group.address || /^0+$/.test(map.tbl_group.address)) continue;
                const groupData = await this.groupActionService.setMotorGroup(ctx.deviceData, map.tbl_group.address, map.device_group_pos);
                if (groupData.isError) throw new Error(`Motor parameter restoring failed: ${groupData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Node Label`, status: 'progress' });
            const deviceName = await dbConfig.dbInstance.deviceModel.findOne({
                attributes: ['name'],
                where: { device_id: ctx.deviceId },
                raw: true
            });
            if (deviceName) {
                const labelData = await this.motorActionService.setMotorLabel(ctx.deviceData, deviceName.name);
                if (labelData.isError) throw new Error(`Motor parameter restoring failed: ${labelData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Network Lock`, status: 'progress' });
            if (deviceConfig.network_lock?.length) {
                const networkLockData = await this.motorActionService.setNetworkLock(ctx.deviceData, deviceConfig.network_lock[0], deviceConfig.network_lock[2]);
                if (networkLockData.isError) throw new Error(`Motor parameter restoring failed: ${networkLockData.message}`);
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor parameter: Network Config`, status: 'progress' });
            if (deviceConfig.network_config?.length && deviceConfig.network_config.length == 5) {
                const networkConfigPayload: NetworkConfigSetting = {
                    brodcast_mode: deviceConfig.network_config[0],
                    brodcast_random_value: deviceConfig.network_config[1],
                    supervision_active: deviceConfig.network_config[2],
                    supervision_timeperiod: deviceConfig.network_config[3],
                    deaf_mode: deviceConfig.network_config[4],
                    upload_requested: 255
                };
                const networkConfigData = await this.motorActionService.setMotorConfig(ctx.deviceData, networkConfigPayload);
                if (networkConfigData.isError) throw new Error(`Motor parameter restoring failed: ${networkConfigData.message}`);
            }
            await sleep(1500);

            await this.restoreExtendedMotorParameters(ctx, deviceConfig);

        } catch (error) {
            throw error;
        }
    }

    protected async restoreExtendedMotorParameters(ctx: FirmwareContext, deviceConfig: any) {
        return;
    }

    protected async restoreMotorPosition(ctx: FirmwareContext) {
        try {
            ctx.restartStep = FirmwareStep.RESTORE_MOTOR_POSITION;
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Restoring motor position`, status: 'progress' });
            const moveMotorResult = await this.motorActionService.motorMoveTo(ctx.deviceData, 'pos_per', true, ctx.motorCurrentPos, 0);
            if (moveMotorResult.isError) throw new Error('Failed to restore motor position');

            const motorReached = await this.checkMotorPosition(ctx);
            if (!motorReached) {
                SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Motor position restore failed but firmware updated sucessfully`, status: 'success' });
                return;
            }

            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Motor position restored successfully`, status: 'progress' });

        } catch (error) {
            throw error;
        }
    }

    protected async closeProcess(ctx: FirmwareContext) {
        try {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Setting all motor to normal mode.`, status: 'progress' });
            const payload: NetworkConfigSetting = {
                brodcast_mode: 255,
                brodcast_random_value: 255,
                supervision_active: 255,
                supervision_timeperiod: 65535,
                deaf_mode: 0,
                upload_requested: 255
            }
            await this.motorActionService.setNetworkConfig(ctx.deviceData, payload);
            await sleep(1000);
            await this.serialportConnectionService.updateBaudRate(false);
            ctx.isCompleted = true;
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, { message: `Firmware upgrade process completed successfully.`, status: 'completed' });

        } catch (error) {
            throw error;
        }
    }

}