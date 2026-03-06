import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import type {
	PostMotorLimits,
	PostMotorPosition,
	PostNodeLabel,
	SetAppMode,
} from '../../interface/motor.interface.ts';
import { GenericMotor } from './generic.motor.ts';

export class ST40Motor extends GenericMotor {

	protected static ST40_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
	]

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(ST40Motor.ST40_MOTOR_METHOD_LIST)

	public ST40_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = ST40Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in ST40 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in ST40 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in ST40 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in ST40 DataBuilder.`
			);
		}
	}

	public ST40_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = ST40Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(`Command "${commandName}" not found in ST40 DataParser.`);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in ST40 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in ST40 DataParser.`
			);
		}
	}

	protected postMotorLimitsJsonData = (data: Buffer): PostMotorLimits => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		const result = {
			up_limit: data.readUInt16LE(0),
			down_limit: data.readUInt16LE(2),
		};
		return result;
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode !== 0x00) {
			throw new Error('Invalid mode');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};
}
