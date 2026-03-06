import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { dbConfig } from '../../models/index.ts';
import { pageOffset } from '../../helpers/util.ts';
import { QueryTypes } from 'sequelize';
export class CommunicationLogController {

    getAllCommunicationLog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { page, limit, type } = req.query;
            const pageNumber = Number(page) ?? 1;
            const pageLimit = Number(limit) ?? 30;
            const offset = pageOffset(pageNumber, pageLimit);

            let where: any = {};
            if (type) {
                type == 'tx' ? where.type = 'sent' : where.type = 'received';
            }

            const get_communicationLog = await dbConfig.dbInstance.communicationLogModel.findAll({
                offset: offset,
                limit: pageLimit,
                where: where,
                order: [['communication_log_id', 'DESC']],
            });
            return HttpStatus.OkResponse('Ok', res, get_communicationLog);
        } catch (err) {
            next(err);
        }
    };

    getCommunicationLogCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let defaultCounts = {
                sent: 0,
                received: 0,
            };

            const results: { type: string, count: number }[] = await dbConfig.dbInstance.sequelize.query(
                `SELECT type, COUNT(*) as count FROM tbl_communication_log GROUP BY type;`,
                { type: QueryTypes.SELECT }
            )
            const responseData = results.reduce((acc: any, { type, count }) => {
                acc[type] = count;
                return acc;
            }, { ...defaultCounts });

            return HttpStatus.OkResponse('Ok', res, responseData);
        } catch (err) {
            next(err);
        }
    };

    createCommunicationLog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objParam = req.body;
            await dbConfig.dbInstance.communicationLogModel.bulkCreate(objParam);
            return HttpStatus.OkResponse("CommunicationLog saved successfully", res, null);
        } catch (err) {
            next(err);
        }
    };

    deleteAllCommunicationLog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!dbConfig.dbInstance.communicationLogModel) return;
            await dbConfig.dbInstance.communicationLogModel.destroy({ truncate: true });
            dbConfig.dbInstance.communicationLogModel.sequelize.query('UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = "tbl_communication_log"');
            return HttpStatus.OkResponse("CommunicationLog deleted successfully", res);
        } catch (err) {
            next(err);
        }
    };

    // reSendCommand = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const get_communicationLog = await dbConfig.dbInstance.communicationLogModel.findByPk(req.params.communication_log_id);
    //         return HttpStatus.OkResponse('Ok', res, get_communicationLog);
    //     } catch (err) {
    //         next(err);
    //     }
    // };

}

