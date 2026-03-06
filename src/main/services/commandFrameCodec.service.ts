import type { Command, CommandBuilderInput, CommandParserOutput } from "../interface/command.interface.ts";
import { CommandBuilderService } from "./command.builder.service.ts";
import { CommandParserService } from "./command.parser.service.ts";
import { CommandSenderService } from "./command.sender.service.ts";


export class CommandFrameCodecService {
    private commandParserService = new CommandParserService();
    private commandBuilderService = new CommandBuilderService();
    private commandSender = new CommandSenderService();

    public decodeFrame = async (frame: string): Promise<CommandParserOutput> => {
        const decodedData = await this.commandParserService.decodeFrameForLog(Buffer.from(frame, 'hex'));
        return decodedData.cmd_data;
    }

    public encodeCommand = async (command: CommandBuilderInput) => {
        console.log('command: ', command);
        const encodedFrame = this.commandBuilderService.Cmd_Bldr_BuildCommandFrame(command);
        return encodedFrame.frame.toString('hex').toUpperCase();
    }

    public sendFrame = async (frame: string) => {
        const decodeData = await this.commandParserService.decodeFrameForLog(Buffer.from(frame, 'hex'));
        const command: any = {
            command_name: decodeData.cmd_data.command_name,
            source_node_type: decodeData.cmd_data.source_node_type,
            dest_node_type: decodeData.cmd_data.dest_node_type,
            source_add: decodeData.cmd_data.source_add,
            destination_add: decodeData.cmd_data.destination_add,
            is_ack: decodeData.cmd_data.is_ack
        }

        await this.commandSender.sendFrameToPort(Buffer.from(frame, 'hex'), decodeData.data_frame, command);
    }
}