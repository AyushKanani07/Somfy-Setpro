import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import type {
	CtrlMove,
	CtrlMoveOf,
	CtrlMoveTo,
	CtrlNetworkLock,
	GetFactoryDefault,
	MotorRollingInput,
	PostMotorLimits,
	SetAppMode,
	SetFactoryDefault,
	SetMotorIp,
	SetMotorRollingSpeed,
} from '../../interface/motor.interface.ts';
import { GenericMotor } from './generic.motor.ts';

export class ST30Motor extends GenericMotor {
	protected MOVE_MOTOR_MIN = 10;
	protected MOVE_MOTOR_MAX = 255;
	protected BOTTOM_LIMIT_MIN = 0x0140;
	protected BOTTOM_LIMIT_MAX = 0x37c0;
	protected ROLLING_SPEED_MIN = 6;
	protected ROLLING_SPEED_MAX = 28;

	protected static ST30_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
	];

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(ST30Motor.ST30_MOTOR_METHOD_LIST)

	public ST30_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = ST30Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in ST30 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in ST30 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in ST30 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in ST30 DataBuilder.`
			);
		}
	}

	public ST30_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = ST30Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(`Command "${commandName}" not found in ST30 DataParser.`);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in ST30 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in ST30 DataParser.`
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

	//#endregion

	protected getFactoryDefaultDataFrame = (data: GetFactoryDefault) => {
		if (data.function_id < 0x00 || data.function_id > 0x17) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		if ([data.up, data.down, data.slow].some(speed => speed < 6 || speed > 28)) {
			throw new Error('Speed values must be between 6 and 28');
		}
		let frame = Buffer.alloc(3);

		frame.writeUInt8(data.up, 0);
		frame.writeUInt8(data.down, 1);
		frame.writeUInt8(data.slow, 2);
		return frame;
	};

	protected setMotorIpDataFrame = (data: SetMotorIp) => {
		if (data.function_id < 0x00 || data.function_id > 0x04) {
			throw new Error('Function id should be between 0 and 4');
		} else if (data.ip_index < 0x00 || data.ip_index > 0x10) {
			throw new Error('Ip index should be between 0 and 16');
		}
		let frame = Buffer.alloc(4);
		// if (data.value_tilting) {
		// 	frame = Buffer.alloc(6);
		// } else {
		// 	frame = Buffer.alloc(4);
		// }
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ip_index, 1);
		frame.writeUInt16LE(data.value_position, 2);
		// if (data.value_tilting) {
		// 	frame.writeUInt16LE(data.value_tilting, 4);
		// }
		return frame;
	};

	protected setFactoryDefaultDataFrame = (data: SetFactoryDefault) => {
		if ((data.function_id < 0x00 || data.function_id > 0x17) && data.function_id !== 0x1c) {
			throw new Error('Function id should be between 0 and 23');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected ctrlMoveDataFrame = (data: CtrlMove) => {
		if (data.direction < 0x00 || data.direction > 0x02) {
			throw new Error('Direction should be between 0 and 2');
		} else if (data.speed < 0x00 || data.speed > 0x02) {
			throw new Error('Speed should be between 0 and 2');
		} else if (data.duration < 0x0a || data.duration > 0xff) {
			throw new Error('Duration should be between 10 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.direction, 0);
		frame.writeUInt8(data.duration, 1);
		frame.writeUInt8(data.speed, 2);
		return frame;
	};

	protected ctrlMoveToDataFrame = (data: CtrlMoveTo) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Function id should be between 0 and 5');
		}
		// if (data.value_tilt !== 0 && data.value_tilt !== 255) {
		// 	throw new Error('Tilting should be 0 or 255');
		// }
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.unused, 3);
		// if (data.value_tilt) {
		// 	frame.writeUInt8(data.value_tilt, 3);
		// }
		return frame;
	};

	protected ctrlMoveOfDataFrame = (data: CtrlMoveOf) => {
		if (data.function_id < 0x00 || data.function_id > 0x07) {
			throw new Error('Function id should be between 0 and 7');
		} else if (data.reserved !== 0x00 && data.reserved !== 0xff) {
			throw new Error('Reserved should be 0 or 255');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeInt16LE(data.value, 1);
		frame.writeUInt8(data.reserved, 3);
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

	protected ctrlNetworkLockDataFrame = (data: CtrlNetworkLock) => {
		if (data.lock_type < 0x00 || data.lock_type > 0x07) {
			throw new Error('Function id should be between 0 and 07');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.lock_type, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.priority, 3);
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
