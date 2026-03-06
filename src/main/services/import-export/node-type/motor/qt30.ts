import type { DeviceModel } from "../../../../interface/device.ts";
import type { ExportDeviceContext, motorDataObj } from "../../../../interface/import-export.interface.ts";
import { GenericImportExportFunctions } from "./generic.ts";


export class qt30ImportExportFunctions extends GenericImportExportFunctions {

    protected async extendedSettingData(deviceContext: ExportDeviceContext, deviceData: DeviceModel) {
        try {
            const rollingSpeedData = await this.motorActionService.getMotorRollingSpeed(deviceData);
            if (rollingSpeedData.isError) throw new Error('Failed to get motor rolling speed');
        } catch (error) {
            throw error;
        }
    }

    protected async setExtendedSettingData(motorDataObj: motorDataObj, deviceData: DeviceModel) {
        try {
            const { up_speed, down_speed, slow_speed } = motorDataObj;
            if (up_speed !== null && down_speed !== null && slow_speed !== null) {
                const setRollingSpeed = await this.motorActionService.setMotorRollingSpeed(deviceData, up_speed, down_speed, slow_speed);
                if (setRollingSpeed.isError) throw new Error('Failed to set motor rolling speed');
            }
        } catch (error) {
            throw error;
        }
    }
}