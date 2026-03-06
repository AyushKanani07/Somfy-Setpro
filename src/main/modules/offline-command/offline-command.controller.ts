import { Op } from 'sequelize';
import { type NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { dbConfig } from '../../models/index.ts';
import type { Command } from '../../interface/command.interface.ts';
import { CommandSenderService } from '../../services/command.sender.service.ts';
import { promiseRegistry } from '../../helpers/util.ts';

export class OfflineCommandController {
    private commandSender = new CommandSenderService();

    getAllOfflineCommand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_offline_command = await dbConfig.dbInstance.offlineCommandModel.findAll({
                order: [['id', 'ASC']]
            })
            return HttpStatus.OkResponse('Ok', res, get_offline_command);
        } catch (err) {
            next(err);
        }
    }

    //Remove because we add offline command from service directly
    createOfflineCommand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objParam = req.body;
            const create_offlineCommand = await dbConfig.dbInstance.offlineCommandModel.create(objParam);
            if (create_offlineCommand) {
                return HttpStatus.OkResponse("OfflineCommand saved successfully", res, null);
            } else {
                return HttpStatus.BadRequestResponse("Something went wrong please try again", res, null);
            }
        } catch (err) {
            next(err);
        }
    }

    deleteAllOfflineCommand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await dbConfig.dbInstance.offlineCommandModel.destroy({ truncate: true });
            return HttpStatus.OkResponse("OfflineCommand deleted successfully", res);
        } catch (err) {
            next(err);
        }
    }

    executeOfflineCommands = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const inIds: number[] = req.body.ids;
            const offlineCommands = await dbConfig.dbInstance.offlineCommandModel.findAll({
                where: {
                    id: { [Op.in]: inIds }
                },
                order: [['id', 'ASC']],
                raw: true
            });

            for (let i = 0; i < offlineCommands.length; i++) {
                const data = offlineCommands[i];

                const command: Command = {
                    command_name: data.command,
                    data: data.data || {},
                    is_ack: true,
                    ack_timeout: 1000,
                    max_retry_count: 3,
                    priority: 'low' as 'low',
                    event_timeout: 1500,
                    source_add: data.source,
                    sub_node_type: data.sub_node_type,
                    dest_node_type: data.node_type,
                    destination_add: data.destination,
                    transaction_id: promiseRegistry.newRequestId()
                }

                this.commandSender.sendSDNCommand(command);

                await promiseRegistry.waitForTransaction(command.transaction_id, "ACK");
            }

            await dbConfig.dbInstance.offlineCommandModel.destroy({ truncate: {} });

            return HttpStatus.OkResponse("Offline commands executed successfully", res);

        } catch (err) {
            next(err);
        }
    }
}

