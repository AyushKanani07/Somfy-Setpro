import { eventBroker } from "../helpers/event.ts";
import type { CommandParserOutput, ParseCommandWithTransactionId } from "../interface/command.interface.ts";
import { CommandSenderService } from "./command.sender.service.ts";
import type { MotorFound } from "../interface/motor.interface.ts";
import { CommanService } from "./comman.service.ts";
import { dbConfig } from "../models/index.ts";
import SocketService from "./socket.service.ts";
import { lstNodeType, lstSubNodeType, Socket_Events } from "../helpers/constant.ts";
import { Op } from "sequelize";
import { promiseRegistry } from "../helpers/util.ts";

let isDiscovering = false;
let isGetNewDeviceRunning = false;

class DiscoveryStoppedError extends Error {
    constructor() {
        super('Discovery stopped by user');
    }
}

export class DeviceDiscoveryService {

    private commandSender = new CommandSenderService();
    private commanService = new CommanService();
    private abortController?: AbortController;

    private throwIfAborted(signal: AbortSignal) {
        if (signal.aborted) {
            throw new DiscoveryStoppedError();
        }
    }

    private sleepOrAbort(ms: number, signal: AbortSignal) {
        return new Promise<void>((resolve, reject) => {
            const onAbort = () => {
                cleanup();
                reject(new DiscoveryStoppedError());
            };

            const timeout = setTimeout(() => {
                cleanup();
                resolve();
            }, ms);

            const cleanup = () => {
                clearTimeout(timeout);
                signal.removeEventListener('abort', onAbort);
            };

            if (signal.aborted) {
                cleanup();
                reject(new DiscoveryStoppedError());
                return;
            }

            signal.addEventListener('abort', onAbort, { once: true });
        });
    }

    public stopDiscovery() {
        if (this.abortController) {
            this.abortController.abort();
            SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Discovery stop requested', status: 'stopped' });
        } else {
            console.log('No active discovery to stop');
        }
    }

    private waitForCommand(
        filterFn: (cmd: CommandParserOutput) => boolean,
        transaction_id: string,
        signal: AbortSignal,
    ): Promise<ParseCommandWithTransactionId | null> {
        return new Promise((resolve, reject) => {
            const onParsed = (response: ParseCommandWithTransactionId[]) => {
                if (!response || typeof response !== "object") return;
                if (!Array.isArray(response)) return;
                for (const frame of response) {
                    if (frame.transaction_id === transaction_id) {
                        if (frame.command_name === 'nACK' || frame.state === 'timeout' || frame.state === 'error') cleanup(() => resolve(null));

                        if (filterFn(frame)) cleanup(() => resolve(frame));
                        return;
                    }
                }
            };

            const onAbort = () => {
                cleanup(() => reject(new DiscoveryStoppedError()));
            };

            const cleanup = (cb: () => void) => {
                eventBroker.removeListener('parsed_command', onParsed);
                signal.removeEventListener('abort', onAbort);
                cb();
            };

            eventBroker.on('parsed_command', onParsed);
            signal.addEventListener('abort', onAbort, { once: true });
        });
    }


    public async discoverMotors() {
        if (isDiscovering) {
            console.error('Device discovery is already in progress');
            SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Device discovery is already in progress', status: 'progress' });
            return;
        };

        SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Device discovery started', status: 'start' });

        // Abort any previous run before starting a fresh one
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        const { signal } = this.abortController;
        let stoppedByUser = false;

        try {
            let FOUNDED_DEVICES: MotorFound[] = [];
            isDiscovering = true;

            const emitProgress = (progress: number, message: string) => {
                SocketService.emit(Socket_Events.DEVICE_DISCOVERY_PROGRESS, { progress, message });
            };

            const getNewDevice = (abortSignal: AbortSignal): Promise<void> => {
                return new Promise(async (resolve) => {
                    if (isGetNewDeviceRunning) {
                        console.log('getNewDevice is already running, skipping this call');
                        return resolve();
                    }

                    isGetNewDeviceRunning = true;

                    try {
                        const parsedCommandPromise = new Promise<CommandParserOutput[]>((resolveCommand, reject) => {
                            const onParsedCommand = async (response: CommandParserOutput[]) => {
                                cleanup();
                                if (response.length > 0) {
                                    const filteredRecords = response.filter(
                                        (record: CommandParserOutput) =>
                                            record.command_name === 'POST_NODE_ADDR' &&
                                            !FOUNDED_DEVICES.some((motor: MotorFound) => motor.address === record.source_add)
                                    );
                                    for (let i = 0; i < filteredRecords.length; i++) {
                                        const record = filteredRecords[i];
                                        // Double-check to prevent race condition duplicates
                                        if (!FOUNDED_DEVICES.some((device: MotorFound) => device.address === record.source_add)) {
                                            const new_device: MotorFound = {
                                                address: record.source_add,
                                                model_no: record.source_node_type,
                                                device_type: record.source_node_type == 13 ? 'rts-receiver' : record.source_node_type == 5 ? 'rts-transmitter' : 'motor'
                                            };

                                            const getNode = lstNodeType.find(nt => nt.node_id === record.source_node_type);
                                            if (getNode && getNode.getSubnode) {
                                                const subNodeType = await this.commanService.getSubNodeId(new_device.model_no, new_device.address);
                                                if (subNodeType.isError) continue;
                                                new_device.sub_node_id = subNodeType.data.sub_node_id;
                                            } else {
                                                const subNodeType = lstSubNodeType.find(snt => snt.node_id === record.source_node_type);
                                                new_device.sub_node_id = subNodeType?.sub_node_id;
                                            }

                                            // Remove when go to production
                                            switch (new_device.model_no) {
                                                case 2:
                                                    new_device.sub_node_id = 5063313;
                                                    break;
                                                case 7:
                                                    new_device.sub_node_id = 5071757;
                                                    break;
                                                case 9:
                                                    new_device.sub_node_id = 5132734;
                                                    break;
                                                case 8:
                                                    new_device.sub_node_id = 5123276;
                                                    break;
                                                case 6:
                                                    new_device.sub_node_id = 5039367;
                                                    break;
                                                default:
                                                    break;
                                            }
                                            // end remove

                                            let device = await dbConfig.dbInstance.deviceModel.findOne({ where: { address: new_device.address } });

                                            if (device) {
                                                await device.update({
                                                    model_no: new_device.model_no,
                                                    sub_node_id: new_device.sub_node_id || null,
                                                    device_type: new_device.device_type
                                                })
                                            } else {
                                                device = await dbConfig.dbInstance.deviceModel.create({
                                                    address: new_device.address,
                                                    model_no: new_device.model_no,
                                                    sub_node_id: new_device.sub_node_id || null,
                                                    device_type: new_device.device_type
                                                });
                                            }
                                            new_device.device_id = device.dataValues.device_id;
                                            FOUNDED_DEVICES.push(new_device);
                                            await this.sleepOrAbort(10, abortSignal);
                                            console.log(`Device discovered: ${record.source_add}, Total: ${FOUNDED_DEVICES.length}`);

                                            // Emit real-time update to frontend
                                            SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { new_device, count: FOUNDED_DEVICES.length, status: 'new_device', message: `New device discovered` });
                                        }
                                    }
                                }
                                resolveCommand(response);
                            };

                            const onAbort = () => {
                                cleanup();
                                reject(new DiscoveryStoppedError());
                            };

                            function cleanup() {
                                abortSignal.removeEventListener('abort', onAbort);
                                eventBroker.removeListener('parsed_command', onParsedCommand);
                            }

                            if (abortSignal.aborted) {
                                onAbort();
                            }

                            eventBroker.on('parsed_command', onParsedCommand);
                            abortSignal.addEventListener('abort', onAbort, { once: true });
                        });

                        this.commandSender.sendSDNCommand({
                            command_name: 'GET_NODE_ADDR',
                            data: {},
                            is_ack: true,
                            ack_timeout: 70,
                            max_retry_count: 1,
                            priority: 'high',
                            dest_node_type: 0,
                            source_add: "010000",
                            destination_add: "FFFFFF",
                            event_timeout: 6500,
                            transaction_id: promiseRegistry.newRequestId()
                        });

                        // Wait for the parsed_command event to complete
                        await parsedCommandPromise;
                        await this.sleepOrAbort(200, abortSignal);

                        for (const motor of FOUNDED_DEVICES) {
                            this.throwIfAborted(abortSignal);
                            if (!motor.is_discover_conf_send) {
                                const command = {
                                    command_name: 'SET_NODE_DISCOVERY',
                                    data: {
                                        discovery_mode: 0x01
                                    },
                                    is_ack: true,
                                    ack_timeout: 200,
                                    max_retry_count: 1,
                                    priority: 'high' as 'high',
                                    dest_node_type: motor.model_no,
                                    sub_node_type: motor.sub_node_id,
                                    source_add: "010000",
                                    destination_add: motor.address,
                                    event_timeout: 1500,
                                    transaction_id: promiseRegistry.newRequestId()
                                };
                                this.commandSender.sendSDNCommand(command);
                                motor.is_discover_conf_send = true;

                                // Wrap in a promise to wait for ACK before continuing
                                await this.waitForCommand(
                                    (cmd) => cmd.command_name === 'ACK' && cmd.source_add === motor.address,
                                    command.transaction_id,
                                    signal,
                                );

                                await this.sleepOrAbort(100, abortSignal);
                            }
                        }
                    } catch (error) {
                        if (error instanceof DiscoveryStoppedError) {
                            stoppedByUser = true;
                            console.log('getNewDevice: Stopped by user');
                            SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Discovery stopped by user', status: 'stopped' });
                            return;
                        }
                    }
                    finally {
                        // Always reset the flag, even if an error occurs
                        isGetNewDeviceRunning = false;
                        resolve();
                    }
                });
            }

            this.commandSender.sendSDNCommand({
                command_name: "SET_NETWORK_CONFIG",
                data: {
                    brodcast_mode: 2,
                    brodcast_random_value: 255,
                    supervision_active: 2,
                    supervision_timeperiod: 255,
                    deaf_mode: 0,
                    upload_requested: 2
                },
                is_ack: false,
                ack_timeout: 70,
                max_retry_count: 3,
                priority: 'high',
                dest_node_type: 0,
                source_add: "010000",
                destination_add: "FFFFFF",
                event_timeout: 1500,
                transaction_id: promiseRegistry.newRequestId()
            })

            emitProgress(10, 'Network configuration set');
            await this.sleepOrAbort(500, signal);
            this.throwIfAborted(signal);

            this.commandSender.sendSDNCommand({
                command_name: "SET_NODE_DISCOVERY",
                data: {
                    discovery_mode: 0
                },
                is_ack: false,
                ack_timeout: 70,
                max_retry_count: 3,
                priority: 'high',
                dest_node_type: 0,
                source_add: "010000",
                destination_add: "FFFFFF",
                event_timeout: 1500,
                transaction_id: promiseRegistry.newRequestId()
            })

            emitProgress(20, 'Discovery mode activated');
            await this.sleepOrAbort(500, signal);
            this.throwIfAborted(signal);

            let deviceToDestroy: number[] = []

            const existingDevices = await dbConfig.dbInstance.deviceModel.findAll();
            for (const device of existingDevices) {
                if (!device.sub_node_id || device.sub_node_id == 0 || device.device_type == 'motor') {
                    const getNode = lstNodeType.find(nt => nt.node_id === device.model_no);
                    if (getNode && getNode.getSubnode) {
                        const subNodeType = await this.commanService.getSubNodeId(device.model_no, device.address);
                        if (subNodeType.isError) continue;
                        device.sub_node_id = subNodeType.data.sub_node_id;
                    } else {
                        const subNodeType = lstSubNodeType.find(snt => snt.node_id === device.model_no);
                        device.sub_node_id = subNodeType?.sub_node_id;
                    }
                    await dbConfig.dbInstance.deviceModel.update(
                        { sub_node_id: device.sub_node_id },
                        { where: { address: device.address, device_id: device.device_id } }
                    );
                }

                if ((!device.sub_node_id || device.sub_node_id == 0) && device.device_type == 'motor') continue;
                this.throwIfAborted(signal);
                const command = {
                    command_name: 'SET_NODE_DISCOVERY',
                    data: {
                        discovery_mode: 0x01
                    },
                    is_ack: true,
                    ack_timeout: 1000,
                    max_retry_count: 1,
                    priority: 'high' as 'high',
                    dest_node_type: device.model_no,
                    sub_node_type: device.sub_node_id,
                    source_add: "010000",
                    destination_add: device.address,
                    event_timeout: 1500,
                    transaction_id: promiseRegistry.newRequestId()
                };

                this.commandSender.sendSDNCommand(command);

                const ack = await this.waitForCommand(
                    (cmd) => cmd.command_name === "ACK" && cmd.source_add === device.address,
                    command.transaction_id,
                    signal,
                );

                if (ack) {
                    const new_device: MotorFound = {
                        address: device.address,
                        model_no: device.model_no,
                        sub_node_id: device.sub_node_id,
                        device_id: device.device_id,
                        is_discover_conf_send: true,
                        device_type: device.device_type
                    }
                    FOUNDED_DEVICES.push(new_device);

                    SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { new_device, count: FOUNDED_DEVICES.length, status: 'new_device', message: `New device discovered` });
                } else {
                    if (device.room_id == 0 && ['motor', 'rts-receiver'].includes(device.device_type)) {
                        deviceToDestroy.push(device.device_id);
                    }
                }

                await this.sleepOrAbort(100, signal);
            }

            if (deviceToDestroy.length > 0) {
                await dbConfig.dbInstance.groupDeviceMapModel.destroy({ where: { device_id: { [Op.in]: deviceToDestroy } } });
                await dbConfig.dbInstance.motorModel.destroy({ where: { device_id: { [Op.in]: deviceToDestroy } } });
                await dbConfig.dbInstance.deviceModel.destroy({ where: { device_id: { [Op.in]: deviceToDestroy } } });
            }

            await this.sleepOrAbort(500, signal);

            let consecutiveRuns = 0;
            const maxConsecutiveRuns = 3;

            while (consecutiveRuns < maxConsecutiveRuns && !signal.aborted) {
                const initialMotorCount = FOUNDED_DEVICES.length;

                const progressBase = 30 + (consecutiveRuns / maxConsecutiveRuns) * 60;
                emitProgress(progressBase, `Discovery cycle ${consecutiveRuns + 1}/${maxConsecutiveRuns} - Scanning Devices...`);

                await getNewDevice(signal);
                await this.sleepOrAbort(500, signal);
                consecutiveRuns++;

                if (FOUNDED_DEVICES.length > initialMotorCount) {
                    console.log(`New device found! Resetting discovery cycle. Found ${FOUNDED_DEVICES.length - initialMotorCount} new device(s).`);
                    consecutiveRuns = 0;
                    emitProgress(progressBase + 10, `Found ${FOUNDED_DEVICES.length - initialMotorCount} new device(s)! Continuing discovery...`);
                }

                console.log(`Discovery cycle ${consecutiveRuns}/${maxConsecutiveRuns} completed. Total devices found: ${FOUNDED_DEVICES.length}`);
                emitProgress(progressBase + 15, `Cycle ${consecutiveRuns}/${maxConsecutiveRuns} completed. Total: ${FOUNDED_DEVICES.length} devices found.`);
            }

            await this.sleepOrAbort(500, signal);

            // Send GET_MOTOR_LIMITS to all motors and wait for their responses
            for (const device of FOUNDED_DEVICES) {
                if (device.device_type !== 'motor') continue;
                this.throwIfAborted(signal);
                const command = {
                    command_name: 'GET_MOTOR_LIMITS',
                    data: {},
                    is_ack: true,
                    ack_timeout: 200,
                    max_retry_count: 3,
                    priority: 'high' as 'high',
                    dest_node_type: device.model_no,
                    sub_node_type: device.sub_node_id,
                    source_add: "010000",
                    destination_add: device.address,
                    event_timeout: 1500,
                    transaction_id: promiseRegistry.newRequestId()
                };
                this.commandSender.sendSDNCommand(command);

                const limitResponse = await this.waitForCommand(
                    (cmd) =>
                        cmd.command_name === "POST_MOTOR_LIMITS" &&
                        cmd.source_add === device.address,
                    command.transaction_id,
                    signal,
                );

                if (limitResponse) {
                    const limitData = limitResponse.data;
                    device.limitData = limitData;
                    device.isLimitSet = !(limitData.up_limit == 65535 && limitData.down_limit == 65535);

                    // Emit motor limit update to frontend
                    SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, {
                        device_id: device?.device_id,
                        address: device.address,
                        limit: limitData,
                        status: 'motor_limit',
                        message: `Motor limit updated for device.`
                    });
                }

                await this.sleepOrAbort(500, signal);
            }

            await this.sleepOrAbort(500, signal);

            // Send GET_NODE_LABEL to all motors and wait for their responses
            for (const device of FOUNDED_DEVICES) {
                this.throwIfAborted(signal);

                const command = {
                    command_name: 'GET_NODE_LABEL',
                    data: {},
                    is_ack: true,
                    ack_timeout: 200,
                    max_retry_count: 3,
                    priority: 'high' as 'high',
                    dest_node_type: device.model_no,
                    sub_node_type: device.sub_node_id,
                    source_add: "010000",
                    destination_add: device.address,
                    event_timeout: 1500,
                    transaction_id: promiseRegistry.newRequestId()
                };
                this.commandSender.sendSDNCommand(command);

                const labelResponse = await this.waitForCommand(
                    (cmd) =>
                        cmd.command_name === "POST_NODE_LABEL" &&
                        cmd.source_add === device.address,
                    command.transaction_id,
                    signal,
                );

                if (labelResponse) {
                    const label = labelResponse.data.label;

                    if (label && label.length > 0) {
                        device.label = label;
                    }

                    // Emit motor label update to frontend
                    SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, {
                        device_id: device.device_id,
                        address: device.address,
                        label: label,
                        status: 'device_label',
                        message: `label updated for device.`
                    });
                }

                await dbConfig.dbInstance.deviceModel.update(
                    { disp_status: 1, name: device.label, is_limit_set: device.isLimitSet },
                    { where: { device_id: device.device_id } }
                );

                if (device.device_type === 'motor') {
                    await dbConfig.dbInstance.motorModel.upsert({
                        device_id: device.device_id,
                        up_limit: device.limitData?.up_limit ?? null,
                        down_limit: device.limitData?.down_limit ?? null,
                    });
                }

                await this.sleepOrAbort(500, signal);
            }

            emitProgress(100, `Discovery completed! Found ${FOUNDED_DEVICES.length} motor(s)`);

            SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, {
                totalMotors: FOUNDED_DEVICES.length,
                message: 'Motor discovery completed',
                status: 'completed'
            });

            isDiscovering = false;
            isGetNewDeviceRunning = false;

            return {
                isError: false,
                message: 'Discovery process complete'
            }

        } catch (error) {
            if (error instanceof DiscoveryStoppedError) {
                stoppedByUser = true;
                SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Discovery stopped by user', status: 'stopped' });
                this.destroyCorruptedMotorData();
                return {
                    isError: false,
                    message: 'Discovery stopped by user'
                };
            } else {
                console.error('Error during motor discovery:', error);
            }
        } finally {
            isDiscovering = false;
            isGetNewDeviceRunning = false;
            if (this.abortController?.signal.aborted && !stoppedByUser) {
                SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'Discovery stopped by user', status: 'stopped' });
            }
            this.abortController = undefined;
        }
    }

    destroyCorruptedMotorData = async () => {
        try {
            await dbConfig.dbInstance.deviceModel.destroy({
                where: {
                    disp_status: 0,
                    device_type: {
                        [Op.in]: ['motor', 'rts-receiver']
                    }
                }
            });
        } catch (error) {
            console.error('Error destroying corrupted motor data:', error);
        }
    }
}
