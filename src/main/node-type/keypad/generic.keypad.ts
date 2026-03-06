import type { MasterCommandBuilderData, MasterCommandParserData } from "../../interface/command.interface.ts";
import type { IndividualSwitchGroup, PostFirmwareVersion, SetSwitchAdd, SwitchSettings } from "../../interface/keypad.interface.ts";


export class GenericKeypad {

    protected static KEYPAD_METHOD_LIST = [
        { cmd_id: 0x8F, name: 'GET_FIRMWARE_VERSION' },
        { cmd_id: 0x82, name: 'GET_SWITCH_SETTINGS', builder_method: 'getSwitchSettingsDataFrame' },
        { cmd_id: 0x83, name: 'GET_INDIVIDUAL_SWITCH_GROUPS' },
        { cmd_id: 0x90, name: 'SET_SWITCH_ADDRESS', builder_method: 'setSwitchAddDataFrame', parser_method: 'setSwitchAddJsonData', },
        { cmd_id: 0x92, name: 'SET_SWITCH_SETTINGS', builder_method: 'setSwitchSettingsFrame', parser_method: 'setSwitchSettingsJsonData', },
        { cmd_id: 0x93, name: 'SET_INDIVIDUAL_SWITCH_GROUPS', builder_method: 'setIndividualSwitchGroupDataFrame', parser_method: 'setIndividualSwitchGroupJsonData', },
        { cmd_id: 0x94, name: 'SET_KEYPAD_TYPE', builder_method: 'setKeypadTypeDataFrame', parser_method: 'setKeypadTypeJsonData', },
        { cmd_id: 0xA2, name: 'POST_SWITCH_SETTING', parser_method: 'postSwitchSettingJsonData', },
        { cmd_id: 0xA3, name: 'POST_INDIVIDUAL_SWITCH_GROUPS', parser_method: 'postIndividualSwitchGroupJsonData', },
        { cmd_id: 0x9F, name: 'POST_FIRMWARE_VERSION', parser_method: 'postFirmwareVersionJsonData', },
        { cmd_id: 0xA0, name: 'POST_SWITCH_ADDRESS' },
        { cmd_id: 0x8F, name: 'GET_FIRMWARE_VERSION' },
        { cmd_id: 0x9F, name: 'POST_FIRMWARE_VERSION', parser_method: 'firmwareVersionJsonData' },
        { cmd_id: 0x7F, name: 'ACK', parser_method: 'ackJsonData' },
        { cmd_id: 0x6F, name: 'nACK', parser_method: 'nackJsonData' }
    ];

    public Generic_Keypad_FrameBuilder(commandName: string, data: MasterCommandBuilderData): Buffer {
        const command = GenericKeypad.KEYPAD_METHOD_LIST.find(cmd => cmd.name === commandName);
        if (!command) {
            throw new Error(`Command "${commandName}" not found in GenericKeypad FrameBuilder.`);
        }
        if (command.builder_method) {
            const method = (this as any)[command.builder_method] as (data: MasterCommandBuilderData) => Buffer;
            if (!method || typeof method !== 'function') {
                throw new Error(`Method "${command.builder_method}" not found or not a function in GenericKeypad FrameBuilder.`);
            }
            return method(data);
        } else {
            throw new Error(`Method "${command.builder_method}" not found or not a function in GenericKeypad FrameBuilder.`);
        }
    };

    public Generic_Keypad_DataParser(commandName: string, buffer: Buffer): MasterCommandParserData {
        const command = GenericKeypad.KEYPAD_METHOD_LIST.find(cmd => cmd.name === commandName);
        if (!command) {
            throw new Error(`Command "${commandName}" not found in GenericKeypad DataParser.`);
        }
        if (command.parser_method) {
            const method = (this as any)[command.parser_method] as (buffer: Buffer) => MasterCommandParserData;
            if (!method || typeof method !== 'function') {
                throw new Error(`Method "${command.parser_method}" not found or not a function in GenericKeypad DataParser.`);
            }
            return method(buffer);
        } else {
            throw new Error(`Method "${command.parser_method}" not found or not a function in GenericKeypad DataParser.`);
        }
    };

    //#endregion

    //#region DataFrame Gener

    protected setSwitchAddDataFrame = (data: SetSwitchAdd): Buffer => {
        let frame = Buffer.alloc(3);
        const src = parseInt(data.address, 16);
        frame.writeUIntLE(src, 0, 3);
        return frame;
    };

    protected setSwitchSettingsFrame = (data: SwitchSettings): Buffer => {
        let frame = Buffer.alloc(22);
        frame.writeUInt8(data.id, 0); // Keypad ID

        frame.writeUInt8(data.press_command, 1); // Press Command
        frame.writeUInt8(data.press_value, 2); // Press value
        frame.writeUInt8(data.press_extra_value, 3); // Press extra value
        frame.writeUInt8(data.press_addr_code, 4); // Press Add Code
        frame.writeUIntLE(parseInt(data.press_target_addr, 16), 5, 3); //Press Target Address

        frame.writeUInt8(data.hold_command, 8); // Hold Command
        frame.writeUInt8(data.hold_value, 9); // Hold value
        frame.writeUInt8(data.hold_extra_value, 10); // Hold extra value
        frame.writeUInt8(data.hold_addr_code, 11); // Hold Add Code
        frame.writeUIntLE(parseInt(data.hold_target_addr, 16), 12, 3); //Hold Target Address

        frame.writeUInt8(data.release_command, 15); // Release Command
        frame.writeUInt8(data.release_value, 16); // Release Value
        frame.writeUInt8(data.release_extra_value, 17); // Release extra value
        frame.writeUInt8(data.release_addr_code, 18); // Release Add Code
        frame.writeUIntLE(parseInt(data.release_target_addr, 16), 19, 3); //Release Target Address
        return frame;
    };

    protected getSwitchSettingsDataFrame = (data: { button_id: number }): Buffer => {
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.button_id, 0);
        return frame;
    };

    protected setIndividualSwitchGroupDataFrame = (data: IndividualSwitchGroup): Buffer => {

        let frame = Buffer.alloc(24);

        frame.writeUIntLE(parseInt(data.sw1_group_addr, 16), 0, 3); // SW1 Group Address

        frame.writeUIntLE(parseInt(data.sw2_group_addr, 16), 3, 3); // SW2 Group Address

        frame.writeUIntLE(parseInt(data.sw3_group_addr, 16), 6, 3); // SW3 Group Address

        frame.writeUIntLE(parseInt(data.sw4_group_addr, 16), 9, 3); // SW4 Group Address

        frame.writeUIntLE(parseInt(data.sw5_group_addr, 16), 12, 3); // SW5 Group Address

        frame.writeUIntLE(parseInt(data.sw6_group_addr, 16), 15, 3); // SW6 Group Address

        frame.writeUIntLE(parseInt(data.sw7_group_addr, 16), 18, 3); // SW7 Group Address

        frame.writeUIntLE(parseInt(data.sw8_group_addr, 16), 21, 3); // SW8 Group Address

        return frame;
    };

    //#endregion

    //#region JosnData Parser

    protected setSwitchAddJsonData = (buffer: Buffer): SetSwitchAdd => {
        if (buffer.length !== 3) {
            throw new Error('Invalid buffer length. Expected 3 bytes.');
        }
        const address = buffer.readUIntLE(0, 3).toString(16).toUpperCase();
        return {
            address
        };
    };

    protected setKeypadTypeDataFrame = (data: { keypad_type: number }): Buffer => {
        let frame = Buffer.alloc(1);
        frame.writeUInt8(data.keypad_type, 0);
        return frame;
    };

    protected setSwitchSettingsJsonData = (buffer: Buffer): SwitchSettings => {
        if (buffer.length !== 22) {
            throw new Error('Invalid buffer length. Expected 22 bytes.');
        }

        const id = buffer.readUInt8(0);

        const press_command = buffer.readUInt8(1);
        const press_value = buffer.readUInt8(2);
        const press_extra_value = buffer.readUInt8(3);
        const press_addr_code = buffer.readUInt8(4);
        const press_target_addr = buffer.readUIntLE(5, 3).toString(16).toUpperCase();

        const hold_command = buffer.readUInt8(8);
        const hold_value = buffer.readUInt8(9);
        const hold_extra_value = buffer.readUInt8(10);
        const hold_addr_code = buffer.readUInt8(11);
        const hold_target_addr = buffer.readUIntLE(12, 3).toString(16).toUpperCase();

        const release_command = buffer.readUInt8(15);
        const release_value = buffer.readUInt8(16);
        const release_extra_value = buffer.readUInt8(17);
        const release_addr_code = buffer.readUInt8(18);
        const release_target_addr = buffer.readUIntLE(19, 3).toString(16).toUpperCase();

        return {
            id,
            press_command,
            press_value,
            press_extra_value,
            press_addr_code,
            press_target_addr,
            hold_command,
            hold_value,
            hold_extra_value,
            hold_addr_code,
            hold_target_addr,
            release_command,
            release_value,
            release_extra_value,
            release_addr_code,
            release_target_addr
        };
    };

    protected setIndividualSwitchGroupJsonData = (buffer: Buffer): IndividualSwitchGroup => {
        if (buffer.length !== 24) {
            throw new Error('Invalid buffer length. Expected 24 bytes.');
        }

        const sw1_group_addr = buffer.readUIntLE(0, 3).toString(16).toUpperCase();
        const sw2_group_addr = buffer.readUIntLE(3, 3).toString(16).toUpperCase();
        const sw3_group_addr = buffer.readUIntLE(6, 3).toString(16).toUpperCase();
        const sw4_group_addr = buffer.readUIntLE(9, 3).toString(16).toUpperCase();
        const sw5_group_addr = buffer.readUIntLE(12, 3).toString(16).toUpperCase();
        const sw6_group_addr = buffer.readUIntLE(15, 3).toString(16).toUpperCase();
        const sw7_group_addr = buffer.readUIntLE(18, 3).toString(16).toUpperCase();
        const sw8_group_addr = buffer.readUIntLE(21, 3).toString(16).toUpperCase();

        return {
            sw1_group_addr,
            sw2_group_addr,
            sw3_group_addr,
            sw4_group_addr,
            sw5_group_addr,
            sw6_group_addr,
            sw7_group_addr,
            sw8_group_addr
        };
    };


    protected postSwitchSettingJsonData = (buffer: Buffer): SwitchSettings => {

        if (buffer.length !== 22) {
            throw new Error('Invalid buffer length. Expected 22 bytes.');
        }

        const id = buffer.readUInt8(0);

        const press_command = buffer.readUInt8(1);
        const press_value = buffer.readUInt8(2);
        const press_extra_value = buffer.readUInt8(3);
        const press_addr_code = buffer.readUInt8(4);
        const press_target_addr = buffer.readUIntLE(5, 3).toString(16).toUpperCase();

        const hold_command = buffer.readUInt8(8);
        const hold_value = buffer.readUInt8(9);
        const hold_extra_value = buffer.readUInt8(10);
        const hold_addr_code = buffer.readUInt8(11);
        const hold_target_addr = buffer.readUIntLE(12, 3).toString(16).toUpperCase();

        const release_command = buffer.readUInt8(15);
        const release_value = buffer.readUInt8(16);
        const release_extra_value = buffer.readUInt8(17);
        const release_addr_code = buffer.readUInt8(18);
        const release_target_addr = buffer.readUIntLE(19, 3).toString(16).toUpperCase();

        return {
            id,
            press_command,
            press_value,
            press_extra_value,
            press_addr_code,
            press_target_addr,
            hold_command,
            hold_value,
            hold_extra_value,
            hold_addr_code,
            hold_target_addr,
            release_command,
            release_value,
            release_extra_value,
            release_addr_code,
            release_target_addr
        };
    };

    protected postIndividualSwitchGroupJsonData = (data: Buffer): IndividualSwitchGroup => {
        if (data.length !== 24) {
            throw new Error('Invalid buffer length. Expected 24 bytes.');
        }

        const sw1_group_addr = data.readUIntLE(0, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw2_group_addr = data.readUIntLE(3, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw3_group_addr = data.readUIntLE(6, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw4_group_addr = data.readUIntLE(9, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw5_group_addr = data.readUIntLE(12, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw6_group_addr = data.readUIntLE(15, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw7_group_addr = data.readUIntLE(18, 3).toString(16).toUpperCase().padStart(6, '0');
        const sw8_group_addr = data.readUIntLE(21, 3).toString(16).toUpperCase().padStart(6, '0');

        return {
            sw1_group_addr,
            sw2_group_addr,
            sw3_group_addr,
            sw4_group_addr,
            sw5_group_addr,
            sw6_group_addr,
            sw7_group_addr,
            sw8_group_addr
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
