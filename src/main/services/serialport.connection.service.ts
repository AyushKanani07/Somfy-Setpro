import { SerialPort } from "serialport";
import { CommandReceiverService } from "./command.receiver.service.ts";


let connected_port_name: string | undefined = undefined;
let serialPortObject: SerialPort | undefined;

export class SerialportConnectionService {

    private commandReceiver = new CommandReceiverService();

    public static getConnectedPortName(): string | undefined {
        return connected_port_name;
    }

    public static getSerialportInstance(): SerialPort | undefined {
        return serialPortObject;
    }

    public listAvailablePorts = (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            SerialPort.list()
                .then((ports) => {
                    resolve(ports);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public connectToPort = async (port: string): Promise<{ isError: boolean; message: string }> => {
        try {
            if (connected_port_name === port) {
                return {
                    isError: false,
                    message: `Already connected to port: ${port}`
                };
            }

            if (serialPortObject && connected_port_name) {
                await new Promise<void>((resolve, reject) => {
                    serialPortObject!.close(err => {
                        if (err) return reject(err);
                        connected_port_name = undefined;
                        serialPortObject = undefined;
                        resolve();
                    });
                });
            }

            if (port === 'offline-edit') {
                connected_port_name = 'offline-edit';
                serialPortObject = undefined;
                console.log(`Offline edit mode activated. No port connected.`);
                return {
                    isError: false,
                    message: `Offline edit mode activated. No port connected.`
                };
            }

            await new Promise<void>((resolve, reject) => {
                serialPortObject = new SerialPort({
                    path: port,
                    baudRate: 4800,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'odd',
                });

                serialPortObject.on('open', () => {
                    connected_port_name = port;
                    this.commandReceiver.init(serialPortObject!);
                    console.log(`Connected to port: ${port}`);
                    resolve();
                });

                serialPortObject.on('error', err => {
                    connected_port_name = undefined;
                    serialPortObject = undefined;
                    reject(err);
                });
            });

            return {
                isError: false,
                message: `Connected to port ${port} successfully.`
            };

        } catch (err: any) {
            return {
                isError: true,
                message: `Failed to connect to port: ${err.message}`
            };
        }
    }

    public updateBaudRate = async (isFirmwareUpdate: boolean): Promise<{ isError: boolean; message: string }> => {
        try {
            if (!serialPortObject || !connected_port_name) return { isError: true, message: "No port is currently connected." };
            let baudRate
            if (isFirmwareUpdate) {
                baudRate = 38400;
                this.commandReceiver.FirmwareUpdating = true;
            } else {
                baudRate = 4800;
                this.commandReceiver.FirmwareUpdating = false;
            }

            await new Promise<void>((resolve, reject) => {
                serialPortObject!.update({ baudRate: baudRate }, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            return {
                isError: false,
                message: `Baud rate updated to ${baudRate} successfully.`
            };
        } catch (err: any) {
            return {
                isError: true,
                message: `Failed to update baud rate: ${err.message}`
            };
        }
    }


    public disconnectPort = (): Promise<{ isError: boolean; message: string }> => {
        return new Promise((resolve, reject) => {
            if (!serialPortObject || !connected_port_name) {
                return resolve({
                    isError: false,
                    message: "No port is currently connected."
                });
            }

            serialPortObject.removeAllListeners('data');
            serialPortObject.close((err) => {
                if (err) {
                    console.error(`Error closing port ${connected_port_name}:`, err);
                    return reject(err);
                }
                console.log(`Port ${connected_port_name} closed successfully.`);
                const disconeectPort = connected_port_name;
                connected_port_name = undefined;
                serialPortObject = undefined;
                return resolve({
                    isError: false,
                    message: `Port ${disconeectPort} disconnected successfully.`
                });
            });
        });
    }

}