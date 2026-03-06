import { SerialPort } from "serialport";


export type PortMode = 'SDN' | 'SENSOR';
export type PortType = 'PRIMARY' | 'SECONDARY';

export interface PortConfig {
    portName: string | undefined;
    portObject: SerialPort | undefined;
    mode: PortMode;
}