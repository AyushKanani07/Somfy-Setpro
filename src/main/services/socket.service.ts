import { Socket, Server } from "socket.io";
import { SerialportConnectionService } from "./serialport.connection.service.ts";
import { DeviceDiscoveryService } from "./device.discovery.service.ts";
import { dbConfig } from "../models/index.ts";
import { MotorActionService } from "./motor-action.service.ts";
import { Socket_Events } from "../helpers/constant.ts";
import { GroupDiscoveryService } from "./group.discovery.service.ts";
import { KeypadActionService } from "./keypad-action.service.ts";
import { CommandFrameCodecService } from "./commandFrameCodec.service.ts";
import type { CommandBuilderInput } from "../interface/command.interface.ts";
import type { DeviceModel } from "../interface/device.ts";
import { CommanService } from "./comman.service.ts";
import { KeypadService } from "./keypad.service.ts";


let io: Server;
let pendingConfirmationResolver: any = null;

export default class SocketService {

    private commonService = new CommanService();
    private motorDiscovery = new DeviceDiscoveryService();
    private groupDiscovery = new GroupDiscoveryService();
    private motorActionService = new MotorActionService();
    private keypadActionService = new KeypadActionService();
    private keypadService: KeypadService = new KeypadService();
    private frameCodecService = new CommandFrameCodecService();


    constructor() { }

    public init = (server: any) => {
        const ioConfig = {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        };
        io = new Server(server, ioConfig);

        io.on("connection", this.handelConnection.bind(this));
    }

    private handelConnection = async (socket: Socket) => {
        try {
            console.log(`New client connected: ${socket.id}`);

            this.portStatusUpdate(socket);
            this.startDeviceDiscovery(socket);
            this.stopDeviceDiscovery(socket);
            this.getMotorPosition(socket);
            this.startGroupDiscovery(socket);
            this.stopGroupDiscovery(socket);
            this.getAllKeypadSwitchSettings(socket);
            this.winkMotor(socket);
            this.OnFirmwareConfirmationResponse(socket);
            this.decodeCommandFrame(socket);
            this.encodeCommandFrame(socket);
            this.sendCommandFrame(socket);
            this.startKeypadDiscovery(socket);
            this.stopKeypadDiscovery(socket);

            socket.on('send-sdn-command', (data) => {
                io.emit('sent-sdn-command', data);
            });
            socket.on('send-frame', (data) => {
                io.emit('sent-frame', data);
            });
            socket.on('sent-communication-log', (data) => {
                io.emit('received-communication-log', data);
            });
            socket.on('resend-command', (data) => {
                io.emit('resent-command', data);
            });

            socket.on('disconnect', () => {
                console.log('socket user disconnected');
            });
            socket.on('error', (err) => {
                console.log('socket ERR', err);
            });

        }
        catch (error) {
            console.error("Socket connection error:", error);
        }
    }

    public static emit = (event: string, data: any) => {
        if (!io) return;

        io.emit(event, data);
    }

    private portStatusUpdate = (socket: Socket) => {
        socket.on(Socket_Events.REQUEST_PORT_STATUS, () => {
            const connectedPort = SerialportConnectionService.getConnectedPortName();
            const data = {
                isConnected: connectedPort ? true : false,
                path: connectedPort || null
            };
            SocketService.emit(Socket_Events.ON_PORT_STATUS, data);
        });
    }

    private startDeviceDiscovery = (socket: Socket) => {

        socket.on(Socket_Events.START_DEVICE_DISCOVERY, async () => {
            try {
                const connectedPort = SerialportConnectionService.getConnectedPortName();
                if (!connectedPort) {
                    console.error("No port connected. Cannot start discovery.");
                    SocketService.emit(Socket_Events.DEVICE_DISCOVERY_INFO, { message: 'No serial port connected. Please connect a serial port before starting device discovery.', status: 'error' });
                    return;
                }

                this.motorDiscovery.discoverMotors();

            } catch (error) {
                console.error("Error during port discovery:", error);
            }
        });

    }

    private stopDeviceDiscovery = (socket: Socket) => {
        socket.on(Socket_Events.STOP_DEVICE_DISCOVERY, () => {
            this.motorDiscovery.stopDiscovery();
        });
    }

    private startGroupDiscovery = (socket: Socket) => {
        socket.on(Socket_Events.START_GROUP_DISCOVERY, async () => {
            try {
                const connectedPort = SerialportConnectionService.getConnectedPortName();
                if (!connectedPort) {
                    console.error("No port connected. Cannot start group discovery.");
                    SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: 'No serial port connected. Please connect a serial port before starting group discovery.', status: 'error' });
                    return;
                }

                this.groupDiscovery.discoverGroups();
            } catch (error) {
                console.error("Error during group discovery:", error);
            };
        });
    }

    private stopGroupDiscovery = (socket: Socket) => {
        socket.on(Socket_Events.STOP_GROUP_DISCOVERY, () => {
            this.groupDiscovery.stopGroupDiscovery();
        });
    }

    public static sentCommunicationLog = async (eventData: any) => {
        try {
            const saveData = await dbConfig.dbInstance.communicationLogModel.create(eventData);
            SocketService.emit(Socket_Events.COMMUNICATION_LOG, saveData);
        } catch (error) {
            console.error("Error saving communication log:", error);
        }
    }

    private getMotorPosition = (socket: Socket) => {
        socket.on(Socket_Events.GET_MOTOR_POSITION, async (data) => {
            try {
                const device_id: number = data.device_id;
                const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);
                const result = await this.motorActionService.getMotorPosition(deviceData);
                const response = {
                    status: result.isError ? 'error' : 'success',
                    message: result.message,
                    data: result.data || null
                }
                SocketService.emit(Socket_Events.POST_MOTOR_POSITION, response);
            } catch (error) {
                console.error("Error getting motor position:", error);
            }
        });
    }

    private getAllKeypadSwitchSettings = (socket: Socket) => {
        socket.on(Socket_Events.GET_KEYPAD_SWITCH_SETTINGS, async (data) => {
            try {
                if (!data || !data.device_id) {
                    console.error("Invalid data for getting keypad switch settings.");
                    SocketService.emit(Socket_Events.POST_KEYPAD_SWITCH_SETTINGS, {
                        isError: true,
                        message: "Invalid data. 'device_id' is required."
                    });
                    return;
                }
                this.keypadActionService.getAllSwitchSettings(data.device_id);

            } catch (error) {
                console.error("Error getting keypad switch settings:", error);
            }
        });
    }

    private winkMotor = (socket: Socket) => {
        socket.on(Socket_Events.WINK_MOTOR, async (data) => {
            try {
                const device_id: number = data.device_id;
                const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);
                this.motorActionService.winkMotor(deviceData, true);
            } catch (error) {
                console.error("Error winking motor:", error);
            }
        });
    }

    waitForFirmwareUserAction(payload: any, dummyRes: boolean = true): Promise<boolean> {
        return new Promise(async (resolve) => {
            SocketService.emit(Socket_Events.FIRMWARE_UPDATE_INFO, payload);
            pendingConfirmationResolver = resolve;
            // await new Promise(res => setTimeout(res, 2000)); // Small delay to ensure listener is set
            // pendingConfirmationResolver(dummyRes); // Default to true for now
        });
    }

    OnFirmwareConfirmationResponse(socket: Socket) {
        socket.on(Socket_Events.ON_FIRMWARE_USER_ACTION, (data) => {
            if (pendingConfirmationResolver) {
                pendingConfirmationResolver(data.confirmed);
                pendingConfirmationResolver = null;
            }
        });
    }

    private decodeCommandFrame = (socket: Socket) => {
        socket.on(Socket_Events.DECODE_COMMAND_FRAME, async (data) => {
            try {
                const frame: string = data.frame;
                const decodedData = await this.frameCodecService.decodeFrame(frame);
                const resData: any = {
                    command: decodedData.command_name,
                    data: decodedData.data,
                    source_node_type: decodedData.source_node_type,
                    destination_node_type: decodedData.dest_node_type,
                    source: decodedData.source_add,
                    destination: decodedData.destination_add,
                    ack: decodedData.is_ack
                }
                SocketService.emit(Socket_Events.ON_DECODE_COMMAND_FRAME, {
                    isError: false,
                    message: 'Frame decoded successfully',
                    data: resData
                });
            } catch (error) {
                console.error("Error decoding command frame:", error);
                SocketService.emit(Socket_Events.ON_DECODE_COMMAND_FRAME, {
                    isError: true,
                    message: error instanceof Error ? error.message : 'Failed to decode frame',
                    data: null
                });
            }
        });
    }

    private encodeCommandFrame = (socket: Socket) => {
        socket.on(Socket_Events.ENCODE_COMMAND_FRAME, async (data) => {
            try {
                const commandPayload: CommandBuilderInput = {
                    command_name: data.command_name,
                    is_ack: data.is_ack,
                    dest_node_type: data.dest_node_type,
                    sub_node_type: data.sub_node_type,
                    source_add: data.source_add,
                    destination_add: data.destination_add,
                    data: data.data
                }
                const encodedFrame = await this.frameCodecService.encodeCommand(commandPayload);
                SocketService.emit(Socket_Events.ON_ENCODE_COMMAND_FRAME, {
                    isError: false,
                    message: 'Command encoded successfully',
                    data: encodedFrame
                });
            } catch (error) {
                console.error("Error encoding command frame:", error);
                SocketService.emit(Socket_Events.ON_ENCODE_COMMAND_FRAME, {
                    isError: true,
                    message: error instanceof Error ? error.message : 'Failed to encode command',
                    data: null
                });
            }
        });
    }

    private sendCommandFrame = (socket: Socket) => {
        socket.on(Socket_Events.SEND_COMMAND_FRAME, async (data) => {
            try {
                const frame: string = data.frame;
                await this.frameCodecService.sendFrame(frame);
                SocketService.emit(Socket_Events.ON_SEND_COMMAND_FRAME, {
                    isError: false,
                    message: 'Frame sent successfully'
                });
            } catch (error) {
                console.error("Error sending command frame:", error);
                SocketService.emit(Socket_Events.ON_SEND_COMMAND_FRAME, {
                    isError: true,
                    message: error instanceof Error ? error.message : 'Failed to send frame'
                });
            }
        });
    }

    private startKeypadDiscovery = (socket: Socket) => {
        socket.on(Socket_Events.START_KEYPAD_DISCOVERY, async () => {
            this.keypadService.startKeyPadDiscovery();
        });
    }

    private stopKeypadDiscovery = (socket: Socket) => {
        socket.on(Socket_Events.STOP_KEYPAD_DISCOVERY, async () => {
            this.keypadService.stopKeyPadDiscovery();
        });
    }


}