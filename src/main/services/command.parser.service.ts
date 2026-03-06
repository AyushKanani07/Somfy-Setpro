import { DEFAULT_NODE_TYPE, NODE_TYPE } from '../common/command.list.ts';
import { busFrameToRawFrame } from '../helpers/parser.ts';
import type {
	MasterCommandParserData,
	CommandParserOutput,
} from '../interface/command.interface.ts';
import { dbConfig } from '../models/index.ts';
import { GenericKeypad } from '../node-type/keypad/generic.keypad.ts';
import { GenericMotor } from '../node-type/motor/generic.motor.ts';
import { GlydeaMotor } from '../node-type/motor/glydea.motor.ts';
import { LSU40Motor } from '../node-type/motor/lsu40.motor.ts';
import { LSU50Motor } from '../node-type/motor/lsu50.motor.ts';
import { QT30Motor } from '../node-type/motor/qt30.motor.ts';
import { ST30Motor } from '../node-type/motor/st30.motor.ts';
import { ST40Motor } from '../node-type/motor/st40.motor.ts';
import { ST50Motor } from '../node-type/motor/st50.motor.ts';
import { GenericReceiver } from '../node-type/Receiver/generic.receiver.ts';
import { GenericTransmiter } from '../node-type/transmiter/generic.transmiter.ts';

type instanceList = {
	node_type: number;
	sub_node_type?: number;
	instance: any;
}
export class CommandParserService {
	private CMD_PRSR_NODE_TYPE: instanceList[];
	private CMD_PRSR_GENERIC_MOTOR: GenericMotor;

	constructor() {
		this.CMD_PRSR_NODE_TYPE = [
			{ node_type: 6, sub_node_type: 5039367, instance: new GlydeaMotor() },
			{ node_type: 9, sub_node_type: 5132734, instance: new LSU40Motor() },
			{ node_type: 7, sub_node_type: 5071757, instance: new LSU50Motor() },
			{ node_type: 2, sub_node_type: 5063313, instance: new ST30Motor() },
			{ node_type: 2, sub_node_type: 5157730, instance: new QT30Motor() },
			{ node_type: 10, sub_node_type: 0x0a, instance: new ST40Motor() },
			{ node_type: 8, sub_node_type: 5123276, instance: new ST50Motor() },
			{ node_type: 14, instance: new GenericKeypad() },
			{ node_type: 5, instance: new GenericTransmiter() },
			{ node_type: 13, instance: new GenericReceiver() }
		];
		this.CMD_PRSR_GENERIC_MOTOR = new GenericMotor();
	}

	private Cmd_Prsr_GetCommandName(buffer: Buffer, node_type: number, sub_node_type?: number): string {
		const ParserCommand = this.Cmd_Prsr_GetParserFunction(node_type, sub_node_type);
		const instance = this.Cmd_Prsr_GetNodeInstance(node_type, sub_node_type);
		const ctor: any = instance.constructor as typeof GenericMotor | typeof GenericKeypad | typeof GenericReceiver | typeof GenericTransmiter;
		const CMD_ARRAY = ctor[ParserCommand.CMD_ARRAY];

		const command = CMD_ARRAY?.find((element: any) => {
			return element.cmd_id == buffer.readUInt8(0);
		});

		return command?.name ?? 'UNKNOWN_COMMAND';
	}

	private Cmd_Prsr_GetSourceAddress(buffer: Buffer): string {
		const src = buffer.readUIntLE(3, 3);
		let hex = src.toString(16);
		while (hex.length < 6) {
			hex = '0' + hex;
		}
		return hex.toUpperCase();
	}

	private Cmd_Prsr_GetDestinationAddress(buffer: Buffer): string {
		const dest = buffer.readUIntLE(6, 3);
		let hex = dest.toString(16);
		while (hex.length < 6) {
			hex = '0' + hex;
		}
		return hex.toUpperCase();
	}

	private Cmd_Prsr_GetSourceNodeType(buffer: Buffer): number {
		return (buffer.readUInt8(2) & 0xf0) >> 4;
	}

	private Cmd_Prsr_GetDestinationNodeType(buffer: Buffer): number {
		return buffer.readUInt8(2) & 0x0f;
	}

	private Cmd_Prsr_GetNodeInstance(node_type: number, sub_node_type?: number) {
		if (sub_node_type && sub_node_type != 0) {
			const instance = this.CMD_PRSR_NODE_TYPE.find((cmd => cmd.sub_node_type == sub_node_type))?.instance;
			if (instance) return instance;
		}

		const instance = this.CMD_PRSR_NODE_TYPE.find((cmd) => cmd.node_type == node_type)?.instance;
		if (instance) return instance;

		return this.CMD_PRSR_GENERIC_MOTOR;
	}

	private Cmd_Prsr_GetParserFunction(node_type: number, sub_node_type?: number) {
		if (sub_node_type && sub_node_type != 0) {
			const parserFunction = NODE_TYPE.find((cmd) => cmd.sub_node_type == sub_node_type);
			if (parserFunction) return parserFunction;
		}


		const parserFunction = NODE_TYPE.find((cmd) => cmd.node_type == node_type);
		if (parserFunction) return parserFunction;

		return DEFAULT_NODE_TYPE;
	}

	private Cmd_Prsr_BufferToJsonData(command_name: string, buffer: Buffer, node_type: number, sub_node_type?: number): MasterCommandParserData {
		const ParserCommand = this.Cmd_Prsr_GetParserFunction(node_type, sub_node_type);
		const instance = this.Cmd_Prsr_GetNodeInstance(node_type, sub_node_type);
		const data = instance[ParserCommand.parser_method](command_name, buffer);
		return data;
	}

	public decodeFrame = async (frame: Buffer): Promise<{ cmd_data: CommandParserOutput, data_frame: Buffer }> => {
		const raw_frame: Buffer = busFrameToRawFrame(frame);
		const frame_length: number = raw_frame.length;

		const source_add: string = this.Cmd_Prsr_GetSourceAddress(raw_frame);
		const getDevice = await dbConfig.dbInstance.deviceModel.findOne({
			attributes: ['sub_node_id', ['model_no', 'node_id']],
			where: {
				address: source_add,
			},
			raw: true,
		});

		const source_node_type: number = this.Cmd_Prsr_GetSourceNodeType(raw_frame);
		const command_name: string = this.Cmd_Prsr_GetCommandName(raw_frame, source_node_type, getDevice?.sub_node_id);

		const destination_add: string =
			this.Cmd_Prsr_GetDestinationAddress(raw_frame);
		const dest_node_type: number =
			this.Cmd_Prsr_GetDestinationNodeType(raw_frame);

		let data = {};
		let data_frame: Buffer = Buffer.alloc(0);
		if (raw_frame.length > 11) {
			const dataBuffer: Buffer = raw_frame.subarray(9, frame_length - 2);
			data_frame = Buffer.alloc(dataBuffer.length);
			data_frame = dataBuffer;
			data = this.Cmd_Prsr_BufferToJsonData(
				command_name,
				dataBuffer,
				getDevice?.node_id,
				getDevice?.sub_node_id
			);
		}

		return {
			cmd_data: {
				command_name,
				source_add,
				destination_add,
				source_node_type,
				dest_node_type,
				data,
				is_ack: (raw_frame.readUInt8(1) & 0x80) ? true : false,
			},
			data_frame: data_frame,
		};
	};

	public decodeFrameForLog = async (frame: Buffer): Promise<{ cmd_data: CommandParserOutput, data_frame: Buffer }> => {
		const raw_frame: Buffer = busFrameToRawFrame(frame);
		const frame_length: number = raw_frame.length;

		const source_add: string = this.Cmd_Prsr_GetSourceAddress(raw_frame);
		const destination_add: string = this.Cmd_Prsr_GetDestinationAddress(raw_frame);
		const source_node_type: number = this.Cmd_Prsr_GetSourceNodeType(raw_frame);
		const dest_node_type: number = this.Cmd_Prsr_GetDestinationNodeType(raw_frame);

		const findAddress = dest_node_type == 15 ? source_add : destination_add;
		const getDevice = await dbConfig.dbInstance.deviceModel.findOne({
			attributes: ['sub_node_id', ['model_no', 'node_id']],
			where: {
				address: findAddress,
			},
			raw: true,
		});

		const command_name: string = this.Cmd_Prsr_GetCommandName(raw_frame, dest_node_type, getDevice?.sub_node_id);

		let data = {};
		let data_frame: Buffer = Buffer.alloc(0);
		if (raw_frame.length > 11) {
			const dataBuffer: Buffer = raw_frame.subarray(9, frame_length - 2);
			data_frame = Buffer.alloc(dataBuffer.length);
			data_frame = dataBuffer;
			data = this.Cmd_Prsr_BufferToJsonData(
				command_name,
				dataBuffer,
				getDevice?.node_id,
				getDevice?.sub_node_id
			);
		}

		return {
			cmd_data: {
				command_name,
				source_add,
				destination_add,
				source_node_type,
				dest_node_type,
				data,
				is_ack: (raw_frame.readUInt8(1) & 0x80) ? true : false,
			},
			data_frame: data_frame,
		};
	};

	public decodeDataFrame = (command_name: string, dataFrame: Buffer, node_type: number, sub_node_type?: number): MasterCommandParserData => {
		return this.Cmd_Prsr_BufferToJsonData(command_name, dataFrame, node_type, sub_node_type);
	}

}
