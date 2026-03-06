import { getSubNodeTypeName } from "../helpers/util.ts";
import type { DeviceModel, DeviceResponse } from "../interface/device.ts";
import type { Device, RoomWiseMotor } from "../interface/project.ts";
export const GLYDEA_SUB_NODE_ID = 5039367;


export class FloorService {
    constructor() { }
    formatFloorData(floorData: any) {
        return new Promise((resolve, reject) => {
            let floors: any[] = [];
            floorData.forEach((floor: any) => {
                let rooms: any[] = [];
                // order floor.tbl_rooms by disp_order
                floor.tbl_rooms?.sort((a: any, b: any) => {
                    return a.disp_order - b.disp_order;
                });
                floor.tbl_rooms.forEach((room: any) => {
                    let device: any[] = [];
                    room.tbl_devices?.sort((a: any, b: any) => {
                        return a.disp_order - b.disp_order;
                    });
                    room.tbl_devices.forEach((motor: any) => {
                        let deviceObj: any = {
                            id: motor.device_id,
                            name: motor.name,
                            device_type: motor.device_type,
                            type: 'device',
                            address: motor.address,
                            model_no: motor.model_no,
                            parent_id: room.room_id,
                            floor_id: floor.floor_id,
                            key_count: motor.key_count,
                            group_count: motor.group_count,
                            is_limit_set: motor.is_limit_set,
                            sub_node_id: motor.sub_node_id,
                            isGlydea: motor.sub_node_id == GLYDEA_SUB_NODE_ID,
                            disp_order: motor.disp_order,
                        };
                        device.push(deviceObj);
                    });
                    let roomObj: any = {
                        id: room.room_id,
                        name: room.name,
                        type: "room",
                        child: device,
                        parent_id: floor.floor_id,
                        count: room.tbl_devices.length
                    };
                    // if (!device?.length) delete roomObj.child;
                    rooms.push(roomObj);
                });
                let floorObj: any = {
                    id: floor.floor_id,
                    name: floor.name,
                    type: "floor",
                    child: rooms,
                    parent_id: null,
                    count: floor.tbl_rooms.length
                };
                // if (!rooms?.length) delete floorObj.child;
                floors.push(floorObj);
            });
            resolve(floors);
        });
    }

    formatRoomDataForDropdown(floorData: any) {
        return new Promise((resolve, reject) => {
            let rooms: any[] = [];
            floorData.forEach((floor: any) => {
                rooms.push({
                    floor: floor.name,
                    room: []
                });
                floor.tbl_rooms.forEach((room: any) => {
                    rooms[rooms.length - 1].room.push({
                        id: room.room_id,
                        name: room.name
                    });
                });
            });
            resolve(rooms);
        });
    }

    formatMotorData(floorData: any) {
        return new Promise((resolve, reject) => {
            let response_arr: RoomWiseMotor[] = [];
            floorData.forEach((floor: any) => {
                floor.tbl_rooms.forEach((room: any) => {
                    response_arr.push({
                        room_name: room.name,
                        device: []
                    });
                    room.tbl_devices.forEach((motor: any) => {
                        let deviceObj: Device = {
                            id: motor.device_id,
                            name: motor.name + ' (' + motor.address + ')',
                            address: motor.address
                        };
                        response_arr[response_arr.length - 1].device.push(deviceObj);
                    });
                });
            });
            resolve(response_arr);
        });
    }

    formatDeviceData(deviceData: DeviceModel[]) {
        const response = this.groupByNodetype(deviceData);
        return response;
    }

    private groupByNodetype(data: any) {
        var list = data.reduce((r: any, a: any) => {
            r[a.sub_node_id ? a.sub_node_id : a.model_no] = [...r[a.sub_node_id ? a.sub_node_id : a.model_no] || [], a];
            return r;
        }, {});
        let find_list = [];
        for (const key in list) {
            if (Object.prototype.hasOwnProperty.call(list, key)) {
                list[key].winking = false;
                const element = list[key];
                const sub_node_name = getSubNodeTypeName(element[0].sub_node_id);
                find_list.push({
                    id: key,
                    name: sub_node_name ?? element[0].model_name,
                    child: element,
                    count: element.length,
                    type: 'node_type'
                });
            }
        }
        return find_list;
    }

}