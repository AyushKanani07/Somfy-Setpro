import { MotorActionService } from "../../services/motor-action.service.ts";
import { ReceiverActionService } from "../../services/receiver-action.service.ts";
import type { NextFunction, Request, Response } from 'express';
import HttpStatus from '../../helpers/http-status.ts';
import { dbConfig } from "../../models/index.ts";
import type { DeviceModel } from "../../interface/device.ts";
import { CommanService } from "../../services/comman.service.ts";


export class ReceiverController {
    private commonService = new CommanService();
    private motorActionService = new MotorActionService();
    private receiverActionService = new ReceiverActionService();

    getReceiverByDeviceId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.deviceModel.hasMany(dbConfig.dbInstance.rtsReceiverModel, { foreignKey: 'device_id' });
            const device_id = +req.params.device_id;
            const receiverData = await dbConfig.dbInstance.deviceModel.findOne({
                where: { device_id: device_id },
                include: [{
                    model: dbConfig.dbInstance.rtsReceiverModel,
                    attributes: [['channel_no', 'index'], ['is_configure', 'config']]
                }],
                order: [
                    [{ model: dbConfig.dbInstance.rtsReceiverModel }, 'channel_no', 'ASC']
                ]
            });

            return HttpStatus.OkResponse('Ok', res, receiverData);

        } catch (err) {
            next(err);
        }
    }

    getAllChannelStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const isRefresh = req.query.refresh === 'true';

            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const getStatus = await this.receiverActionService.getAllChannelStatus(deviceData);
                if (getStatus.isError) return HttpStatus.BadRequestResponse(getStatus.message, res);

                return HttpStatus.OkResponse(getStatus.message, res, getStatus.data);
            } else {
                const getStatus = await dbConfig.dbInstance.rtsReceiverModel.findAll({
                    attributes: [['channel_no', 'index'], ['is_configure', 'config']],
                    where: {
                        device_id: device_id
                    },
                    order: [['channel_no', 'ASC']],
                    raw: true
                });
                return HttpStatus.OkResponse("Channel status retrieved successfully", res, getStatus);
            }
        } catch (err) {
            next(err);
        }
    }

    getChannelStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const isRefresh = req.query.refresh === 'true';
            const index = req.query.index;
            if (!index) return HttpStatus.BadRequestResponse("Channel index is required", res);
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            if (isRefresh) {
                const getStatus = await this.receiverActionService.getChannelStatus(deviceData, +index);
                if (getStatus.isError) return HttpStatus.BadRequestResponse(getStatus.message, res);

                return HttpStatus.OkResponse(getStatus.message, res, getStatus.data);
            } else {
                const getStatus = await dbConfig.dbInstance.rtsReceiverModel.findOne({
                    attributes: [['channel_no', 'index'], ['is_configure', 'config']],
                    where: {
                        device_id: device_id,
                        channel_no: index
                    },
                    raw: true
                });
                return HttpStatus.OkResponse("Channel status retrieved successfully", res, getStatus);
            }
        } catch (err) {
            next(err);
        }
    }

    removeAllChannels = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const ack = await this.motorActionService.setFactoryDefault(deviceData, 'remove-all-channel');
            if (ack.isError) return HttpStatus.BadRequestResponse(ack.message, res);

            return HttpStatus.OkResponse(ack.message, res);

        } catch (err) {
            next(err);
        }
    }

    setChannelStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, index, action } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const ack = await this.receiverActionService.controlChannel(deviceData, index, action);
            if (ack.isError) return HttpStatus.BadRequestResponse(ack.message, res);

            return HttpStatus.OkResponse(ack.message, res);

        } catch (err) {
            next(err);
        }
    }

    resetAllSettings = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const device_id = req.params.device_id;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const result = await this.motorActionService.setFactoryDefault(deviceData, 'all-settings');
            if (result.isError) return HttpStatus.BadRequestResponse(result.message, res);

            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }
}