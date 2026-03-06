import type { Command } from "../interface/command.interface.ts";
import type { getAckResponse } from "../interface/global.ts";
import { dbConfig } from "../models/index.ts";
import { CommandSenderService } from "./command.sender.service.ts";
import type { DeviceModel } from "../interface/device.ts";
import { promiseRegistry } from "../helpers/util.ts";


export class CommanService {

    private commandSender = new CommandSenderService();

    public getSubNodeId = async (nodeType: number, address: string): Promise<getAckResponse> => {
        const command = {
            command_name: 'GET_NODE_APP_VERSION',
            data: {},
            is_ack: true,
            ack_timeout: 200,
            max_retry_count: 3,
            priority: 'high' as 'high',
            dest_node_type: nodeType,
            source_add: "010000",
            destination_add: address,
            event_timeout: 1500,
            transaction_id: promiseRegistry.newRequestId()
        };

        this.commandSender.sendSDNCommand(command);

        const subNodeResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NODE_APP_VERSION");
        if (subNodeResult.isError) return { isError: true, message: subNodeResult.message };

        const data = subNodeResult.data;
        const sub_node_id = ((data.app_index_number & 0xFF) << 16) | ((data.app_index_letter & 0xFF) << 8) | data.app_reference;
        return {
            isError: false,
            message: 'Sub Node ID retrieved successfully',
            data: {
                sub_node_id
            }
        }
    }

    getFirmwareVersion = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_FIRMWARE_VERSION',
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

            const firmwareResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_FIRMWARE_VERSION");
            if (firmwareResponse.isError) return { isError: true, message: firmwareResponse.message };

            const firmwareData = firmwareResponse.data;
            const firmware_version = `${firmwareData.major_version}.${firmwareData.minor_version}`;
            await dbConfig.dbInstance.deviceModel.update(
                { firmware_version: firmware_version },
                { where: { device_id: device_data.device_id } }
            );
            return {
                isError: false,
                message: `Firmware version retrieved successfully`,
                data: { firmware_version }
            }
        } catch (error) {
            throw error;
        }
    }

    getNodeAppVersion = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NODE_APP_VERSION',
                data: {},
                is_ack: true,
                ack_timeout: 2000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 2000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const getAppVersionPromiseResult = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NODE_APP_VERSION");

            if (getAppVersionPromiseResult.isError) return { message: getAppVersionPromiseResult.message, isError: true }

            const appVersionData = getAppVersionPromiseResult.data;
            const sub_node_id = appVersionData.app_reference;
            const stack_index_letter = appVersionData.app_index_letter;
            const stack_index_number = appVersionData.app_index_number;
            const app_profile = appVersionData.app_profile;

            const app_version = `${sub_node_id}-${stack_index_letter}${stack_index_number}-${app_profile}`;
            await dbConfig.dbInstance.deviceModel.update({ app_version: app_version }, { where: { device_id: device_data.device_id } });
            return {
                message: `Node app version received successfully`,
                isError: false,
                data: { app_version: app_version }
            };

        } catch (error) {
            throw error;
        }
    }

    getNodeStackVersion = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_NODE_STACK_VERSION',
                data: {},
                is_ack: true,
                ack_timeout: 2000,
                max_retry_count: 3,
                priority: 'low' as 'low',
                source_add: "010000",
                event_timeout: 2000,
                sub_node_type: device_data.sub_node_id,
                dest_node_type: device_data.model_no,
                destination_add: device_data.address,
                transaction_id: promiseRegistry.newRequestId()
            };

            this.commandSender.sendSDNCommand(command);

            const stackVersionPromise = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_NODE_STACK_VERSION");
            if (stackVersionPromise.isError) return { message: stackVersionPromise.message, isError: true }

            const stackData = stackVersionPromise.data;
            const stack_version = `${stackData.major_version}.${stackData.minor_version}`;
            await dbConfig.dbInstance.deviceModel.update(
                { stack_version: stack_version },
                { where: { device_id: device_data.device_id } }
            );
            return {
                isError: false,
                message: `Firmware version retrieved successfully`,
                data: { stack_version }
            }

        } catch (error) {
            throw error;
        }
    }

    getDevicedataForCommand = async (device_id: number): Promise<DeviceModel> => {
        const deviceInfo: DeviceModel = await dbConfig.dbInstance.deviceModel.findOne({
            where: { device_id: device_id },
            attributes: ['device_id', 'name', 'address', 'device_type', 'model_no', 'sub_node_id'],
            raw: true,
        });

        if (!deviceInfo) {
            throw new Error(`Device not found.`);
        }
        return deviceInfo;
    }
}