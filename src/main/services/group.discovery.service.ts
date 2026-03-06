import { Op } from "sequelize";
import { Socket_Events } from "../helpers/constant.ts";
import type { DeviceModel } from "../interface/device.ts";
import { dbConfig } from "../models/index.ts";
import { GroupActionService } from "./group-action.service.ts";
import SocketService from "./socket.service.ts";

interface DiscoveryOptions {
    devices: DeviceModel[];
    groupDeviceMaps: any[];
    onProgress?: (info: { deviceIndex: number; deviceCount: number; groupIndex: number; groupCount: number }) => void;
    shouldStop?: () => boolean;
}

let isDiscoveringGroups = false;
let shouldStopDiscovery = false;

export class GroupDiscoveryService {

    private groupActionService = new GroupActionService();

    public stopGroupDiscovery() {
        shouldStopDiscovery = true;
        console.log('Group discovery stopped by user.');
    }

    public async discoverGroups() {
        if (isDiscoveringGroups) {
            console.log('Group discovery is already in progress.');
            SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: 'Group discovery is already in progress.', status: 'error' });
            return {
                isError: true,
                message: 'Group discovery is already in progress.'
            };
        }

        isDiscoveringGroups = true;

        try {
            SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: 'Starting group discovery process...', status: 'start' });

            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" });
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.deviceModel, { foreignKey: "device_id" });
            const getAllMotorLst = await dbConfig.dbInstance.deviceModel.findAll({
                where: {
                    device_type: { [Op.in]: ['motor', 'rts-receiver'] }
                },
                order: [['disp_order', 'ASC']],
                raw: true
            });

            const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                order: [['group_id', 'ASC']],
                include: [
                    {
                        model: dbConfig.dbInstance.groupModel,
                        attributes: ['group_id', 'name', 'address']
                    },
                    {
                        model: dbConfig.dbInstance.deviceModel,
                        attributes: ['device_id', 'name', 'address', 'model_no', 'device_type'],
                        where: {
                            device_type: {
                                [Op.ne]: 'rts-receiver'
                            }
                        }
                    }
                ]
            });

            await this.discoveryGroupsCore({
                devices: getAllMotorLst,
                groupDeviceMaps: get_group_device,
                shouldStop: () => shouldStopDiscovery,
                onProgress: ({ deviceIndex, deviceCount, groupIndex, groupCount }) => {
                    SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, {
                        message: `Scanning Group ${groupIndex}/${groupCount} in Motors (${deviceIndex}/${deviceCount})`,
                        status: 'progress'
                    });
                }
            });

            if (shouldStopDiscovery) {
                SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: 'Group discovery process was stopped.', status: 'stopped' });
                return;
            }

            SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: 'Group discovery process completed.', status: 'completed' });
            return {
                isError: false,
                message: 'Group discovery completed.',
            };
        } catch (error) {
            console.error('Error during group discovery:', error);
            SocketService.emit(Socket_Events.GROUP_DISCOVERY_INFO, { message: (error as Error).message || "Error during group discovery process.", status: 'error' });
            return {
                isError: true,
                message: 'Error during group discovery.'
            }
        } finally {
            isDiscoveringGroups = false;
            shouldStopDiscovery = false;
        }
    }

    public async discoverGroupsForDevice(device_id: number) {
        try {
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.groupModel, { foreignKey: "group_id" });
            dbConfig.dbInstance.groupDeviceMapModel.belongsTo(dbConfig.dbInstance.deviceModel, { foreignKey: "device_id" });
            const getDevice = await dbConfig.dbInstance.deviceModel.findOne({
                attributes: ['device_id', 'address', 'model_no', 'sub_node_id'],
                where: { device_id: device_id },
                raw: true
            });
            if (!getDevice) throw new Error('Motor device not found');

            const get_group_device = await dbConfig.dbInstance.groupDeviceMapModel.findAll({
                where: { device_id: device_id },
                order: [['group_id', 'ASC']],
                include: [
                    {
                        model: dbConfig.dbInstance.groupModel,
                        attributes: ['group_id', 'name', 'address']
                    },
                    {
                        model: dbConfig.dbInstance.deviceModel,
                        attributes: ['device_id', 'name', 'address', 'model_no', 'device_type']
                    }
                ]
            });

            await this.discoveryGroupsCore({
                devices: [getDevice],
                groupDeviceMaps: get_group_device,
            });

        } catch (error) {
            throw error;
        }
    }

    private async discoveryGroupsCore(options: DiscoveryOptions) {
        const { devices, groupDeviceMaps, onProgress, shouldStop } = options;

        const existingMap = new Map<string, any>();
        const deletableIds = new Set<number>();

        for (const row of groupDeviceMaps) {
            const key = `${row.device_id}_${row.tbl_group.address}`;
            existingMap.set(key, row);
            deletableIds.add(row.group_device_map_id);
        }

        const newlyDiscoveredGroups: { device_id: number, group_address: string, group_index: number }[] = [];

        for (let i = 0; i < devices.length; i++) {
            if (shouldStop?.()) break;

            const deviceData: DeviceModel = {
                device_id: devices[i].device_id,
                device_type: devices[i].device_type,
                name: devices[i].name,
                address: devices[i].address,
                model_no: devices[i].model_no,
                sub_node_id: devices[i].sub_node_id,
            }

            // const startIndex = (deviceData.model_no == 6 || deviceData.model_no == 13) ? 1 : 0; // For Glydea start from index 1
            // const endIndex = (deviceData.model_no == 6) ? 16 : deviceData.model_no == 13 ? 5 : 15;
            const startIndex = deviceData.model_no == 13 ? 1 : 0;
            const endIndex = deviceData.model_no == 13 ? 5 : 15;

            for (let j = startIndex; j <= endIndex; j++) {
                if (shouldStop?.()) break;

                const getGroup = await this.groupActionService.getMotorGroupByIndex(deviceData, j);
                if (getGroup.isError) throw new Error(getGroup.message);

                if (!getGroup.isError && getGroup.data.group_address && !(/^0+$/.test(getGroup.data.group_address))) {
                    // Valid group found
                    const key = `${deviceData.device_id}_${getGroup.data.group_address}`;
                    const existGroup = existingMap.get(key);
                    if (existGroup) {
                        // Remove from deletable list as it still exists
                        deletableIds.delete(existGroup.group_device_map_id);
                    } else {
                        newlyDiscoveredGroups.push({
                            device_id: deviceData.device_id,
                            group_address: getGroup.data.group_address,
                            group_index: getGroup.data.group_index
                        })
                    }
                }

                onProgress?.({
                    deviceIndex: i + 1,
                    deviceCount: devices.length,
                    groupIndex: j - startIndex + 1,
                    groupCount: endIndex - startIndex + 1
                });
            }
        }
        // Delete groups that were not found during discovery
        if (deletableIds.size > 0) {
            await dbConfig.dbInstance.groupDeviceMapModel.destroy({
                where: {
                    group_device_map_id: Array.from(deletableIds)
                }
            });
        }

        for (const data of newlyDiscoveredGroups) {
            const group = await dbConfig.dbInstance.groupModel.findOrCreate({
                where: { address: data.group_address },
                defaults: {
                    name: `Group-${data.group_address}`,
                    address: data.group_address
                },
                raw: true
            });

            await dbConfig.dbInstance.groupDeviceMapModel.create({
                group_id: group[0].group_id,
                device_id: data.device_id,
                device_group_pos: data.group_index
            });
        }
    }
}