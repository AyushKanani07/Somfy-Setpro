import type { NextFunction, Request, Response } from 'express';
import { MotorActionService } from '../../services/motor-action.service.ts';
import HttpStatus from '../../helpers/http-status.ts';
import { DeviceDiscoveryService } from '../../services/device.discovery.service.ts';
import { dbConfig } from '../../models/index.ts';
import type { RampSetting } from '../../interface/command.interface.ts';
import { CommanService } from '../../services/comman.service.ts';
import type { DeviceModel } from '../../interface/device.ts';

export class MotorActionController {
    private commonService = new CommanService();
    private motorActionService = new MotorActionService();
    private motorDiscovery = new DeviceDiscoveryService;

    motorMove = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, direction, duration, speed, isACK } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.motorMove(deviceData, direction, duration, speed, isACK);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    motorMoveTo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type, isACK, value_position, value_tilt } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.motorMoveTo(deviceData, function_type, isACK, value_position, value_tilt);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    allMotorMoveTo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { function_type, value_position } = req.body;
            const result = await this.motorActionService.allMotorMoveTo(function_type, value_position);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    motorMoveOf = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type, isACK, value_position } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.motorMoveOf(deviceData, function_type, isACK, value_position);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getMotorPosition = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = +req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.getMotorPosition(deviceData);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res, result.data);

        } catch (error) {
            next(error);
        }
    }

    stopMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, isACK } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.stopMotor(deviceData, isACK);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    stopAllMotors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.motorActionService.stopAllMotors();
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    setMotorIp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type, ip_index, value_position, value_tilt } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorIp(deviceData, function_type, ip_index, value_position, value_tilt);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    setMotorIpAuto = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, ip_count } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorIpAuto(deviceData, ip_count);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    getMotorIp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorIps(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

                return HttpStatus.OkResponse(result.message, res);
            } else {
                const ipData = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['ip_data'],
                    where: { device_id: device_id }
                });
                return HttpStatus.OkResponse('OK', res, ipData);
            }
        } catch (error) {
            next(error);
        }
    }

    eraseAllMotorIp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, 'remove-ip');
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    setNetworkReset = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, 'network-reset');
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    resetMotorLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, 'reset-motor-limits');
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    //Remove because we do motor discovery via socket
    discoveryMotors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.motorDiscovery.discoverMotors();
            return HttpStatus.OkResponse('Motor discovery initiated', res, result);
        } catch (error) {
            next(error);
        }
    }

    winkMotor = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, isACK } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.winkMotor(deviceData, isACK);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    winkAllMotors = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.motorActionService.winkAllMotors();

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    setAppMode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, app_mode } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setAppMode(deviceData, app_mode);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            await dbConfig.dbInstance.motorModel.update({ app_mode: app_mode }, { where: { device_id: device_id } });
            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    getAppMode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getAppMode(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const appMode = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['app_mode'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, appMode);
            }
        } catch (error) {
            next(error);
        }
    }

    setMotorDirection = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, direction } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorDirection(deviceData, direction);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            await dbConfig.dbInstance.motorModel.update({ direction: direction }, { where: { device_id: device_id } });
            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    getMotorDirection = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorDirection(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const direction = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['direction'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, direction);
            }

        } catch (error) {
            next(error);
        }
    }

    setMotorLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type, value_position } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorLimits(deviceData, function_type, value_position);

            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);

        } catch (error) {
            next(error);
        }
    }

    getMotorLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorLimits(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const limits = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['up_limit', 'down_limit'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, limits);
            }
        } catch (error) {
            next(error);
        }
    }

    setMotorTiltLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type, value_tilt } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);
            const result = await this.motorActionService.setMotorTiltLimits(deviceData, function_type, value_tilt);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getMotorTiltLimits = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            if (!device_id) return HttpStatus.BadRequestResponse('Device ID is required', res);
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);
            const result = await this.motorActionService.getMotorTiltLimits(deviceData);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res, result.data);
        } catch (error) {
            next(error);
        }
    }

    setMotorRollingSpeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, up, down, slow } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorRollingSpeed(deviceData, up, down, slow);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            await dbConfig.dbInstance.motorModel.update({ up_speed: up, down_speed: down, slow_speed: slow }, { where: { device_id: device_id } });
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    setDefaultRollingSpeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            if (!device_id) return HttpStatus.BadRequestResponse('Device ID is required', res);
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, "default-rolling-speed");
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getMotorRollingSpeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorRollingSpeed(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const speeds = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['up_speed', 'down_speed', 'slow_speed'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, speeds);
            }
        } catch (error) {
            next(error);
        }
    }

    setDefaultRampTime = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, function_type } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setDefaultRampTime(deviceData, function_type);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getMotorRampTime = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorRampTime(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const rampTimes = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['ramp'],
                    where: { device_id: +device_id }
                });
                const data = rampTimes?.dataValues.ramp;
                let payload = null;
                if (data && data.length >= 8) {
                    payload = {
                        start_status_up: data[0] == 0x01 ? true : false,
                        start_value_up: data[1],
                        stop_status_up: data[2] == 0x01 ? true : false,
                        stop_value_up: data[3],
                        start_status_down: data[4] == 0x01 ? true : false,
                        start_value_down: data[5],
                        stop_status_down: data[6] == 0x01 ? true : false,
                        stop_value_down: data[7],
                    }
                }
                return HttpStatus.OkResponse('OK', res, payload);
            }
        } catch (error) {
            next(error);
        }
    }

    saveMotorRampTime = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, start_up, stop_up, start_down, stop_down } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const startUp: RampSetting = {
                enabled: start_up.enabled,
                value: start_up.value,
                ramp_key: 'start_up'
            }
            const result = await this.motorActionService.saveMotorRampTime(deviceData, startUp);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            const stopUp: RampSetting = {
                enabled: stop_up.enabled,
                value: stop_up.value,
                ramp_key: 'stop_up'
            }
            const result2 = await this.motorActionService.saveMotorRampTime(deviceData, stopUp);
            if (result2.isError) return HttpStatus.BadRequestResponse(result2.message, res);

            const startDown: RampSetting = {
                enabled: start_down.enabled,
                value: start_down.value,
                ramp_key: 'start_down'
            }
            const result3 = await this.motorActionService.saveMotorRampTime(deviceData, startDown);
            if (result3.isError) return HttpStatus.BadRequestResponse(result3.message, res);

            const stopDown: RampSetting = {
                enabled: stop_down.enabled,
                value: stop_down.value,
                ramp_key: 'stop_down'
            }
            const result4 = await this.motorActionService.saveMotorRampTime(deviceData, stopDown);
            if (result4.isError) return HttpStatus.BadRequestResponse(result4.message, res);

            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    setMotorLedStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, status } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const statusValue = status === 'on' ? 0 : 1;
            const result = await this.motorActionService.setMotorLedStatus(deviceData, statusValue, 0);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getMotorLedStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getMotorLedStatus(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                const payload = {
                    status: result.data.status == 0x01 ? 'off' : 'on'
                }
                return HttpStatus.OkResponse(result.message, res, payload);
            } else {
                const ledStatus = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['local_ui'],
                    where: { device_id: +device_id }
                });
                const data = ledStatus?.dataValues.local_ui;
                let payload = null;
                if (data && data.length >= 1) {
                    payload = {
                        status: data[0] == 0x01 ? 'off' : 'on'
                    }
                }
                return HttpStatus.OkResponse('OK', res, payload);
            }
        } catch (error) {
            next(error);
        }
    }

    setNetworkLock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, isLocked, priority } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setNetworkLock(deviceData, isLocked, priority);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    getNetworkLock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.getNetworkLock(deviceData);
                const payload = {
                    isLocked: result.data.status === 1 ? true : false,
                    priority: result.data.priority,
                }
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, payload);
            } else {
                const networkLock = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['network_lock'],
                    where: { device_id: +device_id }
                });
                const data = networkLock?.dataValues.network_lock;
                let payload = null;
                if (data && data.length >= 3) {
                    payload = {
                        isLocked: data[0] == 0x01 ? true : false,
                        priority: data[2]
                    }
                }
                return HttpStatus.OkResponse('OK', res, payload);
            }
        } catch (error) {
            next(error);
        }
    }

    getMotorLabel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (!isRefresh) {
                const result = await this.motorActionService.getMotorLabel(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const labelData = await dbConfig.dbInstance.deviceModel.findOne({
                    attributes: ['name'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, labelData);
            }
        } catch (error) {
            next(error);
        }
    }

    setMotorLabel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, label } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const result = await this.motorActionService.setMotorLabel(deviceData, label);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            await dbConfig.dbInstance.deviceModel.update({ name: label }, { where: { device_id: device_id } });
            return HttpStatus.OkResponse('Motor label updated successfully', res, { label: label, device_id: device_id });
        } catch (error) {
            next(error);
        }
    }

    getTotalMoveCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetTotalMoveCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const moveCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['move_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, moveCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getTotalRevCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetTotalRevCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const revCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['revolution_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, revCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getThermalCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetThermalCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const thermalCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['thermal_count', 'post_thermal_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, thermalCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getObstacleCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetObstacleCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const obstacleCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['obstacle_count', 'post_obstacle_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, obstacleCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getPowerCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetPowerCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const powerCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['power_cut_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, powerCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getResetCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const result = await this.motorActionService.diagGetResetCount(deviceData);
                if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);
                return HttpStatus.OkResponse(result.message, res, result.data);
            } else {
                const resetCount = await dbConfig.dbInstance.motorModel.findOne({
                    attributes: ['reset_count'],
                    where: { device_id: +device_id }
                });
                return HttpStatus.OkResponse('OK', res, resetCount);
            }
        } catch (error) {
            next(error);
        }
    }

    getNetworkStat = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.getNetworkStat(deviceData);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res, result.data);
        } catch (error) {
            next(error);
        }
    }

    getNetworkErrorStat = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.getNetworkErrorStat(deviceData);
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res, result.data);
        } catch (error) {
            next(error);
        }
    }

    resetAllSettings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, 'all-settings');
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            await dbConfig.dbInstance.motorModel.update(
                {
                    ip_data: null,
                    direction: null,
                    up_limit: null,
                    down_limit: null,
                    up_speed: null,
                    down_speed: null,
                    slow_speed: null,
                    ramp: null,
                    move_count: null,
                    revolution_count: null,
                    thermal_count: null,
                    post_thermal_count: null,
                    obstacle_count: null,
                    post_obstacle_count: null,
                    power_cut_count: null,
                    reset_count: null,
                    pos_pulse: null,
                    pos_per: null,
                    pos_tilt_per: null,
                    app_mode: null,
                    network_lock: null,
                    network_config: null,
                    local_ui: null,
                    torque: null,
                    dct_mode: null,
                    touch_motion_sensitivity: null,
                },
                { where: { device_id: device_id } }
            );
            await dbConfig.dbInstance.deviceModel.update(
                { is_limit_set: 0 },
                { where: { device_id: device_id } }
            );
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }
}