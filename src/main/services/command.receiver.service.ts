import { eventBroker } from "../helpers/event.ts";
import { crc16, getModelName, sleep } from "../helpers/util.ts";
import { CommandParserService } from "./command.parser.service.ts";
import { SerialportConnectionService } from "./serialport.connection.service.ts";
import SocketService from "./socket.service.ts";
import { SerialPort } from "serialport";
import { FirmwareCommandParserService } from "./firmware-update/firmware-command.parser.service.ts";


let isProcessing = false;
let isFirmwareUpdating = false;
export class CommandReceiverService {
    private postDataFound = Buffer.alloc(0);
    private invalidCommand = Buffer.alloc(0);
    private postFirmwareDataFound = Buffer.alloc(0);
    private dataHandler?: (data: Buffer) => void;
    private CommandParser = new CommandParserService();
    private firmwareCommandParser = new FirmwareCommandParserService();
    private retryCountForFirmware = 0;

    constructor() { }

    public init = (port: SerialPort) => {
        if (this.dataHandler) {
            port.removeListener("data", this.dataHandler);
        }

        this.dataHandler = async (data: Buffer) => {
            if (isFirmwareUpdating) {
                this.postFirmwareDataFound = Buffer.concat([this.postFirmwareDataFound, data]);
                this.processReceivedFirmwareFrame();
            } else {
                this.postDataFound = Buffer.concat([this.postDataFound, data]);
                if (!isProcessing) {
                    await this.processReceivedFrame();
                }
            }
        };
        port.on("data", this.dataHandler);
    }

    public detach = () => {
        const port = SerialportConnectionService.getSerialportInstance();
        if (!port || !this.dataHandler) return;

        port.removeListener("data", this.dataHandler);
        this.dataHandler = undefined;
    }

    private processReceivedFrame = async () => {
        isProcessing = true;
        while (this.postDataFound.length > 2) {
            let msglen = 255 - this.postDataFound.readInt8(1) & 0x3f;

            if (msglen == 0 && this.postDataFound.length == 0) break;

            if (this.postDataFound.length < msglen) break;

            const current_cmd = this.postDataFound.subarray(0, msglen);
            const isValid = this.isValidCommand(current_cmd);

            if (isValid) {
                if (this.invalidCommand.length > 0) {
                    console.error("Invalid Frame received : ", this.invalidCommand);
                    this.invalidCommand = Buffer.alloc(0);
                }
                try {
                    const decodedData = await this.CommandParser.decodeFrame(current_cmd);
                    console.log("Valid Frame received : ", decodedData.cmd_data.command_name, ': ', current_cmd.toString('hex'));
                    eventBroker.emit('command', decodedData.cmd_data);

                    const eventData = {
                        time: new Date(),
                        type: 'received',
                        source_node_type: getModelName(decodedData.cmd_data.source_node_type),
                        destination_node_type: getModelName(decodedData.cmd_data.dest_node_type),
                        source: decodedData.cmd_data.source_add,
                        destination: decodedData.cmd_data.destination_add,
                        command: decodedData.cmd_data.command_name,
                        ack: decodedData.cmd_data.is_ack ? 'ACK' : null,
                        frame: current_cmd.toString('hex').toUpperCase(),
                        data: decodedData.data_frame.toString('hex').toUpperCase(),
                    }

                    SocketService.sentCommunicationLog(eventData);
                } catch (error) {
                    console.error('Error in command decoding ', error);
                    eventBroker.emit('command', { isError: true, message: (error as Error).message });
                }

                this.postDataFound = this.postDataFound.subarray(msglen);
            } else {
                const shiftedValue = this.postDataFound.subarray(0, 1);
                this.invalidCommand = Buffer.concat([this.invalidCommand, shiftedValue]);
                this.postDataFound = this.postDataFound.subarray(1);
            }
        }
        isProcessing = false;
    };

    private isValidCommand = (buffer: Buffer): Boolean => {
        if (buffer.length < 2) {
            return false;
        }
        let sum = 0;
        for (let i = 0; i < buffer.length - 2; i++) {
            sum += buffer[i];
        }
        const checksum = buffer.readUInt16BE(buffer.length - 2);
        return sum == checksum;
    }

    private processReceivedFirmwareFrame = async () => {
        while (this.postFirmwareDataFound.length > 7) {
            const msglen = (this.postFirmwareDataFound.readInt8(3) << 8) + (this.postFirmwareDataFound.readInt8(2) & 0xFF);

            if (msglen == 0 && this.postFirmwareDataFound.length == 0) break;

            if (this.postFirmwareDataFound.length >= msglen) {

                const cmd = this.postFirmwareDataFound.subarray(0, msglen + 2);
                const isValid = this.isValidFirmwareCommand(cmd);

                if (isValid) {
                    this.retryCountForFirmware = 0;
                    try {
                        const parsedCommand = await this.firmwareCommandParser.parseFirmwareCommand(cmd);
                        console.log("Valid Frame received : ", cmd);
                        eventBroker.emit('firmware_command', parsedCommand);
                        this.postFirmwareDataFound = this.postFirmwareDataFound.subarray(msglen + 2);
                    } catch (error) {
                        console.error('Error in firmware command decoding ', error);
                    }
                } else {
                    this.retryCountForFirmware++;
                    await sleep(250);
                    if (this.retryCountForFirmware > 3) {
                        this.postFirmwareDataFound = Buffer.alloc(0);
                        this.retryCountForFirmware = 0;
                    }
                    break;
                }
            } else {
                this.retryCountForFirmware++;
                await sleep(250);
                if (this.retryCountForFirmware > 3) {
                    this.postFirmwareDataFound = Buffer.alloc(0);
                    this.retryCountForFirmware = 0;
                }
                break;
            }
        }
    }

    private isValidFirmwareCommand = (buffer: Buffer): Boolean => {
        if (buffer.length < 7) {
            return false;
        }

        const crc = (buffer[buffer.length - 3] << 8) + (buffer[buffer.length - 2] & 0xFF);
        const cal_crc_data = buffer.subarray(1, buffer.length - 3);
        const cal_crc = crc16(cal_crc_data);

        if (crc == cal_crc) {
            return true;
        } else {
            return false;
        }
    }

    public set FirmwareUpdating(status: boolean) {
        isFirmwareUpdating = status;
        this.postFirmwareDataFound = Buffer.alloc(0);
    }
}