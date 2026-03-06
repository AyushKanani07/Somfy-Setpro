import { Socket_Events } from "../helpers/constant.ts";
import { promiseRegistry } from "../helpers/util.ts";
import type { Command } from "../interface/command.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import type { IndividualSwitchGroup, SwitchSettings } from "../interface/keypad.interface.ts";
import { dbConfig } from "../models/index.ts";
import { CommandSenderService } from "./command.sender.service.ts";
import SocketService from "./socket.service.ts";


interface getAckResponse {
    message: string;
    isError: boolean;
    data?: any;
}

export class KeypadActionService {

    private commandSender = new CommandSenderService();

    setKeypadType = async (device_data: DeviceModel, type: number, ack: boolean = true): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_KEYPAD_TYPE',
                data: {
                    keypad_type: type
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

            if (!ack) {
                return {
                    message: 'Command sent successfully',
                    isError: false
                };
            }

            const getAckPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            return getAckPromise;
        } catch (error) {
            throw error;
        }
    }

    getIndividualSwitchGroups = async (device_data: DeviceModel,): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_INDIVIDUAL_SWITCH_GROUPS',
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

            const getSwitchGroupResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_INDIVIDUAL_SWITCH_GROUPS");
            if (getSwitchGroupResult.isError) return { message: getSwitchGroupResult.message, isError: true }

            for (const [key, value] of Object.entries(getSwitchGroupResult.data)) {
                const number = Number(key.match(/\d+/)?.[0]);
                await dbConfig.dbInstance.keypadModel.update({ group_address: value }, {
                    where: { device_id: device_data.device_id, key_no: number }
                });
            }

            return {
                message: `Individual switch groups received successfully`,
                isError: false,
                data: getSwitchGroupResult.data
            };

        } catch (error) {
            throw error;
        }
    }

    setSwitchSettings = async (device_data: DeviceModel, switch_data: SwitchSettings): Promise<getAckResponse> => {
        try {
            const sdnCommand: Command = {
                command_name: 'SET_SWITCH_SETTINGS',
                data: switch_data,
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

            this.commandSender.sendSDNCommand(sdnCommand);

            const getAckPromise = await promiseRegistry.waitForTransaction(sdnCommand.transaction_id, "ACK");
            return getAckPromise;

        } catch (error) {
            throw error;
        }
    }

    getIndividualSwitchSettings = async (device_id: number, button_id: number): Promise<getAckResponse> => {
        try {
            const keypadInfo = await dbConfig.dbInstance.deviceModel.findOne({
                attributes: ['device_id', 'address', 'model_no', 'sub_node_id', 'key_count'],
                where: { device_id: device_id, device_type: 'keypad' },
                raw: true
            });
            if (!keypadInfo) return { message: 'Keypad not found', isError: true };

            if (keypadInfo.key_count == 6 && (button_id === 4 || button_id === 5)) {
                return {
                    message: `Button ID ${button_id} is not valid for this keypad`,
                    isError: true
                };
            }

            const command: Command = {
                command_name: 'GET_SWITCH_SETTINGS',
                data: {
                    button_id
                },
                is_ack: true,
                ack_timeout: 1000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                dest_node_type: keypadInfo.model_no,
                sub_node_type: keypadInfo.sub_node_id,
                destination_add: keypadInfo.address,
                event_timeout: 1500,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const response = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_SWITCH_SETTING");
            if (response.isError) return { message: `${response.message} For Button ID ${button_id}`, isError: true }

            const dbPayload = {
                device_id: device_id,
                key_no: response.data.button_id,
                target_address: response.data.press_target_addr,
                addr_code: response.data.press_addr_code,

                press_command: response.data.press_command,
                press_value: response.data.press_value,
                press_extra_value: response.data.press_extra_value,

                hold_command: response.data.hold_command,
                hold_value: response.data.hold_value,
                hold_extra_value: response.data.hold_extra_value,

                release_command: response.data.release_command,
                release_value: response.data.release_value,
                release_extra_value: response.data.release_extra_value,
            }

            await dbConfig.dbInstance.keypadModel.update(dbPayload, {
                where: {
                    device_id: device_id,
                    key_no: button_id
                }
            });

            return {
                message: `Switch setting received successfully`,
                isError: false,
                data: response.data
            };

        } catch (error) {
            throw error;
        }
    }

    getAllSwitchSettings = async (device_id: number): Promise<getAckResponse> => {
        try {
            const keypadInfo = await dbConfig.dbInstance.deviceModel.findOne({
                attributes: ['device_id', 'address', 'model_no', 'sub_node_id', 'key_count'],
                where: { device_id: device_id, device_type: 'keypad' },
                raw: true
            });
            if (!keypadInfo) {
                SocketService.emit(Socket_Events.POST_KEYPAD_SWITCH_SETTINGS, {
                    message: 'Keypad not found',
                    status: 'error'
                });
                return {
                    message: 'Keypad not found',
                    isError: true
                }
            };

            for (let button_id = 1; button_id <= 8; button_id++) {
                if (keypadInfo.key_count == 6 && (button_id === 4 || button_id === 5)) continue;

                const command: Command = {
                    command_name: 'GET_SWITCH_SETTINGS',
                    data: {
                        button_id
                    },
                    is_ack: false,
                    ack_timeout: 1000,
                    max_retry_count: 3,
                    priority: 'low' as 'low',
                    source_add: "010000",
                    dest_node_type: keypadInfo.model_no,
                    sub_node_type: keypadInfo.sub_node_id,
                    destination_add: keypadInfo.address,
                    event_timeout: 1500,
                    transaction_id: promiseRegistry.newRequestId()
                };

                this.commandSender.sendSDNCommand(command);

                const response = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_SWITCH_SETTING");

                if (response.isError) throw new Error(response.message);

                const dbPayload = {
                    device_id: device_id,
                    key_no: response.data.button_id,
                    target_address: response.data.press_target_addr,
                    addr_code: response.data.press_addr_code,

                    press_command: response.data.press_command,
                    press_value: response.data.press_value,
                    press_extra_value: response.data.press_extra_value,

                    hold_command: response.data.hold_command,
                    hold_value: response.data.hold_value,
                    hold_extra_value: response.data.hold_extra_value,

                    release_command: response.data.release_command,
                    release_value: response.data.release_value,
                    release_extra_value: response.data.release_extra_value,
                }

                await dbConfig.dbInstance.keypadModel.update(dbPayload, {
                    where: {
                        device_id: device_id,
                        key_no: button_id
                    }
                });

                const responseData = {
                    status: response.isError ? 'error' : 'success',
                    message: response.message,
                    data: response.data
                }
                SocketService.emit(Socket_Events.POST_KEYPAD_SWITCH_SETTINGS, responseData);
            }

            SocketService.emit(Socket_Events.POST_KEYPAD_SWITCH_SETTINGS, {
                message: 'Completed fetching all switch settings',
                status: 'completed'
            });

            return {
                message: 'Successfully fetched all switch settings',
                isError: false
            }

        } catch (error) {
            SocketService.emit(Socket_Events.POST_KEYPAD_SWITCH_SETTINGS, {
                message: 'Error retrieving keypad switch settings',
                status: 'error'
            });
            throw error;
        }
    }

    setIndividualSwitchGroup = async (device_data: DeviceModel, group_data: IndividualSwitchGroup): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'SET_INDIVIDUAL_SWITCH_GROUPS',
                data: group_data,
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
            return {
                isError: true,
                message: (error as Error).message
            };
        }
    }
}