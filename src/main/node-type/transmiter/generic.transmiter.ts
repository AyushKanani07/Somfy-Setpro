import type { MasterCommand, MasterCommandBuilderData, MasterCommandParserData } from "../../interface/command.interface.ts";
import type { PostNodeAppVersion, SetNodeDiscovery } from "../../interface/motor.interface.ts";
import type { ControlDimension, GetChannelMode, GetRtsAddress, SetChannelMode, SetDctLock, SetDimFrameCount, setTilt, SetTiltFrameCount } from "../../interface/transmiter.interface.ts";


export class GenericTransmiter {
    protected static TRANSMITER_METHOD_LIST: MasterCommand[] = [
        { cmd_id: 0x40, name: 'GET_NODE_ADDR' },
        { cmd_id: 0x60, name: 'POST_NODE_ADDR' },
        { cmd_id: 0xa0, name: 'GET_CHANNEL_MODE', builder_method: 'getChannelModeDataFrame' },
        { cmd_id: 0xb0, name: 'POST_CHANNEL_MODE', parser_method: 'getChannelModeJsonData' },
        { cmd_id: 0x90, name: 'SET_CHANNEL_MODE', builder_method: 'setChannelModeDataFrame' },
        { cmd_id: 0xa9, name: 'GET_RTS_ADDRESS', builder_method: 'getRtsAddressDataFrame' },
        { cmd_id: 0xb9, name: 'POST_RTS_ADDRESS', parser_method: 'getRtsAddressJsonData' },
        { cmd_id: 0x93, name: 'SET_SUN_AUTO', builder_method: 'setSunAutoDataFrame' },
        { cmd_id: 0x9a, name: 'SET_IP', builder_method: 'setIpDataFrame' },
        { cmd_id: 0x80, name: 'CTRL_POSITION', builder_method: 'ctrlPositionDataFrame' },
        { cmd_id: 0x81, name: 'CTRL_TILT', builder_method: 'ctrlTiltDataFrame' },
        { cmd_id: 0x82, name: 'CTRL_DIM', builder_method: 'ctrlDimDataFrame' },
        { cmd_id: 0x91, name: 'SET_TILT_FRAMECOUNT', builder_method: 'setTiltFrameCountDataFrame' },
        { cmd_id: 0xa1, name: 'GET_TILT_FRAMECOUNT', builder_method: 'getTiltFrameCountDataFrame' },
        { cmd_id: 0xb1, name: 'POST_TILT_FRAMECOUNT', parser_method: 'postTiltFrameCountJsonData' },
        { cmd_id: 0x92, name: 'SET_DIM_FRAMECOUNT', builder_method: 'setDimFrameCountDataFrame' },
        { cmd_id: 0xa2, name: 'GET_DIM_FRAMECOUNT', builder_method: 'getDimFrameCountDataFrame' },
        { cmd_id: 0xb2, name: 'POST_DIM_FRAMECOUNT', parser_method: 'postDimFrameCountJsonData' },
        { cmd_id: 0x94, name: 'SET_DCT_LOCK', builder_method: 'setDctLockDataFrame' },
        { cmd_id: 0xa4, name: 'GET_DCT_LOCK' },
        { cmd_id: 0xb4, name: 'POST_DCT_LOCK', parser_method: 'postdctLockJsonData' },
        { cmd_id: 0x97, name: 'SET_CHANNEL', builder_method: 'setChannelDataFrame' },
        { cmd_id: 0x98, name: 'SET_OPEN_PROG', builder_method: 'setOpenProgDataFrame' },
        { cmd_id: 0x99, name: 'SET_RTS_ADDRESS_CHANGE', builder_method: 'setRtsAddressChangeDataFrame' },
        { cmd_id: 0x50, name: 'SET_NODE_DISCOVERY', builder_method: 'setNodeDiscoveryDataFrame', parser_method: 'setNodeDiscoveryJsonData', },
        { cmd_id: 0x70, name: 'GET_NODE_STACK_VERSION' },
        { cmd_id: 0x71, name: 'POST_NODE_STACK_VERSION', parser_method: 'postNodeStackVersionJsonData', builder_method: 'postNodeStackVersionDataFrame' },
        { cmd_id: 0x74, name: 'GET_NODE_APP_VERSION' },
        { cmd_id: 0x75, name: 'POST_NODE_APP_VERSION', parser_method: 'postNodeAppVersionJsonData', builder_method: 'postNodeAppVersionDataFrame', },
        { cmd_id: 0x7F, name: 'ACK', parser_method: 'ackJsonData' },
        { cmd_id: 0x6F, name: 'nACK', parser_method: 'nackJsonData' }
    ];

    public Generic_Transmiter_FrameBuilder(commandName: string, data: MasterCommandBuilderData): Buffer {
        const command = GenericTransmiter.TRANSMITER_METHOD_LIST.find(cmd => cmd.name === commandName);
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

    public Generic_Transmiter_DataParser(commandName: string, buffer: Buffer): MasterCommandParserData {
        const command = GenericTransmiter.TRANSMITER_METHOD_LIST.find(cmd => cmd.name === commandName);
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

    protected setChannelModeDataFrame = (data: SetChannelMode): Buffer => {
        const { channel_number, frequency_mode, application_mode, feature_set_mode } = data;
        const validations: [number, number, number, string][] = [
            [channel_number, 0, 15, "Invalid channel number. Expected 0–15"],
            [frequency_mode, 0, 1, "Invalid frequency mode. Expected 0 or 1"],
            [application_mode, 0, 1, "Invalid application mode. Expected 0 or 1"],
            [feature_set_mode, 0, 1, "Invalid feature set mode. Expected 0 or 1"],
        ];

        for (const [value, min, max, message] of validations) {
            if (value < min || value > max) {
                throw new Error(message);
            }
        }

        return Buffer.from([
            channel_number,
            frequency_mode,
            application_mode,
            feature_set_mode
        ]);
    }

    protected getChannelModeDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected getChannelModeJsonData = (data: Buffer): GetChannelMode => {
        const channel_number = data.readUInt8(0);
        const frequency_mode = data.readUInt8(1) === 0 ? 'CE' : 'US';
        const application_mode = data.readUInt8(2) === 0 ? 'Rolling' : 'Tilting';
        const feature_set_mode = data.readUInt8(3) === 0 ? 'Normal' : 'Modulis';

        return {
            channel_number,
            frequency_mode,
            application_mode,
            feature_set_mode
        }
    }

    protected getRtsAddressDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected setChannelDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected setOpenProgDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected setRtsAddressChangeDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected getRtsAddressJsonData = (data: Buffer): GetRtsAddress => {
        if (data.length !== 4) {
            throw new Error('Invalid buffer length. Expected 4 bytes.');
        }

        const channel_number = data.readUInt8(0);
        const rts_address = data.readUIntLE(1, 3).toString(16).padStart(6, '0').toUpperCase();
        return {
            channel_number,
            rts_address
        };
    }

    protected setIpDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected setSunAutoDataFrame = (data: { sun_auto: number }): Buffer => {
        if (data.sun_auto !== 0 && data.sun_auto !== 1) {
            throw new Error('Invalid value. Expected 0 or 1.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.sun_auto);
        return frame;
    }

    protected ctrlPositionDataFrame = (data: { channel: number, function_type: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        if (data.function_type < 1 || data.function_type > 4) {
            throw new Error('Invalid function type. Expected value between 1 and 4.');
        }
        let frame = Buffer.alloc(2);
        frame.writeUInt8(data.channel, 0);
        frame.writeUInt8(data.function_type, 1);
        return frame;
    }

    protected ctrlTiltDataFrame = (data: setTilt): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        if (data.function_type !== 0 && data.function_type !== 1) {
            throw new Error('Invalid function type. Expected 0 or 1.');
        }
        if (data.tilt_amplitude < 1 || data.tilt_amplitude > 127) {
            throw new Error('Invalid tilt amplitude. Expected value between 1 and 127.');
        }
        let frame = Buffer.alloc(3);
        frame.writeUInt8(data.channel, 0);
        frame.writeUInt8(data.function_type, 1);
        frame.writeUInt8(data.tilt_amplitude, 2);
        return frame;
    }

    protected ctrlDimDataFrame = (data: ControlDimension): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        if (data.function_type !== 0 && data.function_type !== 1) {
            throw new Error('Invalid function type. Expected 0 or 1.');
        }
        if (data.dim_amplitude < 1 || data.dim_amplitude > 127) {
            throw new Error('Invalid dim amplitude. Expected value between 1 and 127.');
        }
        let frame = Buffer.alloc(3);
        frame.writeUInt8(data.channel, 0);
        frame.writeUInt8(data.function_type, 1);
        frame.writeUInt8(data.dim_amplitude, 2);
        return frame;
    }

    protected setTiltFrameCountDataFrame = (data: SetTiltFrameCount): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        if (data.tilt_frame_us < 4 || data.tilt_frame_us > 255) {
            throw new Error('Invalid US value. Expected value between 4 and 255.');
        }
        if (data.tilt_frame_ce < 2 || data.tilt_frame_ce > 13) {
            throw new Error('Invalid CE value. Expected value between 2 and 13.');
        }
        let frame = Buffer.alloc(3);
        frame.writeUInt8(data.channel, 0);
        frame.writeUInt8(data.tilt_frame_us, 1);
        frame.writeUInt8(data.tilt_frame_ce, 2);
        return frame;
    }

    protected getTiltFrameCountDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected postTiltFrameCountJsonData = (data: Buffer) => {
        if (data.length !== 3) {
            throw new Error('Invalid buffer length. Expected 3 bytes.');
        }
        const channel_number = data.readUInt8(0);
        const tilt_frame_us = data.readUInt8(1);
        const tilt_frame_ce = data.readUInt8(2);
        return {
            channel_number,
            tilt_frame_us,
            tilt_frame_ce
        };
    }

    protected setDimFrameCountDataFrame = (data: SetDimFrameCount): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        if (data.dim_frame < 4 || data.dim_frame > 255) {
            throw new Error('Invalid DIM value. Expected value between 4 and 255.');
        }
        let frame = Buffer.alloc(2);
        frame.writeUInt8(data.channel, 0);
        frame.writeUInt8(data.dim_frame, 1);
        return frame;
    }

    protected getDimFrameCountDataFrame = (data: { channel: number }): Buffer => {
        if (data.channel < 0 || data.channel > 15) {
            throw new Error('Invalid channel. Expected value between 0 and 15.');
        }
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.channel, 0);
        return frame;
    }

    protected postDimFrameCountJsonData = (data: Buffer) => {
        if (data.length !== 2) {
            throw new Error('Invalid buffer length. Expected 2 bytes.');
        }
        const channel_number = data.readUInt8(0);
        const dim_frame = data.readUInt8(1);
        return {
            channel_number,
            dim_frame
        };
    }

    protected setDctLockDataFrame = (data: SetDctLock): Buffer => {
        if (data.index < 1 || data.index > 5) {
            throw new Error('Invalid index. Expected value between 1 and 5.');
        }
        let frame = Buffer.alloc(2);
        frame.writeUInt8(data.index, 0);
        frame.writeUInt8(data.isLocked, 1);
        return frame;
    }

    protected postdctLockJsonData = (data: Buffer) => {
        if (data.length < 1) {
            throw new Error('Invalid buffer length. Expected at least 1 byte.');
        }
        const lockByte = data.readUInt8(0);
        const dctLocks = [];
        for (let i = 1; i <= 5; i++) {
            dctLocks.push({
                index: i,
                isLocked: Boolean((lockByte >> i) & 1)
            });
        }

        return {
            dctLocks
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

    protected postNodeStackVersionJsonData = (data: Buffer) => {
        if (data.length < 3) {
            throw new Error('Invalid buffer length. Expected at least 3 bytes.');
        }
        const major = data.readUInt8(0);
        const minor = data.readUInt8(1);

        return {
            major_version: major,
            minor_version: minor
        };
    }

    protected postNodeStackVersionDataFrame = (data: { major_version: number, minor_version: number }) => {
        const frame = Buffer.alloc(2);
        frame.writeUInt8(data.major_version, 0);
        frame.writeUInt8(data.minor_version, 1);
        return frame;
    }

    protected postNodeAppVersionJsonData = (data: Buffer): PostNodeAppVersion => {
        if (data.length < 6) {
            throw new Error('Invalid buffer length. Expected 6 bytes.');
        }

        return {
            app_reference: data.readUIntLE(0, 3),
            app_index_letter: String.fromCharCode(data.readUInt8(3)),
            app_index_number: data.readUInt8(4),
            app_profile: data.readUInt8(5),
        };
    };

    protected postNodeAppVersionDataFrame = (data: PostNodeAppVersion) => {
        let frame = Buffer.alloc(6);
        frame.writeUIntLE(data.app_reference, 0, 3);
        frame.writeUInt8(data.app_index_letter.charCodeAt(0), 3);
        frame.writeUInt8(data.app_index_number, 4);
        frame.writeUInt8(data.app_profile, 5);
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