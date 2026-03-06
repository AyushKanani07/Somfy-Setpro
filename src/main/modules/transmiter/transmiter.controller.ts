import type { NextFunction, Request, Response } from 'express';
import HttpStatus from '../../helpers/http-status.ts';
import { TransmiterActionService } from "../../services/transmiter-action.service.ts";
import { dbConfig } from '../../models/index.ts';
import type { DataToStore } from '../../interface/transmiter.interface.ts';
import { CommanService } from '../../services/comman.service.ts';
import type { DeviceModel } from '../../interface/device.ts';


export class TransmiterController {
    private commonService = new CommanService();
    private transmiterActionService = new TransmiterActionService();

    getTransmiterDataById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            dbConfig.dbInstance.deviceModel.hasMany(dbConfig.dbInstance.rtsTransmitterModel, { foreignKey: "device_id" });
            const device_id = +req.params.device_id;

            const getData = await dbConfig.dbInstance.deviceModel.findOne({
                where: {
                    device_id: device_id
                },
                include: [{
                    model: dbConfig.dbInstance.rtsTransmitterModel
                }],
                order: [
                    [{ model: dbConfig.dbInstance.rtsTransmitterModel }, 'channel_no', 'ASC']
                ]
            });
            return HttpStatus.OkResponse('Ok', res, getData);

        } catch (error) {
            next(error);
        }
    }

    setChannelMode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel_number, frequency_mode, application_mode, feature_set_mode } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setChannelMode(deviceData, channel_number, frequency_mode, application_mode, feature_set_mode);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            const payload: DataToStore = {
                frequency_mode: frequency_mode,
                application_mode: application_mode,
                feature_set_mode: feature_set_mode
            }
            await this.updatedb(device_id, channel_number, payload);
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    getChannelMode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.getChannelMode(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res, response.data);
        } catch (error) {
            next(error);
        }
    }

    getRtsAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.getRtsAddress(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res, response.data);
        } catch (error) {
            next(error);
        }
    }

    setIp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setIp(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res);

        } catch (error) {
            next(error);
        }
    }

    setSunAuto = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, sun_mode } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const status = sun_mode == 'on' ? 0 : 1;
            const response = await this.transmiterActionService.setSunAuto(deviceData, status);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            await dbConfig.dbInstance.deviceModel.update({ sun_mode: sun_mode }, { where: { device_id: device_id } });
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    controlPosition = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel, function_type } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.controlPosition(deviceData, channel, function_type);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    sendTiltCommand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel, function_type, tilt_amplitude } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.controlTilt(deviceData, channel, function_type, tilt_amplitude);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    sendDimCommand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel, function_type, dim_amplitude } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.controlDimension(deviceData, channel, function_type, dim_amplitude);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    setTiltFrameCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel, tilt_frame_us, tilt_frame_ce } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setTiltFrameCount(deviceData, channel, tilt_frame_us, tilt_frame_ce);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            const payload: DataToStore = {
                tilt_frame_us: tilt_frame_us,
                tilt_frame_ce: tilt_frame_ce
            }
            await this.updatedb(device_id, channel, payload);
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    getTiltFrameCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.getTiltFrameCount(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res, response.data);
        } catch (error) {
            next(error);
        }
    }

    setDimFrameCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel, dim_frame } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setDimFrameCount(deviceData, channel, dim_frame);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            const payload: DataToStore = {
                dim_frame: dim_frame
            }
            await this.updatedb(device_id, channel, payload);
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    getDimFrameCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.getDimFrameCount(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res, response.data);
        } catch (error) {
            next(error);
        }
    }

    setDctLock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, index, isLocked } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setDctLock(deviceData, index, isLocked);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            const device = await dbConfig.dbInstance.deviceModel.findOne({ where: { device_id: device_id } });
            if (device) {
                const currentLock = device.dct_lock || [];
                const getIndex = currentLock.findIndex((item: any) => item.index == index);
                if (getIndex > -1) {
                    currentLock[getIndex].isLocked = isLocked;
                } else {
                    currentLock.push({ index: index, isLocked: isLocked });
                }
                await device.update({ dct_lock: currentLock });
            }
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    getDctLock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id } = req.params;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(+device_id);

            const response = await this.transmiterActionService.getDctLock(deviceData);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res, response.data);
        } catch (error) {
            next(error);
        }
    }

    setRtsAddressChange = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setRtsAddressChange(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);

            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    setChannel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setChannel(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    setOpenProg = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { device_id, channel } = req.body;
            const deviceData: DeviceModel = await this.commonService.getDevicedataForCommand(device_id);

            const response = await this.transmiterActionService.setOpenProg(deviceData, channel);
            if (response.isError) return HttpStatus.BadRequestResponse(response.message, res);
            return HttpStatus.OkResponse(response.message, res);
        } catch (error) {
            next(error);
        }
    }

    updatedb = async (device_id: number, channel_no: number, payload: DataToStore) => {
        const rtsData = await dbConfig.dbInstance.rtsTransmitterModel.findOne({ where: { device_id: device_id, channel_number: channel_no } });
        if (rtsData) {
            await rtsData.update(payload);
        } else {
            await dbConfig.dbInstance.rtsTransmitterModel.create({ device_id: device_id, channel_number: channel_no, ...payload });
        }
    }
}