import { ProjectController } from './project.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { exportRetrySchema, importProjectSchema, importRetrySchema, lastGroupAddressSchema, projectSchema, startFirmwareUpdateSchema } from './project.schema.ts';
import { Multer } from '../../helpers/multer.ts';

export class ProjectRoutes {
    router = Router();

    private projectCtrl: ProjectController = new ProjectController();
    private firmwareMulter = new Multer('firmware', false);
    private dbMulter = new Multer('db', false);

    constructor() {
        this.router.get('/', this.projectCtrl.getProject);

        this.router.get('/last-group-address', this.projectCtrl.getLastGroupAddress);

        this.router.put('/last-group-address', [Validator(lastGroupAddressSchema)], this.projectCtrl.updateLastGroupAddress);

        this.router.get('/:project_id', this.projectCtrl.getProjectById);

        this.router.get('/export/:project_id', this.projectCtrl.exportProject);
        this.router.post('/export/start', this.projectCtrl.startProjectExport);
        this.router.post('/export/retry', [Validator(exportRetrySchema)], this.projectCtrl.retryProjectExport);
        this.router.post('/export/pause', this.projectCtrl.pauseProjectExport);
        this.router.post('/export/resume', this.projectCtrl.resumeProjectExport);
        this.router.post('/export/close', this.projectCtrl.closeImportExport);

        this.router.post('/import', [Validator(importProjectSchema), this.dbMulter.uploadAndStore.single('file')], this.projectCtrl.importProject);
        this.router.post('/import/start', this.projectCtrl.startProjectImport);
        this.router.post('/import/retry', [Validator(importRetrySchema)], this.projectCtrl.retryProjectImport);
        this.router.post('/import/close', this.projectCtrl.closeImportExport);

        this.router.delete('/:project_id', this.projectCtrl.deleteProject);

        this.router.post('/', [Validator(projectSchema)], this.projectCtrl.createProject);

        this.router.put('/:project_id', [Validator(projectSchema)], this.projectCtrl.updateProject);

        this.router.put('/update-last-opened/:project_id', this.projectCtrl.updateLastOpen);

        this.router.get('/dashboard/count', this.projectCtrl.getDashboardCount)

        this.router.post('/firmware/file', [this.firmwareMulter.uploadAndStore.single('file')], this.projectCtrl.uploadFirmwareFile);

        this.router.post('/firmware/update', [Validator(startFirmwareUpdateSchema)], this.projectCtrl.startFirmwareUpdate);

        // this.router.post('/firmware/decyrpt-data', this.projectCtrl.decryptFirmwareUpdateData)

        // this.router.post('/calculate/crc32', this.projectCtrl.calculateCrc32)
    }

}

