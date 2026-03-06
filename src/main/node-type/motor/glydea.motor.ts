import type {
	MasterCommandBuilderData,
	MasterCommandParserData,
} from '../../interface/command.interface.ts';
import type {
	CtrlMove,
	CtrlMoveOf,
	CtrlMoveTo,
	CtrlNetworkLock,
	GetFactoryDefault,
	MotorRollingInput,
	PostMotorLimits,
	PostTouchMotionSensitivity,
	SetAppMode,
	SetDCTMode,
	SetFactoryDefault,
	SetMotorRollingSpeed,
	SetMotorSoftStartStop,
	SetMotorTiltingSpeed,
	SetTiltLimits,
	SetTouchMotionSensitivity,
} from '../../interface/motor.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';
import { GenericMotor } from './generic.motor.ts';

export class GlydeaMotor extends GenericMotor {
	protected PULSE_MIN = 30;
	protected MS_MIN = 30;
	protected GROUP_INDEX_MIN = 1;
	protected GROUP_INDEX_MAX = 16;
	protected MOVE_MOTOR_MIN = 75;
	protected MOVE_MOTOR_MAX = 255;
	protected MOTOR_ROLLING_SPEED = [87, 105, 122, 140];

	protected static GLYDEA_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{
			cmd_id: 0x0c,
			name: 'GET_MOTOR_POSITION'
		},
		{
			cmd_id: 0x80,
			name: 'SET_DCT_MODE',
			builder_method: 'setDCTModeDataFrame',
			parser_method: 'setDCTModeJsonData',
		},
		{
			cmd_id: 0x81,
			name: 'SET_TOUCH_MOTION_SENSITIVITY',
			builder_method: 'setTouchMotionSensitivityDataFrame',
			parser_method: 'setTouchMotionSensitivityJsonData',
		},
		{
			cmd_id: 0x82,
			name: 'SET_START_AUTO_LIMITS_SEEK'
		},
		{
			cmd_id: 0x91,
			name: 'GET_TOUCH_MOTION_SENSITIVITY'
		},
		{
			cmd_id: 0xa0,
			name: 'POST_DCT_MODE',
			parser_method: 'postDCTModeJsonData',
		},
		{
			cmd_id: 0x90,
			name: 'GET_DCT_MODE'
		},
		{
			cmd_id: 0xa1,
			name: 'POST_TOUCH_MOTION_SENSITIVITY',
			parser_method: 'postTouchMotionSensitivityJsonData',
		},
		// { cmd_id: 0x14, name: 'SET_MOTOR_TILTING_SPEED', builder_method: 'setMotorTiltingSpeedDataFrame', parser_method: 'setMotorTiltingSpeedJsonData' }, // Command not Supoorted

		// { cmd_id: 0x18, name: 'SET_TILT_LIMITS', builder_method: 'setTiltLimitsDataFrame', parser_method: 'setTiltLimitsJsonData' }, // Command not Supported

		// { cmd_id: 0x19, name: 'SET_MOTOR_SOFT_START_STOP', builder_method: 'setMotorSoftStartStopDataFrame', parser_method: 'setMotorSoftStartStopJsonData' }, // Command not Supported
	];

	private static ALL_COMMANDS: MotorCommandList[] = GenericMotor.mergeMotorCommands(GlydeaMotor.GLYDEA_MOTOR_METHOD_LIST)

	public Glydea_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = GlydeaMotor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(`Command "${commandName}" not found in Glydea DataBuilder.`);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in Glydea DataBuilder.`);
		}
		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in Glydea DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in Glydea DataBuilder.`
			);
		}
	}

	public Glydea_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = GlydeaMotor.ALL_COMMANDS.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(
				`Command "${commandName}" not found in Glydea DataParser.`
			);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in Glydea DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in Glydea DataParser.`
			);
		}
	}

	//#region Input Validation

	public validateGropIndex = (groupIndex: number): number | boolean => {
		groupIndex++;
		if (
			groupIndex >= this.GROUP_INDEX_MIN &&
			groupIndex <= this.GROUP_INDEX_MAX
		) {
			return groupIndex;
		} else {
			return false;
		}
	};

	public validateMotorMoveButton = (value: number): boolean => {
		if (value > this.MOVE_MOTOR_MIN || value < this.MOVE_MOTOR_MAX) {
			return true;
		} else {
			return false;
		}
	};

	public validateMotorRollingSpeed = (value: MotorRollingInput): boolean => {
		if (this.MOTOR_ROLLING_SPEED.includes(value.up)) {
			return true;
		} else {
			return false;
		}
	};

	//#endregion

	protected getFactoryDefaultDataFrame = (data: GetFactoryDefault) => {
		if (
			data.function_id == 0 ||
			data.function_id == 1 ||
			(data.function_id >= 11 && data.function_id <= 13) ||
			data.function_id == 15 ||
			data.function_id == 17 ||
			data.function_id == 19
		) {
			let frame = Buffer.alloc(1);
			frame.writeUInt8(data.function_id, 0);
			return frame;
		} else {
			throw new Error('Invalid function id');
		}
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode !== 0x02) {
			throw new Error('Invalid mode');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		if (![87, 105, 122, 140].includes(data.up)) {
			throw new Error('Up speed value should be one of the following: 87, 105, 122, 140');
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

	protected setTiltLimitsDataFrame = (data: SetTiltLimits) => {
		let frame = Buffer.alloc(0);
		return frame;
	};

	protected setMotorSoftStartStopDataFrame = (data: SetMotorSoftStartStop) => {
		let frame = Buffer.alloc(0);
		return frame;
	};

	protected setFactoryDefaultDataFrame = (data: SetFactoryDefault) => {
		if (
			data.function_id < 0x00 ||
			(data.function_id > 0x02 && data.function_id < 0x11) ||
			data.function_id == 0x18 ||
			data.function_id > 0x19
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected setDCTModeDataFrame = (data: SetDCTMode) => {
		if (data.mode < 0x00 || data.mode > 0x02) {
			throw new Error('Mode should be between 0 and 2');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected setDCTModeJsonData = (buffer: Buffer): SetDCTMode => {
		if (buffer.length !== 1) {
			throw new Error('Invalid frame length');
		}
		return {
			mode: buffer.readUInt8(0),
		};
	};

	protected setTouchMotionSensitivityDataFrame = (data: SetTouchMotionSensitivity) => {
		if (data.mode < 0x00 || data.mode > 0x03) {
			throw new Error('Mode should be between 0 and 3');
		} else if (data.value < 0x00 || data.value > 0xff) {
			throw new Error('Value should be between 0 and 255');
		}

		let frame = Buffer.alloc(2);
		frame.writeUInt8(data.mode, 0);
		frame.writeUInt8(data.value, 1);
		return frame;
	};

	protected setTouchMotionSensitivityJsonData = (buffer: Buffer): SetTouchMotionSensitivity => {
		if (buffer.length !== 2) {
			throw new Error('Invalid frame length');
		}
		return {
			mode: buffer.readUInt8(0),
			value: buffer.readUInt8(1),
		};
	};

	protected ctrlMoveDataFrame = (data: CtrlMove) => {
		if (data.direction < 0x00 || data.direction > 0x02) {
			throw new Error('Direction should be between 0 and 2');
		} else if (data.duration < 0x4b || data.duration > 0xff) {
			throw new Error('Duration should be between 75 and 255');
		} else if (data.speed < 0x00 || data.speed > 0x02) {
			throw new Error('Speed should be between 0 and 2');
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
		// frame.writeUInt16LE(0, 4);
		return frame;
	};

	protected ctrlMoveToJsonData = (buffer: Buffer): CtrlMoveTo => {
		if (buffer.length !== 4) {
			throw new Error('Invalid frame length');
		}
		return {
			function_id: buffer.readUInt8(0),
			value_position: buffer.readUInt16LE(1),
			unused: buffer.readUInt8(3),
		};
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

	protected ctrlMoveOfJsonData = (buffer: Buffer): CtrlMoveOf => {
		if (buffer.length !== 4) {
			throw new Error('Invalid frame length');
		}
		return {
			function_id: buffer.readUInt8(0),
			value: buffer.readInt16LE(1),
			reserved: buffer.readUInt8(3),
		};
	};

	protected ctrlNetworkLockDataFrame = (data: CtrlNetworkLock) => {
		if (data.lock_type < 0x00 || data.lock_type > 0x07) {
			throw new Error('Function id should be between 0 and 7');
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

	protected postDCTModeJsonData = (buffer: Buffer): SetDCTMode => {
		if (buffer.length !== 1) {
			throw new Error('Invalid frame length');
		}
		return {
			mode: buffer.readUInt8(0),
		};
	};

	protected postDCTModeDataFrame = (data: SetDCTMode) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected postTouchMotionSensitivityJsonData = (buffer: Buffer): PostTouchMotionSensitivity => {
		if (buffer.length !== 2) {
			throw new Error('Invalid frame length');
		}
		return {
			mode: buffer.readUInt8(0),
			value: buffer.readUInt8(1),
		};
	};

	protected postTouchMotionSensitivityDataFrame = (data: PostTouchMotionSensitivity) => {
		let frame = Buffer.alloc(2);
		frame.writeUInt8(data.mode, 0);
		frame.writeUInt8(data.value, 1);
		return frame;
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
}
