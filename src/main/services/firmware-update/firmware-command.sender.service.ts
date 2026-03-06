import { Socket_Events } from "../../helpers/constant.ts";
import { eventBroker } from "../../helpers/event.ts";
import type { FirmwareCommand, stateType } from "../../interface/command.interface.ts";
import { SerialportConnectionService } from "../serialport.connection.service.ts";
import SocketService from "../socket.service.ts";
import { writeToSerialPort } from "../../helpers/serialport.ts";
import { FirmwareCommandBuilderService } from "./firmware-command.builder.service.ts";


export class FirmwareCommandSenderService {
    private commandQueue: FirmwareCommand[] = [];
    private isProcessing: boolean = false;
    private state: stateType = 'ready';

    private frameCommandBuilder: FirmwareCommandBuilderService = new FirmwareCommandBuilderService();

    public sendFirmwareCommand(command: FirmwareCommand): Error | void {
        const port = SerialportConnectionService.getConnectedPortName();
        if (!port) {
            SocketService.emit(Socket_Events.ON_PORT_ERROR, {
                status: 'not_connected',
                message: 'Connect to Port first'
            });
            console.error('Serial port not connected');
            throw new Error('Serial port not connected');
        }

        this.commandQueue.push(command);

        if (!this.isProcessing && this.state === 'ready') {
            this.processNextFirmwareCommand();
        } else if (!this.isProcessing && this.state !== 'ready') {
            setTimeout(() => {
                this.processNextFirmwareCommand();
            }, 1);
        }
    }

    private async processNextFirmwareCommand() {
        if (this.commandQueue.length === 0) {
            this.isProcessing = false;
            this.state = 'ready';
            return;
        }

        this.isProcessing = true;
        const command = this.commandQueue.shift()!;

        try {
            this.processCurrentFirmwareCommand(command);
        } catch (error) {
            this.state = 'error';
            console.error('Error processing firmware command:', error);
        }

        setTimeout(() => {
            this.state = 'ready';
            this.processNextFirmwareCommand();
        }, 20);
    }

    private async processCurrentFirmwareCommand(command: FirmwareCommand) {
        for (let attempt = 0; attempt <= command.retrieve_count; attempt++) {
            try {
                const resultPromise = new Promise<any>((resolve) => {
                    let timeout: any;
                    const onData = (data: any) => {
                        clearTimeout(timeout);
                        eventBroker.removeListener('firmware_command', onData);
                        resolve(data);
                    };
                    timeout = setTimeout(() => {
                        eventBroker.removeListener('firmware_command', onData);
                        resolve(null);
                    }, command.event_timeout);
                    eventBroker.on('firmware_command', onData);
                });

                await this.sendFirmwareCommandToPort(command);

                const responses = await resultPromise;

                this.state = 'completed';
                eventBroker.emit('parse_firmware_command', responses);
                break;

            } catch (error) {
                this.state = 'error';
                console.error(`Error in processCurrentFirmwareCommand: ${error}`);
                const res = await new Promise((resolve) => {
                    resolve({
                        state: 'error',
                        ...command,
                        message: (error as Error).message,
                        data: null
                    });
                });
                eventBroker.emit('parse_firmware_command', res);
                break;
            }
        }
    }

    private async sendFirmwareCommandToPort(command: FirmwareCommand) {
        const portInstance = SerialportConnectionService.getSerialportInstance();
        if (!portInstance) {
            console.error('Primary port not connected');
            return;
        }

        try {
            const command_frame = this.frameCommandBuilder.buildFirmwareCommand(command);
            console.log(`command_frame for: ${command.command}`, command_frame);
            await writeToSerialPort(portInstance, command_frame.frame);

        } catch (error) {
            console.error('Error sending firmware command to port:', error);
            throw error;
        }
    }

}