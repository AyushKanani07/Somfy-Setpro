export interface CommandParserOutput {
	command_name: string;
	source_add: string;
	destination_add: string;
	source_node_type: number;
	dest_node_type: number;
	data: any;
	is_ack: boolean;
	state?: commandState;
	message?: string;
	isError?: boolean;
}

type commandState = "offline_command" | "ready" | "error" | "wait_for_ack" | "reply_processing" | "timeout" | "completed" | "retry";

export interface ParseCommandWithTransactionId extends CommandParserOutput {
	transaction_id: string;
}

export interface AckResponse {
	command_name: string;
	source_add: string;
	destination_add: string;
	source_node_type: number;
	dest_node_type: number;
	data: any;
	state?: string;
	message?: string;
}

export interface Command {
	command_name: string;
	sub_node_type?: number;
	dest_node_type: number;
	source_node_type?: number;
	source_add?: string;
	destination_add: string;
	is_ack: boolean;
	ack_timeout: number;
	data: any;
	max_retry_count: number;
	priority?: Priority;
	event_timeout: number;
	transaction_id: string;
}

export interface FirmwareCommand {
	command: string;
	data: number[] | Buffer;
	state?: stateType;
	isSecondMotor?: boolean;
	retrieve_count: number;
	action_message?: string;
	event_timeout: number;
}

export interface BaseCommand {
	command_name: string;
	source_add?: string;
	is_ack: boolean;
	ack_timeout: number;
	data: any;
	max_retry_count: number;
	priority?: Priority;
	event_timeout: number;
}

export type Priority = 'high' | 'low' | undefined;

export interface MasterCommand {
	cmd_id: number;
	name: string;
	builder_method?: string;
	parser_method?: string;
}

export interface CommandBuilderInput {
	command_name: string;
	is_ack: boolean;
	dest_node_type: number;
	sub_node_type?: number;
	source_add?: string;
	destination_add: string;
	data: any;
}

export type stateType =
	| 'ready'
	| 'wait_for_ack'
	| 'reply_processing'
	| 'completed'
	| 'error'
	| 'timeout';

export interface SensorCommandBuilderInput {
	command_name: string;
	dest_node_type: number;
	slave_address: number;
	source_add?: string;
	destination_add: string;
	data: any;
}

export interface SensorResponseBase {
	error: boolean;
	slave_address: number;
	function_code: number;
}

export interface SensorResponseSuccess extends SensorResponseBase {
	error: false;
	byte_count?: number;
	data: number | null;
	units?: string;
	raw_data?: number[];
	message?: string;
}

export interface SensorResponseWriteSuccess extends SensorResponseBase {
	error: false;
	byte_count?: number;
	start_address?: number;
	num_registers?: number;
	data: null;
	message: string;
}

export interface SensorResponseError extends SensorResponseBase {
	error: true;
	message: string;
	exception_code?: number;
	data: null;
}

export type SensorResponse =
	| SensorResponseSuccess
	| SensorResponseWriteSuccess
	| SensorResponseError;

export interface MasterCommandBuilderData {
	ip_index?: number;
	group_index?: number;
	function_id?: number;
	limit?: number;
	value?: number;
	direction?: number;
	up?: number;
	down?: number;
	slow?: number;
	tilting_speed?: number;
	value_position?: number;
	value_tilting?: number;
	priority?: number;
	ui_index?: number;
	discovery_mode?: number;
	group_address?: number;
	label?: string;
	brodcast_mode?: number;
	brodcast_random_value?: number;
	supervision_active?: number;
	supervision_timeperiod?: number;
	deaf_mode?: number;
	upload_requested?: number;
	max_retry_count?: number;
	reset_counter?: number;
	mode?: number;
	ramp?: number;
	duration?: number;
	speed?: number;
	reserved?: number;
	unused?: number;
	value_tilt?: number;
	lock_type?: number;
	value_angle?: number;
}

export interface MasterCommandParserData {
	ip_index?: number;
	group_index?: number;
	function_id?: number;
	limit?: number;
	value?: number;
	direction?: number;
	up?: number;
	down?: number;
	slow?: number;
	tilting_speed?: number;
	value_position?: number;
	value_tilting?: number;
	priority?: number;
	ui_index?: number;
	discovery_mode?: number;
	group_address?: number;
	label?: string;
	brodcast_mode?: number;
	brodcast_random_value?: number;
	supervision_active?: number;
	supervision_timeperiod?: number;
	deaf_mode?: number;
	upload_requested?: number;
	max_retry_count?: number;
	reset_counter?: number;
	mode?: number;
	ramp?: number;
	duration?: number;
	speed?: number;
	reserved?: number;
	unused?: number;
	value_tilt?: number;
	lock_type?: number;
	value_angle?: number;
	position_pulse?: number;
	position_percentage?: number;
	tilting_percentage?: number;
	ip?: number;
	tilting_degree?: number;
	tilting_pulse?: number;
	status?: number;
	source?: number;
	cause?: number;
	up_limit?: number;
	down_limit?: number;
	up_speed?: number;
	down_speed?: number;
	slow_speed?: number;
	reserved1?: number;
	reserved2?: number;
	reserved3?: number;
	ip_position_pulse?: number;
	ip_position_percentage?: number;
	ip_angle_pulse?: number;
	ip_angle_percentage?: number;
	ip_angle_degree?: number;
	source_addr?: number;
	saved?: number;
	tilt_range?: number;
	upward_backlash_pulses?: number;
	downward_backlash_pulses?: number;
	upward_backlash_ms?: number;
	downward_backlash_ms?: number;
	min_angle_degrees?: number;
	max_angle_degrees?: number;
	broadcast_mode?: number;
	broadcast_max_random_value?: number;
	supervision_time_period?: number;
	serial_number?: string;
	tx_failed?: number;
	tx_collision?: number;
	rx_data_error?: number;
	rx_unknown_message?: number;
	rx_length_msg_error?: number;
	rx_fifo_full?: number;
	tx_fifo_full?: number;
	rx_crc_error?: number;
	bundle_size_error?: number;
	tx_total_frame_sent?: number;
	rx_total_frame_received?: number;
	rx_total_frame_node_received?: number;
	rx_busy?: number;
	tx_max_slot?: number;
	supervision_failure?: number;
	stack_reference?: number;
	stack_index_letter?: string;
	stack_index_number?: number;
	stack_standard?: number;
	app_reference?: number;
	app_index_letter?: string;
	app_index_number?: number;
	app_profile?: number;
	start_status_up?: number;
	start_value_up?: number;
	stop_status_up?: number;
	stop_value_up?: number;
	start_status_down?: number;
	start_value_down?: number;
	stop_status_down?: number;
	stop_value_down?: number;
	keypad_id?: number;
	sw1_group_addr?: string;
	sw2_group_addr?: string;
	sw3_group_addr?: string;
	sw4_group_addr?: string;
	sw5_group_addr?: string;
	sw6_group_addr?: string;
	sw7_group_addr?: string;
	sw8_group_addr?: string;
	major_version?: number;
	minor_version?: number;

	button_id?: number;
	press_command?: number;
	press_value?: number;
	press_extra_value?: number;
	press_addr_code?: number;
	press_target_addr?: string;

	hold_command?: number;
	hold_value?: number;
	hold_extra_value?: number;
	hold_addr_code?: number;
	hold_target_addr?: string;

	release_command?: number;
	release_value?: number;
	release_extra_value?: number;
	release_addr_code?: number;
	release_target_addr?: string;
}

export interface NodeType {
	node_id: number,
	node_type_name: string,
	type: string,
	key_count?: number;
	getSubnode?: boolean;
}

export type RampKey = "start_up" | "start_down" | "stop_up" | "stop_down";

export interface RampSetting {
	enabled: boolean;
	value: number;
	ramp_key: RampKey;
};

export interface IP {
	pulse: number;
	percentage: number;
	selected?: boolean;
	index: number;
	angle?: number;
}

export interface Group {
	index: number;
	group_address: string;
}