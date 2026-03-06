import type { DeviceModel } from "../../../../interface/device.ts";
import type { ImportDeviceContext, ExportDeviceContext } from "../../../../interface/import-export.interface.ts";
import { dbConfig } from "../../../../models/index.ts";
import { GroupActionService } from "../../../group-action.service.ts";
import { GroupDiscoveryService } from "../../../group.discovery.service.ts";
import { ReceiverActionService } from "../../../receiver-action.service.ts";


export class ReceiverImportExportFunctions {

    receiverActionService = new ReceiverActionService();
    groupActionService = new GroupActionService();
    groupDiscoveryService = new GroupDiscoveryService();

    protected async fetchIpData(deviceContext: ExportDeviceContext) {
        deviceContext.status.ip = 'n/a';
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
            const getStatus = await this.receiverActionService.getAllChannelStatus(deviceData);
            if (getStatus.isError) throw new Error('Failed to get receiver channel status');

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
        try {
            const deviceData: DeviceModel = {
                device_id: deviceContext.device_id,
                name: deviceContext.name,
                address: deviceContext.address,
                device_type: deviceContext.device_type,
                model_no: deviceContext.model_no,
                sub_node_id: deviceContext.sub_node_id,
            }

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

            const channelData = await dbConfig.dbInstance.rtsReceiverModel.findAll({
                attributes: ['channel_no', 'is_configure'],
                where: { device_id: deviceData.device_id },
                order: [['channel_no', 'ASC']],
                raw: true
            });

            for (const channel of channelData) {
                const index = channel.channel_no;
                let action: 'config' | 'delete' | null = null;
                switch (channel.is_configure) {
                    case 0:
                        action = 'delete';
                        break;
                    case 1:
                        action = 'config';
                        break;
                }
                if (!action) continue;
                const channelData = await this.receiverActionService.controlChannel(deviceData, index, action);
                if (channelData.isError) throw new Error(`Receiver channel restoring failed: ${channelData.message}`);
            }

            deviceContext.status.setting = 'success';

        } catch (error) {
            deviceContext.status.setting = 'failed';
            console.log('error: ', error);
        }
    }

}