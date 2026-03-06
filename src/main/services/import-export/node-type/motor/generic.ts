import type { DeviceModel } from "../../../../interface/device.ts";
import type { ImportDeviceContext, ExportDeviceContext, motorDataObj } from "../../../../interface/import-export.interface.ts";
import type { NetworkConfigSetting } from "../../../../interface/motor.interface.ts";
import { dbConfig } from "../../../../models/index.ts";
import { GroupActionService } from "../../../group-action.service.ts";
import { GroupDiscoveryService } from "../../../group.discovery.service.ts";
import { MotorActionService } from "../../../motor-action.service.ts";


export class GenericImportExportFunctions {
    motorActionService = new MotorActionService();
    groupActionService = new GroupActionService();
    groupDiscoveryService = new GroupDiscoveryService();

    protected async fetchIpData(deviceContext: ExportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }

            await this.motorActionService.getMotorIps(deviceData);
            deviceContext.status.ip = 'success';

        } catch (error) {
            deviceContext.status.ip = 'failed';
            console.log('error: ', error);
        }
    }

    protected async fetchGroupData(deviceContext: ExportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }

            await this.groupDiscoveryService.discoverGroupsForDevice(deviceData.device_id);
            deviceContext.status.group = 'success';
        } catch (error) {
            deviceContext.status.group = 'failed';
            console.log('error: ', error);
        }
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
            const positionData = await this.motorActionService.getMotorPosition(deviceData);
            if (positionData.isError) throw new Error('Failed to get motor position');

            const directionData = await this.motorActionService.getMotorDirection(deviceData);
            if (directionData.isError) throw new Error('Failed to get motor direction');

            const labelData = await this.motorActionService.getMotorLabel(deviceData);
            if (labelData.isError) throw new Error('Failed to get motor label');

            const appModeData = await this.motorActionService.getAppMode(deviceData);
            if (appModeData.isError) throw new Error('Failed to get app mode');

            const networkLockData = await this.motorActionService.getNetworkLock(deviceData);
            if (networkLockData.isError) throw new Error('Failed to get network lock');

            const networkConfigData = await this.motorActionService.getNetworkConfig(deviceData);
            if (networkConfigData.isError) throw new Error('Failed to get network config');

            await this.extendedSettingData(deviceContext, deviceData);
            deviceContext.status.setting = 'success';
        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

    protected async extendedSettingData(deviceContext: ExportDeviceContext, deviceData: DeviceModel) {
        return;
    }

    protected async setIpData(deviceContext: ImportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }
            const motorData = await dbConfig.dbInstance.motorModel.findOne({ where: { device_id: deviceData.device_id }, attributes: ['ip_data'] });

            for (let i = 0; i < motorData.ip_data?.length; i++) {
                const ip_value = motorData.ip_data[i];
                if (ip_value.pulse === 65535) continue; // skip unassigned IPs
                const ipData = await this.motorActionService.setMotorIp(deviceData, 'pos_pulse', ip_value.index, ip_value.pulse, undefined, false);
                if (ipData.isError) throw new Error(`Motor parameter restoring failed: ${ipData.message}`);
            }

            deviceContext.status.ip = 'success';

        } catch (error) {
            deviceContext.status.ip = 'failed';
            console.log('error: ', error);
        }
    }

    protected async setGroupData(deviceContext: ImportDeviceContext) {
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }

            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" });
            const groupDeviceMap = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                attributes: ['group_id', 'device_id', 'device_group_pos'],
                where: { device_id: deviceData.device_id },
                include: [{
                    model: dbConfig.dbInstance.groupModel,
                    attributes: ['group_id', 'name', 'address']
                }]
            });
            for (const map of groupDeviceMap) {
                if (!map.tbl_group.address || /^0+$/.test(map.tbl_group.address)) continue;
                const groupData = await this.groupActionService.setMotorGroup(deviceData, map.tbl_group.address, map.device_group_pos);
                if (groupData.isError) throw new Error(`Motor parameter restoring failed: ${groupData.message}`);
            }

            deviceContext.status.group = 'success';

        } catch (error) {
            deviceContext.status.group = 'failed';
            console.log('error: ', error);
        }
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

            const motorData = await dbConfig.dbInstance.motorModel.findOne({ where: { device_id: deviceData.device_id } });
            const motorDataObj = {
                pos_per: motorData.pos_per,
                direction: motorData.direction,
                app_mode: motorData.app_mode,
                down_limit: motorData.down_limit,
                up_speed: motorData.up_speed,
                down_speed: motorData.down_speed,
                slow_speed: motorData.slow_speed,
                ramp: motorData.ramp,
                network_lock: motorData.network_lock,
                network_config: motorData.network_config,
                local_ui: motorData.local_ui,
                torque: motorData.torque,
                dct_mode: motorData.dct_mode,
                touch_motion_sensitivity: motorData.touch_motion_sensitivity
            }

            if (motorDataObj.direction !== null) {
                const directionSet = await this.motorActionService.setMotorDirection(deviceData, motorDataObj.direction);
                if (directionSet.isError) throw new Error('Failed to set motor direction');
            }

            const device = await dbConfig.dbInstance.deviceModel.findOne({
                attributes: ['name'],
                where: { device_id: deviceData.device_id },
                raw: true
            });
            if (device.name) {
                const labelData = await this.motorActionService.setMotorLabel(deviceData, device.name);
                if (labelData.isError) throw new Error(`Motor parameter restoring failed: ${labelData.message}`);
            }

            if (motorDataObj.network_lock !== null && motorDataObj.network_lock?.length >= 3) {
                const lockStatus = motorDataObj.network_lock[0] == 1 ? true : false;
                const lockPriority = motorDataObj.network_lock[2]
                const setNetworkLock = await this.motorActionService.setNetworkLock(deviceData, lockStatus, lockPriority);
                if (setNetworkLock.isError) throw new Error('Failed to set network lock');
            }

            if (motorDataObj.network_config !== null && motorDataObj.network_config?.length >= 5) {
                const networkConfigPayload: NetworkConfigSetting = {
                    brodcast_mode: motorDataObj.network_config[0],
                    brodcast_random_value: motorDataObj.network_config[1],
                    supervision_active: motorDataObj.network_config[2],
                    supervision_timeperiod: motorDataObj.network_config[3],
                    deaf_mode: motorDataObj.network_config[4]
                }
                const setNetworkConfig = await this.motorActionService.setMotorConfig(deviceData, networkConfigPayload);
                if (setNetworkConfig.isError) throw new Error('Failed to set network config');
            }

            await this.setExtendedSettingData(motorDataObj, deviceData);
            deviceContext.status.setting = 'success';

        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

    protected async setExtendedSettingData(motorDataObj: motorDataObj, deviceData: DeviceModel) {
        return;
    }

}