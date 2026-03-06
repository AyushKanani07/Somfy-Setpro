import { Socket_Events } from "../../helpers/constant.ts";
import type { ImportDeviceContext, ExportDeviceContext, ImportExportJob } from "../../interface/import-export.interface.ts";
import SocketService from "../socket.service.ts";
import { GenericImportExportFunctions } from "./node-type/motor/generic.ts";
import { glydeaImportExportFunctions } from "./node-type/motor/glydea.ts";
import { lsu40ImportExportFunctions } from "./node-type/motor/lsu40.ts";
import { lsu50ImportExportFunctions } from "./node-type/motor/lsu50.ts";
import { qt30ImportExportFunctions } from "./node-type/motor/qt30.ts";
import { st30ImportExportFunctions } from "./node-type/motor/st30.ts";
import { st40ImportExportFunctions } from "./node-type/motor/st40.ts";
import { st50ImportExportFunctions } from "./node-type/motor/st50.ts";


export class ExportRunner {
    private job: ImportExportJob;
    private running: boolean = false;
    private lst_instance: { [key: number]: any } = {
        5039367: new glydeaImportExportFunctions(),
        5132734: new lsu40ImportExportFunctions(),
        5071757: new lsu50ImportExportFunctions(),
        5063313: new st30ImportExportFunctions(),
        5157730: new qt30ImportExportFunctions(),
        0x0a: new st40ImportExportFunctions(),
        5123276: new st50ImportExportFunctions()
    };
    private genricImportExportFunctions = new GenericImportExportFunctions();

    constructor(job: ImportExportJob) {
        this.job = job;
    }

    async runExport() {
        if (this.running) return;
        this.running = true;

        this.sendProgressUpdate('export');

        while (this.job.currentIndex < this.job.devices.length) {
            if (['pause', 'close'].includes(this.job.status)) {
                break;
            }

            const deviceContext: ExportDeviceContext = this.job.devices[this.job.currentIndex];
            const instance = this.getInstanceForDevice(deviceContext.sub_node_id, deviceContext.model_no);

            try {
                if (deviceContext.status.ip === 'pending') await instance.fetchIpData(deviceContext);
                if (['pause', 'close'].includes(this.job.status)) {
                    break;
                }
                this.sendDeviceUpdate(deviceContext, 'export');

                if (deviceContext.status.group === 'pending') await instance.fetchGroupData(deviceContext);
                if (['pause', 'close'].includes(this.job.status)) {
                    break;
                }
                this.sendDeviceUpdate(deviceContext, 'export');

                if (deviceContext.status.setting === 'pending') await instance.fetchSettingData(deviceContext);
                this.sendDeviceUpdate(deviceContext, 'export');

                this.sendProgressUpdate('export');
                this.job.currentIndex += 1;

            } catch (error) {
                console.log('error: ', error);
                continue;
            }
        }

        if (this.job.currentIndex == this.job.devices.length) {
            this.job.status = 'complete';
            SocketService.emit(Socket_Events.EXPORT_PROGRESS, { title: `Fetching Device Parameters (Done)`, isCompleted: true });
        }

        this.running = false;
    }

    async runImport() {
        if (this.running) return;
        this.running = true;

        this.sendProgressUpdate('import');

        while (this.job.currentIndex < this.job.devices.length) {
            if (['pause', 'close'].includes(this.job.status)) {
                break;
            }

            const deviceContext: ImportDeviceContext = this.job.devices[this.job.currentIndex];
            const instance = this.getInstanceForDevice(deviceContext.sub_node_id, deviceContext.model_no);

            try {

                await instance.setIpData(deviceContext);
                this.sendDeviceUpdate(deviceContext, 'import');
                if (['pause', 'close'].includes(this.job.status)) {
                    break;
                }

                await instance.setGroupData(deviceContext);
                this.sendDeviceUpdate(deviceContext, 'import');
                if (['pause', 'close'].includes(this.job.status)) {
                    break;
                }

                await instance.setSettingData(deviceContext);
                this.sendDeviceUpdate(deviceContext, 'import');

                this.sendProgressUpdate('import');
                this.job.currentIndex += 1;

            } catch (error) {
                continue;
            }
        }

        if (this.job.currentIndex == this.job.devices.length) {
            this.job.status = 'complete';
            SocketService.emit(Socket_Events.IMPORT_PROGRESS, { title: `Setting Device Parameters (Done)`, isCompleted: true });
        }
        this.running = false;
    }

    async retryFailedExport(deviceContext: ImportDeviceContext | ExportDeviceContext, step: 'ip' | 'group' | 'setting') {
        this.sendDeviceUpdate(deviceContext, 'export');
        const instance = this.getInstanceForDevice(deviceContext.sub_node_id, deviceContext.model_no);

        switch (step) {
            case 'ip':
                await instance.fetchIpData(deviceContext);
                break;
            case 'group':
                await instance.fetchGroupData(deviceContext);
                break;
            case 'setting':
                await instance.fetchSettingData(deviceContext);
                break;
        }
        this.sendDeviceUpdate(deviceContext, 'export');
    }

    async retryFailedImport(deviceContext: ImportDeviceContext | ExportDeviceContext, step: 'ip' | 'group' | 'setting') {
        this.sendDeviceUpdate(deviceContext, 'import');
        const instance = this.getInstanceForDevice(deviceContext.sub_node_id, deviceContext.model_no);

        switch (step) {
            case 'ip':
                await instance.setIpData(deviceContext);
                break;
            case 'group':
                await instance.setGroupData(deviceContext);
                break;
            case 'setting':
                await instance.setSettingData(deviceContext);
                break;
        }
        this.sendDeviceUpdate(deviceContext, 'import');
    }

    private getInstanceForDevice(sub_node_id: number, model_no: number) {
        let instance;
        if (sub_node_id in this.lst_instance) {
            instance = this.lst_instance[sub_node_id];
        } else if (model_no in this.lst_instance) {
            instance = this.lst_instance[model_no];
        } else {
            instance = this.genricImportExportFunctions;
        }
        return instance;
    }

    private async sendDeviceUpdate(deviceContext: ImportDeviceContext | ExportDeviceContext, processType: 'import' | 'export') {
        const payload = {
            device_id: deviceContext.device_id,
            address: deviceContext.address,
            model_no: deviceContext.model_no,
            sub_node_id: deviceContext.sub_node_id,
            status: deviceContext.status,
        }
        if (processType === 'import') {
            SocketService.emit(Socket_Events.IMPORT_DEVICE_INFO, payload);
        } else {
            SocketService.emit(Socket_Events.EXPORT_DEVICE_INFO, payload);
        }
    }

    private async sendProgressUpdate(processType: 'import' | 'export') {
        if (processType === 'import') {
            const payload = {
                title: `Setting Device Parameters (${this.job.currentIndex + 1}/${this.job.devices.length}) (${((this.job.currentIndex) / this.job.devices.length * 100).toFixed(0)}%)`,
            }
            SocketService.emit(Socket_Events.IMPORT_PROGRESS, payload);

        } else {
            const payload = {
                title: `Fetching Device Parameters (${this.job.currentIndex + 1}/${this.job.devices.length}) (${((this.job.currentIndex) / this.job.devices.length * 100).toFixed(0)}%)`,
            }
            SocketService.emit(Socket_Events.EXPORT_PROGRESS, payload);
        }
    }
}