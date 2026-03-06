import type { DeviceModel } from "../../../../interface/device.ts";
import type { ExportDeviceContext, motorDataObj } from "../../../../interface/import-export.interface.ts";
import { GenericImportExportFunctions } from "./generic.ts";


export class glydeaImportExportFunctions extends GenericImportExportFunctions {

    protected async extendedSettingData(deviceContext: ExportDeviceContext, deviceData: DeviceModel) {
        try {
            const rollingSpeedData = await this.motorActionService.getMotorRollingSpeed(deviceData);
            if (rollingSpeedData.isError) throw new Error('Failed to get motor rolling speed');

            const localUIData = (await this.motorActionService.getMotorLedStatus(deviceData));
            if (localUIData.isError) throw new Error('Failed to get motor LED status');

            const dctModeData = (await this.motorActionService.getDCTMode(deviceData));
            if (dctModeData.isError) throw new Error('Failed to get DCT mode');

            const touchMotionSensitivityData = (await this.motorActionService.getTouchMotionSensitivity(deviceData));
            if (touchMotionSensitivityData.isError) throw new Error('Failed to get touch motion sensitivity');
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

            const localUIData = motorDataObj.local_ui;
            if (localUIData?.length) {
                const status = localUIData[0]
                const priority = localUIData[2]
                const setLocalUI = await this.motorActionService.setMotorLedStatus(deviceData, status, priority);
                if (setLocalUI.isError) throw new Error('Failed to set motor LED status');
            }

            const dctMode = motorDataObj.dct_mode;
            if (dctMode) {
                const setDCTMode = await this.motorActionService.setDCTMode(deviceData, dctMode);
                if (setDCTMode.isError) throw new Error('Failed to set DCT mode');
            }

            const touchMotionSensitivityData = motorDataObj.touch_motion_sensitivity;
            if (touchMotionSensitivityData?.length) {
                const setTouchMotionSensitivity = await this.motorActionService.setTouchMotionSensitivity(deviceData, touchMotionSensitivityData[0], touchMotionSensitivityData[1]);
                if (setTouchMotionSensitivity.isError) throw new Error('Failed to set touch motion sensitivity');
            }

        } catch (error) {
            throw error;
        }
    }

}