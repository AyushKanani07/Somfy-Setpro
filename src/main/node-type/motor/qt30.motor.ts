import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type {
	CtrlMoveOf,
	CtrlMoveTo,
	CtrlNetworkLock,
	GetFactoryDefault,
	GetMotorUI,
	MotorRollingInput,
	PostMotorLimits,
	PostMotorPosition,
	SetAppMode,
	SetFactoryDefault,
	SetLocalUI,
	SetMotorIp,
	SetMotorLimit,
	SetMotorRollingSpeed,
	SetMotorSoftStartStop,
	SetMotorTiltingSpeed,
	SetTiltLimits,
} from '../../interface/motor.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import { GenericMotor } from './generic.motor.ts';

export class QT30Motor extends GenericMotor {
	protected PULSE_MIN = 1;
	protected BOTTOM_LIMIT_MIN = 0x0632;
	protected BOTTOM_LIMIT_MAX = 0xf6e0;
	protected ROLLING_SPEED_MIN = 10;
	protected ROLLING_SPEED_MAX = 28;

	protected static QT30_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
	]

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(QT30Motor.QT30_MOTOR_METHOD_LIST)

	public QT30_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = QT30Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in QT30 DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in QT30 DataBuilder.`);
		}

		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in QT30 DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in Qt30 DataBuilder.`
			);
		}
	}

	public QT30_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = QT30Motor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(`Command "${commandName}" not found in QT30 DataParser.`);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in QT30 DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in QT30 DataParser.`
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

	protected getLocalUIDataFrame = (data: GetMotorUI) => {
		if (data.ui_index !== 0x00 && data.ui_index !== 0x05) {
			throw new Error('UI index should be 0 or 5');
		}
		let frame = Buffer.alloc(1);
		// 0x05 is  for led status
		frame.writeUInt8(data.ui_index, 0);
		return frame;
	};

	protected getFactoryDefaultDataFrame = (data: GetFactoryDefault) => {
		if (
			data.function_id < 0x00 ||
			(data.function_id > 0x02 && data.function_id < 0x11) ||
			data.function_id == 0x18 ||
			data.function_id == 0x14 ||
			data.function_id == 0x16 ||
			data.function_id == 0x18 ||
			data.function_id > 0x1c
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
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

	protected setMotorLimitDataFrame = (data: SetMotorLimit) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Invalid function id');
		} else if (data.limit < 0x00 || data.limit > 0x01) {
			throw new Error('Invalid limit');
		}

		if (
			data.function_id == 0x02 &&
			(data.value < 0x0278 || data.value > 0xf6e0)
		) {
			throw new Error('Value should be between 632 and 63200');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.limit, 1);
		frame.writeUint16LE(data.value, 2);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		if ([data.up, data.down, data.slow].some(speed => speed < 10 || speed > 28)) {
			throw new Error('Speed values must be between 10 and 28');
		}
		let frame = Buffer.alloc(3);

		frame.writeUInt8(data.up, 0);
		frame.writeUInt8(data.down, 1);
		frame.writeUInt8(data.slow, 2);
		return frame;
	};

	protected setMotorTiltingSpeedDataFrame = (data: SetMotorTiltingSpeed) => {
		let frame = Buffer.alloc(0);
		return frame;
	};

	protected setMotorIpDataFrame = (data: SetMotorIp) => {
		if (data.function_id < 0x00 || data.function_id > 0x04) {
			throw new Error('Function id should be between 0 and 4');
		} else if (data.ip_index < 0x00 || data.ip_index > 0x10) {
			throw new Error('Ip index should be between 0 and 16');
		}
		let frame;
		if (data.value_tilting) {
			frame = Buffer.alloc(6);
		} else {
			frame = Buffer.alloc(4);
		}
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ip_index, 1);
		frame.writeUInt16LE(data.value_position, 2);
		if (data.value_tilting) {
			frame.writeUInt16LE(data.value_tilting, 4);
		}
		return frame;
	};

	protected setLocalUIDataFrame = (data: SetLocalUI) => {
		if (data.function_id < 0x00 || data.function_id > 0x01) {
			throw new Error('Function id should be 0 or 1');
		} else if (data.ui_index !== 0x00) {
			throw new Error('UI index should be between 0');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ui_index, 1);
		frame.writeUInt8(data.priority, 2);
		return frame;
	};

	protected setTiltLimitsDataFrame = (data: SetTiltLimits) => {
		let frame = Buffer.alloc(0);
		return frame;
	};

	protected setFactoryDefaultDataFrame = (data: SetFactoryDefault) => {
		if (
			data.function_id < 0x00 ||
			data.function_id > 0x1c ||
			(data.function_id > 0x02 && data.function_id < 0x11) ||
			data.function_id == 0x14 ||
			data.function_id == 0x16 ||
			data.function_id == 0x18 ||
			data.function_id == 0x1a
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected setMotorSoftStartStopDataFrame = (data: SetMotorSoftStartStop) => {
		if (data.function_id < 0x00 || data.function_id > 0x02) {
			throw new Error('Function id should be between 0 and 2');
		} else if (data.ramp < 0x00 || data.ramp > 0x08) {
			throw new Error('Ramp value should be between 0 and 8');
		} else if (data.value < 0x32 || data.value > 0xff) {
			throw new Error('Value should be between 50 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ramp, 1);
		frame.writeUInt8(data.value, 2);
		return frame;
	};

	protected ctrlMoveToDataFrame = (data: CtrlMoveTo) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Function id should be between 0 and 5');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.unused, 3);
		return frame;
	};

	protected ctrlMoveOfDataFrame = (data: CtrlMoveOf) => {
		if (data.function_id < 0x00 || data.function_id > 0x07) {
			throw new Error('Function id should be between 0 and 7');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeInt16LE(data.value, 1);
		frame.writeUInt8(data.reserved, 3);
		return frame;
	};

	protected ctrlNetworkLockDataFrame = (data: CtrlNetworkLock) => {
		if (data.lock_type < 0x00 || data.lock_type > 0x08) {
			throw new Error('Function id should be between 0 and 17');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame;
		if (data.value_angle) {
			frame = Buffer.alloc(6);
		} else {
			frame = Buffer.alloc(4);
		}
		frame.writeUInt8(data.lock_type, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.priority, 3);
		if (data.value_angle) {
			frame.writeUInt16LE(data.value_angle, 4);
		}
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
}
