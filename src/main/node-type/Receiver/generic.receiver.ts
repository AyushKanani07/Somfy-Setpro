import type { MasterCommand, MasterCommandBuilderData, MasterCommandParserData } from "../../interface/command.interface.ts";
import type { PostFirmwareVersion } from "../../interface/keypad.interface.ts";
import type { SetNodeDiscovery } from "../../interface/motor.interface.ts";


export class GenericReceiver {
    protected static RECEIVER_METHOD_LIST: MasterCommand[] = [
        { cmd_id: 0x40, name: 'GET_NODE_ADDR' },
        { cmd_id: 0x60, name: 'POST_NODE_ADDR' },
        { cmd_id: 0xb7, name: 'GET_CHANNEL_STATUS', builder_method: 'getChannelStatusDataFrame', parser_method: 'getChannelStatusJsonData' },
        { cmd_id: 0xa7, name: 'POST_CHANNEL_STATUS', parser_method: 'postChannelStatusJsonData', builder_method: 'postChannelStatusDataFrame' },
        { cmd_id: 0x8F, name: 'CONTROL_CHANNEL', builder_method: 'controlChannelDataFrame', parser_method: 'controlChannelJsonData' },
        { cmd_id: 0x50, name: 'SET_NODE_DISCOVERY', builder_method: 'setNodeDiscoveryDataFrame', parser_method: 'setNodeDiscoveryJsonData', },
        { cmd_id: 0x8F, name: 'GET_FIRMWARE_VERSION' },
        { cmd_id: 0x9F, name: 'POST_FIRMWARE_VERSION', parser_method: 'firmwareVersionJsonData', builder_method: 'firmwareVersionDataFrame' },
        { cmd_id: 0x7F, name: 'ACK', parser_method: 'ackJsonData' },
        { cmd_id: 0x6F, name: 'nACK', parser_method: 'nackJsonData' }
    ];

    public Generic_Receiver_FrameBuilder(commandName: string, data: MasterCommandBuilderData): Buffer {
        const command = GenericReceiver.RECEIVER_METHOD_LIST.find(cmd => cmd.name === commandName);
        if (!command) {
            throw new Error(`Command ${commandName} not found in Transmiter method list`);
        }
        if (command.builder_method) {
            const method = (this as any)[command.builder_method] as (data: MasterCommandBuilderData) => Buffer;
            if (!method || typeof method !== 'function') {
                throw new Error(`Builder method ${command.builder_method} not found in Transmiter class`);
            }
            return method(data);
        } else {
            throw new Error(`No builder method defined for command ${commandName}`);
        }
    }

    public Generic_Receiver_DataParser(commandName: string, buffer: Buffer): MasterCommandParserData {
        const command = GenericReceiver.RECEIVER_METHOD_LIST.find(cmd => cmd.name === commandName);
        if (!command) {
            throw new Error(`Command ${commandName} not found in Transmiter method list`);
        }
        if (command.parser_method) {
            const method = (this as any)[command.parser_method] as (buffer: Buffer) => MasterCommandParserData;
            if (!method || typeof method !== 'function') {
                throw new Error(`Parser method ${command.parser_method} not found in Transmiter class`);
            }
            return method(buffer);
        } else {
            throw new Error(`No parser method defined for command ${commandName}`);
        }
    }

    protected getChannelStatusDataFrame = (data: { index: number }): Buffer => {
        const frame = Buffer.alloc(1);
        frame.writeUInt8(data.index, 0);
        return frame;
    }

    protected getChannelStatusJsonData = (buffer: Buffer) => {
        const index = buffer.readUInt8(0);
        return {
            index
        };
    }

    protected postChannelStatusJsonData = (buffer: Buffer) => {
        const index = buffer.readUInt8(0);
        const config = buffer.readUInt8(1) ? true : false;
        return {
            index,
            config
        };
    }

    protected postChannelStatusDataFrame = (data: { index: number, config: number }): Buffer => {
        const frame = Buffer.alloc(2);
        frame.writeUInt8(data.index, 0);
        frame.writeUInt8(data.config, 1);
        return frame;
    }

    protected controlChannelDataFrame = (data: { index: number, status: number }): Buffer => {
        const frame = Buffer.alloc(2);
        frame.writeUInt8(data.index, 0);
        frame.writeUInt8(data.status, 1);
        return frame;
    }

    protected controlChannelJsonData = (buffer: Buffer) => {
        const index = buffer.readUInt8(0);
        const status = buffer.readUInt8(1);
        return {
            index,
            status
        };
    }

    protected setNodeDiscoveryDataFrame = (data: SetNodeDiscovery) => {
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.discovery_mode, 0);
        return frame;
    };

    protected setNodeDiscoveryJsonData = (data: Buffer): SetNodeDiscovery => {
        if (data.length !== 1) {
            throw new Error('Invalid buffer length. Expected 1 byte.');
        }

        return {
            discovery_mode: data.readUInt8(0),
        };
    };

    protected postFirmwareVersionJsonData = (data: Buffer): PostFirmwareVersion => {
        if (data.length !== 2) {
            throw new Error('Invalid buffer length. Expected 2 bytes.');
        }
        const major = data.readUInt8(0);
        const minor = data.readUInt8(1);
        return {
            major_version: major,
            minor_version: minor
        };
    };

    protected firmwareVersionDataFrame = (data: { major_version: number, minor_version: number }): Buffer => {
        const frame = Buffer.alloc(2);
        frame.writeUInt8(data.major_version, 0);
        frame.writeUInt8(data.minor_version, 1);
        return frame;
    }

    protected ackJsonData = (data: Buffer) => {
        if (data.length !== 0) {
            throw new Error('Invalid buffer length. Expected 1 byte.');
        }
        return {
        };
    };

    protected nackJsonData = (data: Buffer) => {
        if (data.length !== 1) {
            throw new Error('Invalid buffer length. Expected 1 byte.');
        }
        return {
            status: data.readUInt8(0)
        }
    };
}