import { Op } from 'sequelize';
import type { NextFunction, Request, Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { createAuditLog } from '../../helpers/audit.ts';
import * as _ from 'underscore';
import { GLYDEA_SUB_NODE_ID } from '../../services/floor.service.ts';
import { dbConfig } from '../../models/index.ts';
import { GroupActionService } from '../../services/group-action.service.ts';
import { GroupDiscoveryService } from '../../services/group.discovery.service.ts';
import { MotorActionService } from '../../services/motor-action.service.ts';
import type { DeviceModel } from '../../interface/device.ts';
import { CommanService } from '../../services/comman.service.ts';

export class GroupDeviceController {
    private commonService = new CommanService();
    private groupDiscovery = new GroupDiscoveryService();
    private groupActionService = new GroupActionService();
    private motorActionService = new MotorActionService();

    // get all group devices from database
    getAllGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" });
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.deviceModel, { foreignKey: "device_id" });
            const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                order: [['group_id', 'ASC']],
                include: [
                    {
                        model: dbConfig.dbInstance.groupModel,
                        attributes: ['group_id', 'name', 'address']
                    },
                    {
                        model: dbConfig.dbInstance.deviceModel,
                        attributes: ['device_id', 'name', 'address', 'model_no', 'device_type'],
                        where: {
                            device_type: {
                                [Op.ne]: 'rts-receiver'
                            }
                        }
                    }
                ]
            })
            return HttpStatus.OkResponse('Ok', res, get_group_device);
        } catch (err) {
            next(err);
        }
    }

    //Remove because of we do discovery for all devices via socket
    discoverGroups = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // this.groupDiscovery.discoverGroups()
            const result = await this.groupDiscovery.discoverGroups()
            return HttpStatus.OkResponse('Group discovery initiated', res, result);
        } catch (error) {
            next(error);
        }
    }

    getGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" });
            const device_id = Number(req.query.device_id);
            if (!device_id) return HttpStatus.BadRequestResponse("Please pass device_id", res, null);

            const isRefresh = req.query.refresh === 'true';

            if (isRefresh) {
                await this.groupDiscovery.discoverGroupsForDevice(+device_id);
            }

            const get_groupDevice = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                where: { device_id: device_id },
                order: [['group_id', 'ASC']],
                include: [{
                    model: dbConfig.dbInstance.groupModel
                }]
            });
            return HttpStatus.OkResponse('Ok', res, get_groupDevice);

        } catch (err) {
            next(err);
        }
    }

    createGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, group_id, index } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);
            if (!deviceData) {
                return HttpStatus.BadRequestResponse("Device not found", res);
            }
            if (deviceData.model_no === 13 && !index) {
                return HttpStatus.BadRequestResponse("Index is required for RTS Receiver devices", res);
            }

            const existingMapping = await dbConfig.dbInstance.groupDeviceMapModel.findOne({
                where: {
                    device_id: device_id,
                    group_id: group_id,
                }
            });
            if (existingMapping) {
                createAuditLog("group_map", "add", req.body, existingMapping, false);
                return HttpStatus.BadRequestResponse("Device already exist in this group", res, existingMapping);
            }

            let device_group_pos = index;
            if (!device_group_pos) {
                device_group_pos = await this.getEmptyGroupPosition(device_id);
            }

            if (device_group_pos === null || device_group_pos > 16) {
                createAuditLog("group_map", "add", req.body, null, false);
                return HttpStatus.BadRequestResponse("Can't add more than 16 groups", res, null);
            }

            const groupAddress = await dbConfig.dbInstance.groupModel.findOne({ where: { group_id: group_id }, attributes: ['address', 'name'], raw: true });
            const setGroup = await this.groupActionService.setMotorGroup(deviceData, groupAddress.address, device_group_pos);
            if (setGroup.isError) return HttpStatus.BadRequestResponse(setGroup.message, res);

            const create_groupDevice = await dbConfig.dbInstance.groupDeviceMapModel.create({
                device_id: device_id,
                group_id: group_id,
                device_group_pos: device_group_pos
            });
            await this.updateMotorGroupCount(device_id);

            if (create_groupDevice) {
                const payload = {
                    device_id: create_groupDevice.device_id,
                    group_id: create_groupDevice.group_id,
                    device_group_pos: device_group_pos,
                    name: groupAddress.name,
                    address: groupAddress.address
                }
                createAuditLog("group_map", "add", req.body, create_groupDevice, true);
                return HttpStatus.OkResponse("GroupDevice saved successfully", res, payload);
            } else {
                createAuditLog("group_map", "add", req.body, create_groupDevice, false);
                return HttpStatus.InternalServerErrorResponse("Failed to save GroupDevice in db", res, null);
            }

        } catch (err) {
            next(err);
        }
    }

    //Remove if not used
    updateGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            const get_groupDevice = await dbConfig.dbInstance.groupDeviceMapModel.findByPk(req.params.group_device_map_id);
            if (get_groupDevice) {
                await get_groupDevice.update(objParam);
                createAuditLog("group_map", "update", objParam, get_groupDevice, true);
                return HttpStatus.OkResponse("GroupDevice updated successfully", res, get_groupDevice);
            } else {
                createAuditLog("group_map", "update", objParam, get_groupDevice, false);
                return HttpStatus.NotFoundResponse("GroupDevice not found", res);
            }
        } catch (err) {
            next(err);
        }
    }

    deleteGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, group_id } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const get_groupDevice = await dbConfig.dbInstance.groupDeviceMapModel.findOne({
                where: {
                    device_id: device_id,
                    group_id: group_id,
                }
            });
            if (!get_groupDevice) return HttpStatus.NotFoundResponse("No Record found", res);

            const ack = await this.groupActionService.setMotorGroup(deviceData, '0', get_groupDevice.device_group_pos);
            if (ack.isError) return HttpStatus.BadRequestResponse(ack.message, res);

            await get_groupDevice.destroy();
            await this.updateMotorGroupCount(device_id);
            createAuditLog("group_map", "delete", null, get_groupDevice, true);
            return HttpStatus.OkResponse("GroupDevice deleted successfully", res);
        } catch (err) {
            next(err);
        }
    }

    deleteAllGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deviceId = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+deviceId);

            const ack = await this.motorActionService.setFactoryDefault(deviceData, 'remove-group');
            if (ack.isError) {
                return HttpStatus.BadRequestResponse(ack.message, res);
            }

            const get_all_device_group = await dbConfig.dbInstance.groupDeviceMapModel.findOne({ where: { device_id: deviceId } });
            await dbConfig.dbInstance.groupDeviceMapModel.destroy({ where: { device_id: deviceId } });
            await this.updateMotorGroupCount(+deviceId);
            createAuditLog("group_map", "delete", null, get_all_device_group, true);
            return HttpStatus.OkResponse("All Group deleted successfully", res);
        } catch (err) {
            next(err);
        }
    }

    getGroupDeviceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_groupDevice = await dbConfig.dbInstance.groupDeviceMapModel.findByPk(req.params.group_device_map_id);
            return HttpStatus.OkResponse('Ok', res, get_groupDevice);
        } catch (err) {
            next(err);
        }
    }

    //Remove if not used
    createNewGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            let self = this;
            async function forLoop(i: number) {
                if (i < objParam.length) {
                    // create new group
                    let group_data = {
                        name: objParam[i].group_name,
                        address: objParam[i].group_address,
                        device_id: objParam[i].device_id,
                        device_group_pos: objParam[i].device_group_pos,
                        group_id: null,
                    }
                    const create_group = await dbConfig.dbInstance.groupModel.findOrCreate({
                        where: {
                            address: group_data.address
                        },
                        defaults: group_data
                    })
                    if (create_group) {
                        // create new group device map
                        group_data.group_id = create_group[0].group_id;
                        const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findOne({
                            where: {
                                device_id: group_data.device_id,
                                group_id: group_data.group_id
                            },
                        });
                        if (get_group_device) {
                            const update_group_device = await get_group_device.update(group_data, {
                                where: {
                                    group_id: group_data.group_id,
                                    device_id: group_data.device_id
                                }
                            });
                            createAuditLog("group_map", "update", objParam[i], update_group_device, true);
                        } else {
                            await self.updateMotorGroupCount(group_data.device_id);
                            const create_group_device = await dbConfig.dbInstance.groupDeviceMapModel.create(group_data);
                            if (create_group_device) {
                                createAuditLog("group_map", "add", objParam[i], create_group_device, true);
                            } else {
                                createAuditLog("group_map", "add", objParam[i], create_group_device, false);
                            }
                        }
                    }
                    forLoop(i + 1);
                } else {

                    return HttpStatus.OkResponse("Group Device Mapped successfully", res, null);
                }
            }
            forLoop(0);
        } catch (err) {
            next(err);
        }
    }

    //Remove if not used
    checkDeviceGroupPosition = async (req: Request, res: Response, next: NextFunction) => {
        try {
            var objParam = req.body;
            let self = this;
            async function forLoop(i: number) {
                if (i < objParam.length) {
                    const check_group_device_map = await dbConfig.dbInstance.groupDeviceMapModel.findOne({
                        where: {
                            group_id: objParam[i].group_id,
                            device_id: objParam[i].device_id
                        }
                    })
                    if (check_group_device_map) {
                        await check_group_device_map.update(objParam[i], {
                            where: {
                                group_id: objParam[i].group_id,
                                device_id: objParam[i].device_id
                            }
                        });
                        createAuditLog("group_map", "update", objParam[i], check_group_device_map, true);
                    } else {
                        const create_group_device = await dbConfig.dbInstance.groupDeviceMapModel.create(objParam[i]);
                        if (create_group_device) {
                            createAuditLog("group_map", "add", objParam[i], create_group_device[0], true);
                        } else {
                            createAuditLog("group_map", "add", objParam[i], create_group_device, false);
                        }
                    }
                    i++;
                    forLoop(i);
                }
            }
            forLoop(0);
            return HttpStatus.OkResponse("Group Device Mapped successfully", res, null);

        } catch (err) {
            next(err);
        }
    }

    //Remove if not used - not used in current running version
    // get vaccant device_group_position for particular device
    getVaccantDeviceGroupPosition = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.query;
            if (objParam.device_id) {

                const get_vaccant_group_device_position = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                    where: {
                        device_id: objParam.device_id,
                    }
                });
                let device_group_pos = _.pluck(get_vaccant_group_device_position, 'device_group_pos');

                let missing_position;
                const isGlydea = await this.isGlydeaDevice(+objParam.device_id);
                if (isGlydea) {
                    missing_position = _.range(1, 17).filter(x => !device_group_pos.includes(x));
                } else {
                    missing_position = _.range(0, 16).filter(x => !device_group_pos.includes(x));
                }

                return HttpStatus.OkResponse('Ok', res, missing_position);
            } else {
                return HttpStatus.BadRequestResponse('DeviceId is required', res, null);
            }
        } catch (err) {
            next(err);
        }
    }

    creteMultipleGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id: deviceIds, group_id } = req.body;
            const response_pos: any[] = [];

            const groupAddress = await dbConfig.dbInstance.groupModel.findOne({
                attributes: ['address'],
                where: {
                    group_id
                },
                raw: true
            });

            for (const devId of deviceIds) {
                const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(devId);

                // Check if this mapping already exists
                const existing = await dbConfig.dbInstance.groupDeviceMapModel.findOne({
                    where: {
                        group_id,
                        device_id: devId
                    }
                });
                if (existing) continue;

                // Get next empty position for this motor
                const group_pos = await this.getEmptyGroupPosition(devId);

                // If group_pos is null, skip
                if (group_pos === null || group_pos === undefined) continue;

                response_pos.push({
                    device_group_pos: group_pos,
                    device_id: devId
                });

                const create_obj = {
                    group_id,
                    device_id: devId,
                    device_group_pos: group_pos
                };

                const setGroup = await this.groupActionService.setMotorGroup(deviceData, groupAddress.address, group_pos);
                if (setGroup.isError) {
                    createAuditLog("group_map", "add", devId, null, false);
                    continue; // Skip creating the mapping if setting the group failed
                }

                const created = await dbConfig.dbInstance.groupDeviceMapModel.create(create_obj);
                await this.updateMotorGroupCount(devId);

                if (created) {
                    createAuditLog("group_map", "add", devId, created, true);
                } else {
                    createAuditLog("group_map", "add", devId, created, false);
                }
            }

            return HttpStatus.OkResponse("Group Device Mapped successfully", res, response_pos);

        } catch (err) {
            next(err);
        }
    }

    //Remove if not used
    deleteMultipleGroupDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { body } = req;
            await dbConfig.dbInstance.groupDeviceMapModel.destroy({
                where: {
                    group_device_map_id: {
                        [Op.in]: body.group_device_map_id
                    }
                }
            })
            return HttpStatus.OkResponse('Ok', res, null);
        } catch (err) {
            next(err);
        }
    }

    //Remove because we discovery group for particular device in getGroupDevice api itself
    discoverGroupsByDeviceId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;

            await this.groupDiscovery.discoverGroupsForDevice(+device_id);

            return HttpStatus.OkResponse('Ok', res);

        } catch (err) {
            next(err);
        }
    }

    private async getEmptyGroupPosition(device_id: number): Promise<number | null> {
        const rows = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
            where: {
                device_id: device_id,
            }
        });
        const usedPositions = rows.map((r: any) => r.device_group_pos);
        console.log("🚀 ~ returnnewPromise<any> ~ device_group_pos", usedPositions);

        // Glydea motors use 1–16, others use 0–15
        const isGlydea = await this.isGlydeaDevice(device_id);
        const allowedRange = isGlydea
            ? Array.from({ length: 16 }, (el, i) => i + 1)
            : Array.from({ length: 16 }, (el, i) => i);

        // Find the first empty slot
        const missingPosition = allowedRange.find(pos => !usedPositions.includes(pos)) ?? null;
        console.log("🚀 ~ returnnewPromise<any> ~ missing_position", missingPosition);

        return missingPosition;
    }

    private async updateMotorGroupCount(device_id: number) {
        return new Promise<any>(async (resolve, reject) => {
            const get_vaccant_group_device_position = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                where: {
                    device_id: device_id,
                }
            });
            if (get_vaccant_group_device_position.length <= 16) {
                await dbConfig.dbInstance.deviceModel.update({
                    group_count: get_vaccant_group_device_position.length
                }, {
                    where: {
                        device_id: device_id
                    }
                });
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    private isGlydeaDevice(device_id: number | undefined) {
        return new Promise<any>(async (resolve, reject) => {
            const device = await dbConfig.dbInstance.deviceModel.findOne({
                where: {
                    device_id: device_id,
                }
            });
            if (device.sub_node_id === GLYDEA_SUB_NODE_ID || device.model_no === 6) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

}

