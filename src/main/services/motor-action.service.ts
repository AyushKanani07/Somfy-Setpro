import { CommandSenderService } from "./command.sender.service.ts";
import { Socket_Events } from "../helpers/constant.ts";
import { dbConfig } from "../models/index.ts";
import type { getAckResponse } from "../interface/global.ts";
import type { Command, RampSetting } from "../interface/command.interface.ts";
import SocketService from "./socket.service.ts";
import type { NetworkConfigSetting } from "../interface/motor.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import { CommanService } from "./comman.service.ts";
import { SerialportConnectionService } from "./serialport.connection.service.ts";
import { promiseRegistry } from "../helpers/util.ts";

type MoveFunctionType = 'up' | 'down' | 'ip' | 'pos_pulse' | 'pos_per' | 'pos_angle_pulse' | 'curr_pos_angle_pulse' | 'curr_pos_angle_per' | 'curr_pos_angle_deg';
type MoveOfFunctionType = 'ip_up' | 'ip_down' | 'jog_down_pulse' | 'jog_up_pulse' | 'jog_down_ms' | 'jog_up_ms' | 'jog_down_per' | 'jog_up_per' | 'tilt_down_deg' | 'tilt_up_deg' | 'tilt_down_pulse' | 'tilt_up_pulse' | 'tilt_down_per' | 'tilt_up_per';
type IpFunctionType = 'delete' | 'curr_pos' | 'pos_pulse' | 'pos_per' | 'curr_pos_angle' | 'pos_angle_pulse' | 'pos_pulse_angle_per' | 'pos_pulse_angle_deg' | 'pos_per_angle_pulse' | 'pos_angle_per' | 'pos_per_angle_deg' | 'angle_pulse' | 'angle_per';

type functionMap = {
    function_id: number;
    requiresPosition?: boolean;
    requiresTilt?: boolean;
    missing_value_error?: string;
}

type FactoryDefaultType = 'all-settings' | 'remove-ip' | 'remove-group' | 'reset-motor-limits' | 'default-rolling-speed' | 'default-ramp-speed' | 'network-reset' | 'remove-all-channel';

export class MotorActionService {

    private commandSender = new CommandSenderService();
    private commanService = new CommanService();

    private moveFunctionMap: Record<MoveFunctionType, functionMap> = {
        'down': { function_id: 0x00 },
        'up': { function_id: 0x01 },
        'ip': { function_id: 0x02, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'pos_pulse': { function_id: 0x03, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'pos_per': { function_id: 0x04, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'pos_angle_pulse': { function_id: 0x08, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt' },
        'curr_pos_angle_pulse': { function_id: 0x0e, requiresTilt: true, missing_value_error: 'Missing value_tilt' },
        'curr_pos_angle_per': { function_id: 0x0f, requiresTilt: true, missing_value_error: 'Missing value_tilt' },
        'curr_pos_angle_deg': { function_id: 0x10, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt' },
    };

    private setTiltFunctionMap: Record<string, functionMap> = {
        'delete': { function_id: 0x00 },
        'current_pos': { function_id: 0x01 },
        'flat_current_pos': { function_id: 0x03 },
        'jog_up_pulse': { function_id: 0x04, requiresTilt: true, missing_value_error: 'Missing value_tilt.' },
        'jog_up_ms': { function_id: 0x05, requiresTilt: true, missing_value_error: 'Missing value_tilt.' },
        'pos_pulse': { function_id: 0x06, requiresTilt: true, missing_value_error: 'Missing value_tilt.' },
        'initial': { function_id: 0x10 },
    }

    private moveOfFunctionMap: Record<MoveOfFunctionType, functionMap> = {
        'ip_down': { function_id: 0x00 },
        'ip_up': { function_id: 0x01 },
        'jog_down_pulse': { function_id: 0x02, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'jog_up_pulse': { function_id: 0x03, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'jog_down_ms': { function_id: 0x04, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'jog_up_ms': { function_id: 0x05, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'jog_down_per': { function_id: 0x06, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'jog_up_per': { function_id: 0x07, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_down_deg': { function_id: 0x08, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_up_deg': { function_id: 0x09, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_down_pulse': { function_id: 0x0a, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_up_pulse': { function_id: 0x0b, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_down_per': { function_id: 0x0c, requiresPosition: true, missing_value_error: 'Missing value_position' },
        'tilt_up_per': { function_id: 0x0d, requiresPosition: true, missing_value_error: 'Missing value_position' },
    }

    private ipFunctionMap: Record<IpFunctionType, functionMap> = {
        'delete': { function_id: 0x00 },
        'curr_pos': { function_id: 0x01 },
        'pos_pulse': { function_id: 0x02, requiresPosition: true, missing_value_error: 'Missing value_position.' },
        'pos_per': { function_id: 0x03, requiresPosition: true, missing_value_error: 'Missing value_position.' },
        // 'auto': { function_id: 0x04 },
        'curr_pos_angle': { function_id: 0x05 },
        'pos_angle_pulse': { function_id: 0x06, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt' },
        'pos_pulse_angle_per': { function_id: 0x07, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt.' },
        'pos_pulse_angle_deg': { function_id: 0x08, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt.' },
        'pos_per_angle_pulse': { function_id: 0x09, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt.' },
        'pos_angle_per': { function_id: 0x0A, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt.' },
        'pos_per_angle_deg': { function_id: 0x0B, requiresPosition: true, requiresTilt: true, missing_value_error: 'Missing value_position or value_tilt.' },
        'angle_pulse': { function_id: 0x0C, requiresTilt: true, missing_value_error: 'Missing value_tilt.' },
        'angle_per': { function_id: 0x0C, requiresTilt: true, missing_value_error: 'Missing value_tilt.' },
    };

    private factoryDefaultMap: Record<FactoryDefaultType, number> = {
        'all-settings': 0x00,
        'remove-ip': 0x15,
        'remove-group': 0x01,
        'reset-motor-limits': 0x11,
        'default-rolling-speed': 0x13,
        'default-ramp-speed': 0x1B,
        'network-reset': 0x1C,
        'remove-all-channel': 0x02
    };

    motorMove = async (device_data: DeviceModel, direction: 'up' | 'down', duration: number, speed: 'up' | 'down' | 'slow', isACK: boolean = true): Promise<getAckResponse> => {
        try {
            const directionValue = direction === 'up' ? 0x01 : 0x00;
            const speedValue = speed === 'up' ? 0x00 : speed === 'down' ? 0x01 : 0x02;

            const command: Command = {
                command_name: 'CTRL_MOVE',
                data: {
                    direction: directionValue,
                    duration: duration,
                    speed: speedValue,
                },
                is_ack: isACK,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            }

            this.commandSender.sendSDNCommand(command);

            if (!isACK) return { message: `command sent successfully`, isError: false };

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    motorMoveTo = async (device_data: DeviceModel, function_type: MoveFunctionType, isACK: boolean = true, value_position?: number, value_tilt?: number): Promise<getAckResponse> => {
        try {
            let errorMsg = null;
            let positionRequired = this.moveFunctionMap[function_type].requiresPosition;
            let tiltRequired = this.moveFunctionMap[function_type].requiresTilt;
            let functionId = this.moveFunctionMap[function_type].function_id;

            if (positionRequired && (value_position === undefined || value_position === null)) {
                errorMsg = this.moveFunctionMap[function_type].missing_value_error;
            }
            if (tiltRequired && (value_tilt === undefined || value_tilt === null)) {
                errorMsg = this.moveFunctionMap[function_type].missing_value_error;
            }

            if (errorMsg) return { message: errorMsg, isError: true };

            let data = {
                value_position: value_position || 0,
                ...(tiltRequired && { value_tilt: value_tilt }),
                function_id: functionId,
                unused: 0,
            }

            const command: Command = {
                command_name: 'CTRL_MOVETO',
                data,
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

            if (!isACK) {
                return {
                    message: `command sent successfully`,
                    isError: false
                };
            }

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    allMotorMoveTo = async (function_type: MoveFunctionType, value_position?: number): Promise<getAckResponse> => {
        try {
            let errorMsg = null;
            let positionRequired = this.moveFunctionMap[function_type].requiresPosition;
            let functionId = this.moveFunctionMap[function_type].function_id;

            if (positionRequired && (value_position === undefined || value_position === null)) {
                errorMsg = this.moveFunctionMap[function_type].missing_value_error;
            }

            if (errorMsg) return { message: errorMsg, isError: true };

            const command: Command = {
                command_name: 'CTRL_MOVETO',
                data: {
                    function_id: functionId,
                    value_position: positionRequired ? value_position : 0,
                    unused: 0,
                },
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                dest_node_type: 0,
                destination_add: "FFFFFF",
                event_timeout: 1500,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);
            return {
                message: `command sent successfully`,
                isError: false
            };

        } catch (error) {
            throw error;
        }
    }

    motorMoveOf = async (device_data: DeviceModel, function_type: MoveOfFunctionType, isACK: boolean = true, value_position?: number, value_tilt?: number): Promise<getAckResponse> => {
        try {
            let errorMsg = null;
            let positionRequired = this.moveOfFunctionMap[function_type].requiresPosition;
            let functionId = this.moveOfFunctionMap[function_type].function_id;

            if (positionRequired && (value_position === undefined || value_position === null)) {
                errorMsg = this.moveOfFunctionMap[function_type].missing_value_error;
            }

            if (errorMsg) return { message: errorMsg, isError: true };

            let data = {
                value: positionRequired ? value_position : 0,
                function_id: functionId,
                reserved: 0,
            }

            const command = {
                command_name: 'CTRL_MOVEOF',
                data,
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

            if (!isACK) {
                return {
                    message: `command sent successfully`,
                    isError: false
                };
            }

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getMotorPosition = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_POSITION',
                data: {},
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getPositionResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_POSITION");
            if (getPositionResult.isError) return { message: getPositionResult.message, isError: true }

            const data = getPositionResult.data;
            await dbConfig.dbInstance.motorModel.update(
                { pos_pulse: data.position_pulse, pos_per: data.position_percentage, pos_tilt_per: data.tilting_percentage },
                { where: { device_id: device_data.device_id } }
            );

            return {
                message: `Motor position received successfully`,
                isError: false,
                data: data
            };
        } catch (error) {
            return {
                message: (error as Error).message || 'Failed to get motor position',
                isError: true
            };
        }
    }

    stopMotor = async (device_data: DeviceModel, isACK: boolean = true): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'CTRL_STOP',
                data: {
                    reserved: 0x01
                },
                is_ack: isACK,
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

            if (!isACK) {
                return {
                    message: `command sent successfully`,
                    isError: false
                };
            }

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");

            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    stopAllMotors = async (): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'CTRL_STOP',
                data: {
                    reserved: 0x01
                },
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                dest_node_type: 0,
                destination_add: "FFFFFF",
                event_timeout: 1500,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);
            return {
                message: `command sent successfully`,
                isError: false
            };
        } catch (error) {
            throw error;
        }
    }

    setMotorIp = async (device_data: DeviceModel, function_type: IpFunctionType, ip_index: number, value_position: number, value_tilt?: number, isGet: boolean = true): Promise<getAckResponse> => {
        try {

            let errorMsg = null;
            const ipFunction = this.ipFunctionMap[function_type];
            if (!ipFunction) return { message: `Invalid function_type provided.`, isError: true };

            let positionRequired = ipFunction.requiresPosition;
            let tiltRequired = ipFunction.requiresTilt;
            let functionId = ipFunction.function_id;

            if (positionRequired && (value_position === undefined || value_position === null)) {
                errorMsg = this.ipFunctionMap[function_type].missing_value_error;
            } else if (tiltRequired && (value_tilt === undefined || value_tilt === null)) {
                errorMsg = this.ipFunctionMap[function_type].missing_value_error;
            }

            if (errorMsg) return { message: errorMsg, isError: true };

            let data = {
                function_id: functionId,
                ip_index: ip_index,
                value_position: positionRequired ? value_position : 0,
                ...(tiltRequired && { value_tilting: value_tilt }),
            }

            const command: Command = {
                command_name: 'SET_MOTOR_IP',
                data,
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

            const port = SerialportConnectionService.getConnectedPortName();
            if (!getAckPromise.isError && isGet && port !== 'offline-edit') {
                this.getMotorIpByIndex(device_data, ip_index);
            }
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    setMotorIpAuto = async (device_data: DeviceModel, ip_count: number): Promise<getAckResponse> => {
        try {
            await this.setFactoryDefault(device_data, 'remove-ip');

            let functionId = 0x04;
            const command = {
                command_name: 'SET_MOTOR_IP',
                data: {
                    function_id: functionId,
                    ip_index: 0,
                    value_position: ip_count
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

            const port = SerialportConnectionService.getConnectedPortName();
            if (port !== 'offline-edit') {
                this.getMotorIps(device_data);
            }
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getMotorIps = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            for (let i = 1; i <= 16; i++) {
                const ipRes = await this.getMotorIpByIndex(device_data, i);
                if (ipRes.isError) throw new Error(ipRes.message);
            }
            return {
                message: `Motor IP fetched successfully`,
                isError: false
            };
        } catch (error) {
            throw error;
        }
    }

    getMotorIpByIndex = async (device_data: DeviceModel, ip_index: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_IP',
                data: {
                    ip_index: ip_index
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

            const getIpPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_IP");

            if (getIpPromise.isError) {
                const res = {
                    message: getIpPromise.message,
                    isError: true
                }
                SocketService.emit(Socket_Events.POST_MOTOR_IP, res);
                return res;
            }

            const newIp = getIpPromise.data;
            const motor = await dbConfig.dbInstance.motorModel.findOne({
                attributes: ['ip_data'],
                where: { device_id: device_data.device_id }
            });

            const existingIpData = motor?.ip_data ?? [];
            let updatedIpData: any[];

            if (newIp.pulse === 65535) {
                updatedIpData = existingIpData.filter(
                    (ip: any) => ip.index !== newIp.index
                );
            } else {
                const exists = existingIpData.some(
                    (ip: any) => ip.index === newIp.index
                );

                updatedIpData = exists
                    ? existingIpData.map((ip: any) =>
                        ip.index === newIp.index ? newIp : ip
                    )
                    : [...existingIpData, newIp];
            }

            await dbConfig.dbInstance.motorModel.update(
                { ip_data: updatedIpData },
                { where: { device_id: device_data.device_id } }
            );
            const res = {
                isError: false,
                message: `Motor IP received successfully`,
                data: newIp
            }
            SocketService.emit(Socket_Events.POST_MOTOR_IP, res);
            return res;
        } catch (error) {
            SocketService.emit(Socket_Events.POST_MOTOR_IP, {
                message: (error as Error).message || 'Failed to get motor IP',
                isError: true
            });
            throw error;
        }
    }

    setFactoryDefault = async (device_data: DeviceModel, function_type: FactoryDefaultType): Promise<getAckResponse> => {
        try {
            const command = {
                command_name: 'SET_FACTORY_DEFAULT',
                data: {
                    function_id: this.factoryDefaultMap[function_type] || 21
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

    winkMotor = async (device_data: DeviceModel, isACK: boolean = true): Promise<getAckResponse> => {
        try {
            const command = {
                command_name: 'CTRL_WINK',
                data: {},
                is_ack: isACK,
                ack_timeout: 1000,
                max_retry_count: 1,
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

    winkAllMotors = async (): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'CTRL_WINK',
                data: {},
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 1,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                dest_node_type: 0,
                destination_add: "FFFFFF",
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);
            return {
                message: `Command sent successfully`,
                isError: false
            };

        } catch (error) {
            throw error;
        }
    }

    setAppMode = async (device_data: DeviceModel, app_mode: number): Promise<getAckResponse> => {
        try {
            const command = {
                command_name: 'SET_APP_MODE',
                data: {
                    mode: app_mode
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

    getAppMode = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_APP_MODE',
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

            const getModePromiseResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_APP_MODE");

            if (getModePromiseResult.isError) return { message: getModePromiseResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { app_mode: getModePromiseResult.data.mode },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `App mode received successfully`,
                isError: false,
                data: getModePromiseResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setMotorDirection = async (device_data: DeviceModel, direction: 'forward' | 'reverse'): Promise<getAckResponse> => {
        try {
            let dir = direction.toLowerCase() == 'forward' ? 0 : 1;
            const command: Command = {
                command_name: 'SET_MOTOR_DIRECTION',
                data: {
                    direction: dir
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

    getMotorDirection = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_DIRECTION',
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

            const getDirectionPromiseResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_DIRECTION");

            if (getDirectionPromiseResult.isError) return { message: getDirectionPromiseResult.message, isError: true }

            const direction = getDirectionPromiseResult.data.direction == 0 ? 'forward' : 'reverse';
            await dbConfig.dbInstance.motorModel.update(
                { direction: direction },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Motor direction received successfully`,
                isError: false,
                data: direction
            };
        } catch (error) {
            throw error;
        }
    }

    setMotorLimits = async (device_data: DeviceModel, function_type: 'top' | 'bottom' | 'pulse', value_position?: number): Promise<getAckResponse> => {
        try {
            const fnMap = {
                top: { function_id: 1, limit: 1, needsValue: false },
                bottom: { function_id: 1, limit: 0, needsValue: false },
                pulse: { function_id: 2, limit: 0, needsValue: true }
            };

            const cfg = fnMap[function_type];

            if (cfg.needsValue && (value_position == null || value_position == undefined)) {
                return {
                    message: `Missing value position.`,
                    isError: true
                };
            }

            const command: Command = {
                command_name: 'SET_MOTOR_LIMITS',
                data: {
                    function_id: cfg.function_id,
                    limit: cfg.limit,
                    value: cfg.needsValue ? value_position : 0
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

            const ackPromiseResult = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return ackPromiseResult;

        } catch (error) {
            throw error;
        }

    }

    getMotorLimits = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_LIMITS',
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

            const limitsResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_LIMITS");
            if (limitsResult.isError) return { message: limitsResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { up_limit: limitsResult.data.up_limit, down_limit: limitsResult.data.down_limit },
                { where: { device_id: device_data.device_id } }
            );
            const isLimitSet = limitsResult.data.up_limit !== 65535 && limitsResult.data.down_limit !== 65535;
            await dbConfig.dbInstance.deviceModel.update(
                { is_limit_set: isLimitSet },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Motor limits received successfully`,
                isError: false,
                data: limitsResult.data
            };

        } catch (error) {
            throw error;
        }

    }

    setMotorTiltLimits = async (device_data: DeviceModel, function_type: string, value_tilt?: number): Promise<getAckResponse> => {
        try {
            const functionId = this.setTiltFunctionMap[function_type]?.function_id;
            if (functionId === undefined || functionId === null) {
                return {
                    message: `Invalid function type`,
                    isError: true
                };
            }
            const tiltRequired = this.setTiltFunctionMap[function_type].requiresTilt;
            if (tiltRequired && (value_tilt === undefined || value_tilt === null)) {
                return {
                    message: this.setTiltFunctionMap[function_type].missing_value_error || ``,
                    isError: true
                };
            }
            const command = {
                command_name: 'SET_TILT_LIMITS',
                data: {
                    function_id: functionId,
                    value: tiltRequired ? value_tilt : 0,
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

            const ackPromiseResult = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return ackPromiseResult;
        } catch (error) {
            throw error;
        }
    }

    getMotorTiltLimits = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_TILT_LIMITS',
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
            }

            this.commandSender.sendSDNCommand(command);

            const limitsResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_TILT_LIMITS");
            if (limitsResult.isError) return { message: limitsResult.message, isError: true }

            return {
                message: `Motor tilt limits received successfully`,
                isError: false,
                data: limitsResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    setMotorRollingSpeed = async (device_data: DeviceModel, up: number, down: number, slow: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_MOTOR_ROLLING_SPEED',
                data: { up, down, slow },
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

    getMotorRollingSpeed = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_ROLLING_SPEED',
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

            const speedResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_ROLLING_SPEED");
            if (speedResult.isError) return { message: speedResult.message, isError: true }

            const data = speedResult.data;
            await dbConfig.dbInstance.motorModel.update(
                { up_speed: data.up_speed, down_speed: data.down_speed, slow_speed: data.slow_speed },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Motor rolling speed received successfully`,
                isError: false,
                data: speedResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    setDefaultRampTime = async (device_data: DeviceModel, function_type: string): Promise<getAckResponse> => {
        try {
            const DEFAULT_FUNCTION = 0x02;
            const DEFAULT_VALUE = 150;
            const rampId = this.getRamps(function_type);

            const sendRampCmd = async (function_id: number) => {
                const command = {
                    command_name: "SET_MOTOR_SOFT_START_STOP",
                    data: {
                        function_id,
                        ramp: rampId,
                        value: DEFAULT_VALUE
                    },
                    is_ack: true,
                    ack_timeout: 1000,
                    max_retry_count: 3,
                    priority: "low" as const,
                    source_add: "010000",
                    event_timeout: 1500,
                    sub_node_type: device_data.sub_node_id,
                    dest_node_type: device_data.model_no,
                    destination_add: device_data.address,
                    transaction_id: promiseRegistry.newRequestId()
                };

                this.commandSender.sendSDNCommand(command);

                const ackPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
                return ackPromise;
            };

            const enableResult = await sendRampCmd(0x01);
            if (enableResult?.isError) return enableResult;

            const defaultResult = await sendRampCmd(DEFAULT_FUNCTION);
            return defaultResult;
        } catch (err) {
            throw err;
        }
    }

    getMotorRampTime = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_MOTOR_SOFT_START_STOP',
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

            const rampResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_MOTOR_SOFT_START_STOP");
            if (rampResult.isError) return { message: rampResult.message, isError: true }

            const rampTimeData = rampResult.data;
            const ramp = [
                rampTimeData.start_status_up, rampTimeData.start_value_up,
                rampTimeData.stop_status_up, rampTimeData.stop_value_up,
                rampTimeData.start_status_down, rampTimeData.start_value_down,
                rampTimeData.stop_status_down, rampTimeData.stop_value_down
            ];
            await dbConfig.dbInstance.motorModel.update(
                { ramp: ramp },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Motor ramp time received successfully`,
                isError: false,
                data: rampResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    saveMotorRampTime = async (device_data: DeviceModel, rampData: RampSetting): Promise<getAckResponse> => {
        try {
            const rampAdjustFn = 0x02;
            const rampId = this.getRamps(rampData.ramp_key);

            const sendRampCmd = async (function_id: number) => {
                const cmd = {
                    command_name: 'SET_MOTOR_SOFT_START_STOP',
                    data: {
                        function_id,
                        ramp: rampId,
                        value: rampData.value
                    },
                    is_ack: true,
                    ack_timeout: 1000,
                    max_retry_count: 3,
                    priority: 'low' as const,
                    source_add: "010000",
                    event_timeout: 1500,
                    sub_node_type: device_data.sub_node_id,
                    dest_node_type: device_data.model_no,
                    destination_add: device_data.address,
                    transaction_id: promiseRegistry.newRequestId()
                };

                this.commandSender.sendSDNCommand(cmd);
                return promiseRegistry.waitForTransaction(cmd.transaction_id, "ACK");
            };

            const enableResult = await sendRampCmd(rampData.enabled ? 0x01 : 0x00);
            if (enableResult?.isError) return enableResult;

            const adjustResult = await sendRampCmd(rampAdjustFn);
            return adjustResult;

        } catch (err) {
            throw err;
        }
    }

    getTorqueLimitation = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_TORQUE_LIMITATION',
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

            const torqueResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_TORQUE_LIMITATION");
            if (torqueResult.isError) return { message: torqueResult.message, isError: true }

            const torqueLimitData = torqueResult.data;
            const torque = [torqueLimitData.status, torqueLimitData.level];
            await dbConfig.dbInstance.motorModel.update(
                { torque: torque },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Torque limitation received successfully`,
                isError: false,
                data: torqueResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setTorqueLimitation = async (device_data: DeviceModel, isEnabled: number, torqueValue: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_TORQUE_LIMITATION',
                data: {
                    function_id: isEnabled ? 0 : 1,
                    value: torqueValue
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

    setMotorLedStatus = async (device_data: DeviceModel, status: number, priority: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_LOCAL_UI',
                data: {
                    function_id: status,
                    ui_index: 0x05,
                    priority: priority
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

    getMotorLedStatus = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_LOCAL_UI',
                data: {
                    ui_index: 0x05
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

            const getLedResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_LOCAL_UI");
            if (getLedResult.isError) return { message: getLedResult.message, isError: true }

            const localUI = getLedResult.data;
            await dbConfig.dbInstance.motorModel.update(
                { motor_led_status: [localUI.status, localUI.source_addr, localUI.priority] },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Motor LED status received successfully`,
                isError: false,
                data: {
                    status: localUI.status,
                }
            };

        } catch (error) {
            throw error;
        }
    }

    setNetworkLock = async (device_data: DeviceModel, isLocked: boolean, priority: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_NETWORK_LOCK',
                data: {
                    function_id: isLocked ? 1 : 0,
                    priority: priority
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

    getNetworkLock = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NETWORK_LOCK',
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

            const getLockResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NETWORK_LOCK");
            if (getLockResult.isError) return { message: getLockResult.message, isError: true }

            const networkLockData = getLockResult.data;
            const networkLockPayload = [
                networkLockData.status,
                networkLockData.source_addr,
                networkLockData.priority
            ];
            if (networkLockData.status !== undefined || networkLockData.status !== null) {
                networkLockPayload.push(networkLockData.saved);
            }
            await dbConfig.dbInstance.motorModel.update(
                { network_lock: networkLockPayload },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Network lock status received successfully`,
                isError: false,
                data: getLockResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    getNetworkConfig = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NETWORK_CONFIG',
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

            const getConfigResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NETWORK_CONFIG");
            if (getConfigResult.isError) return { message: getConfigResult.message, isError: true }

            const networkConfig = getConfigResult.data;
            await dbConfig.dbInstance.motorModel.update(
                { network_config: [networkConfig.broadcast_mode, networkConfig.broadcast_max_random_value, networkConfig.supervision_active, networkConfig.supervision_time_period, networkConfig.deaf_mode] },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Network config received successfully`,
                isError: false,
                data: getConfigResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setDCTMode = async (device_data: DeviceModel, mode: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_DCT_MODE',
                data: { mode },
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

    getDCTMode = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_DCT_MODE',
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

            const getDCTModeResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_DCT_MODE");
            if (getDCTModeResult.isError) return { message: getDCTModeResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { dct_mode: getDCTModeResult.data.mode },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `DCT mode received successfully`,
                isError: false,
                data: getDCTModeResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    setTouchMotionSensitivity = async (device_data: DeviceModel, mode: number, sensitivity: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_TOUCH_MOTION_SENSITIVITY',
                data: { mode, value: sensitivity },
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

    getTouchMotionSensitivity = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_TOUCH_MOTION_SENSITIVITY',
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

            const getSensitivityResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_TOUCH_MOTION_SENSITIVITY");
            if (getSensitivityResult.isError) return { message: getSensitivityResult.message, isError: true }

            const data = getSensitivityResult.data;
            await dbConfig.dbInstance.motorModel.update(
                { touch_motion_sensitivity: [data.mode, data.value] },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Touch motion sensitivity received successfully`,
                isError: false,
                data: getSensitivityResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    getMotorLabel = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NODE_LABEL',
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

            const getLabelResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NODE_LABEL");
            if (getLabelResult.isError) return { message: getLabelResult.message, isError: true }

            await dbConfig.dbInstance.deviceModel.update(
                { name: getLabelResult.data.label },
                { where: { device_id: device_data.device_id } }
            );

            return {
                message: `Motor label received successfully`,
                isError: false,
                data: getLabelResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setMotorLabel = async (device_data: DeviceModel, label: string): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_NODE_LABEL',
                data: { label },
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

            const getLabelResult = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getLabelResult;

        } catch (error) {
            throw error;
        }
    }

    diagGetTotalMoveCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_TOTAL_MOVE_COUNT',
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

            const getMoveCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_TOTAL_MOVE_COUNT");
            if (getMoveCountResult.isError) return { message: getMoveCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { move_count: getMoveCountResult.data.move_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Total move count received successfully`,
                isError: false,
                data: getMoveCountResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    diagGetTotalRevCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_TOTAL_REV_COUNT',
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

            const getRevCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_TOTAL_REV_COUNT");
            if (getRevCountResult.isError) return { message: getRevCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { revolution_count: getRevCountResult.data.revolution_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Total rev count received successfully`,
                isError: false,
                data: getRevCountResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    diagGetThermalCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_THERMAL_COUNT',
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

            const getThermalCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_THERMAL_COUNT");
            if (getThermalCountResult.isError) return { message: getThermalCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { thermal_count: getThermalCountResult.data.thermal_count, post_thermal_count: getThermalCountResult.data.post_thermal_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Thermal count received successfully`,
                isError: false,
                data: getThermalCountResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    diagGetObstacleCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_OBSTACLE_COUNT',
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

            const getObstacleCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_OBSTACLE_COUNT");
            if (getObstacleCountResult.isError) return { message: getObstacleCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { obstacle_count: getObstacleCountResult.data.obstacle_count, post_obstacle_count: getObstacleCountResult.data.post_obstacle_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Obstacle count received successfully`,
                isError: false,
                data: getObstacleCountResult.data
            };
        } catch (error) {
            throw error;
        }
    }

    diagGetPowerCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_POWER_COUNT',
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

            const getPowerCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_POWER_COUNT");
            if (getPowerCountResult.isError) return { message: getPowerCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { power_cut_count: getPowerCountResult.data.power_cut_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Power count received successfully`,
                isError: false,
                data: getPowerCountResult.data
            }

        } catch (error) {
            throw error;
        }
    }

    diagGetResetCount = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'DIAG_GET_RESET_COUNT',
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

            const getResetCountResult = await promiseRegistry.waitForTransaction(command.transaction_id, "DIAG_POST_RESET_COUNT");
            if (getResetCountResult.isError) return { message: getResetCountResult.message, isError: true }

            await dbConfig.dbInstance.motorModel.update(
                { reset_count: getResetCountResult.data.reset_count },
                { where: { device_id: device_data.device_id } }
            );
            return {
                message: `Reset count received successfully`,
                isError: false,
                data: getResetCountResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    getNetworkStat = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NETWORK_STAT',
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

            const getNetworkStatusResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NETWORK_STAT");
            if (getNetworkStatusResult.isError) return { message: getNetworkStatusResult.message, isError: true }

            return {
                message: `Network status received successfully`,
                isError: false,
                data: getNetworkStatusResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    getNetworkErrorStat = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NETWORK_ERROR_STAT',
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

            const getNetworkErrorStatResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NETWORK_ERROR_STAT");
            if (getNetworkErrorStatResult.isError) return { message: getNetworkErrorStatResult.message, isError: true }

            return {
                message: `Network error statistics received successfully`,
                isError: false,
                data: getNetworkErrorStatResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setMotorConfig = async (device_data: DeviceModel, configData: NetworkConfigSetting): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_NETWORK_CONFIG',
                data: configData,
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 1,
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

    setNetworkConfig = async (device_data: DeviceModel, configData: NetworkConfigSetting): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_NETWORK_CONFIG',
                data: configData,
                is_ack: false,
                ack_timeout: 1500,
                max_retry_count: 1,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 1500,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: 0x0,
                destination_add: "ffffff",
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            return {
                message: `Network config set successfully`,
                isError: false
            };

        } catch (error) {
            throw error;
        }
    }

    setCalibration = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_CALIBRATION',
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
            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    private getRamps(mode: string) {
        let ramp;
        switch (mode) {
            case 'start_up':
                ramp = 0x04;
                break;
            case 'stop_up':
                ramp = 0x05;
                break;
            case 'start_down':
                ramp = 0x07;
                break;
            case 'stop_down':
                ramp = 0x08;
                break;
            default:
                ramp = 0x00;
                break;
        }
        return ramp;
    }

}
