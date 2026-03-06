import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Op } from 'sequelize';
import { createAuditLog } from '../../helpers/audit.ts';
import { FloorService } from '../../services/floor.service.ts';
import { dbConfig } from '../../models/index.ts';

export class MotorController {
    floorService: FloorService = new FloorService();

    getMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_motor = await dbConfig.dbInstance.deviceModel.findAll({
                where: {
                    device_type: {
                        [Op.in]: ['motor', 'keypad', 'rs485-setting', 'rts-receiver']
                    },
                    room_id: {
                        [Op.ne]: 0
                    }
                },
                order: [['disp_order', 'ASC']],
            });
            return HttpStatus.OkResponse('Ok', res, get_motor);
        } catch (err) {
            next(err);
        }
    };

    getAllMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_motor = await dbConfig.dbInstance.deviceModel.findAll({
                where: {
                    device_type: {
                        [Op.in]: ['motor']
                    },
                },
                order: [['disp_order', 'ASC']],
            });
            return HttpStatus.OkResponse('Ok', res, get_motor);
        } catch (err) {
            next(err);
        }
    };

    getMotorByRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.floorModel.hasMany(dbConfig.dbInstance.roomModel, { foreignKey: "floor_id" });
            dbConfig.dbInstance.roomModel.hasMany(dbConfig.dbInstance.deviceModel, { foreignKey: 'room_id' });
            const get_floor = await dbConfig.dbInstance.floorModel.findAll({
                order: [['disp_order', 'ASC']],
                include: [{
                    model: dbConfig.dbInstance.roomModel,
                    include: [{
                        model: dbConfig.dbInstance.deviceModel,
                        where: { device_type: 'motor' }
                    }]
                }]
            });
            const format_motor = await this.floorService.formatMotorData(get_floor);
            return HttpStatus.OkResponse('Ok', res, format_motor);
        } catch (err) {
            next(err);
        }
    };

    getMotorDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_motor = await dbConfig.dbInstance.motorModel.findByPk(req.params.device_id);
            if (get_motor) {
                return HttpStatus.OkResponse("Motor detail get successfully", res, get_motor);
            } else {
                return HttpStatus.NotFoundResponse("Motor not found", res);
            }
        } catch (err) {
            next(err);
        }
    }

    //REmove if not used
    createMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            objParam.device_type = "motor";
            const create_motor = await dbConfig.dbInstance.deviceModel.findOrCreate({
                where: {
                    address: objParam.address
                },
                defaults: objParam
            });
            if (create_motor[1]) {
                await dbConfig.dbInstance.motorModel.create({ device_id: create_motor[0].device_id });
                createAuditLog("motor", "add", objParam, create_motor[0], true);
                return HttpStatus.OkResponse("Motor saved successfully", res, create_motor[0]);
            } else {
                createAuditLog("motor", "add", objParam, create_motor, false);
                return HttpStatus.BadRequestResponse("Motor Already exist", res, create_motor[0]);
            }

        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    createMultipleMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            let self = this;
            let err_list: any[] = [];
            // function forloop to create multiple motor
            async function forLoop(i: number) {
                if (i < objParam.length) {
                    let device_data = objParam[i];
                    // device_data.device_type = device_data.type;
                    const get_device = await dbConfig.dbInstance.deviceModel.findOne({
                        where: {
                            address: device_data.address
                        },
                    });
                    if (!get_device) {
                        await dbConfig.dbInstance.deviceModel.create(device_data);
                    } else {
                        await get_device.update(device_data);
                        err_list.push(device_data);
                        createAuditLog("motor", "add", device_data, get_device, false);
                    }
                    forLoop(i + 1);
                } else {
                    return HttpStatus.OkResponse("Motor saved successfully", res, err_list);
                }
            }
            forLoop(0);
        } catch (err) {
            next(err);
        }
    };

    assignMotorToRoom = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { room_id } = req.body;
            const device_id = req.params.device_id;
            const data: any = {
                room_id,
                device_id
            };
            const get_motor = await dbConfig.dbInstance.deviceModel.findByPk(device_id,
                {
                    attributes: ['device_id', 'room_id']
                }
            );
            if (get_motor) {
                await get_motor.update({ room_id: room_id });
                createAuditLog("motor", "update", data, get_motor, true);
                return HttpStatus.OkResponse("Device updated successfully", res, get_motor);
            } else {
                createAuditLog("motor", "update", data, get_motor, false);
                return HttpStatus.NotFoundResponse("Motor not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    updateMultipleMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            let self = this;
            async function forLoop(i: number) {
                if (i < objParam.length) {
                    const create_motor = await dbConfig.dbInstance.deviceModel.findByPk(objParam[i].device_id);
                    if (create_motor) {
                        await create_motor.update(objParam[i]);
                    }
                    forLoop(i + 1);
                } else {
                    return HttpStatus.OkResponse("Motor updated successfully", res, []);
                }
            }
            forLoop(0);

        } catch (err) {
            next(err);
        }
    };

    deleteMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_motor = await dbConfig.dbInstance.deviceModel.findByPk(req.params.device_id);
            if (get_motor) {
                await get_motor.update({ room_id: 0 });
                createAuditLog("motor", "delete", null, get_motor, true);
            }
            else return HttpStatus.NotFoundResponse("No Record found", res);
            return HttpStatus.OkResponse("Motor deleted successfully", res, get_motor);
        } catch (err) {
            next(err);
        }
    };

    getMotorById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.deviceModel.hasOne(dbConfig.dbInstance.motorModel, { foreignKey: "device_id" });
            const get_motor = await dbConfig.dbInstance.deviceModel.findOne({
                where: {
                    device_id: req.params.device_id
                },
                include: [{
                    model: dbConfig.dbInstance.motorModel
                }]
            });
            return HttpStatus.OkResponse('Ok', res, get_motor);
        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    getMotorsLimit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_device = await dbConfig.dbInstance.deviceModel.findAll({
                where: {
                    device_type: {
                        [Op.in]: ['motor']
                    },
                },
                attributes: ['device_id', 'address', 'is_limit_set', 'sub_node_id'],
                order: [['disp_order', 'ASC']],
                raw: true
            });
            const ids = get_device.map((device: any) => device.device_id);
            const get_motor = await dbConfig.dbInstance.motorModel.findAll({
                where: {
                    device_id: {
                        [Op.in]: ids
                    }
                },
                attributes: ['device_id', 'up_limit', 'down_limit'],
                raw: true
            });
            const response = get_device.map((device: any) => {
                const motor = get_motor.find((m: any) => m.device_id === device.device_id);
                return {
                    ...device,
                    up_limit: motor ? motor.up_limit : null,
                    down_limit: motor ? motor.down_limit : null
                };
            });

            return HttpStatus.OkResponse('Ok', res, response);
        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    saveUnassignedDevices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            objParam.forEach((element: any) => {
                element.room_id = 0;
            });
            const get_devices = await dbConfig.dbInstance.deviceModel.findAll({ where: { room_id: { [Op.ne]: 0 } } });
            const assigned_address = get_devices.map((device: any) => device.address);

            const create_devices_list = objParam.filter((device: any) => !assigned_address.includes(device.address));
            const existing_devices = await dbConfig.dbInstance.deviceModel.findAll({ where: { address: create_devices_list.map((device: any) => device.address) } });
            const existing_addresses = existing_devices.map((device: any) => device.address);

            const new_devices_list = create_devices_list.filter((device: any) => !existing_addresses.includes(device.address));
            const created_devices = await dbConfig.dbInstance.deviceModel.bulkCreate(new_devices_list);
            const created_device_ids = created_devices.map((device: any) => device.device_id);
            await dbConfig.dbInstance.motorModel.bulkCreate(created_device_ids.map((device_id: any) => ({ device_id })));

            return HttpStatus.OkResponse('Ok', res, null);

        } catch (err) {
            next(err);
        }
    };

    // deleteUnassignedDevices = async (param: any) => {
    //     const get_unassigned_devices = await dbConfig.dbInstance.deviceModel.findOne({ where: { room_id: 0, address: param.address } });
    //     if (get_unassigned_devices) {
    //         await get_unassigned_devices.destroy();
    //     }
    // };


    updateMotorDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            const get_motor = await dbConfig.dbInstance.motorModel.findByPk(req.params.device_id);
            if (get_motor) {
                await get_motor.update(objParam);
                createAuditLog("motor", "update", objParam, get_motor, true);
                return HttpStatus.OkResponse("Motor updated successfully", res, get_motor);
            } else {
                createAuditLog("motor", "update", objParam, get_motor, false);
                return HttpStatus.NotFoundResponse("Motor not found", res);
            }
        } catch (err) {
            next(err);
        }
    };


    //Remove it we set the limit in discovery
    saveMotorLimit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            let is_changed = false;
            let update_devices = [];
            let update_motors = [];
            const ids = objParam.map((add: any) => add.address);
            const get_devices = await dbConfig.dbInstance.deviceModel.findAll({
                where: { address: ids },
                raw: true
            });

            for (let i = 0; i < get_devices.length; i++) {
                is_changed = get_devices[i]?.is_limit_set != objParam[i]?.is_limit_set;
                update_devices.push({
                    device_id: get_devices[i].device_id,
                    address: get_devices[i].address,
                    is_limit_set: objParam[i]?.is_limit_set
                });
                update_motors.push({
                    device_id: get_devices[i].device_id,
                    up_limit: objParam[i]?.up_limit,
                    down_limit: objParam[i]?.down_limit
                });
            }
            await dbConfig.dbInstance.deviceModel.bulkCreate(update_devices, { fields: ["device_id", "address", "is_limit_set"], updateOnDuplicate: ['is_limit_set'] });
            await dbConfig.dbInstance.motorModel.bulkCreate(update_motors, { fields: ["device_id", "up_limit", "down_limit"], updateOnDuplicate: ['up_limit', 'down_limit'] });

            return HttpStatus.OkResponse('Ok', res, is_changed);

        } catch (err) {
            next(err);
        }
    };


    //Remove it we set the node stack in discovery
    saveNodeStackVersion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body;
            const addresses = body.map((b: any) => b.address);
            const get_devices = await dbConfig.dbInstance.deviceModel.findAll({
                where: {
                    address: { [Op.in]: addresses }
                }
            });
            const bodyMap = new Map(body.map((b: any) => [b.address, b]));
            const update_node_stack = [];
            for (const device of get_devices) {
                const b: any = bodyMap.get(device.address);
                update_node_stack.push({
                    device_id: device.device_id,
                    address: device.address,
                    sub_node_id: b.sub_node_id
                });
            }
            await dbConfig.dbInstance.deviceModel.bulkCreate(update_node_stack, { fields: ["device_id", "address", "sub_node_id"], updateOnDuplicate: ['sub_node_id'] });
            return HttpStatus.OkResponse('Ok', res, null);
        } catch (err) {
            next(err);
        }
    };

}

