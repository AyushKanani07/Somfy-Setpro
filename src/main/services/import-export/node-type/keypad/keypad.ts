import type { DeviceModel } from "../../../../interface/device.ts";
import type { ImportDeviceContext, ExportDeviceContext, keypadDataObj } from "../../../../interface/import-export.interface.ts";
import type { IndividualSwitchGroup, SwitchSettings } from "../../../../interface/keypad.interface.ts";
import { dbConfig } from "../../../../models/index.ts";
import { KeypadActionService } from "../../../keypad-action.service.ts";


export class KeypadImportExportFunctions {

    keypadActionService = new KeypadActionService();

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

            const switchSettingData = await this.keypadActionService.getAllSwitchSettings(deviceData.device_id);
            if (switchSettingData.isError) throw new Error('Failed to get keypad switch settings');

            const switchGroupData = await this.keypadActionService.getIndividualSwitchGroups(deviceData);
            if (switchGroupData.isError) throw new Error('Failed to get keypad individual switch groups');

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

            const keypadData = await dbConfig.dbInstance.keypadModel.findAll({ where: { device_id: deviceData.device_id } });
            let processedKeypadData: SwitchSettings[] = [];
            let switch_group: any = {};
            keypadData.forEach((kd: any) => {
                processedKeypadData.push({
                    id: kd.key_no,
                    press_command: kd.press_command,
                    press_value: kd.press_value,
                    press_extra_value: kd.press_extra_value,
                    press_addr_code: kd.addr_code,
                    press_target_addr: kd.target_address,
                    hold_command: kd.hold_command,
                    hold_value: kd.hold_value,
                    hold_extra_value: kd.hold_extra_value,
                    hold_addr_code: kd.addr_code,
                    hold_target_addr: kd.target_address,
                    release_command: kd.release_command,
                    release_value: kd.release_value,
                    release_extra_value: kd.release_extra_value,
                    release_addr_code: kd.addr_code,
                    release_target_addr: kd.target_address,
                });

                switch_group[`sw${kd.key_no}_group_addr`] = kd.group_address ?? '000000';
            });

            const keypadDataObj: keypadDataObj = {
                keypad_data: processedKeypadData,
                individual_switch_group: switch_group as IndividualSwitchGroup,
            }

            for (let i = 0; i < keypadDataObj.keypad_data.length; i++) {
                const payload = keypadDataObj.keypad_data[i];
                const setSwitchRes = await this.keypadActionService.setSwitchSettings(deviceData, payload);
                if (setSwitchRes.isError) throw new Error(`Keypad parameter restoring failed: ${setSwitchRes.message}`);
            }

            const switchGroup = keypadDataObj.individual_switch_group;
            const setSwitchGroupRes = await this.keypadActionService.setIndividualSwitchGroup(deviceData, switchGroup);
            if (setSwitchGroupRes.isError) throw new Error(`Keypad parameter restoring failed: ${setSwitchGroupRes.message}`);

            deviceContext.status.setting = 'success';

        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

}