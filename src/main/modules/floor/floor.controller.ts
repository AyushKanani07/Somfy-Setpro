import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Op } from 'sequelize';
import { createAuditLog } from '../../helpers/audit.ts';
import { FloorService } from '../../services/floor.service.ts';
import { dbConfig } from '../../models/index.ts';
export class FloorController {
    floorService: FloorService = new FloorService();

    constructor() { }

    getFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.floorModel.hasMany(dbConfig.dbInstance.roomModel, { foreignKey: "floor_id" });
            dbConfig.dbInstance.roomModel.hasMany(dbConfig.dbInstance.deviceModel, { foreignKey: 'room_id' });
            const get_floor = await dbConfig.dbInstance.floorModel.findAll({
                order: [['disp_order', 'ASC']],
                include: [{
                    order: [['disp_order', 'ASC']],
                    model: dbConfig.dbInstance.roomModel,
                    include: [{
                        order: [['disp_order', 'ASC']],
                        model: dbConfig.dbInstance.deviceModel,
                    }]
                }]
            });
            const format_floor = await this.floorService.formatFloorData(get_floor);
            return HttpStatus.OkResponse('Ok', res, format_floor);
        } catch (err) {
            next(err);
        }
    };

    createFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            const create_floor = await dbConfig.dbInstance.floorModel.findOrCreate({
                where: {
                    name: objParam.name,
                },
                defaults: objParam
            });
            if (create_floor[1]) {
                createAuditLog("floor", "add", objParam, create_floor[0], true);
                return HttpStatus.OkResponse("Floor saved successfully", res, create_floor[0]);
            } else {
                createAuditLog("floor", "add", objParam, create_floor[0], false);
                return HttpStatus.BadRequestResponse("Floor Already exist", res, create_floor[0]);
            }

        } catch (err: any) {
            next(err);
        }
    };

    createMultipleFloors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const no_of_floors = req.body.no_of_floors;
            const floor_prefix = req.body.floor_prefix.trim() || '';
            let start_from = req.body.start_from || 1;

            if (no_of_floors && no_of_floors > 0) {
                const floors: any[] = [];
                const padLength = no_of_floors.toString().length;
                for (let i = 1; i <= no_of_floors; i++) {
                    const floor_number = String(start_from).padStart(padLength, '0');
                    floors.push({ name: `${floor_prefix} ${floor_number}`.trim() });
                    start_from++;
                }
                const create_floors = await dbConfig.dbInstance.floorModel.bulkCreate(floors, { returning: true });
                createAuditLog("floor", "add", req.body, create_floors, true);
                return HttpStatus.OkResponse("Floors created successfully", res, create_floors);
            } else {
                return HttpStatus.BadRequestResponse("Invalid number of floors", res);
            }
        } catch (err) {
            next(err);
        }
    }


    updateFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objParam = req.body;
            const get_floor = await dbConfig.dbInstance.floorModel.findByPk(req.params.floor_id);
            if (!get_floor) {
                createAuditLog("floor", "update", objParam, get_floor, false);
                return HttpStatus.NotFoundResponse("Floor not found", res);
            }

            const check_floor = await dbConfig.dbInstance.floorModel.findOne({
                where: {
                    floor_id: {
                        [Op.ne]: req.params.floor_id
                    },
                    name: objParam.name
                }
            });
            if (check_floor) {
                createAuditLog("floor", "update", objParam, check_floor, false);
                return HttpStatus.BadRequestResponse("Floor Already exist", res, check_floor);
            } else {
                await get_floor.update(objParam);
                createAuditLog("floor", "update", objParam, get_floor, true);
                return HttpStatus.OkResponse("Floor updated successfully", res, get_floor);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteFloor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_floor = await dbConfig.dbInstance.floorModel.findByPk(req.params.floor_id);
            if (!get_floor) return HttpStatus.NotFoundResponse("No Record found", res);

            const get_room = await dbConfig.dbInstance.roomModel.findAll({ where: { floor_id: req.params.floor_id } });
            const roomIds = get_room.map((r: any) => r.room_id);
            if (roomIds && roomIds.length > 0) {
                await dbConfig.dbInstance.deviceModel.update({ room_id: 0 }, { where: { room_id: { [Op.in]: roomIds } } });
                await dbConfig.dbInstance.roomModel.destroy({ where: { room_id: { [Op.in]: roomIds } } });
            }

            await get_floor.destroy();

            createAuditLog("floor", "delete", null, get_floor, true);
            return HttpStatus.OkResponse("Floor deleted successfully", res);
        } catch (err) {
            next(err);
        }
    };

    getFloorById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { floor_id } = req.params;
            const get_floor = await dbConfig.dbInstance.floorModel.findByPk(floor_id);
            return HttpStatus.OkResponse('Ok', res, get_floor);
        } catch (err) {
            next(err);
        }
    };

    updateDispOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req;
            const data = body.data;
            const payload: any = [];
            if (body.type === 'floor') {
                data.forEach((element: any) => {
                    payload.push({ disp_order: element.disp_order, floor_id: element.id });
                });
                await dbConfig.dbInstance.floorModel.bulkCreate(payload, { fields: ["floor_id", "disp_order"], updateOnDuplicate: ['disp_order'] });
            } else if (body.type === 'room') {
                data.forEach((element: any) => {
                    payload.push({ disp_order: element.disp_order, room_id: element.id });
                });
                await dbConfig.dbInstance.roomModel.bulkCreate(payload, { fields: ["room_id", "disp_order"], updateOnDuplicate: ['disp_order'] });
            } else if (body.type === 'device') {
                data.forEach((element: any) => {
                    payload.push({ disp_order: element.disp_order, device_id: element.id });
                });
                await dbConfig.dbInstance.deviceModel.bulkCreate(payload, { fields: ["device_id", "disp_order"], updateOnDuplicate: ['disp_order'] });
            }
            return HttpStatus.OkResponse('Ok', res);
        } catch (err) {
            next(err);
        }
    };

}

