import { promiseRegistry } from "../helpers/util.ts";
import type { Command } from "../interface/command.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import { CommandSenderService } from "./command.sender.service.ts";


export class GroupActionService {

    private commandSender = new CommandSenderService();

    setMotorGroup = async (device_data: DeviceModel, group_address: string, index: number): Promise<{ isError: boolean; message: string; }> => {
        try {
            const command: Command = {
                command_name: 'SET_GROUP_ADDR',
                data: {
                    group_address: group_address,
                    group_index: index
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

    getMotorGroupByIndex = async (device_data: DeviceModel, index: number): Promise<{ isError: boolean; message: string; data?: any; }> => {
        try {
            const command: Command = {
                command_name: 'GET_GROUP_ADDR',
                data: {
                    group_index: index
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

            const getGroupPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_GROUP_ADDR");

            if (getGroupPromise.isError) return { message: getGroupPromise.message, isError: true };

            return {
                isError: false,
                message: `Motor IP received successfully`,
                data: getGroupPromise.data
            }
        } catch (error) {
            throw error;
        }
    }

    winkGroup = async (group_address: string): Promise<{ isError: boolean; message: string; }> => {
        try {
            const command: Command = {
                command_name: 'CTRL_WINK',
                data: {},
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: group_address,
                event_timeout: 1500,
                dest_node_type: 0x0,
                destination_add: "000000",
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            return {
                isError: false,
                message: 'Wink command sent successfully.'
            };
        } catch (error) {
            throw error;
        }
    }

    groupMoveTo = async (group_address: string, action: 'up' | 'down'): Promise<{ isError: boolean; message: string; }> => {
        try {
            const command: Command = {
                command_name: 'CTRL_MOVETO',
                data: {
                    function_id: action === 'up' ? 0x01 : 0x00,
                    value_position: 0,
                    unused: 0,
                },
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 1,
                priority: 'low' as 'low',
                source_add: group_address,
                event_timeout: 1500,
                dest_node_type: 0x0,
                destination_add: "000000",
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            return {
                isError: false,
                message: `Command sent successfully.`
            };

        } catch (error) {
            throw error;
        }
    }

    groupStop = async (group_address: string): Promise<{ isError: boolean; message: string; }> => {
        try {
            const command: Command = {
                command_name: 'CTRL_STOP',
                data: {
                    reserved: 0x01
                },
                is_ack: false,
                ack_timeout: 1000,
                max_retry_count: 1,
                priority: 'low' as 'low',
                source_add: group_address,
                event_timeout: 1500,
                dest_node_type: 0x0,
                destination_add: "000000",
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            return {
                isError: false,
                message: `Command sent successfully.`
            };

        } catch (error) {
            throw error;
        }
    }


}