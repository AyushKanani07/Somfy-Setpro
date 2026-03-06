import { eventBroker } from '../helpers/event.ts';
import type {
	Command,
	CommandParserOutput,
	ParseCommandWithTransactionId,
	stateType,
} from '../interface/command.interface.ts';
import { CommandBuilderService } from './command.builder.service.ts';
import { writeToSerialPort } from '../helpers/serialport.ts';
import { SerialportConnectionService } from './serialport.connection.service.ts';
import { resolveNodeName } from '../helpers/util.ts';
import SocketService from './socket.service.ts';
import { dbConfig } from '../models/index.ts';
import { OFFLINE_SUPPORTED_COMMANDS, Socket_Events } from '../helpers/constant.ts';

let commandQueue: Command[] = [];
let isProcessing: boolean = false;
let state: stateType = 'ready';
export class CommandSenderService {


	private CommandBuilder: CommandBuilderService = new CommandBuilderService();

	constructor() { }

	private async addOfflineCommandToDb(command: Command): Promise<void> {
		const payload = {
			command: command.command_name,
			ack: command.is_ack ? 'ACK' : 'nACK',
			node_type: command.dest_node_type,
			sub_node_id: command.sub_node_type,
			destination: command.destination_add,
			source: command.source_add,
			data: Object.values(command.data).length > 0 ? command.data : null
		}
		await dbConfig.dbInstance.offlineCommandModel.create({
			...payload,
			created_at: new Date(),
			updated_at: new Date()
		});
	}

	// Add a command to the queue
	public sendSDNCommand(command: Command): Error | void {
		const port = SerialportConnectionService.getConnectedPortName();
		if (!port) {
			SocketService.emit(Socket_Events.ON_PORT_ERROR, {
				status: 'not_connected',
				message: 'Connect to Port first'
			});
			console.error('Serial port not connected');
			throw new Error('Serial port not connected');
		}

		if (port === 'offline-edit') {
			if (OFFLINE_SUPPORTED_COMMANDS.includes(command.command_name)) {
				this.addOfflineCommandToDb(command);
				const payload: ParseCommandWithTransactionId = {
					command_name: "ACK",
					source_add: command.destination_add,
					destination_add: command.source_add || "Unknown",
					source_node_type: command.dest_node_type,
					dest_node_type: command.source_node_type || 0,
					data: null,
					is_ack: false,
					state: "offline_command",
					message: "Command added to offline database successfully",
					isError: false,
					transaction_id: command.transaction_id
				};
				setTimeout(() => {
					eventBroker.emit('parsed_command', [payload]);
				}, 500);
				return;
			} else {
				throw new Error(`Command is not supported in offline mode`);
			}
		}

		if (command.priority === 'high') {
			let insertIndex = commandQueue.findIndex(
				(c) => c.priority === 'low'
			);
			if (insertIndex === -1) {
				commandQueue.push(command);
			} else {
				commandQueue.splice(insertIndex, 0, command);
			}
		} else {
			command.priority = 'low';
			commandQueue.push(command);
		}

		if (!isProcessing && state === 'ready') {
			this.processNextSDNCommand();
		}
		// else if (!isProcessing && state !== 'ready') {
		// 	setTimeout(() => {
		// 		this.processNextSDNCommand();
		// 	}, 1);
		// }
	}

	// Process the next command in the queue
	private async processNextSDNCommand() {
		// console.log('processNextSDNCommand called ',);
		if (commandQueue.length === 0) {
			isProcessing = false;
			state = 'ready';
			// console.log('There is no any command in queue to process. Thats why process terminate',);
			return;
		}

		isProcessing = true;
		const command = commandQueue.shift()!;

		try {
			await this.processCurrentSDNCommand(command);
		} catch (error) {
			state = 'error';
			console.error(`Error in processNextSDNCommand: ${error}`);
		}

		setTimeout(() => {
			state = 'ready';
			this.processNextSDNCommand();
		}, 20);
	}

	// Send a command and handle retries and ACKs
	private async processCurrentSDNCommand(command: Command) {
		// console.log('processCurrentSDNCommand: called');
		for (let attempt = 0; attempt <= command.max_retry_count; attempt++) {
			// console.log(`Attempt ${attempt + 1} start for command - ${command.command_name}`);
			try {
				let result: ParseCommandWithTransactionId[] = [];

				if (command.is_ack) {
					state = 'wait_for_ack';

					if (
						command.dest_node_type == 0 ||
						command.destination_add == 'FFFFFF'
					) {
						/**  If the dest_node_type is 0 or dest_add is FFFFFF, 
						 then the command will support multiple responses */
						const resultPromise = new Promise<ParseCommandWithTransactionId[]>(
							(resolve) => {
								const responses: ParseCommandWithTransactionId[] = [];
								let timeout: any;
								const onDataReceived = (data: CommandParserOutput) => {
									responses.push({ ...data, transaction_id: command.transaction_id });

									clearTimeout(timeout);
									timeout = setTimeout(() => {
										eventBroker.removeListener('command', onDataReceived);
										resolve(responses);
									}, command.event_timeout);
								};
								timeout = setTimeout(() => {
									eventBroker.removeListener('command', onDataReceived);
									resolve(responses);
								}, command.event_timeout);
								eventBroker.on('command', onDataReceived);
							}
						);

						// Send command AFTER listener is registered
						await this.buildAndSendSDNCommandToPort(command);
						result = await resultPromise;
					} else {
						const resultPromise = new Promise<ParseCommandWithTransactionId[]>(
							(resolve) => {
								const timeout = setTimeout(() => {
									eventBroker.removeListener('command', onDataReceived);
									resolve([]);
								}, command.ack_timeout);
								const onDataReceived = (data: CommandParserOutput) => {
									clearTimeout(timeout);
									eventBroker.removeListener('command', onDataReceived);
									resolve([{ ...data, transaction_id: command.transaction_id }]);
								};
								eventBroker.once('command', onDataReceived);
							}
						);

						// Send command AFTER listener is registered
						await this.buildAndSendSDNCommandToPort(command);
						result = await resultPromise;
					}

					if (result.length > 0) {
						if (result[0].isError) {
							throw new Error(result[0].message);
						}
						state = 'reply_processing';
						eventBroker.emit('parsed_command', result);
						break;
					} else {
						if (attempt === command.max_retry_count - 1) {
							state = 'timeout';
							eventBroker.emit('parsed_command', [{ state: 'timeout', ...command, transaction_id: command.transaction_id }]);
							break;
						}
						// eventBroker.emit('parsed_command', [{ state: 'retry', ...command }]);
						continue;
					}
				} else {
					// const resultPromise = new Promise<CommandParserOutput[]>(
					// 	(resolve) => {
					// 		let timeout: any;
					// 		const onDataReceived = (data: CommandParserOutput) => {
					// 			/**
					// 			 * We will not push data to result array because,
					// 			 * we are not waiting for ACK
					// 			 */
					// 			clearTimeout(timeout);
					// 			timeout = setTimeout(() => {
					// 				eventBroker.removeListener('command', onDataReceived);
					// 				resolve([]);
					// 			}, command.event_timeout);
					// 		};
					// 		timeout = setTimeout(() => {
					// 			eventBroker.removeListener('command', onDataReceived);
					// 			resolve([]);
					// 		}, command.event_timeout);
					// 		eventBroker.on('command', onDataReceived);
					// 	}
					// );

					// Send command AFTER listener is registered
					await this.buildAndSendSDNCommandToPort(command);
					// result = await resultPromise;

					// console.log("Command does not require ACK");
					state = 'completed';
					eventBroker.emit('parsed_command', result);
					break;
				}
			} catch (error) {
				state = 'error';
				console.error(`Error in processCurrentSDNCommand: ${error}`);
				const res = await new Promise((resolve) => {
					resolve({
						state: 'error',
						...command,
						message: (error as Error).message,
						data: null,
						transaction_id: command.transaction_id,
					});
				});
				eventBroker.emit('parsed_command', [res]);
				break;
			}
		}
	}

	private async buildAndSendSDNCommandToPort(command: Command) {
		try {
			const command_frame = this.CommandBuilder.Cmd_Bldr_BuildCommandFrame(command);
			console.log('command_frame sent: ', command_frame.frame.toString('hex'));
			// Send on primary port
			await this.sendFrameToPort(command_frame.frame, command_frame.data, command);

		} catch (error) {
			console.error('Error in sending Frame to Port', error);
			throw error;
		}
	}

	public sendFrameToPort = async (frame: Buffer, dataFrame: Buffer, command: Command): Promise<void> => {
		try {
			// Always send on primary port (mandatory)
			const portInstance = SerialportConnectionService.getSerialportInstance();
			if (!portInstance) {
				throw new Error('Serial port not connected');
			}

			await writeToSerialPort(portInstance, frame);

			// Socket event emit for communication log
			this.sentCommunicationLog(frame, dataFrame, command);

		} catch (error) {
			throw error;
		}
	}

	private sentCommunicationLog = async (frame: Buffer, dataFrame: Buffer, command: Command) => {
		let sourceNodeType = 15;
		if (command.source_node_type && command.source_node_type != 0) {
			sourceNodeType = command.source_node_type;
		}
		let eventData = {
			time: new Date(),
			source_node_type: resolveNodeName(sourceNodeType),
			destination_node_type: resolveNodeName(command.dest_node_type),
			source: command.source_add,
			destination: command.destination_add,
			command: command.command_name,
			ack: command.is_ack ? 'ACK' : null,
			data: dataFrame.toString('hex').toUpperCase(),
			frame: frame.toString('hex').toUpperCase(),
			type: "sent"
		}

		SocketService.sentCommunicationLog(eventData);
	}

}
