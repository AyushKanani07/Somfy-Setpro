import { crc16 } from "../../helpers/util.ts";
import type { FirmwareCommand } from "../../interface/command.interface.ts";
import { FirmwareCommands } from "../../node-type/firmware/firmware-commands.ts";

export class FirmwareCommandBuilderService {

    private firmwareCommand = new FirmwareCommands();

    private getCommandIdByName(name: string): number {
        const CMD_ARRAY = this.firmwareCommand.firmwareCommandList;
        const command = CMD_ARRAY.find(cmd => cmd.name === name);
        return command ? command.cmd_id : 0;
    }

    public buildFirmwareCommand(command: FirmwareCommand) {
        const cmd_len = 11 + command.data.length;

        let frame = Buffer.alloc(cmd_len);

        let i = 0;

        // set header
        frame[i++] = 0xC0;

        // set data length
        frame[i++] = (((cmd_len - 2) >> 8) & 0xFF);
        frame[i++] = (((cmd_len - 2)) & 0xFF);

        // set control
        frame[i++] = 0x0;
        frame[i++] = 0x0;
        frame[i++] = 0x0;

        // set command type from slave to master
        frame[i++] = command.isSecondMotor ? 0xE2 : 0xE0;

        frame[i++] = this.getCommandIdByName(command.command);

        // set data
        if (command.data.length) {
            command.data.forEach((value: number) => {
                frame[i++] = value;
            });
        }

        // set checksum
        let crc = crc16(frame.subarray(1, frame.length - 3));
        frame[i++] = (crc >> 8);
        frame[i++] = crc & 0xff;

        frame[i] = 0xC0;
        return {
            frame: frame,
        };
    }
}