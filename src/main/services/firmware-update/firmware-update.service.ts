import { Socket_Events } from "../../helpers/constant.ts";
import SocketService from "../socket.service.ts";
import { ST30FirmwareStep } from "./node-type/st30.step.ts";
import { GlydeaFirmwareStep } from "./node-type/glydea.step.ts";
import { LSU40FirmwareStep } from "./node-type/lsu40.step.ts";
import { LSU50FirmwareStep } from "./node-type/lsu50.step.ts";
import { QT30FirmwareStep } from "./node-type/qt30.step.ts";
import { ST40FirmwareStep } from "./node-type/st40.step.ts";
import { ST50FirmwareStep } from "./node-type/st50.step.ts";
import { dbConfig } from "../../models/index.ts";
import type { DeviceModel } from "../../interface/device.ts";

let isFirmwareProcessing: boolean = false;
export class FirmwareUpdateService {
    private lst_instance: { [key: number]: any };

    constructor() {
        this.lst_instance = {
            5039367: new GlydeaFirmwareStep(),
            5132734: new LSU40FirmwareStep(),
            5071757: new LSU50FirmwareStep(),
            5063313: new ST30FirmwareStep(),
            5157730: new QT30FirmwareStep(),
            0x0a: new ST40FirmwareStep(),
            5123276: new ST50FirmwareStep()
        };
    }

    async start(device_id: number, isBricked: boolean, file_name: string) {
        if (isFirmwareProcessing) {
            throw new Error('Firmware update is already in progress');
        };

        const deviceData: DeviceModel = await dbConfig.dbInstance.deviceModel.findOne({
            where: {
                device_id: device_id
            },
            attributes: ['device_id', 'name', 'address', 'device_type', 'model_no', 'sub_node_id'],
            raw: true
        });
        if (!deviceData) {
            throw new Error('Device not found');
        }

        try {
            isFirmwareProcessing = true;
            const instance = this.lst_instance[deviceData.sub_node_id];
            await instance['startFirmwareUpdate'](deviceData, isBricked, file_name);
        } catch (error) {
            isFirmwareProcessing = false;
            throw error;
        }
    }

    static setFirmwareProcessingState(state: boolean) {
        isFirmwareProcessing = state;
    }
}