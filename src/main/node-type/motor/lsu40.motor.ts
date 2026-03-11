import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import type {
	CtrlMove,
	CtrlMoveOf,
	CtrlMoveTo,
	GetFactoryDefault,
	GetMotorUI,
	PostMotorLimits,
	PostMotorPosition,
	SetAppMode,
	SetFactoryDefault,
	SetLocalUI,
	SetMotorRollingSpeed,
	SetMotorSoftStartStop,
	SetMotorTiltingSpeed,
} from '../../interface/motor.interface.ts';
import { GenericMotor } from './generic.motor.ts';

export class LSU40Motor extends GenericMotor {
	protected PULSE_MIN = 4;
	protected MS_MIN = 2;
	protected MOVE_MOTOR_MIN = 2;
	protected MOVE_MOTOR_MAX = 255;
	protected BOTTOM_LIMIT_MIN = 0x00b4;
	protected BOTTOM_LIMIT_MAX = 0xfcff;

	protected static LSU40_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
		// { cmd_id: 0x19, name: 'SET_MOTOR_SOFT_START_STOP', builder_method: 'setMotorSoftStartStopDataFrame', parser_method: 'setMotorSoftStartStopJsonData' }, // Command not supported
		// { cmd_id: 0x14, name: 'SET_MOTOR_TILTING_SPEED', builder_method: 'setMotorTiltingSpeedDataFrame', parser_method: 'setMotorTiltingSpeedJsonData' }, // Command not supported

	];

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(LSU40Motor.LSU40_MOTOR_METHOD_LIST)

	public LSU40_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = LSU40Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in LSU40 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in LSU40 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in LSU40 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in LSU40 DataBuilder.`
			);
		}
	}

	public LSU40_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = LSU40Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(
				`Command "${commandName}" not found in LSU40 DataParser.`
			);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in LSU40 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in LSU40 DataParser.`
			);
		}
	}

	//#region Input Validation

	public validateMotorMoveButton = (value: number): boolean => {
		if (value > this.MOVE_MOTOR_MIN || value < this.MOVE_MOTOR_MAX) {
			return true;
		} else {
			return false;
		}
	};

	public validateMotorBottomLimit = (value: number): boolean => {
		if (value > this.BOTTOM_LIMIT_MIN && value < this.BOTTOM_LIMIT_MAX) {
			return true;
		} else {
			return false;
		}
	};

	//#endregion

	//#region DataFrame Gener

	protected getLocalUIDataFrame = (data: GetMotorUI) => {
		if (
			data.ui_index < 0x00 ||
			data.ui_index > 0x05 ||
			data.ui_index == 0x01 ||
			data.ui_index == 0x04
		) {
			throw new Error('UI index invalid');
		}
		let frame = Buffer.alloc(1);
		// 0x05 is  for led status
		frame.writeUInt8(data.ui_index, 0);
		return frame;
	};

	protected getFactoryDefaultDataFrame = (data: GetFactoryDefault) => {
		if (
			(data.function_id > 0x02 && data.function_id < 0x11) ||
			data.function_id == 0x13 ||
			data.function_id == 0x12 ||
			data.function_id > 0x1c
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode != 0x00 && data.mode != 0x01 && data.mode != 0x03) {
			throw new Error('Mode should be 0, 1, or 3');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		throw new Error('Command is not supported for LSU40 motor.');
	};

	protected setMotorTiltingSpeedDataFrame = (data: SetMotorTiltingSpeed) => {
		const frame = Buffer.alloc(0);
		return frame;
	};

	protected setLocalUIDataFrame = (data: SetLocalUI) => {
		if (data.function_id < 0x00 || data.function_id > 0x01) {
			throw new Error('Function id should be 0 or 1');
		} else if (
			data.ui_index < 0x00 ||
			data.ui_index > 0x05 ||
			data.ui_index == 0x01 ||
			data.ui_index == 0x04
		) {
			throw new Error('Invalid UI index');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ui_index, 1);
		frame.writeUInt8(data.priority, 2);
		return frame;
	};

	protected setMotorSoftStartStopDataFrame = (data: SetMotorSoftStartStop) => {
		let frame = Buffer.alloc(0);
		return frame;
	};

	protected postMotorPositionJsonData = (data: Buffer): PostMotorPosition => {
		if (data.length < 5 || data.length > 11) {
			throw new Error('Invalid buffer length');
		}

		let result: any = {
			position_pulse: data.readUInt16LE(0),
			position_percentage: data.readUInt8(2),
			tilting_percentage: data.readUInt8(3),
			ip: data.readUInt8(4),
		};

		let offset = 5;

		if (data.length >= 7) {
			result.reserved = data.readUInt16LE(offset);
			offset += 2;
		}

		if (data.length >= 9) {
			result.tilting_degree = data.readUInt16LE(offset);
			offset += 2;
		}

		if (data.length >= 11) {
			result.tilting_pulse = data.readUInt16LE(offset);
		}

		return result;
	};

	protected setFactoryDefaultDataFrame = (data: SetFactoryDefault) => {
		if (
			data.function_id < 0x00 ||
			data.function_id > 0x1c ||
			(data.function_id > 0x02 && data.function_id < 0x11) ||
			data.function_id == 0x13 ||
			data.function_id == 0x1b
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected ctrlMoveToDataFrame = (data: CtrlMoveTo) => {
		if (data.function_id < 0x00 || data.function_id > 0x10) {
			throw new Error('Function id should be between 0 and 16');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.unused, 3);
		return frame;
	};

	protected ctrlMoveDataFrame = (data: CtrlMove) => {
		if (data.direction < 0x00 || data.direction > 0x02) {
			throw new Error('Direction should be between 0 and 2');
		} else if (data.duration < 0x02 || data.duration > 0xff) {
			throw new Error('Duration should be between 2 and 255');
		} else if (data.speed < 0x00 || data.speed > 0x02) {
			throw new Error('Speed should be between 0 and 2');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.direction, 0);
		frame.writeUInt8(data.duration, 1);
		frame.writeUInt8(data.speed, 2);
		return frame;
	};

	protected ctrlMoveOfDataFrame = (data: CtrlMoveOf) => {
		if (data.function_id < 0x00 || data.function_id > 0x0d) {
			throw new Error('Function id should be between 0 and 13');
		} else if (data.reserved !== 0x00) {
			throw new Error('Reserved should be 0');
		}

		if (data.function_id == 0x02 || data.function_id == 0x03 || data.function_id == 0x0a || data.function_id == 0x0b) {
			if (data.value < 0x04 || data.value > 0x3e8) {
				throw new Error('Value should be between 4 and 1000');
			}
		} else if (data.function_id == 0x04 || data.function_id == 0x05) {
			if (data.value < 0x02 || data.value > 0x03e8) {
				throw new Error('Value should be between 2 and 1000');
			}
		} else if (
			data.function_id == 0x06 || data.function_id == 0x07 || data.function_id == 0x0c || data.function_id == 0x0d) {
			if (data.value < 0x01 || data.value > 0x64) {
				throw new Error('Value should be 1 or 100');
			}
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeInt16LE(data.value, 1);
		frame.writeUInt8(data.reserved, 3);
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
