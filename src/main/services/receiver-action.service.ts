import { Socket_Events } from "../helpers/constant.ts";
import { eventBroker } from "../helpers/event.ts";
import { promiseRegistry } from "../helpers/util.ts";
import type { Command } from "../interface/command.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import type { getAckResponse } from "../interface/global.ts";
import { dbConfig } from "../models/index.ts";
import { CommandSenderService } from "./command.sender.service.ts";
import SocketService from "./socket.service.ts";


export class ReceiverActionService {
    private commandSender = new CommandSenderService();

    getAllChannelStatus = async (device_data: DeviceModel): Promise<getAckResponse> => {
        try {
            let responses: any[] = [];
            for (let i = 1; i <= 5; i++) {
                const channelStatusResponse = await this.getChannelStatus(device_data, i);
                if (channelStatusResponse.isError) continue;
                responses.push(channelStatusResponse.data);
            }

            return {
                isError: false,
                message: `Channel status retrieved successfully`,
                data: responses
            };
        } catch (error) {
            throw error;
        }

    }

    getChannelStatus = async (device_data: DeviceModel, index: number): Promise<getAckResponse> => {
        try {
            const command: Command = {
                command_name: 'GET_CHANNEL_STATUS',
                data: {
                    index: index
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

            const channelStatusResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "POST_CHANNEL_STATUS");
            if (channelStatusResponse.isError) return { message: channelStatusResponse.message, isError: true }

            await this.updatedb(device_data.device_id, index, channelStatusResponse.data.config);

            return {
                isError: false,
                message: `Channel status retrieved successfully`,
                data: channelStatusResponse.data
            };
        } catch (error) {
            throw error;
        }
    }

    controlChannel = async (device_data: DeviceModel, index: number, action: 'config' | 'delete' | 'close-config'): Promise<getAckResponse> => {
        try {
            let status;
            switch (action) {
                case 'config':
                    status = 0x01;
                    break;
                case 'delete':
                    status = 0x00;
                    break;
                case 'close-config':
                    status = 0x02;
                    break;
                default:
                    return {
                        isError: true,
                        message: `Invalid status type: ${action}`
                    };
            }

            const command: Command = {
                command_name: 'CONTROL_CHANNEL',
                data: {
                    index,
                    status
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

            const ackResponse = await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            if (ackResponse.isError) return { message: ackResponse.message, isError: true }

            if (action === 'config') {
                this.waitForChannelStatusUpdate()
            }

            return ackResponse;

        } catch (error) {
            throw error;
        }
    }

    waitForChannelStatusUpdate = () => {
        return new Promise((resolve, reject) => {

            const receiverListener = (response: any) => {
                if (response && response.command_name === 'POST_CHANNEL_STATUS') {

                    const payload = {
                        action: 'config',
                        step: 'POST_CHANNEL_STATUS',
                        data: response.data
                    };

                    SocketService.emit(
                        Socket_Events.ON_POST_CHANNEL_STATUS,
                        { status: 'success', message: "Keypad found", data: payload }
                    );

                    resolve(response);
                }
            };
            eventBroker.once('command', receiverListener);

            // Optional: timeout protection
            setTimeout(() => {
                const payload = {
                    action: 'config',
                    step: 'POST_CHANNEL_STATUS',
                    isError: true,
                }
                SocketService.emit(
                    Socket_Events.ON_POST_CHANNEL_STATUS,
                    { status: 'timeout', message: "Timeout waiting for channel status update", data: payload }
                );
                reject(new Error("Timeout waiting for POST_CHANNEL_STATUS"));
            }, 10 * 60 * 1000);
        });
    }

    updatedb = async (device_id: number, channel: number, payload: { is_configure?: boolean, fw_version?: string }) => {
        const rtsData = await dbConfig.dbInstance.rtsReceiverModel.findOne({ where: { device_id: device_id, channel_no: channel } });
        if (rtsData) {
            await rtsData.update(payload);
        } else {
            await dbConfig.dbInstance.rtsReceiverModel.create({ device_id: device_id, channel_no: channel, ...payload });
        }
    }

}