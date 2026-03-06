import { Socket_Events } from "../../helpers/constant.ts";
import type { DeviceModel } from "../../interface/device";
import type { ExportDeviceContext, ImportDeviceContext, ImportExportJob } from "../../interface/import-export.interface.ts";
import { dbConfig } from "../../models/index.ts";
import SocketService from "../socket.service.ts";
import { ExportRunner } from "./export.runner.ts";


export class ImportExportManager {
    private static job?: ImportExportJob;
    private static runner?: any;
    private static starting: boolean = false;

    async startExport() {
        try {
            if (ImportExportManager.starting) {
                throw new Error('Export is already starting');
            }
            ImportExportManager.starting = true;

            if (ImportExportManager.job?.status === 'running') {
                throw new Error('Import already in progress');
            }

            ImportExportManager.job = undefined;
            ImportExportManager.runner = undefined;

            const devices: DeviceModel[] = await dbConfig.dbInstance.deviceModel.findAll();

            ImportExportManager.job = {
                status: 'running',
                currentIndex: 0,
                devices: devices.map((d: DeviceModel) => this.DeviceContextForExport(d)),
            }

            SocketService.emit(Socket_Events.EXPORT_DEVICES, ImportExportManager.job.devices);

            ImportExportManager.runner = new ExportRunner(ImportExportManager.job);
            ImportExportManager.runner.runExport();
        } finally {
            ImportExportManager.starting = false;
        }
    }

    pauseExport() {
        if (ImportExportManager.job) ImportExportManager.job.status = 'pause';
    }

    resumeExport() {
        if (ImportExportManager.job && ImportExportManager.job.status === 'pause') {
            ImportExportManager.job.status = 'running';
            ImportExportManager.runner.runExport();
        }
    }

    retryExport(device_id: number, step: 'ip' | 'group' | 'setting') {
        const device = ImportExportManager.job?.devices.find((d: any) => d.device_id === device_id);
        if (!device) return;

        device.status[step] = 'pending';
        ImportExportManager.runner.retryFailedExport(device, step);
    }

    closeImportExport() {
        if (ImportExportManager.job) ImportExportManager.job.status = 'close';
        setTimeout(() => {
            ImportExportManager.runner = undefined;
            ImportExportManager.job = undefined;
            ImportExportManager.starting = false;
        }, 100);
    }

    private DeviceContextForExport(device: DeviceModel): ExportDeviceContext {
        return {
            device_id: device.device_id,
            device_type: device.device_type,
            name: device.name,
            address: device.address,
            model_no: device.model_no,
            sub_node_id: device.sub_node_id,
            status: {
                ip: 'pending',
                group: 'pending',
                setting: 'pending',
            }
        }
    }

    async startImport() {
        if (ImportExportManager.starting) {
            throw new Error('Import is already starting');
        }
        ImportExportManager.starting = true;

        if (ImportExportManager.job?.status === 'running') {
            throw new Error('Import already in progress');
        }

        ImportExportManager.job = undefined;
        ImportExportManager.runner = undefined;

        const devices: DeviceModel[] = await dbConfig.dbInstance.deviceModel.findAll();

        ImportExportManager.job = {
            status: 'running',
            currentIndex: 0,
            devices: await Promise.all(devices.map(async (d: DeviceModel) => await this.DeviceContextForImport(d))),
        }

        SocketService.emit(Socket_Events.IMPORT_DEVICES, ImportExportManager.job.devices);

        ImportExportManager.runner = new ExportRunner(ImportExportManager.job);
        ImportExportManager.runner.runImport();
    }

    retryImport(device_id: number, step: 'ip' | 'group' | 'setting') {
        const device = ImportExportManager.job?.devices.find((d: any) => d.device_id === device_id);
        if (!device) return;
        device.status[step] = 'pending';
        ImportExportManager.runner.retryFailedImport(device, step);
    }

    private async DeviceContextForImport(device: any): Promise<ImportDeviceContext> {
        return {
            device_id: device.device_id,
            device_type: device.device_type,
            name: device.name,
            address: device.address,
            model_no: device.model_no,
            sub_node_id: device.sub_node_id,
            status: {
                ip: 'pending',
                group: 'pending',
                setting: 'pending',
            }
        }
    }
} 