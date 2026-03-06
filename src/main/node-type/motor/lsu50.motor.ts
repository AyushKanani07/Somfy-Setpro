import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import type {
	CtrlMove,
	CtrlMoveOf,
	CtrlMoveTo,
	PostMotorLimits,
	SetAppMode,
	SetMotorIp,
	SetMotorLimit,
	SetMotorRollingSpeed,
} from '../../interface/motor.interface.ts';
import { GenericMotor } from './generic.motor.ts';

export class LSU50Motor extends GenericMotor {
	protected BOTTOM_LIMIT_MIN = 0x0020;
	protected BOTTOM_LIMIT_MAX = 0xfcff;

	protected static LSU50_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
		{
			cmd_id: 0x80,
			name: 'SET_CALIBRATION'
		},
	];

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(LSU50Motor.LSU50_MOTOR_METHOD_LIST)

	public LSU50_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = LSU50Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log('command: ', command);
			console.log(`Command "${commandName}" not found in LSU50 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in LSU50 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in LSU50 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in LSU50 DataBuilder.`
			);
		}
	}

	public LSU50_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = LSU50Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(
				`Command "${commandName}" not found in LSU50 DataParser.`
			);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in LSU50 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in LSU50 DataParser.`
			);
		}
	}

	//#region Input Validation

	public validateMotorBottomLimit = (value: number): boolean => {
		if (value > this.BOTTOM_LIMIT_MIN && value < this.BOTTOM_LIMIT_MAX) {
			return true;
		} else {
			return false;
		}
	};

	//#endregion

	protected setMotorLimitDataFrame = (data: SetMotorLimit) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Invalid function id');
		} else if (data.limit < 0x00 || data.limit > 0x01) {
			throw new Error('Invalid limit');
		}

		if (
			data.function_id == 0x02 &&
			(data.value < 0x0020 || data.value > 0xfcff)
		) {
			throw new Error('Value should be between 32 and 64767');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.limit, 1);
		frame.writeUint16LE(data.value, 2);
		return frame;
	};

	protected setMotorIpDataFrame = (data: SetMotorIp) => {
		if (data.function_id < 0x00 || data.function_id > 0x04) {
			throw new Error('Function id should be between 0 and 4');
		} else if (data.ip_index < 0x00 || data.ip_index > 0x10) {
			throw new Error('Ip index should be between 0 and 16');
		}
		let frame = Buffer.alloc(4);

		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ip_index, 1);
		frame.writeUInt16LE(data.value_position, 2);
		return frame;
	};

	protected ctrlMoveDataFrame = (data: CtrlMove) => {
		if (data.direction < 0x00 || data.direction > 0x01) {
			throw new Error('Direction should be 0 or 1');
		} else if (data.duration < 0x01 || data.duration > 0xff) {
			throw new Error('Duration should be between 1 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.direction, 0);
		frame.writeUInt8(data.duration, 1);
		frame.writeUInt8(data.speed, 2);
		return frame;
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

	protected ctrlMoveOfDataFrame = (data: CtrlMoveOf) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Function id should be between 0 and 5');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeInt16LE(data.value, 1);
		frame.writeUInt8(data.reserved, 3);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		throw new Error('Command is not supported for LSU50 motor.');
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode !== 0x00) {
			throw new Error('Invalid mode');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
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
}
