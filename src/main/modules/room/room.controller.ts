import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Op } from 'sequelize';
import { createAuditLog } from '../../helpers/audit.ts';
import { FloorService } from '../../services/floor.service.ts';
import { dbConfig } from '../../models/index.ts';
export class RoomController {
    floorService: FloorService = new FloorService();

    constructor() {

    }

    getRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.floorModel.hasMany(dbConfig.dbInstance.roomModel, { foreignKey: "floor_id" });
            const get_floor = await dbConfig.dbInstance.floorModel.findAll({
                order: [['disp_order', 'ASC']],
                include: [{
                    model: dbConfig.dbInstance.roomModel
                }]
            });
            const format_room = await this.floorService.formatRoomDataForDropdown(get_floor);
            return HttpStatus.OkResponse('Ok', res, format_room);
        } catch (err) {
            next(err);
        }
    };

    createRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objParam = req.body;
            const create_room = await dbConfig.dbInstance.roomModel.findOrCreate({
                where: {
                    name: objParam.name,
                    floor_id: objParam.floor_id
                },
                defaults: objParam
            });
            if (create_room[1]) {
                createAuditLog("room", "add", objParam, create_room[0], true);
                return HttpStatus.OkResponse("Room saved successfully", res, create_room[0]);
            } else {
                createAuditLog("room", "add", objParam, create_room, false);
                return HttpStatus.BadRequestResponse("Room Already exist", res, create_room[0]);
            }

        } catch (err) {
            next(err);
        }
    };

    createMultipleRooms = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const floor_id = req.body.floor_id;
            const no_of_rooms = req.body.no_of_rooms;
            const room_prefix = req.body.room_prefix.trim() || '';
            let start_from = req.body.start_from || 1;
            if (no_of_rooms && no_of_rooms > 0) {
                const rooms: any[] = [];
                const padLength = no_of_rooms.toString().length;
                for (let i = 1; i <= no_of_rooms; i++) {
                    const roomNumber = (start_from).toString().padStart(padLength, '0');
                    rooms.push({ name: `${room_prefix} ${roomNumber}`, floor_id: floor_id });
                    start_from++;
                }
                const create_rooms = await dbConfig.dbInstance.roomModel.bulkCreate(rooms, { returning: true });
                createAuditLog("room", "add", req.body, create_rooms, true);
                return HttpStatus.OkResponse("Rooms created successfully", res, create_rooms);
            } else {
                return HttpStatus.BadRequestResponse("Invalid number of rooms", res);
            }
        } catch (err) {
            next(err);
        }
    }


    updateRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            const get_room = await dbConfig.dbInstance.roomModel.findByPk(req.params.room_id);
            if (get_room) {
                const update_obj = {
                    name: objParam.name ?? undefined,
                    floor_id: objParam.floor_id ?? undefined
                };
                await get_room.update(update_obj);
                createAuditLog("room", "update", objParam, get_room, true);
                return HttpStatus.OkResponse("Room updated successfully", res, get_room);
            } else {
                createAuditLog("room", "update", objParam, get_room, false);
                return HttpStatus.NotFoundResponse("Room not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_room = await dbConfig.dbInstance.roomModel.findByPk(req.params.room_id);
            if (get_room) {
                await dbConfig.dbInstance.deviceModel.update({ room_id: 0 }, { where: { room_id: req.params.room_id } });
                await get_room.destroy();
            }
            else return HttpStatus.NotFoundResponse("No Record found", res);
            createAuditLog("room", "delete", null, get_room, true);
            return HttpStatus.OkResponse("Room deleted successfully", res);
        } catch (err) {
            next(err);
        }
    };

    getRoomById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_room = await dbConfig.dbInstance.roomModel.findByPk(req.params.room_id);
            return HttpStatus.OkResponse('Ok', res, get_room);
        } catch (err) {
            next(err);
        }
    };

}

