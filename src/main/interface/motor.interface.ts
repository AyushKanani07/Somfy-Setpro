export interface MotorFound {
	address: string;
	model_no: number;
	sub_node_id?: number;
	device_id?: number;
	isLimitSet?: boolean;
	limitData?: {
		up_limit: number;
		down_limit: number;
	},
	label?: string;
	is_discover_conf_send?: boolean;
	device_type?: string;
}

export interface MotorRollingInput {
	up: number;
	down: number;
	slow: number;
}

export interface GetMotorIp {
	ip_index: number;
}

export interface GetMotorUI {
	ui_index: number;
}

export interface GetGroupAdd {
	group_index: number;
}

export interface GetFactoryDefault {
	function_id: number;
}

export interface SetMotorLimit {
	function_id: number;
	limit: number;
	value: number;
}

export interface SetMotorDirection {
	direction: number;
}

export interface SetMotorRollingSpeed {
	up: number;
	down: number;
	slow: number;
}

export interface SetMotorTiltingSpeed {
	tilting_speed: number;
}

export interface SetMotorIp {
	function_id: number;
	ip_index: number;
	value_position: number;
	value_tilting?: number;
}

export interface SetNetworkLock {
	function_id: number;
	priority: number;
}

export interface SetLocalUI {
	function_id: number;
	ui_index: number;
	priority: number;
}

export interface SetTiltLimits {
	function_id: number;
	value: number;
}

export interface SetFactoryDefault {
	function_id: number;
}

export interface SetNodeDiscovery {
	discovery_mode: number;
}

export interface SetGroupAdd {
	group_index: number;
	group_address: string;
}

export interface SetNodeLabel {
	label: string;
}

export interface SetNetworkConfig {
	brodcast_mode: number;
	brodcast_random_value: number;
	supervision_active: number;
	supervision_timeperiod: number;
	deaf_mode: number;
	upload_requested: number;
}

export interface SetNetworkStat {
	max_retry_count: number;
	reset_counter: number;
}

export interface SetAppMode {
	mode: number;
}

export interface SetMotorSoftStartStop {
	function_id: number;
	ramp: number;
	value: number;
}

export interface SetDCTMode {
	mode: number;
}

export interface SetTouchMotionSensitivity {
	mode: number;
	value: number;
}
export interface PostTouchMotionSensitivity {
	mode: number;
	value: number;
}

export interface CtrlMove {
	direction: number;
	duration: number;
	speed: number;
}

export interface CtrlStop {
	reserved: number;
}

export interface CtrlMoveTo {
	function_id: number;
	value_position: number;
	unused: number;
	value_tilt?: number;
}

export interface CtrlMoveOf {
	function_id: number;
	value: number;
	reserved: number;
}

export interface CtrlNetworkLock {
	lock_type: number;
	value_position: number;
	priority: number;
	value_angle?: number;
}

export interface PostMotorPosition {
	position_pulse: number;
	position_percentage: number;
	tilting_percentage: number;
	ip: number;
	reserved?: number;
	tilting_degree?: number;
	tilting_pulse?: number;
}

export interface PostMotorStatus {
	status: number;
	direction: number;
	source: number;
	cause: number;
}

export interface PostAppMode {
	mode: number;
}

export interface PostMotorLimits {
	up_limit: number;
	down_limit: number;
}

export interface PostMotorDirection {
	direction: number;
}

export interface PostMotorRollingSpeed {
	up_speed: number;
	down_speed: number;
	slow_speed: number;
	reserved1?: number;
	reserved2?: number;
	reserved3?: number;
}

export interface PostMotorTiltingSpeed {
	tilting_speed: number;
}

export interface PostMotorIP {
	index: number;
	pulse: number;
	percentage: number;
	angle_pulse?: number;
	angle_percentage?: number;
	angle_degree?: number;
}

export interface PostNetworkLock {
	status: number;
	source_addr: number;
	priority: number;
	saved?: number;
}

export interface PostLocalUI {
	status: number;
	source_addr: number;
	priority: number;
}

export interface PostTiltLimits {
	tilt_range: number;
	upward_backlash_pulses: number;
	downward_backlash_pulses: number;
	upward_backlash_ms: number;
	downward_backlash_ms: number;
	min_angle_degrees: number;
	max_angle_degrees: number;
}

export interface PostFactoryDefault {
	function_id: number;
	status: number;
}

export interface PostGroupAddr {
	group_index: number;
	group_address: string;
}

export interface PostNodeLabel {
	label: string;
}

export interface PostNetworkConfig {
	broadcast_mode: number;
	broadcast_max_random_value: number;
	supervision_active: number;
	supervision_time_period: number;
	deaf_mode: number;
}

export interface PostNodeSerialNumber {
	serial_number: string;
}

export interface PostNetworkErrorStat {
	txFailures: number;
	collisions: number;
	rxDataError: number;
	unknownMessage: number;
	messageLengthError: number;
	rxFifoFull: number;
	txFifoFull: number;
	crcError: number;
	bundleSizeError: number;
}

export interface PostNetworkStat {
	maxRetry: number;
	sentFrames: number;
	receivedFrames: number;
	seenFrames: number;
	busy: number;
	maxSlot: number;
	supervisionFailures: number;
}

export interface PostNodeStackVersion {
	stack_reference: number;
	stack_index_letter: string;
	stack_index_number: number;
	stack_standard: number;
}

export interface PostNodeAppVersion {
	app_reference: number;
	app_index_letter: string;
	app_index_number: number;
	app_profile: number;
}

export interface PostMotorSoftStartStop {
	start_status_up: number;
	start_value_up: number;
	stop_status_up: number;
	stop_value_up: number;
	start_status_down: number;
	start_value_down: number;
	stop_status_down: number;
	stop_value_down: number;
}

export interface PostMotorPosition {
	position_pulse: number;
	position_percentage: number;
	tilting_percentage: number;
	ip: number;
}

export interface NetworkConfigSetting {
	brodcast_mode: number;
	brodcast_random_value: number;
	supervision_active: number;
	supervision_timeperiod: number;
	deaf_mode: number;
	upload_requested?: number;
}