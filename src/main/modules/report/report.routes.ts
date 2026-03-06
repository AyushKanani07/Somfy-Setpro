import { ReportController } from './report.controller.ts';
import { Router } from 'express';

export class ReportRoutes {
    router = Router();
    private ReportCtrl: ReportController = new ReportController();

    constructor() {
        this.router.get('/', this.ReportCtrl.exportReport);

        this.router.get('/template', this.ReportCtrl.downloadTemplate);

        this.router.get('/communication-log', this.ReportCtrl.exportCommunicationLog);

        this.router.post('/', this.ReportCtrl.importFloorPlan);
    }

}

