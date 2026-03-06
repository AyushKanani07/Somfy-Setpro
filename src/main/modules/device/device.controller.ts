import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Op } from 'sequelize';
import { dbConfig } from '../../models/index.ts';
import { CommanService } from '../../services/comman.service.ts';
import type { DeviceModel } from '../../interface/device.ts';

export class DeviceController {
    private commonService = new CommanService();

    getAssignedDevices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_assigned = await dbConfig.dbInstance.deviceModel.findAll({
                attributes: ['device_id', 'room_id', 'name', 'address', 'device_type', 'model_no', 'sub_node_id', 'key_count', 'is_limit_set', 'group_count'],
                where: {
                    room_id: {
                        [Op.ne]: 0
                    }
                },
                order: [['disp_order', 'ASC']],
            });
            // const format_device = await this.floorService.formatDeviceData(get_assigned);
            return HttpStatus.OkResponse('Ok', res, get_assigned);
        } catch (err) {
            next(err);
        }
    };

    getUnassignedDevices = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_unassigned_devices = await dbConfig.dbInstance.deviceModel.findAll({
                attributes: ['device_id', 'room_id', 'name', 'address', 'device_type', 'model_no', 'sub_node_id', 'key_count', 'is_limit_set', 'group_count'],
                where: { room_id: 0 }
            });
            return HttpStatus.OkResponse('Ok', res, get_unassigned_devices);
        } catch (err) {
            next(err);
        }
    };

    getFirmwareVersion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const getVersion = await this.commonService.getFirmwareVersion(deviceData);
                if (getVersion.isError) return HttpStatus.BadRequestResponse(getVersion.message, res);
                return HttpStatus.OkResponse(getVersion.message, res, getVersion.data);
            } else {
                const firmwareVersion = await dbConfig.dbInstance.deviceModel.findOne({
                    attributes: ['firmware_version'],
                    where: { device_id: device_id },
                    raw: true
                });
                return HttpStatus.OkResponse("Firmware version retrieved successfully", res, firmwareVersion);
            }
        } catch (err) {
            next(err);
        }
    }

    getNodeAppVersion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const getVersion = await this.commonService.getNodeAppVersion(deviceData);
                if (getVersion.isError) return HttpStatus.BadRequestResponse(getVersion.message, res);
                return HttpStatus.OkResponse(getVersion.message, res, getVersion.data);
            } else {
                const appVersion = await dbConfig.dbInstance.deviceModel.findOne({
                    attributes: ['app_version'],
                    where: { device_id: device_id },
                    raw: true
                });
                return HttpStatus.OkResponse("Node app version retrieved successfully", res, appVersion);
            }
        } catch (err) {
            next(err);
        }
    }

    getNodeStackVersion = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const getVersion = await this.commonService.getNodeStackVersion(deviceData);
                if (getVersion.isError) return HttpStatus.BadRequestResponse(getVersion.message, res);
                return HttpStatus.OkResponse(getVersion.message, res, getVersion.data);
            } else {
                const stackVersion = await dbConfig.dbInstance.deviceModel.findOne({
                    attributes: ['stack_version'],
                    where: { device_id: device_id },
                    raw: true
                });
                return HttpStatus.OkResponse("Node stack version retrieved successfully", res, stackVersion);
            }

        } catch (err) {
            next(err);
        }
    }

    // getDeviceClone = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { device_id } = req.query;
    //         if (!device_id) return HttpStatus.BadRequestResponse('Device ID is required', res);

    //         const get_device_clone = await dbConfig.dbInstance.deviceModel.findOne({
    //             where: {
    //                 device_id: +device_id,
    //             },
    //             attributes: ['device_id', 'device_type', 'name', 'address', 'model_no', 'sub_node_id', 'cur_pos', 'direction', 'app_mode', 'down_limit',
    //                 'ip', 'group', 'speed', 'ramp', 'network_lock', 'network_config', 'local_ui', 'torque', 'dct_mode', 'touch_motion_sensitivity',
    //                 'identity', 'keypad_data', 'individual_switch_group', 'channel'
    //             ],
    //         });
    //         return HttpStatus.OkResponse('Ok', res, get_device_clone);
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // getAllDeviceClone = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const get_device_clone = await dbConfig.dbInstance.deviceModel.findAll({
    //             attributes: ['device_id', 'device_type', 'name', 'address', 'model_no', 'sub_node_id', 'cur_pos', 'direction', 'app_mode', 'down_limit',
    //                 'ip', 'group', 'speed', 'ramp', 'network_lock', 'network_config', 'local_ui', 'torque', 'dct_mode', 'touch_motion_sensitivity',
    //                 'identity', 'keypad_data', 'individual_switch_group', 'channel'
    //             ],
    //             order: [['device_id', 'DESC']],
    //         });
    //         return HttpStatus.OkResponse('Ok', res, get_device_clone);
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // updateDeviceClone = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { body } = req;
    //         const get_device = await dbConfig.dbInstance.deviceModel.findOne({
    //             where: {
    //                 device_id: body.device_id,
    //             },
    //         });
    //         if (!get_device) return HttpStatus.BadRequestResponse('Device not found', res);
    //         await get_device.update(body);
    //         return HttpStatus.OkResponse('Ok', res);
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // updateDeviceIdentity = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const { body } = req;
    //         const get_device = await dbConfig.dbInstance.deviceModel.findOne({
    //             where: {
    //                 device_id: body.device_id,
    //             },
    //         });
    //         if (!get_device) return HttpStatus.BadRequestResponse('Device not found', res);

    //         await get_device.update({
    //             identity: body.identity,
    //         });
    //         return HttpStatus.OkResponse('Ok', res);
    //     } catch (err) {
    //         next(err);
    //     }
    // };

}