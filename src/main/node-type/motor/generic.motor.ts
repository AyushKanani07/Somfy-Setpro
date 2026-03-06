
import type { MasterCommandBuilderData, MasterCommandParserData } from '../../interface/command.interface.ts';
import type {
	CtrlMove,
	CtrlMoveOf,
	CtrlMoveTo,
	CtrlNetworkLock,
	CtrlStop,
	GetFactoryDefault,
	GetGroupAdd,
	GetMotorIp,
	GetMotorUI,
	MotorRollingInput,
	PostAppMode,
	PostFactoryDefault,
	PostGroupAddr,
	PostLocalUI,
	PostMotorDirection,
	PostMotorIP,
	PostMotorLimits,
	PostMotorPosition,
	PostMotorRollingSpeed,
	PostMotorSoftStartStop,
	PostMotorStatus,
	PostMotorTiltingSpeed,
	PostNetworkConfig,
	PostNetworkErrorStat,
	PostNetworkLock,
	PostNetworkStat,
	PostNodeAppVersion,
	PostNodeLabel,
	PostNodeSerialNumber,
	PostNodeStackVersion,
	PostTiltLimits,
	SetAppMode,
	SetFactoryDefault,
	SetGroupAdd,
	SetLocalUI,
	SetMotorDirection,
	SetMotorIp,
	SetMotorLimit,
	SetMotorRollingSpeed,
	SetMotorSoftStartStop,
	SetMotorTiltingSpeed,
	SetNetworkConfig,
	SetNetworkLock,
	SetNetworkStat,
	SetNodeDiscovery,
	SetNodeLabel,
	SetTiltLimits,
} from '../../interface/motor.interface.ts';
import type { MotorCommandList } from '../../interface/global.ts';

export class GenericMotor {
	protected PULSE_MIN = 1;
	protected PULSE_MAX = 1000;
	protected MS_MIN = 1;
	protected MS_MAX = 1000;
	protected GROUP_INDEX_MIN = 0;
	protected GROUP_INDEX_MAX = 15;
	protected BOTTOM_LIMIT = 100;

	protected static GENERIC_MOTOR_METHOD_LIST: MotorCommandList[] = [
		{ cmd_id: 0x40, name: 'GET_NODE_ADDR' },
		{ cmd_id: 0x21, name: 'GET_MOTOR_LIMITS' },
		{ cmd_id: 0x45, name: 'GET_NODE_LABEL' },
		{ cmd_id: 0x74, name: 'GET_NODE_APP_VERSION' },
		{ cmd_id: 0x23, name: 'GET_MOTOR_ROLLING_SPEED' },
		{ cmd_id: 0x29, name: 'GET_MOTOR_SOFT_START_STOP' },
		{ cmd_id: 0x26, name: 'GET_NETWORK_LOCK' },
		{ cmd_id: 0x46, name: 'GET_NETWORK_CONFIG' },
		{ cmd_id: 0xb0, name: 'DIAG_GET_TOTAL_MOVE_COUNT' },
		{ cmd_id: 0xc0, name: 'DIAG_POST_TOTAL_MOVE_COUNT', parser_method: 'diagPostTotalMoveCountJsonData', builder_method: 'diagPostTotalMoveCountDataFrame' },
		{ cmd_id: 0xb1, name: 'DIAG_GET_TOTAL_REV_COUNT' },
		{ cmd_id: 0xc1, name: 'DIAG_POST_TOTAL_REV_COUNT', parser_method: 'diagPostTotalRevCountJsonData', builder_method: 'diagPostTotalRevCountDataFrame' },
		{ cmd_id: 0xb2, name: 'DIAG_GET_THERMAL_COUNT' },
		{ cmd_id: 0xc2, name: 'DIAG_POST_THERMAL_COUNT', parser_method: 'postThermalCountJsonData', builder_method: 'postThermalCountDataFrame' },
		{ cmd_id: 0xb3, name: 'DIAG_GET_OBSTACLE_COUNT' },
		{ cmd_id: 0xc3, name: 'DIAG_POST_OBSTACLE_COUNT', parser_method: 'postObstacleCountJsonData', builder_method: 'postObstacleCountDataFrame' },
		{ cmd_id: 0xb4, name: 'DIAG_GET_POWER_COUNT' },
		{ cmd_id: 0xc4, name: 'DIAG_POST_POWER_COUNT', parser_method: 'postPowerCountJsonData', builder_method: 'postPowerCountDataFrame' },
		{ cmd_id: 0xb5, name: 'DIAG_GET_RESET_COUNT' },
		{ cmd_id: 0xc5, name: 'DIAG_POST_RESET_COUNT', parser_method: 'postResetCountJsonData', builder_method: 'postResetCountDataFrame' },
		{ cmd_id: 0x4e, name: 'GET_NETWORK_STAT' },
		{ cmd_id: 0x4d, name: 'GET_NETWORK_ERROR_STAT' },
		{ cmd_id: 0x22, name: 'GET_MOTOR_DIRECTION' },
		{
			cmd_id: 0x25,
			name: 'GET_MOTOR_IP',
			builder_method: 'getMotorIpDataFrame',
			parser_method: 'getMotorIpJsonData',
		},
		{
			cmd_id: 0x27,
			name: 'GET_LOCAL_UI',
			builder_method: 'getLocalUIDataFrame',
			parser_method: 'getLocalUIJsonData',
		},
		{
			cmd_id: 0x41,
			name: 'GET_GROUP_ADDR',
			builder_method: 'getGroupDataFrame',
			parser_method: 'getGroupAddrJsonData',
		},
		{
			cmd_id: 0x61,
			name: 'POST_GROUP_ADDR',
			parser_method: 'postGroupAddrJsonData',
			builder_method: 'postGroupAddrDataFrame',
		},
		{
			cmd_id: 0x2f,
			name: 'GET_FACTORY_DEFAULT',
			builder_method: 'getFactoryDefaultDataFrame',
			parser_method: 'getFactoryDefaultJsonData',
		},
		{
			cmd_id: 0x20,
			name: 'GET_APP_MODE'
		},
		{
			cmd_id: 0x10,
			name: 'SET_APP_MODE',
			builder_method: 'setAppModeDataFrame',
			parser_method: 'setAppModeJsonData',
		},
		{
			cmd_id: 0x11,
			name: 'SET_MOTOR_LIMITS',
			builder_method: 'setMotorLimitDataFrame',
			parser_method: 'setMotorLimitJsonData',
		},
		{
			cmd_id: 0x12,
			name: 'SET_MOTOR_DIRECTION',
			builder_method: 'setMotorDirectionDataFrame',
			parser_method: 'setMotorDirectionJsonData',
		},
		{
			cmd_id: 0x13,
			name: 'SET_MOTOR_ROLLING_SPEED',
			builder_method: 'setMotorRollingSpeedDataFrame',
			parser_method: 'setMotorRollingSpeedJsonData',
		},
		{
			cmd_id: 0x14,
			name: 'SET_MOTOR_TILTING_SPEED',
			builder_method: 'setMotorTiltingSpeedDataFrame',
			parser_method: 'setMotorTiltingSpeedJsonData',
		},
		{
			cmd_id: 0x15,
			name: 'SET_MOTOR_IP',
			builder_method: 'setMotorIpDataFrame',
			parser_method: 'setMotorIpJsonData',
		},
		{
			cmd_id: 0x16,
			name: 'SET_NETWORK_LOCK',
			builder_method: 'setNetworkLockDataFrame',
			parser_method: 'setNetworkLockJsonData',
		},
		{
			cmd_id: 0x17,
			name: 'SET_LOCAL_UI',
			builder_method: 'setLocalUIDataFrame',
			parser_method: 'setLocalUIJsonData',
		},
		{
			cmd_id: 0x18,
			name: 'SET_TILT_LIMITS',
			builder_method: 'setTiltLimitsDataFrame',
			parser_method: 'setTiltLimitsJsonData',
		},
		{
			cmd_id: 0x1f,
			name: 'SET_FACTORY_DEFAULT',
			builder_method: 'setFactoryDefaultDataFrame',
			parser_method: 'setFactoryDefaultJsonData',
		},
		{
			cmd_id: 0x50,
			name: 'SET_NODE_DISCOVERY',
			builder_method: 'setNodeDiscoveryDataFrame',
			parser_method: 'setNodeDiscoveryJsonData',
		},
		{
			cmd_id: 0x51,
			name: 'SET_GROUP_ADDR',
			builder_method: 'setMotorGroupAddDataFrame',
			parser_method: 'setMotorGroupAddJsonData',
		},
		{
			cmd_id: 0x55,
			name: 'SET_NODE_LABEL',
			builder_method: 'setNodeLabelDataFrame',
			parser_method: 'setNodeLabelJsonData',
		},
		{
			cmd_id: 0x56,
			name: 'SET_NETWORK_CONFIG',
			builder_method: 'setNetworkConfigDataFrame',
			parser_method: 'setNetworkConfigJsonData',
		},
		{
			cmd_id: 0x5e,
			name: 'SET_NETWORK_STAT',
			builder_method: 'setNetworkStatDataFrame',
			parser_method: 'setNetworkStatJsonData',
		},
		{
			cmd_id: 0x19,
			name: 'SET_MOTOR_SOFT_START_STOP',
			builder_method: 'setMotorSoftStartStopDataFrame',
			parser_method: 'setMotorSoftStartStopJsonData',
		},
		{
			cmd_id: 0x01,
			name: 'CTRL_MOVE',
			builder_method: 'ctrlMoveDataFrame',
			parser_method: 'ctrlMoveJsonData',
		},
		{
			cmd_id: 0x02,
			name: 'CTRL_STOP',
			builder_method: 'ctrlStopDataFrame',
			parser_method: 'ctrlStopJsonData',
		},
		{
			cmd_id: 0x03,
			name: 'CTRL_MOVETO',
			builder_method: 'ctrlMoveToDataFrame',
			parser_method: 'ctrlMoveToJsonData',
		},
		{
			cmd_id: 0x04,
			name: 'CTRL_MOVEOF',
			builder_method: 'ctrlMoveOfDataFrame',
			parser_method: 'ctrlMoveOfJsonData',
		},
		{ cmd_id: 0x05, name: 'CTRL_WINK' },
		{
			cmd_id: 0x06,
			name: 'CTRL_NETWORK_LOCK',
			builder_method: 'ctrlNetworkLockDataFrame',
			parser_method: 'ctrlNetworkLockJsonData',
		},
		{
			cmd_id: 0x0d,
			name: 'POST_MOTOR_POSITION',
			parser_method: 'postMotorPositionJsonData',
			builder_method: 'postMotorPositionDataFrame'
		},
		{
			cmd_id: 0x0f,
			name: 'POST_MOTOR_STATUS',
			parser_method: 'postMotorStatusJsonData',
			builder_method: 'postMotorStatusDataFrame'
		},
		{
			cmd_id: 0x30,
			name: 'POST_APP_MODE',
			parser_method: 'postAppModeJsonData',
			builder_method: 'postAppModeDataFrame'
		},
		{
			cmd_id: 0x31,
			name: 'POST_MOTOR_LIMITS',
			parser_method: 'postMotorLimitsJsonData',
			builder_method: 'postMotorLimitsDataFrame'
		},
		{
			cmd_id: 0x32,
			name: 'POST_MOTOR_DIRECTION',
			parser_method: 'postMotorDirectionJsonData',
			builder_method: 'postMotorDirectionDataFrame'
		},
		{
			cmd_id: 0x33,
			name: 'POST_MOTOR_ROLLING_SPEED',
			parser_method: 'postMotorRollingSpeedJsonData',
			builder_method: 'postMotorRollingSpeedDataFrame'
		},
		{
			cmd_id: 0x34,
			name: 'POST_MOTOR_TILTING_SPEED',
			parser_method: 'postMotorTiltingSpeedJsonData',
			builder_method: 'postMotorTiltingSpeedDataFrame'
		},
		{
			cmd_id: 0x35,
			name: 'POST_MOTOR_IP',
			parser_method: 'postMotorIPJsonData',
			builder_method: 'postMotorIPDataFrame'
		},
		{
			cmd_id: 0x36,
			name: 'POST_NETWORK_LOCK',
			parser_method: 'postNetworkLockJsonData',
			builder_method: 'postNetworkLockDataFrame'
		},
		{
			cmd_id: 0x37,
			name: 'POST_LOCAL_UI',
			parser_method: 'postLocalUIJsonData',
			builder_method: 'postLocalUIDataFrame',
		},
		{
			cmd_id: 0x38,
			name: 'POST_TILT_LIMITS',
			parser_method: 'postTiltLimitsJsonData',
			builder_method: 'postTiltLimitsDataFrame',
		},
		{
			cmd_id: 0x3f,
			name: 'POST_FACTORY_DEFAULT',
			parser_method: 'postFactoryDefaultJsonData',
			builder_method: 'postFactoryDefaultDataFrame',
		},
		{ cmd_id: 0x60, name: 'POST_NODE_ADDR' },
		{
			cmd_id: 0x65,
			name: 'POST_NODE_LABEL',
			parser_method: 'postNodeLabelJsonData',
			builder_method: 'postNodeLabelDataFrame',
		},
		{
			cmd_id: 0x66,
			name: 'POST_NETWORK_CONFIG',
			parser_method: 'postNetworkConfigJsonData',
			builder_method: 'postNetworkConfigDataFrame',
		},
		{
			cmd_id: 0x6c,
			name: 'POST_NODE_SERIAL_NUMBER',
			parser_method: 'postNodeSerialNumberJsonData',
			builder_method: 'postNodeSerialNumberDataFrame',
		},
		{
			cmd_id: 0x6d,
			name: 'POST_NETWORK_ERROR_STAT',
			parser_method: 'postNetworkErrorStatJsonData',
			builder_method: 'postNetworkErrorStatDataFrame',
		},
		{
			cmd_id: 0x6e,
			name: 'POST_NETWORK_STAT',
			parser_method: 'postNetworkStatJsonData',
			builder_method: 'postNetworkStatDataFrame',
		},
		{
			cmd_id: 0x71,
			name: 'POST_NODE_STACK_VERSION',
			parser_method: 'postNodeStackVersionJsonData',
			builder_method: 'postNodeStackVersionDataFrame',
		},
		{
			cmd_id: 0x75,
			name: 'POST_NODE_APP_VERSION',
			parser_method: 'postNodeAppVersionJsonData',
			builder_method: 'postNodeAppVersionDataFrame',
		},
		{
			cmd_id: 0x39,
			name: 'POST_MOTOR_SOFT_START_STOP',
			parser_method: 'postMotorSoftStartStopJsonData',
			builder_method: 'postMotorSoftStartStopDataFrame',
		},
		{ cmd_id: 0x7f, name: 'ACK', parser_method: 'ackJsonData', builder_method: 'ackDataFrame' },
		{ cmd_id: 0x6f, name: 'nACK', parser_method: 'nackJsonData' },
	];

	protected static mergeMotorCommands(child: MotorCommandList[]): MotorCommandList[] {
		const byName = new Map<string, MotorCommandList>();

		for (const cmd of GenericMotor.GENERIC_MOTOR_METHOD_LIST) {
			byName.set(cmd.name, cmd);
		}

		for (const cmd of child) {
			byName.set(cmd.name, cmd);
		}

		return Array.from(byName.values());
	}

	public Generic_FrameBuilder(
		commandName: string,
		data: MasterCommandBuilderData
	): Buffer {
		const command = GenericMotor.GENERIC_MOTOR_METHOD_LIST.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			console.log(
				`Command "${commandName}" not found in GenericMotor DataBuilder.`
			);
			return Buffer.alloc(0);
			// throw new Error(`Command "${commandName}" not found in GenericMotor DataBuilder.`);
		}
		if (command.builder_method) {
			const method = (this as any)[command.builder_method] as (
				data: MasterCommandBuilderData
			) => Buffer;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.builder_method}" not found or not a function in GenericMotor DataBuilder.`
				);
			}
			return method(data);
		} else {
			throw new Error(
				`Method "${command.builder_method}" not found or not a function in GenericMotor DataBuilder.`
			);
		}
	}

	public Generic_DataParser(
		commandName: string,
		buffer: Buffer
	): MasterCommandParserData {
		const command = GenericMotor.GENERIC_MOTOR_METHOD_LIST.find(
			(cmd) => cmd.name === commandName
		);
		if (!command) {
			throw new Error(
				`Command "${commandName}" not found in GenericMotor DataParser.`
			);
		}
		if (command.parser_method) {
			const method = (this as any)[command.parser_method] as (
				buffer: Buffer
			) => MasterCommandParserData;
			if (!method || typeof method !== 'function') {
				throw new Error(
					`Method "${command.parser_method}" not found or not a function in GenericMotor DataParser.`
				);
			}
			return method(buffer);
		} else {
			throw new Error(
				`Method "${command.parser_method}" not found or not a function in GenericMotor DataParser.`
			);
		}
	}

	//#region Input Validation

	public validatePulseValue = (pulse: number): boolean => {
		if (pulse > this.PULSE_MIN || pulse < this.PULSE_MAX) {
			return true;
		} else {
			return false;
		}
	};

	public validateMSValue = (ms: number): boolean => {
		if (ms > this.MS_MIN || ms < this.MS_MAX) {
			return true;
		} else {
			return false;
		}
	};

	public validateGropIndex = (groupIndex: number): number | boolean => {
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
		return true;
	};

	public validateMotorBottomLimit = (value: number): boolean => {
		if (value > this.BOTTOM_LIMIT) {
			return true;
		} else {
			return false;
		}
	};

	public validateMotorRollingSpeed = (value: MotorRollingInput): boolean => {
		return true;
	};

	//#endregion

	protected getMotorIpDataFrame = (data: GetMotorIp) => {
		if (data.ip_index < 0x01 || data.ip_index > 0x10) {
			throw new Error('Ip index should be between 1 and 16');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.ip_index, 0);
		return frame;
	};

	protected getMotorIpJsonData = (data: Buffer): GetMotorIp => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		const ipIndex = data.readUInt8(0);
		return {
			ip_index: ipIndex,
		};
	};

	protected getLocalUIDataFrame = (data: GetMotorUI) => {
		let frame = Buffer.alloc(1);
		// 0x05 is  for led status
		frame.writeUInt8(data.ui_index, 0);
		return frame;
	};

	protected getLocalUIJsonData = (data: Buffer): GetMotorUI => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		const uiIndex = data.readUInt8(0);
		return {
			ui_index: uiIndex,
		};
	};

	protected getGroupDataFrame = (data: GetGroupAdd) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.group_index, 0);
		return frame;
	};

	protected getGroupAddrJsonData = (data: Buffer): GetGroupAdd => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		const groupIndex = data.readUInt8(0);

		return {
			group_index: groupIndex,
		};
	};

	protected getFactoryDefaultDataFrame = (data: GetFactoryDefault) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected getFactoryDefaultJsonData = (data: Buffer): GetFactoryDefault => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			function_id: data.readUInt8(0),
		};
	};

	protected setAppModeDataFrame = (data: SetAppMode) => {
		if (data.mode < 0x00 || data.mode > 0x03) {
			throw new Error('Invalid mode value');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
		return frame;
	};

	protected setAppModeJsonData = (data: Buffer): SetAppMode => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			mode: data.readUInt8(0),
		};
	};

	protected setMotorLimitDataFrame = (data: SetMotorLimit) => {
		if (data.function_id < 0x00 || data.function_id > 0x05) {
			throw new Error('Function id should be between 0 and 5');
		} else if (data.limit !== 0x00 && data.limit !== 0x01) {
			throw new Error('Limit should be 0 or 1');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.limit, 1);
		frame.writeUint16LE(data.value, 2);
		return frame;
	};

	protected setMotorLimitJsonData = (data: Buffer): SetMotorLimit => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			limit: data.readUInt8(1),
			value: data.readUInt16LE(2),
		};
	};

	protected setMotorDirectionDataFrame = (data: SetMotorDirection) => {
		if (data.direction < 0x00 || data.direction > 0x01) {
			throw new Error('Invalid direction');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.direction, 0);
		return frame;
	};

	protected setMotorDirectionJsonData = (data: Buffer): SetMotorDirection => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			direction: data.readUInt8(0),
		};
	};

	protected setMotorRollingSpeedDataFrame = (data: SetMotorRollingSpeed) => {
		let frame = Buffer.alloc(3);

		frame.writeUInt8(data.up, 0);
		frame.writeUInt8(data.down, 1);
		frame.writeUInt8(data.slow, 2);
		return frame;
	};

	protected setMotorRollingSpeedJsonData = (data: Buffer): SetMotorRollingSpeed => {
		if (data.length !== 3) {
			throw new Error('Invalid buffer length. Expected 3 bytes.');
		}

		return {
			up: data.readUInt8(0),
			down: data.readUInt8(1),
			slow: data.readUInt8(2),
		};
	};

	protected setMotorTiltingSpeedDataFrame = (data: SetMotorTiltingSpeed) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.tilting_speed, 0);
		return frame;
	};

	protected setMotorTiltingSpeedJsonData = (data: Buffer): SetMotorTiltingSpeed => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			tilting_speed: data.readUInt8(0),
		};
	};

	protected setMotorIpDataFrame = (data: SetMotorIp) => {
		if (data.function_id < 0x00 || data.function_id > 0x10) {
			throw new Error('Function id should be between 0 and 16');
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

	protected setMotorIpJsonData = (data: Buffer): SetMotorIp => {
		if (data.length < 4 || data.length > 6) {
			throw new Error('Invalid buffer length');
		}

		let valueTilting;
		if (data.length === 6) {
			valueTilting = data.readUInt16LE(4);
		}

		return {
			function_id: data.readUInt8(0),
			ip_index: data.readUInt8(1),
			value_position: data.readUInt16LE(2),
			value_tilting: valueTilting,
		};
	};

	protected setNetworkLockDataFrame = (data: SetNetworkLock) => {
		if (data.function_id < 0x00 || data.function_id > 0x04) {
			throw new Error('Invalid function id');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame = Buffer.alloc(2);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.priority, 1);
		return frame;
	};

	protected setNetworkLockJsonData = (data: Buffer): SetNetworkLock => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			priority: data.readUInt8(1),
		};
	};

	protected setLocalUIDataFrame = (data: SetLocalUI) => {
		if (data.function_id < 0x00 || data.function_id > 0x01) {
			throw new Error('Function id should be 0 or 1');
		} else if (data.ui_index < 0x00 || data.ui_index > 0x05) {
			throw new Error('UI index should be between 0 and 5');
		} else if (data.priority < 0x00 || data.priority > 0xff) {
			throw new Error('Priority value should be between 0 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ui_index, 1);
		frame.writeUInt8(data.priority, 2);
		return frame;
	};

	protected setLocalUIJsonData = (data: Buffer): SetLocalUI => {
		if (data.length !== 3) {
			throw new Error('Invalid buffer length. Expected 3 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			ui_index: data.readUInt8(1),
			priority: data.readUInt8(2),
		};
	};

	protected setTiltLimitsDataFrame = (data: SetTiltLimits) => {
		if (data.function_id < 0x00 || data.function_id > 0x11 || [0x0d, 0x0e, 0x0f].includes(data.function_id)) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value, 1);
		return frame;
	};

	protected setTiltLimitsJsonData = (data: Buffer): SetTiltLimits => {
		if (data.length !== 3) {
			throw new Error('Invalid buffer length. Expected 3 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			value: data.readUInt16LE(1),
		};
	};

	protected setFactoryDefaultDataFrame = (data: SetFactoryDefault) => {
		if (
			data.function_id < 0x00 ||
			data.function_id > 0x1c ||
			(data.function_id > 0x02 && data.function_id < 0x11)
		) {
			throw new Error('Invalid function id');
		}
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.function_id, 0);
		return frame;
	};

	protected setFactoryDefaultJsonData = (data: Buffer): SetFactoryDefault => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			function_id: data.readUInt8(0),
		};
	};

	protected setNodeDiscoveryDataFrame = (data: SetNodeDiscovery) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.discovery_mode, 0);
		return frame;
	};

	protected setNodeDiscoveryJsonData = (data: Buffer): SetNodeDiscovery => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			discovery_mode: data.readUInt8(0),
		};
	};

	protected setMotorGroupAddDataFrame = (data: SetGroupAdd) => {
		if (data.group_index < 0x00 || data.group_index > 0x0f) {
			throw new Error('Group index should be between 0 and 15');
		}
		// Convert HEX string to number
		const groupAddr = parseInt(data.group_address, 16);

		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.group_index, 0);
		frame.writeUIntLE(groupAddr, 1, 3);
		return frame;
	};

	protected setMotorGroupAddJsonData = (data: Buffer): SetGroupAdd => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}

		const groupIndex = data.readUInt8(0);
		const groupAddress = data.readUIntLE(1, 3).toString(16).padStart(6, "0").toUpperCase();

		return {
			group_index: groupIndex,
			group_address: groupAddress,
		};
	};

	protected setNodeLabelDataFrame = (data: SetNodeLabel) => {
		let frame = Buffer.alloc(16);
		frame.write(data.label, 0, 16);
		return frame;
	};

	protected setNodeLabelJsonData = (data: Buffer): SetNodeLabel => {
		if (data.length !== 16) {
			throw new Error('Invalid buffer length. Expected 16 bytes.');
		}

		const label = data.toString('utf8', 0, 16);

		return {
			label: label,
		};
	};

	protected setNetworkConfigDataFrame = (data: SetNetworkConfig) => {
		let frame = Buffer.alloc(7);
		frame.writeUInt8(data.brodcast_mode, 0);
		frame.writeUInt8(data.brodcast_random_value, 1);
		frame.writeUInt8(data.supervision_active, 2);
		frame.writeUInt16LE(data.supervision_timeperiod, 3);
		frame.writeUInt8(data.deaf_mode, 5);
		frame.writeUInt8(data.upload_requested, 6);
		return frame;
	};

	protected setNetworkConfigJsonData = (data: Buffer): SetNetworkConfig => {
		if (data.length !== 7) {
			throw new Error('Invalidbuffer length. Expected 7 bytes.');
		}

		return {
			brodcast_mode: data.readUInt8(0),
			brodcast_random_value: data.readUInt8(1),
			supervision_active: data.readUInt8(2),
			supervision_timeperiod: data.readUInt16LE(3),
			deaf_mode: data.readUInt8(5),
			upload_requested: data.readUInt8(6),
		};
	};

	protected setNetworkStatDataFrame = (data: SetNetworkStat) => {
		let frame = Buffer.alloc(2);
		frame.writeUInt8(data.max_retry_count, 0);
		frame.writeUInt8(data.reset_counter, 1);
		return frame;
	};

	protected setNetworkStatJsonData = (data: Buffer): SetNetworkStat => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}

		return {
			max_retry_count: data.readUInt8(0),
			reset_counter: data.readUInt8(1),
		};
	};

	protected setMotorSoftStartStopDataFrame = (data: SetMotorSoftStartStop) => {
		if (data.function_id < 0x00 || data.function_id > 0x02) {
			throw new Error('Function id should be between 0 and 2');
		} else if (data.ramp < 0x00 || data.ramp > 0x08) {
			throw new Error('Ramp value should be between 0 and 8');
		} else if (data.value < 0x00 || data.value > 0xff) {
			throw new Error('Value should be between 0 and 255');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.ramp, 1);
		frame.writeUInt8(data.value, 2);
		return frame;
	};

	protected setMotorSoftStartStopJsonData = (data: Buffer): SetMotorSoftStartStop => {
		if (data.length !== 3) {
			throw new Error('Invalid buffer length. Expected 3 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			ramp: data.readUInt8(1),
			value: data.readUInt8(2),
		};
	};

	protected ctrlMoveDataFrame = (data: CtrlMove) => {
		if (data.direction < 0x00 || data.direction > 0x02) {
			throw new Error('Direction should be between 0 and 2');
		} else if (data.speed < 0x00 || data.speed > 0x02) {
			throw new Error('Speed should be between 0 and 2');
		}
		let frame = Buffer.alloc(3);
		frame.writeUInt8(data.direction, 0);
		frame.writeUInt8(data.duration, 1);
		frame.writeUInt8(data.speed, 2);
		return frame;
	};

	protected ctrlMoveJsonData = (data: Buffer): CtrlMove => {
		if (data.length !== 3) {
			throw new Error('Invalid buffer length. Expected 3 bytes.');
		}

		return {
			direction: data.readUInt8(0),
			duration: data.readUInt8(1),
			speed: data.readUInt8(2),
		};
	};

	protected ctrlStopDataFrame = (data: CtrlStop) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.reserved, 0);
		return frame;
	};

	protected ctrlStopJsonData = (data: Buffer): CtrlStop => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			reserved: data.readUInt8(0),
		};
	};

	protected ctrlMoveToDataFrame = (data: CtrlMoveTo) => {
		if (data.function_id < 0x00 || data.function_id > 0x10) {
			throw new Error('Function id should be between 0 and 16');
		}
		let frame;
		if (data.value_tilt) {
			frame = Buffer.alloc(6);
		} else {
			frame = Buffer.alloc(4);
		}
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt16LE(data.value_position, 1);
		frame.writeUInt8(data.unused, 3);
		if (data.value_tilt) {
			frame.writeUInt16LE(data.value_tilt, 4);
		}
		return frame;
	};

	protected ctrlMoveToJsonData = (data: Buffer): CtrlMoveTo => {
		if (data.length < 4 || data.length > 6) {
			throw new Error('Invalid buffer length');
		}

		let valueTilt;
		if (data.length === 6) {
			valueTilt = data.readUInt16LE(4);
		}

		return {
			function_id: data.readUInt8(0),
			value_position: data.readUInt16LE(1),
			unused: data.readUInt8(3),
			value_tilt: valueTilt,
		};
	};

	protected ctrlMoveOfDataFrame = (data: CtrlMoveOf) => {
		if (data.function_id < 0x00 || data.function_id > 0x0d) {
			throw new Error('Function id should be between 0 and 13');
		}
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.function_id, 0);
		frame.writeInt16LE(data.value, 1);
		frame.writeUInt8(data.reserved, 3);
		return frame;
	};

	protected ctrlMoveOfJsonData = (data: Buffer): CtrlMoveOf => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			value: data.readInt16LE(1),
			reserved: data.readUInt8(3),
		};
	};

	protected ctrlNetworkLockDataFrame = (data: CtrlNetworkLock) => {
		if (data.lock_type < 0x00 || data.lock_type > 0x11) {
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

	protected ctrlNetworkLockJsonData = (data: Buffer): CtrlNetworkLock => {
		if (data.length < 4 || data.length > 6) {
			throw new Error('Invalid buffer length');
		}

		let valueAngle;
		if (data.length === 6) {
			valueAngle = data.readUInt16LE(4);
		}

		return {
			lock_type: data.readUInt8(0),
			value_position: data.readUInt16LE(1),
			priority: data.readUInt8(3),
			value_angle: valueAngle,
		};
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

	protected postMotorPositionDataFrame = (data: PostMotorPosition) => {
		const hasData = (v: any) => typeof v === 'number' && !Number.isNaN(v);
		const hasR = hasData(data.reserved);
		const hasD = hasData(data.tilting_degree);
		const hasP = hasData(data.tilting_pulse);

		let frame = Buffer.alloc(5 + (hasR ? 2 : 0) + (hasD ? 2 : 0) + (hasP ? 2 : 0));

		frame.writeUInt16LE(data.position_pulse, 0);
		frame.writeUInt8(data.position_percentage, 2);
		frame.writeUInt8(data.tilting_percentage, 3);
		frame.writeUInt8(data.ip, 4);
		let offset = 5;

		if (hasR) {
			frame.writeUInt16LE(data.reserved!, offset);
			offset += 2;
		}
		if (hasD) {
			frame.writeUInt16LE(data.tilting_degree!, offset);
			offset += 2;
		}
		if (hasP) {
			frame.writeUInt16LE(data.tilting_pulse!, offset);
		}
		return frame;
	}

	protected postMotorStatusJsonData = (data: Buffer): PostMotorStatus => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		const result = {
			status: data.readUInt8(0),
			direction: data.readUInt8(1),
			source: data.readUInt8(2),
			cause: data.readUInt8(3),
		};
		return result;
	};

	protected postMotorStatusDataFrame = (data: PostMotorStatus) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.status, 0);
		frame.writeUInt8(data.direction, 1);
		frame.writeUInt8(data.source, 2);
		frame.writeUInt8(data.cause, 3);
		return frame;
	};

	protected postAppModeJsonData = (data: Buffer): PostAppMode => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		return {
			mode: data.readUInt8(0),
		};
	};

	protected postAppModeDataFrame = (data: PostAppMode) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.mode, 0);
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

	protected postMotorLimitsDataFrame = (data: PostMotorLimits) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt16LE(data.up_limit, 0);
		frame.writeUInt16LE(data.down_limit, 2);
		return frame;
	};

	protected postMotorDirectionJsonData = (data: Buffer): PostMotorDirection => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}

		return {
			direction: data.readUInt8(0),
		};
	};

	protected postMotorDirectionDataFrame = (data: PostMotorDirection) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.direction, 0);
		return frame;
	}

	protected postMotorRollingSpeedJsonData = (data: Buffer): PostMotorRollingSpeed => {
		if (data.length < 3 || data.length > 6) {
			throw new Error('Invalid buffer length. Expected 3 to 6 bytes.');
		}

		let result: any = {
			up_speed: data.readUInt8(0),
			down_speed: data.readUInt8(1),
			slow_speed: data.readUInt8(2),
		};

		let offset = 3;

		if (data.length >= 4) {
			result.reserved1 = data.readUInt8(offset);
			offset += 1;
		}

		if (data.length >= 5) {
			result.reserved2 = data.readUInt8(offset);
			offset += 1;
		}

		if (data.length === 6) {
			result.reserved3 = data.readUInt8(offset);
		}

		return result;
	};

	protected postMotorRollingSpeedDataFrame = (data: PostMotorRollingSpeed) => {
		const hasR1 = typeof data.reserved1 === 'number' && !Number.isNaN(data.reserved1);
		const hasR2 = typeof data.reserved2 === 'number' && !Number.isNaN(data.reserved2);
		const hasR3 = typeof data.reserved3 === 'number' && !Number.isNaN(data.reserved3);

		let frame = Buffer.alloc(3 + (hasR1 ? 1 : 0) + (hasR2 ? 1 : 0) + (hasR3 ? 1 : 0));

		frame.writeUInt8(data.up_speed, 0);
		frame.writeUInt8(data.down_speed, 1);
		frame.writeUInt8(data.slow_speed, 2);
		let offset = 3;
		if (hasR1) {
			frame.writeUInt8(data.reserved1!, offset);
			offset += 1;
		}
		if (hasR2) {
			frame.writeUInt8(data.reserved2!, offset);
			offset += 1;
		}
		if (hasR3) {
			frame.writeUInt8(data.reserved3!, offset);
		}
		return frame;
	}

	protected postMotorTiltingSpeedJsonData = (data: Buffer): PostMotorTiltingSpeed => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		return {
			tilting_speed: data.readUInt8(0),
		};
	};

	protected postMotorTiltingSpeedDataFrame = (data: PostMotorTiltingSpeed) => {
		let frame = Buffer.alloc(1);
		frame.writeUInt8(data.tilting_speed, 0);
		return frame;
	};

	protected postMotorIPJsonData = (data: Buffer): PostMotorIP => {
		if (data.length < 4 || data.length > 9) {
			throw new Error('Invalid buffer length. Expected 4 to 9 bytes.');
		}

		let result: PostMotorIP = {
			index: data.readUInt8(0),
			pulse: data.readUInt16LE(1),
			percentage: data.readUInt8(3),
		};

		let offset = 4;

		if (data.length >= 6) {
			result.angle_pulse = data.readUInt16LE(offset);
			offset += 2;
		}

		if (data.length >= 7) {
			result.angle_percentage = data.readUInt8(offset);
			offset += 1;
		}

		if (data.length === 9) {
			result.angle_degree = data.readUInt16LE(offset);
		}

		return result;
	};

	protected postMotorIPDataFrame = (data: PostMotorIP) => {
		const hasAP = typeof data.angle_pulse === 'number' && !Number.isNaN(data.angle_pulse);
		const hasAPer = typeof data.angle_percentage === 'number' && !Number.isNaN(data.angle_percentage);
		const hasAD = typeof data.angle_degree === 'number' && !Number.isNaN(data.angle_degree);

		let frame = Buffer.alloc(4 + (hasAP ? 2 : 0) + (hasAPer ? 1 : 0) + (hasAD ? 2 : 0));

		frame.writeUInt8(data.index, 0);
		frame.writeUInt16LE(data.pulse, 1);
		frame.writeUInt8(data.percentage, 3);
		let offset = 4;
		if (hasAP) {
			frame.writeUInt16LE(data.angle_pulse!, offset);
			offset += 2;
		}
		if (hasAPer) {
			frame.writeUInt8(data.angle_percentage!, offset);
			offset += 1;
		}
		if (hasAD) {
			frame.writeUInt16LE(data.angle_degree!, offset);
		}
		return frame;
	}

	protected postNetworkLockJsonData = (data: Buffer): PostNetworkLock => {
		if (data.length < 5) {
			throw new Error('Invalid buffer length. Expected at least 5 bytes.');
		}

		return {
			status: data.readUInt8(0),
			source_addr: data.readUIntLE(1, 3),
			priority: data.readUInt8(4),
			...(data.length >= 6 && { saved: data.readUInt8(5) })
		};
	};

	protected postNetworkLockDataFrame = (data: PostNetworkLock) => {
		let frame = Buffer.alloc(6);
		frame.writeUInt8(data.status, 0);
		frame.writeUIntLE(data.source_addr, 1, 3);
		frame.writeUInt8(data.priority, 4);
		if (data.saved !== undefined && data.saved !== null) {
			frame.writeUInt8(data.saved, 5);
		}
		return frame;
	}

	protected postLocalUIJsonData = (data: Buffer): PostLocalUI => {
		if (data.length !== 5) {
			throw new Error('Invalid buffer length. Expected 5 bytes.');
		}

		return {
			status: data.readUInt8(0),
			source_addr: data.readUIntLE(1, 3),
			priority: data.readUInt8(4),
		};
	};

	protected postLocalUIDataFrame = (data: PostLocalUI) => {
		let frame = Buffer.alloc(5);
		frame.writeUInt8(data.status, 0);
		frame.writeUIntLE(data.source_addr, 1, 3);
		frame.writeUInt8(data.priority, 4);
		return frame;
	}

	protected postTiltLimitsJsonData = (data: Buffer): PostTiltLimits => {
		if (data.length !== 14) {
			throw new Error('Invalid buffer length. Expected 14 bytes.');
		}

		return {
			tilt_range: data.readUInt16LE(0),
			upward_backlash_pulses: data.readUInt16LE(2),
			downward_backlash_pulses: data.readUInt16LE(4),
			upward_backlash_ms: data.readUInt16LE(6),
			downward_backlash_ms: data.readUInt16LE(8),
			min_angle_degrees: data.readUInt16LE(10),
			max_angle_degrees: data.readUInt16LE(12),
		};
	};

	protected postTiltLimitsDataFrame = (data: PostTiltLimits) => {
		let frame = Buffer.alloc(14);
		frame.writeUInt16LE(data.tilt_range, 0);
		frame.writeUInt16LE(data.upward_backlash_pulses, 2);
		frame.writeUInt16LE(data.downward_backlash_pulses, 4);
		frame.writeUInt16LE(data.upward_backlash_ms, 6);
		frame.writeUInt16LE(data.downward_backlash_ms, 8);
		frame.writeUInt16LE(data.min_angle_degrees, 10);
		frame.writeUInt16LE(data.max_angle_degrees, 12);
		return frame;
	}

	protected postFactoryDefaultJsonData = (data: Buffer): PostFactoryDefault => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}

		return {
			function_id: data.readUInt8(0),
			status: data.readUInt8(1),
		};
	};

	protected postFactoryDefaultDataFrame = (data: PostFactoryDefault) => {
		let frame = Buffer.alloc(2);
		frame.writeUInt8(data.function_id, 0);
		frame.writeUInt8(data.status, 1);
		return frame;
	}

	protected postGroupAddrJsonData = (data: Buffer): PostGroupAddr => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}

		const groupIndex = data.readUInt8(0);
		const groupAddress = data.subarray(1, 4).reverse().reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0').toUpperCase(), '');
		// const groupAddress = data.readUIntLE(1, 3);

		return {
			group_index: groupIndex,
			group_address: groupAddress,
		};
	};

	protected postGroupAddrDataFrame = (data: { group_index: number, group_address: string }): Buffer => {
		let frame = Buffer.alloc(4);
		frame.writeUInt8(data.group_index, 0);
		frame.writeUIntLE(parseInt(data.group_address, 16), 1, 3);
		return frame;
	};

	protected postNodeLabelJsonData = (data: Buffer): PostNodeLabel => {
		if (data.length !== 16) {
			throw new Error('Invalid buffer length. Expected 16 bytes.');
		}

		const label = data.toString('ascii').replace(/\0/g, '');

		return {
			label: label,
		};
	};

	protected postNodeLabelDataFrame = (data: PostNodeLabel): Buffer => {
		let frame = Buffer.alloc(16);
		frame.write(data.label, 0, 16, 'ascii');
		return frame;
	}

	protected postNetworkConfigJsonData = (data: Buffer): PostNetworkConfig => {
		if (data.length !== 6) {
			throw new Error('Invalid buffer length. Expected 6 bytes.');
		}

		return {
			broadcast_mode: data.readUInt8(0),
			broadcast_max_random_value: data.readUInt8(1),
			supervision_active: data.readUInt8(2),
			supervision_time_period: data.readUInt16LE(3),
			deaf_mode: data.readUInt8(5),
		};
	};

	protected postNetworkConfigDataFrame = (data: PostNetworkConfig) => {
		let frame = Buffer.alloc(6);
		frame.writeUInt8(data.broadcast_mode, 0);
		frame.writeUInt8(data.broadcast_max_random_value, 1);
		frame.writeUInt8(data.supervision_active, 2);
		frame.writeUInt16LE(data.supervision_time_period, 3);
		frame.writeUInt8(data.deaf_mode, 5);
		return frame;
	}

	protected postNodeSerialNumberJsonData = (data: Buffer): PostNodeSerialNumber => {
		if (data.length !== 12) {
			throw new Error('Invalid buffer length. Expected 12 bytes.');
		}

		const serialNumber = data.toString('ascii').replace(/\0/g, '');

		return {
			serial_number: serialNumber,
		};
	};

	protected postNodeSerialNumberDataFrame = (data: PostNodeSerialNumber): Buffer => {
		let frame = Buffer.alloc(12);
		frame.write(data.serial_number, 0, 12, 'ascii');
		return frame;
	}

	protected postNetworkErrorStatJsonData = (data: Buffer): PostNetworkErrorStat => {
		if (data.length !== 18) {
			throw new Error('Invalid buffer length. Expected 18 bytes.');
		}

		return {
			txFailures: data.readUInt16LE(0),
			collisions: data.readUInt16LE(2),
			rxDataError: data.readUInt16LE(4),
			unknownMessage: data.readUInt16LE(6),
			messageLengthError: data.readUInt16LE(8),
			rxFifoFull: data.readUInt16LE(10),
			txFifoFull: data.readUInt16LE(12),
			crcError: data.readUInt16LE(14),
			bundleSizeError: data.readUInt16LE(16),
		};
	};

	protected postNetworkErrorStatDataFrame = (data: PostNetworkErrorStat) => {
		let frame = Buffer.alloc(18);
		frame.writeUInt16LE(data.txFailures, 0);
		frame.writeUInt16LE(data.collisions, 2);
		frame.writeUInt16LE(data.rxDataError, 4);
		frame.writeUInt16LE(data.unknownMessage, 6);
		frame.writeUInt16LE(data.messageLengthError, 8);
		frame.writeUInt16LE(data.rxFifoFull, 10);
		frame.writeUInt16LE(data.txFifoFull, 12);
		frame.writeUInt16LE(data.crcError, 14);
		frame.writeUInt16LE(data.bundleSizeError, 16);
		return frame;
	}

	protected postNetworkStatJsonData = (data: Buffer): PostNetworkStat => {
		if (data.length !== 17) {
			throw new Error('Invalid buffer length. Expected 17 bytes.');
		}

		return {
			maxRetry: data.readUInt8(0),
			sentFrames: data.readUInt32LE(1),
			receivedFrames: data.readUInt32LE(5),
			seenFrames: data.readUInt32LE(9),
			busy: data.readUInt16LE(13),
			maxSlot: data.readUInt8(15),
			supervisionFailures: data.readUInt8(16),
		};
	};

	protected postNetworkStatDataFrame = (data: PostNetworkStat) => {
		let frame = Buffer.alloc(17);
		frame.writeUInt8(data.maxRetry, 0);
		frame.writeUInt32LE(data.sentFrames, 1);
		frame.writeUInt32LE(data.receivedFrames, 5);
		frame.writeUInt32LE(data.seenFrames, 9);
		frame.writeUInt16LE(data.busy, 13);
		frame.writeUInt8(data.maxSlot, 15);
		frame.writeUInt8(data.supervisionFailures, 16);
		return frame;
	}

	protected postNodeStackVersionJsonData = (data: Buffer): PostNodeStackVersion => {
		if (data.length !== 6) {
			throw new Error('Invalid buffer length. Expected 6 bytes.');
		}

		return {
			stack_reference: data.readUIntLE(0, 3),
			stack_index_letter: String.fromCharCode(data.readUInt8(3)),
			stack_index_number: data.readUInt8(4),
			stack_standard: data.readUInt8(5),
		};
	};

	protected postNodeStackVersionDataFrame = (data: PostNodeStackVersion) => {
		let frame = Buffer.alloc(6);
		frame.writeUIntLE(data.stack_reference, 0, 3);
		frame.writeUInt8(data.stack_index_letter.charCodeAt(0), 3);
		frame.writeUInt8(data.stack_index_number, 4);
		frame.writeUInt8(data.stack_standard, 5);
		return frame;
	}

	protected postNodeAppVersionJsonData = (data: Buffer): PostNodeAppVersion => {
		if (data.length !== 6) {
			throw new Error('Invalid buffer length. Expected 6 bytes.');
		}

		return {
			app_reference: data.readUIntLE(0, 3),
			app_index_letter: String.fromCharCode(data.readUInt8(3)),
			app_index_number: data.readUInt8(4),
			app_profile: data.readUInt8(5),
		};
	};

	protected postNodeAppVersionDataFrame = (data: PostNodeAppVersion) => {
		let frame = Buffer.alloc(6);
		frame.writeUIntLE(data.app_reference, 0, 3);
		frame.writeUInt8(data.app_index_letter.charCodeAt(0), 3);
		frame.writeUInt8(data.app_index_number, 4);
		frame.writeUInt8(data.app_profile, 5);
		return frame;
	}

	protected postMotorSoftStartStopJsonData = (data: Buffer): PostMotorSoftStartStop => {
		if (data.length !== 8) {
			throw new Error('Invalid buffer length. Expected 8 bytes.');
		}

		return {
			start_status_up: data.readUInt8(0),
			start_value_up: data.readUInt8(1),
			stop_status_up: data.readUInt8(2),
			stop_value_up: data.readUInt8(3),
			start_status_down: data.readUInt8(4),
			start_value_down: data.readUInt8(5),
			stop_status_down: data.readUInt8(6),
			stop_value_down: data.readUInt8(7),
		};
	};

	protected postMotorSoftStartStopDataFrame = (data: PostMotorSoftStartStop) => {
		let frame = Buffer.alloc(8);
		frame.writeUInt8(data.start_status_up, 0);
		frame.writeUInt8(data.start_value_up, 1);
		frame.writeUInt8(data.stop_status_up, 2);
		frame.writeUInt8(data.stop_value_up, 3);
		frame.writeUInt8(data.start_status_down, 4);
		frame.writeUInt8(data.start_value_down, 5);
		frame.writeUInt8(data.stop_status_down, 6);
		frame.writeUInt8(data.stop_value_down, 7);
		return frame;
	}

	protected diagPostTotalMoveCountJsonData = (data: Buffer) => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		return {
			move_count: data.readUInt32LE(0),
		};
	}

	protected diagPostTotalMoveCountDataFrame = (data: { move_count: number }) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt32LE(data.move_count, 0);
		return frame;
	}

	protected diagPostTotalRevCountJsonData = (data: Buffer) => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		return {
			revolution_count: data.readUInt32LE(0),
		};
	};

	protected diagPostTotalRevCountDataFrame = (data: { revolution_count: number }) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt32LE(data.revolution_count, 0);
		return frame;
	};

	protected postThermalCountJsonData = (data: Buffer) => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		return {
			thermal_count: data.readUInt16LE(0),
			post_thermal_count: data.readUInt16LE(2),
		};
	};

	protected postThermalCountDataFrame = (data: { thermal_count: number; post_thermal_count: number }) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt16LE(data.thermal_count, 0);
		frame.writeUInt16LE(data.post_thermal_count, 2);
		return frame;
	}

	protected postObstacleCountJsonData = (data: Buffer) => {
		if (data.length !== 4) {
			throw new Error('Invalid buffer length. Expected 4 bytes.');
		}
		return {
			obstacle_count: data.readUInt16LE(0),
			post_obstacle_count: data.readUInt16LE(2),
		};
	};

	protected postObstacleCountDataFrame = (data: { obstacle_count: number; post_obstacle_count: number }) => {
		let frame = Buffer.alloc(4);
		frame.writeUInt16LE(data.obstacle_count, 0);
		frame.writeUInt16LE(data.post_obstacle_count, 2);
		return frame;
	};

	protected postPowerCountJsonData = (data: Buffer) => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}
		return {
			power_cut_count: data.readUInt16LE(0)
		};
	};

	protected postPowerCountDataFrame = (data: { power_cut_count: number }) => {
		let frame = Buffer.alloc(2);
		frame.writeUInt16LE(data.power_cut_count, 0);
		return frame;
	}

	protected postResetCountJsonData = (data: Buffer) => {
		if (data.length !== 2) {
			throw new Error('Invalid buffer length. Expected 2 bytes.');
		}
		return {
			reset_count: data.readUInt16LE(0),
		};
	};

	protected postResetCountDataFrame = (data: { reset_count: number }) => {
		let frame = Buffer.alloc(2);
		frame.writeUInt16LE(data.reset_count, 0);
		return frame;
	};

	protected ackJsonData = (data: Buffer) => {
		if (data.length !== 0) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		return {};
	};

	protected nackJsonData = (data: Buffer) => {
		if (data.length !== 1) {
			throw new Error('Invalid buffer length. Expected 1 byte.');
		}
		return {
			status: data.readUInt8(0),
		};
	};
}
