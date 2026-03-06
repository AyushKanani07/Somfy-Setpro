import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Sequelize } from 'sequelize';
import { createAuditLog } from '../../helpers/audit.ts';
import { dbConfig } from '../../models/index.ts';
import { GroupActionService } from '../../services/group-action.service.ts';
import { CommanService } from '../../services/comman.service.ts';
import type { DeviceModel } from '../../interface/device.ts';

export class GroupController {
    private commonService = new CommanService();
    private groupActionService = new GroupActionService();

    getGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_group = await dbConfig.dbInstance.groupModel.findAll({
                attributes: ['group_id', 'name', 'address', 'disp_order'],
                order: [['name', 'ASC']],
            });
            return HttpStatus.OkResponse('Ok', res, get_group);
        } catch (err) {
            next(err);
        }
    };

    createGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            const create_group = await dbConfig.dbInstance.groupModel.findOrCreate({
                attribiutes: ['group_id', 'name', 'address', 'disp_order'],
                where: {
                    address: objParam.address
                },
                defaults: objParam
            });
            if (create_group[1]) {
                createAuditLog("group", "add", objParam, create_group[0], true);
                return HttpStatus.OkResponse("Group saved successfully", res, create_group[0]);
            } else {
                createAuditLog("group", "add", objParam, create_group, false);
                return HttpStatus.ConflictRequestResponse("Group Already exist", res, create_group[0]);
            }

        } catch (err) {
            next(err);
        }
    };

    updateGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.body;
            const get_group = await dbConfig.dbInstance.groupModel.findByPk(req.params.group_id);
            if (get_group) {
                await get_group.update(objParam);
                createAuditLog("group", "update", objParam, get_group, true);
                return HttpStatus.OkResponse("Group updated successfully", res, get_group);
            } else {
                createAuditLog("group", "update", objParam, get_group, false);
                return HttpStatus.NotFoundResponse("Group not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const group_id = +req.params.group_id;
            const get_group = await dbConfig.dbInstance.groupModel.findByPk(group_id);
            if (!get_group) return HttpStatus.NotFoundResponse("No Record found", res);

            const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                where: { group_id: group_id },
                attributes: ['device_id', 'group_id', 'device_group_pos'],
                raw: true
            });

            for (const gd of get_group_device) {
                const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(gd.device_id);
                await this.groupActionService.setMotorGroup(deviceData, '0', gd.device_group_pos);
            }

            await this.updateMotorGroupCount(group_id);
            await dbConfig.dbInstance.groupDeviceMapModel.destroy({ where: { group_id: group_id } });
            await get_group.destroy();

            createAuditLog("group", "delete", null, get_group, true);
            return HttpStatus.OkResponse("Group deleted successfully", res, get_group);
        } catch (err) {
            next(err);
        }
    };

    getGroupById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_group = await dbConfig.dbInstance.groupModel.findByPk(req.params.group_id);
            return HttpStatus.OkResponse('Ok', res, get_group);
        } catch (err) {
            next(err);
        }
    };

    winkGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const group_id = req.body.group_id;
            const getGroupAddress = await dbConfig.dbInstance.groupModel.findOne({
                where: { group_id: group_id },
                attributes: ['address'],
                raw: true
            });
            if (!getGroupAddress) {
                return HttpStatus.NotFoundResponse("Group not found", res);
            }
            const winkResult = await this.groupActionService.winkGroup(getGroupAddress.address);
            return HttpStatus.OkResponse("Wink command sent", res, winkResult);
        } catch (err) {
            next(err);
        }
    }

    groupMoveTo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { group_id, action } = req.body;
            const getGroupAddress = await dbConfig.dbInstance.groupModel.findOne({
                where: { group_id: group_id },
                attributes: ['address'],
                raw: true
            });
            if (!getGroupAddress) return HttpStatus.NotFoundResponse("Group not found", res);

            const moveResult = await this.groupActionService.groupMoveTo(getGroupAddress.address, action);
            return HttpStatus.OkResponse(`Group move ${action} command sent`, res, moveResult);

        } catch (err) {
            next(err);
        }
    }

    groupStop = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const group_id = req.body.group_id;
            const getGroupAddress = await dbConfig.dbInstance.groupModel.findOne({
                where: { group_id: group_id },
                attributes: ['address'],
                raw: true
            });
            if (!getGroupAddress) return HttpStatus.NotFoundResponse("Group not found", res);

            const stopResult = await this.groupActionService.groupStop(getGroupAddress.address);
            return HttpStatus.OkResponse("Group stop command sent", res, stopResult);

        } catch (err) {
            next(err);
        }
    }

    private async updateMotorGroupCount(group_id: number): Promise<void> {
        const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
            where: {
                group_id: group_id,
            },
            attributes: ['device_id'],
            raw: true
        });

        const deviceIds = get_group_device.map((d: any) => d.device_id);

        if (deviceIds.length === 0) return;

        await dbConfig.dbInstance.deviceModel.update(
            { group_count: Sequelize.literal('group_count - 1') },
            { where: { device_id: deviceIds } }
        )
    }

}

