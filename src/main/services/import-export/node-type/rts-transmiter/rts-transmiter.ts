import { DeviceModel } from "../../../../interface/device";
import type { ImportDeviceContext, ExportDeviceContext } from "../../../../interface/import-export.interface";
import { dbConfig } from "../../../../models";
import { TransmiterActionService } from "../../../transmiter-action.service";


export class TransmiterImportExportFunctions {
    private transmiterActionService = new TransmiterActionService();

    protected async fetchIpData(deviceContext: ExportDeviceContext) {
        deviceContext.status.ip = 'n/a';
    }

    protected async fetchGroupData(deviceContext: ExportDeviceContext) {
        deviceContext.status.group = 'n/a';
    }

    protected async fetchSettingData(deviceContext: ExportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }
            for (let channel = 0; channel <= 15; channel++) {
                const getChannelModeResponse = await this.transmiterActionService.getChannelMode(deviceData, channel);
                if (getChannelModeResponse.isError) throw new Error('Failed to get transmiter channel mode');

                const getTiltFrameCountResponse = await this.transmiterActionService.getTiltFrameCount(deviceData, channel);
                if (getTiltFrameCountResponse.isError) throw new Error('Failed to get transmiter tilt frame count');

                const getDimFrameCountResponse = await this.transmiterActionService.getDimFrameCount(deviceData, channel);
                if (getDimFrameCountResponse.isError) throw new Error('Failed to get transmiter dim frame count');
            }

            const getDctLockResponse = await this.transmiterActionService.getDctLock(deviceData);
            if (getDctLockResponse.isError) throw new Error('Failed to get transmiter DCT lock');

            deviceContext.status.setting = 'success';
        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

    protected async setIpData(deviceContext: ImportDeviceContext) {
        deviceContext.status.ip = 'n/a';
    }

    protected async setGroupData(deviceContext: ImportDeviceContext) {
        deviceContext.status.group = 'n/a';
    }

    protected async setSettingData(deviceContext: ImportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }

            const transmiterData = await dbConfig.dbInstance.rtsTransmitterModel.findAll({ where: { device_id: deviceContext.device_id } });

            for (let data of transmiterData) {
                const setChannelModeResponse = await this.transmiterActionService.setChannelMode(deviceData, data.channel_no, data.frequency_mode, data.application_mode, data.feature_set_mode);
                if (setChannelModeResponse.isError) throw new Error(`Transmiter channel mode restoring failed: ${setChannelModeResponse.message}`);

                const setTiltFrameResponse = await this.transmiterActionService.setTiltFrameCount(deviceData, data.channel_no, data.tilt_frame_us, data.tilt_frame_ce);
                if (setTiltFrameResponse.isError) throw new Error(`Transmiter tilt frame count restoring failed: ${setTiltFrameResponse.message}`);

                const setDimFrameResponse = await this.transmiterActionService.setDimFrameCount(deviceData, data.channel_no, data.dim_frame);
                if (setDimFrameResponse.isError) throw new Error(`Transmiter dim frame count restoring failed: ${setDimFrameResponse.message}`);
            }

            const deviceRecordForTransmiter = await dbConfig.dbInstance.deviceModel.findOne({ where: { device_id: deviceContext.device_id }, attributes: ['dct_lock', 'sun_mode'] });

            for (let data of deviceRecordForTransmiter.dct_lock || []) {
                const setDctLockResponse = await this.transmiterActionService.setDctLock(deviceData, data.index, data.isLocked);
                if (setDctLockResponse.isError) throw new Error(`Transmiter DCT lock restoring failed: ${setDctLockResponse.message}`);
            }

            if (deviceRecordForTransmiter.sun_mode) {
                const setSunModeResponse = await this.transmiterActionService.setSunAuto(deviceData, deviceRecordForTransmiter.sun_mode);
                if (setSunModeResponse.isError) throw new Error(`Transmiter sun mode restoring failed: ${setSunModeResponse.message}`);
            }

            deviceContext.status.setting = 'success';

        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

}