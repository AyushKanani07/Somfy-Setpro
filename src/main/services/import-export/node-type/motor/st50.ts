import type { RampSetting } from "../../../../interface/command.interface.ts";
import type { DeviceModel } from "../../../../interface/device.ts";
import type { ExportDeviceContext, motorDataObj } from "../../../../interface/import-export.interface.ts";
import { GenericImportExportFunctions } from "./generic.ts";


export class st50ImportExportFunctions extends GenericImportExportFunctions {

    protected async extendedSettingData(deviceContext: ExportDeviceContext, deviceData: DeviceModel) {
        try {
            const rollingSpeedData = await this.motorActionService.getMotorRollingSpeed(deviceData);
            if (rollingSpeedData.isError) throw new Error('Failed to get motor rolling speed');

            const getRampTime = await this.motorActionService.getMotorRampTime(deviceData);
            if (getRampTime.isError) throw new Error('Failed to get motor ramp time');

            const getTorqueLimit = await this.motorActionService.getTorqueLimitation(deviceData);
            if (getTorqueLimit.isError) throw new Error('Failed to get motor torque limitation');
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

            const rampData = motorDataObj.ramp;
            if (rampData?.length) {
                const rampTimePayload: any = {
                    start_status_up: rampData[0] == 1 ? true : false,
                    start_value_up: rampData[1],
                    stop_status_up: rampData[2] == 1 ? true : false,
                    stop_value_up: rampData[3],
                    start_status_down: rampData[4] == 1 ? true : false,
                    start_value_down: rampData[5],
                    stop_status_down: rampData[6] == 1 ? true : false,
                    stop_value_down: rampData[7]
                };
                const startUp: RampSetting = {
                    enabled: rampTimePayload.start_status_up,
                    value: rampTimePayload.start_value_up,
                    ramp_key: 'start_up'
                }
                const rampStartUp = await this.motorActionService.saveMotorRampTime(deviceData, startUp);
                if (rampStartUp.isError) throw new Error('Failed to set motor ramp time');

                const stopUp: RampSetting = {
                    enabled: rampTimePayload.stop_status_up,
                    value: rampTimePayload.stop_value_up,
                    ramp_key: 'stop_up'
                }
                const rampStopUp = await this.motorActionService.saveMotorRampTime(deviceData, stopUp);
                if (rampStopUp.isError) throw new Error('Failed to set motor ramp time');

                const startDown: RampSetting = {
                    enabled: rampTimePayload.start_status_down,
                    value: rampTimePayload.start_value_down,
                    ramp_key: 'start_down'
                }
                const rampStartDown = await this.motorActionService.saveMotorRampTime(deviceData, startDown);
                if (rampStartDown.isError) throw new Error('Failed to set motor ramp time');

                const stopDown: RampSetting = {
                    enabled: rampTimePayload.stop_status_down,
                    value: rampTimePayload.stop_value_down,
                    ramp_key: 'stop_down'
                }
                const rampStopDown = await this.motorActionService.saveMotorRampTime(deviceData, stopDown);
                if (rampStopDown.isError) throw new Error('Failed to set motor ramp time');
            }

            const torqueData = motorDataObj.torque;
            if (torqueData?.length) {
                const torqueStatus = torqueData[0];
                const torqueLevel = torqueData[1];
                const setTorqueLimit = await this.motorActionService.setTorqueLimitation(deviceData, torqueStatus, torqueLevel);
                if (setTorqueLimit.isError) throw new Error('Failed to set motor torque limitation');
            }
        } catch (error) {
            throw error;
        }
    }

}