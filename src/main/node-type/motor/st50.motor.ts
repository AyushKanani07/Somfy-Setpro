import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import type {
	CtrlMoveTo,
	MotorRollingInput,
	PostMotorLimits,
	SetAppMode,
	SetMotorRollingSpeed,
} from '../../interface/motor.interface.ts';
import { GenericMotor } from './generic.motor.ts';

export class ST50Motor extends GenericMotor {
	protected BOTTOM_LIMIT_MIN = 0x0696;
	protected BOTTOM_LIMIT_MAX = 0xfcff;
	protected ROLLING_SPEED_MIN = 6;
	protected ROLLING_SPEED_MAX = 28;

	protected static ST50_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
		{
			cmd_id: 0x2a,
			name: 'GET_TORQUE_LIMITATION'
		},
		{
			cmd_id: 0x3a,
			name: 'POST_TORQUE_LIMITATION',
			parser_method: 'postTorqueLimitationJsonData',
			builder_method: 'postTorqueLimitationDataFrame'
		},
		{
			cmd_id: 0x1a,
			name: 'SET_TORQUE_LIMITATION',
			builder_method: 'setTorqueLimitationDataFrame',
			parser_method: 'setTorqueLimitationJsonData'
		}
	];

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(ST50Motor.ST50_MOTOR_METHOD_LIST)

	public ST50_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = ST50Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in ST50 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in ST50 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in ST50 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in ST50 DataBuilder.`
			);
		}
	}

	public ST50_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = ST50Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(`Command "${commandName}" not found in ST50 DataParser.`);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in ST50 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in ST50 DataParser.`
			);
		}
	}

	public validateMotorBottomLimit = (value: number): boolean => {
		if (value > this.BOTTOM_LIMIT_MIN && value < this.BOTTOM_LIMIT_MAX) {
			return true;
		} else {
			return false;
		}
	};

	public validateMotorRollingSpeed = (value: MotorRollingInput): boolean => {
		if (
			value.up > this.ROLLING_SPEED_MIN ||
			value.down > this.ROLLING_SPEED_MIN ||
			value.slow > this.ROLLING_SPEED_MIN ||
			value.up < this.ROLLING_SPEED_MAX ||
			value.down < this.ROLLING_SPEED_MAX ||
			value.slow < this.ROLLING_SPEED_MAX
		) {
			return true;
		} else {
			return false;
		}
	};

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

	protected ctrlMoveToDataFrame = (data: CtrlMoveTo) => {
		if (data.function_id < 0x00 || data.function_id > 0x04) {
			throw new Error('Function id should be between 0 and 4');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.unused, 3);
		return frame;
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode !== 0x00) {
			throw new Error('Invalid mode');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		if ([data.up, data.down, data.slow].some(speed => speed < 10 || speed > 25)) {
			throw new Error('Speed values must be between 10 and 25');
		}
		let frame = Buffer.alloc(3);

		frame.writeUInt8(data.up, 0);
		frame.writeUInt8(data.down, 1);
		frame.writeUInt8(data.slow, 2);
		return frame;
	};

	protected postTorqueLimitationJsonData = (data: Buffer) => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}

		const status = data.readUInt8(0);
		const level = data.readUInt8(1);

		return {
			status,
			level
		}
	}

	protected postTorqueLimitationDataFrame = (data: any) => {
		let frame = Buffer.alloc(2);

		frame.writeUInt8(data.status, 0);
		frame.writeUInt8(data.level, 1);
		return frame;
	}

	protected setTorqueLimitationDataFrame = (data: { function_id: number, value: number }) => {
		let frame = Buffer.alloc(2);

		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.value, 1);
		return frame;
	}

	protected setTorqueLimitationJsonData = (data: Buffer) => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}
		const function_id = data.readUInt8(0);
		const value = data.readUInt8(1);
		return {
			function_id,
			value
		}
	}
}
