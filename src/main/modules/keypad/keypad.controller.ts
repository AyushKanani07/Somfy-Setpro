import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../../helpers/http-status.ts';
import { Op } from 'sequelize';
import { createAuditLog } from '../../helpers/audit.ts';
import { KeypadService } from '../../services/keypad.service.ts';
import { dbConfig } from '../../models/index.ts';
import { KeypadActionService } from '../../services/keypad-action.service.ts';
import type { keypadCommandData, SwitchSettingType } from '../../interface/keypad.interface.ts';
import { CommanService } from '../../services/comman.service.ts';
import type { DeviceModel } from '../../interface/device.ts';

interface SwitchSettingMap {
    command_id: number;
    isValueRequired?: boolean;
    isPriorityRequired?: boolean;
    error_msg?: string;
}

export class KeypadController {
    commonService = new CommanService();
    keypadService: KeypadService = new KeypadService();
    keypadActionService: KeypadActionService = new KeypadActionService();

    private switchSettingMap: Record<SwitchSettingType, SwitchSettingMap> = {
        'up': { command_id: 0x01 },
        'down': { command_id: 0x02 },
        'stop': { command_id: 0x03 },
        'go_to_ip': { command_id: 0x04, isValueRequired: true, error_msg: 'IP value is required for this command' },
        'next_ip_up': { command_id: 0x05 },
        'next_ip_down': { command_id: 0x06 },
        'go_to_pulse': { command_id: 0x08, isValueRequired: true, error_msg: 'Pulse value is required for this command' },
        'jog_up_ms': { command_id: 0x0A, isValueRequired: true, error_msg: 'Value is required for this command' },
        'jog_down_ms': { command_id: 0x0B, isValueRequired: true, error_msg: 'Value is required for this command' },
        'jog_up_pulse': { command_id: 0x0C, isValueRequired: true, error_msg: 'Pulse value is required for this command' },
        'jog_down_pulse': { command_id: 0x0D, isValueRequired: true, error_msg: 'Pulse value is required for this command' },
        'go_to_per': { command_id: 0x10, isValueRequired: true, error_msg: 'Percentage value is required for this command' },
        'lock_curr': { command_id: 0x20, isPriorityRequired: true, error_msg: 'Priority is required' },
        'lock_up': { command_id: 0x21, isPriorityRequired: true, error_msg: 'Priority is required' },
        'lock_down': { command_id: 0x22, isPriorityRequired: true, error_msg: 'Priority is required' },
        'lock_ip': { command_id: 0x23, isValueRequired: true, isPriorityRequired: true, error_msg: 'IP and Priority are required' },
        'unlock': { command_id: 0x24, isPriorityRequired: true, error_msg: 'Priority is required' },
        'set_ip': { command_id: 0x25, isValueRequired: true, error_msg: 'IP value is required for this command' },
        'group': { command_id: 0x11 },
    }

    checkKeypad = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const objParam = req.query;
            const check_keypad = await dbConfig.dbInstance.deviceModel.findOne({
                where: {
                    address: objParam.address,
                    device_type: 'keypad'
                },
            });
            return HttpStatus.OkResponse('Ok', res, check_keypad);
        } catch (err) {
            next(err);
        }
    };

    createKeypad = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, address, key_count } = req.body;
            const dbPayload: any = {
                name: name,
                address: address,
                device_type: "keypad",
                model_no: 14,
                key_count: key_count,
            }
            const create_keypad = await dbConfig.dbInstance.deviceModel.findOrCreate({
                attributes: ['device_id', 'room_id', 'name', 'address', 'device_type', 'model_no', 'sub_node_id', 'key_count', 'is_limit_set', 'group_count'],
                where: {
                    address: address,
                },
                defaults: dbPayload
            });
            if (create_keypad[1]) {
                for (let i = 1; i <= 8; i++) {
                    // if (key_count == 6 && (i == 4 || i == 5)) continue;
                    await dbConfig.dbInstance.keypadModel.create({ device_id: create_keypad[0].device_id, key_no: i });
                }
                createAuditLog("keypad", "add", dbPayload, create_keypad[0], true);
                return HttpStatus.OkResponse("Keypad saved successfully", res, create_keypad[0]);
            } else {
                createAuditLog("keypad", "add", dbPayload, create_keypad, false);
                return HttpStatus.BadRequestResponse("Keypad Already exist", res, create_keypad[0]);
            }

        } catch (err) {
            next(err);
        }
    };

    updateKeypad = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, key_count } = req.body;
            const dbPayload: any = {
                name: name,
                // room_id: room_id,
                key_count: key_count,
            }
            const get_keypad = await dbConfig.dbInstance.deviceModel.findByPk(req.params.device_id);
            if (get_keypad) {
                await get_keypad.update(dbPayload);
                createAuditLog("keypad", "update", dbPayload, get_keypad, true);
                return HttpStatus.OkResponse("Device updated successfully", res, get_keypad);
            } else {
                createAuditLog("keypad", "update", dbPayload, get_keypad, false);
                return HttpStatus.NotFoundResponse("Keypad not found", res);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteKeypad = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const get_keypad = await dbConfig.dbInstance.deviceModel.findByPk(req.params.device_id);
            if (!get_keypad) return HttpStatus.NotFoundResponse("No Record found", res);

            // await this.global.keypadModel.destroy({ where: { device_id: req.params.device_id } });
            await get_keypad.update({ room_id: 0 });
            createAuditLog("keypad", "delete", null, get_keypad, true);

            return HttpStatus.OkResponse("Keypad deleted successfully", res);
        } catch (err) {
            next(err);
        }
    };

    getKeypadById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.deviceModel.hasMany(dbConfig.dbInstance.keypadModel, { foreignKey: "device_id" });
            const device_id = +req.params.device_id;

            const getData = await dbConfig.dbInstance.deviceModel.findOne({
                where: {
                    device_id: device_id
                },
                include: [{
                    model: dbConfig.dbInstance.keypadModel
                }],
                order: [
                    [{ model: dbConfig.dbInstance.keypadModel }, 'key_no', 'ASC']
                ]
            });
            return HttpStatus.OkResponse('Ok', res, getData);
        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    saveUnassignedKeypad = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, address, key_count } = req.body;
            const dbPayload: any = {
                name: name,
                address: address,
                device_type: "keypad",
                model_no: 14,
                key_count: key_count,
            }
            const create_keypad = await dbConfig.dbInstance.deviceModel.findOrCreate({
                where: {
                    address: address
                },
                defaults: dbPayload
            });
            if (create_keypad[1]) {
                for (let i = 0; i < key_count; i++) {
                    await dbConfig.dbInstance.keypadModel.create({ device_id: create_keypad[0].device_id });
                }
                createAuditLog("keypad", "add", dbPayload, create_keypad[0], true);
                return HttpStatus.OkResponse("Keypad saved successfully", res, create_keypad[0]);
            } else {
                createAuditLog("keypad", "add", dbPayload, create_keypad, false);
                return HttpStatus.BadRequestResponse("Keypad Already exist", res, create_keypad[0]);
            }
        } catch (err) {
            next(err);
        }
    };

    deleteUnnasignedDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const get_device = await dbConfig.dbInstance.deviceModel.findByPk(device_id);
            if (!get_device) return HttpStatus.NotFoundResponse("No Record found", res);

            await dbConfig.dbInstance.groupDeviceMapModel.destroy({ where: { device_id: device_id } });
            if (get_device.device_type == 'motor' || get_device.device_type == 'rts-receiver' || get_device.device_type == 'rts-transmitter') {
                await dbConfig.dbInstance.motorModel.destroy({ where: { device_id: device_id } });
            } else {
                await dbConfig.dbInstance.keypadModel.destroy({ where: { device_id: device_id } });
            }
            // await dbConfig.dbInstance.deviceCloneModel.destroy({ where: { device_id: device_id } });
            await get_device.destroy();

            return HttpStatus.OkResponse("Device deleted successfully", res, get_device);
        } catch (err) {
            next(err);
        }
    };

    deleteAllUnnasignedDevice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let get_device;
            if (req.params.device_type == 'all') {
                get_device = await dbConfig.dbInstance.deviceModel.findAll({ where: { room_id: 0 } });
            } else if (req.params.device_type == 'device') {
                get_device = await dbConfig.dbInstance.deviceModel.findAll({
                    where: {
                        room_id: 0,
                        device_type: {
                            [Op.in]: ['motor', 'rts-receiver']
                        }
                    }
                });

            } else {
                get_device = await dbConfig.dbInstance.deviceModel.findAll({
                    where: {
                        room_id: 0,
                        device_type: {
                            [Op.eq]: req.params.device_type
                        }
                    }
                });
            }

            const device_ids = get_device.map((device: any) => device.device_id);
            if (device_ids.length > 0) {

                await dbConfig.dbInstance.groupDeviceMapModel.destroy({ where: { device_id: { [Op.in]: device_ids } } });

                await dbConfig.dbInstance.motorModel.destroy({ where: { device_id: { [Op.in]: device_ids } } });

                if (req.params.device_type == 'all') {
                    await dbConfig.dbInstance.keypadModel.destroy({ where: { device_id: { [Op.in]: device_ids } } });
                }

                // await dbConfig.dbInstance.deviceCloneModel.destroy({ where: { device_id: { [Op.in]: device_ids } } });
                await dbConfig.dbInstance.deviceModel.destroy({ where: { device_id: { [Op.in]: device_ids } } });

            }

            return HttpStatus.OkResponse("Unassigned Device deleted successfully", res, get_device);
        } catch (err) {
            next(err);
        }
    };

    //Remove if not used
    saveKeypadDetail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            objParam.forEach((element: any) => {
                element.device_id = req.params.device_id;
            });
            await dbConfig.dbInstance.keypadModel.destroy({ where: { device_id: req.params.device_id } });
            await dbConfig.dbInstance.keypadModel.bulkCreate(objParam);
            return HttpStatus.OkResponse("Keypad updated successfully", res, null);
        } catch (err) {
            next(err);
        }
    };

    // * Keypad Config Schemas

    getKeypadConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let get_keypad_config = await this.keypadService.getkeypadConfigList();
            get_keypad_config = get_keypad_config ? JSON.parse(get_keypad_config) : [];
            return HttpStatus.OkResponse('Ok', res, get_keypad_config);
        } catch (err) {
            next(err);
        }
    };

    saveKeypadConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let objParam = req.body;
            let get_keypad_config: any = await this.keypadService.getkeypadConfigList();
            get_keypad_config = get_keypad_config ? JSON.parse(get_keypad_config) : [];
            let index = get_keypad_config.findIndex((x: any) => x.name == objParam.name);
            if (index > -1) {
                get_keypad_config[index] = objParam;
            } else {
                get_keypad_config.push(objParam);
            }
            await this.keypadService.setkeypadConfigList(get_keypad_config);
            return HttpStatus.OkResponse("Keypad updated successfully", res, null);
        } catch (err) {
            next(err);
        }
    };

    setKeypadToDefault = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = +req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.keypadActionService.setKeypadType(deviceData, 2);
            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res);
        } catch (err) {
            next(err);
        }
    };

    setKeypadType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { keypad_id, type } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(keypad_id);

            const result = await this.keypadActionService.setKeypadType(deviceData, type);

            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res);

        } catch (err) {
            next(err);
        }
    }

    setSwitchSettings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { keypad_id, switch_data } = req.body;

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(keypad_id);
            if (!deviceData) return HttpStatus.BadRequestResponse('Keypad not found', res);

            const result = await this.keypadActionService.setSwitchSettings(deviceData, switch_data);
            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res);
        } catch (err) {
            next(err);
        }
    };

    getSwitchSetting = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { keypad_id, button_id } = req.query;
            const result = await this.keypadActionService.getIndividualSwitchSettings(+keypad_id!, +button_id!);
            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res, result.data);
        } catch (err) {
            next(err);
        }
    };

    setIndividualSwitchGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { keypad_id, group_addresses } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(keypad_id);

            const result = await this.keypadActionService.setIndividualSwitchGroup(deviceData, group_addresses);
            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res);
        } catch (err) {
            next(err);
        }
    };

    getIndividualSwitchGroup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id!);

            const result = await this.keypadActionService.getIndividualSwitchGroups(deviceData);
            if (result.isError) {
                return HttpStatus.BadRequestResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res, result.data);
        } catch (err) {
            next(err);
        }
    }
}

