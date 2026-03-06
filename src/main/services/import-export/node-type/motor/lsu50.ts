import type { DeviceModel } from "../../../../interface/device.ts";
import type { motorDataObj } from "../../../../interface/import-export.interface.ts";
import { GenericImportExportFunctions } from "./generic.ts";



export class lsu50ImportExportFunctions extends GenericImportExportFunctions {

    protected async setExtendedSettingData(motorDataObj: motorDataObj, deviceData: DeviceModel) {
        try {
            const setcalibration = await this.motorActionService.setCalibration(deviceData);
            if (setcalibration.isError) throw new Error('Failed to set motor calibration');
        } catch (error) {
            throw error;
        }
    }

}