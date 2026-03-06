
import { LSU40Motor } from '../node-type/motor/lsu40.motor.ts';
import { LSU50Motor } from '../node-type/motor/lsu50.motor.ts';
import { QT30Motor } from '../node-type/motor/qt30.motor.ts';
import { ST30Motor } from '../node-type/motor/st30.motor.ts';
import { ST40Motor } from '../node-type/motor/st40.motor.ts';
import { ST50Motor } from '../node-type/motor/st50.motor.ts';
import { GenericMotor } from '../node-type/motor/generic.motor.ts';
import { GlydeaMotor } from '../node-type/motor/glydea.motor.ts';
import { GenericKeypad } from '../node-type/keypad/generic.keypad.ts';
import type { CommandBuilderInput } from '../interface/command.interface.ts';
import { DEFAULT_NODE_TYPE, NODE_TYPE } from '../common/command.list.ts';
import { GenericTransmiter } from '../node-type/transmiter/generic.transmiter.ts';
import { GenericReceiver } from '../node-type/Receiver/generic.receiver.ts';

type instanceList = {
	node_type: number;
	sub_node_type?: number;
	instance: any;
}
export class CommandBuilderService {
	private CMD_BLDR_NODE_TYPE: instanceList[];
	private CMD_BLDR_GENERIC_MOTOR: GenericMotor;

	constructor() {
		this.CMD_BLDR_NODE_TYPE = [
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
		this.CMD_BLDR_GENERIC_MOTOR = new GenericMotor();
	}

	private Cmd_Bldr_GetCommandIDByName(command_name: string, node_type: number, sub_node_type?: number): number {
		const BuilderCommand = this.Cmd_Bldr_GetBuilderFunction(node_type, sub_node_type);
		const instance = this.Cmd_Bldr_GetNodeInstance(node_type, sub_node_type);
		const ctor: any = instance.constructor as typeof GenericMotor;
		const CMD_ARRAY = ctor[BuilderCommand.CMD_ARRAY];

		const command = CMD_ARRAY?.find((element: any) => {
			return element.name == command_name;
		});

		return command?.cmd_id ?? 0;
	}

	private Cmd_Bldr_GetNodeInstance(node_type: number, sub_node_type?: number) {
		if (sub_node_type && sub_node_type != 0) {
			const instance = this.CMD_BLDR_NODE_TYPE.find((cmd => cmd.sub_node_type == sub_node_type))?.instance;
			if (instance) {
				return instance;
			}
		}

		const instance = this.CMD_BLDR_NODE_TYPE.find((cmd) => cmd.node_type == node_type)?.instance;
		if (instance) return instance;

		return this.CMD_BLDR_GENERIC_MOTOR;
	}

	private Cmd_Bldr_GetBuilderFunction(node_type: number, sub_node_type?: number) {
		if (sub_node_type && sub_node_type != 0) {
			const builderFunction = NODE_TYPE.find((cmd) => cmd.sub_node_type == sub_node_type);
			if (builderFunction) {
				return builderFunction;
			}
		}

		const builderFunction = NODE_TYPE.find((cmd) => cmd.node_type == node_type);
		if (builderFunction) return builderFunction;

		return DEFAULT_NODE_TYPE;
	}

	private Cmd_Bldr_BuildDataFrame(command_name: string, data: any, node_type: number, sub_node_type: number | undefined): Buffer {
		const BuilderCommand = this.Cmd_Bldr_GetBuilderFunction(node_type, sub_node_type);
		const instance = this.Cmd_Bldr_GetNodeInstance(node_type, sub_node_type);
		const frame = instance[BuilderCommand.builder_method](command_name, data);
		return frame;
	}

	public Cmd_Bldr_BuildCommandFrame = (CommandData: CommandBuilderInput): { frame: Buffer; data: Buffer } => {
		if (CommandData.dest_node_type == 2 && !CommandData.sub_node_type && CommandData.command_name != 'GET_NODE_APP_VERSION') {
			throw new Error('sub_node_type is required.');
		}

		let dataFrame: Buffer = Buffer.alloc(0);

		if (Object.values(CommandData.data).length > 0) {
			dataFrame = this.Cmd_Bldr_BuildDataFrame(
				CommandData.command_name,
				CommandData.data,
				CommandData.dest_node_type,
				CommandData.sub_node_type
			);
		}

		// Calculate frame length
		const frameLength = 11 + (dataFrame.length || 0);
		let frame = Buffer.alloc(frameLength);

		// Set message id
		frame.writeUInt8(
			this.Cmd_Bldr_GetCommandIDByName(
				CommandData.command_name,
				CommandData.dest_node_type,
				CommandData.sub_node_type
			),
			0
		);

		// Set node type
		frame.writeUInt8(CommandData.dest_node_type | 0xf0, 2);

		let source_add = `010000`;
		if (CommandData.source_add) {
			source_add = CommandData.source_add;
		}

		// Set source address
		const src = parseInt(source_add, 16);
		frame.writeUIntLE(src, 3, 3);

		// Set destination address
		const dest = parseInt(CommandData.destination_add, 16);
		frame.writeUIntLE(dest, 6, 3);

		// Set data
		let i = 9;
		if (dataFrame.length > 0) {
			dataFrame.forEach((value: number) => {
				frame.writeUInt8(value, i);
				i += 1;
			});
		}

		// Set data length
		let dataLengthField = i + 2;
		if (CommandData.is_ack) {
			dataLengthField = 0x80 | dataLengthField;
		}
		frame.writeUInt8(dataLengthField, 1);

		// 2's complement of each byte of frame
		for (let j = 0; j < i; j++) {
			frame[j] = 255 - frame[j];
		}

		// Write checksum
		let checksum = 0;
		for (let j = 0; j < i; j++) {
			checksum += frame[j];
		}
		frame.writeUInt16BE(checksum, i);

		return {
			frame: frame,
			data: dataFrame
		};
	};

}
