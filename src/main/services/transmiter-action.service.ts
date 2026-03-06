import { promiseRegistry } from "../helpers/util.ts";
import type { Command } from "../interface/command.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import type { getAckResponse } from "../interface/global.ts";
import type { DataToStore } from "../interface/transmiter.interface.ts";
import { dbConfig } from "../models/index.ts";
import { CommandSenderService } from "./command.sender.service.ts";

type ControlFunctionType = 'down' | 'up' | 'stop' | 'ip';

type functionMap = {
    function_id: number;
    requiredChannel?: boolean;
    missing_value_error?: string;
}

export class TransmiterActionService {
    private commandSender = new CommandSenderService();

    private controlFunctionMap: Record<ControlFunctionType, functionMap> = {
        'down': { function_id: 0x02, requiredChannel: true, missing_value_error: 'Missing channel value' },
        'up': { function_id: 0x01, requiredChannel: true, missing_value_error: 'Missing channel value' },
        'stop': { function_id: 0x03, requiredChannel: true, missing_value_error: 'Missing channel value' },
        'ip': { function_id: 0x04, requiredChannel: true, missing_value_error: 'Missing channel value' }
    };

    setChannelMode = async (device_data: DeviceModel, channel_number: number, frequency_mode: 'us' | 'ce', application_mode: 'rolling' | 'tilting', feature_set_mode: 'normal' | 'modulis'): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_CHANNEL_MODE',
                data: {
                    channel_number,
                    frequency_mode: frequency_mode == 'us' ? 1 : 0,
                    application_mode: application_mode == 'rolling' ? 0 : 1,
                    feature_set_mode: feature_set_mode == 'normal' ? 0 : 1
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;
        } catch (error) {
            throw error;
        }
    }

    getChannelMode = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_CHANNEL_MODE',
                data: {
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getChannelResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_CHANNEL_MODE");
            if (getChannelResponse.isError) return { message: getChannelResponse.message, isError: true };

            const resData = getChannelResponse.data
            const payload: DataToStore = {
                frequency_mode: resData.frequency_mode,
                application_mode: resData.application_mode,
                feature_set_mode: resData.feature_set_mode
            }
            await this.updatedb(device_data.device_id, channel, payload);

            return {
                message: `Channel mode retrieved successfully`,
                isError: false,
                data: resData
            };

        } catch (error) {
            throw error;
        }
    }

    getRtsAddress = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_RTS_ADDRESS',
                data: {
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getRtsAddressResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_RTS_ADDRESS");
            if (getRtsAddressResponse.isError) return { message: getRtsAddressResponse.message, isError: true };

            const payload: DataToStore = {
                rts_address: getRtsAddressResponse.data.rts_address
            }
            await this.updatedb(device_data.device_id, channel, payload);
            return {
                message: `RTS address retrieved successfully`,
                isError: false,
                data: getRtsAddressResponse.data
            };

        } catch (error) {
            throw error;
        }
    }

    setSunAuto = async (device_data: DeviceModel, mode: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_SUN_AUTO',
                data: {
                    sun_auto: mode
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    setIp = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_IP',
                data: {
                    channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }

    }

    controlPosition = async (device_data: DeviceModel, channel: number, function_type: ControlFunctionType): Promise<getAckResponse> => {
        try {
            let errorMsg = null;
            const functionConfig = this.controlFunctionMap[function_type];
            if (!functionConfig) return { message: `Invalid function_type value`, isError: true };

            const requiredChannel = functionConfig.requiredChannel;

            if (requiredChannel && (channel === null || channel === undefined)) {
                errorMsg = functionConfig.missing_value_error || 'Missing channel value';
            }
            if (errorMsg) return { message: errorMsg, isError: true };

            const command: Command = {
                command_name: 'CTRL_POSITION',
                data: {
                    function_id: functionConfig.function_id,
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'high' as 'high',
                source_add: "010000",
                event_timeout: 2000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    controlTilt = async (device_data: DeviceModel, channel: number, function_type: string, tilt_amplitude: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'CTRL_TILT',
                data: {
                    channel: channel,
                    function_type: function_type == 'up' ? 0 : 1,
                    tilt_amplitude: tilt_amplitude
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'high' as 'high',
                source_add: "010000",
                event_timeout: 2000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    controlDimension = async (device_data: DeviceModel, channel: number, function_type: string, dim_amplitude: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'CTRL_DIM',
                data: {
                    channel: channel,
                    function_type: function_type == 'up' ? 0 : 1,
                    dim_amplitude: dim_amplitude
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'high' as 'high',
                source_add: "010000",
                event_timeout: 2000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    setTiltFrameCount = async (device_data: DeviceModel, channel: number, tilt_frame_us: number, tilt_frame_ce: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_TILT_FRAMECOUNT',
                data: {
                    channel,
                    tilt_frame_us,
                    tilt_frame_ce
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getTiltFrameCount = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_TILT_FRAMECOUNT',
                data: {
                    channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getTiltFrameCountResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_TILT_FRAMECOUNT");
            if (getTiltFrameCountResponse.isError) return { message: getTiltFrameCountResponse.message, isError: true };

            const payload: DataToStore = {
                tilt_frame_us: getTiltFrameCountResponse.data.tilt_frame_us,
                tilt_frame_ce: getTiltFrameCountResponse.data.tilt_frame_ce
            }
            await this.updatedb(device_data.device_id, channel, payload);
            return {
                message: `Tilt frame count retrieved successfully`,
                isError: false,
                data: getTiltFrameCountResponse.data
            };

        } catch (error) {
            throw error;
        }
    }

    setDimFrameCount = async (device_data: DeviceModel, channel: number, dim_frame: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_DIM_FRAMECOUNT',
                data: {
                    channel,
                    dim_frame
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getDimFrameCount = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_DIM_FRAMECOUNT',
                data: {
                    channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getDimFrameCountResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_DIM_FRAMECOUNT");
            if (getDimFrameCountResponse.isError) return { message: getDimFrameCountResponse.message, isError: true };

            const payload: DataToStore = {
                dim_frame: getDimFrameCountResponse.data.dim_frame
            }
            await this.updatedb(device_data.device_id, channel, payload);
            return {
                message: `Dim frame count retrieved successfully`,
                isError: false,
                data: getDimFrameCountResponse.data
            };

        } catch (error) {
            throw error;
        }
    }

    setDctLock = async (device_data: DeviceModel, index: number, lock: boolean): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_DCT_LOCK',
                data: {
                    index: index,
                    isLocked: lock ? 1 : 0
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getDctLock = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_DCT_LOCK',
                data: {},
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getDtcLockResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_DCT_LOCK");
            if (getDtcLockResponse.isError) return { message: getDtcLockResponse.message, isError: true };

            await dbConfig.dbInstance.deviceModel.update({ dct_lock: getDtcLockResponse.data }, { where: { device_id: device_data.device_id } });
            return {
                message: `DTC lock retrieved successfully`,
                isError: false,
                data: getDtcLockResponse.data
            };

        } catch (error) {
            throw error;
        }
    }

    setChannel = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_CHANNEL',
                data: {
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    setOpenProg = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_OPEN_PROG',
                data: {
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }

    }

    setRtsAddressChange = async (device_data: DeviceModel, channel: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_RTS_ADDRESS_CHANGE',
                data: {
                    channel: channel
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    updatedb = async (device_id: number, channel_no: number, payload: DataToStore) => {
        const rtsData = await dbConfig.dbInstance.rtsTransmitterModel.findOne({ where: { device_id: device_id, channel_no: channel_no } });
        if (rtsData) {
            await rtsData.update(payload);
        } else {
            await dbConfig.dbInstance.rtsTransmitterModel.create({ device_id: device_id, channel_no: channel_no, ...payload });
        }
    }

}