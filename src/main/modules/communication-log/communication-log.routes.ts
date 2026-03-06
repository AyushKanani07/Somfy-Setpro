import { CommunicationLogController } from './communication-log.controller.ts';
import { Router } from 'express';
import { QueryValidator, Validator } from '../../middleware/validate.middleware.ts';
import { communicationLogSchema, getCommunicationLogSchema } from './communication-log.schema.ts';

export class CommunicationLogRoutes {
    router = Router();

    private communicationLogCtrl: CommunicationLogController = new CommunicationLogController();

    constructor() {
        this.router.get('/', [QueryValidator(getCommunicationLogSchema)], this.communicationLogCtrl.getAllCommunicationLog);

        this.router.get('/count', this.communicationLogCtrl.getCommunicationLogCount);

        // this.router.get('/:communication_log_id', this.communicationLogCtrl.reSendCommand);

        this.router.post('/', [Validator(communicationLogSchema)], this.communicationLogCtrl.createCommunicationLog);

        this.router.delete('/:id', this.communicationLogCtrl.deleteAllCommunicationLog);
    }

}

