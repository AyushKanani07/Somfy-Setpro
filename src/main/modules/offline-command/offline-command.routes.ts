import { OfflineCommandController } from './offline-command.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { executeCommandSchema, offlineCommandSchema } from './offline-command.schema.ts';

export class OfflineCommandRoutes {
    router = Router();

    private offlineCommandCtrl: OfflineCommandController = new OfflineCommandController();

    constructor() {
        this.router.get('/', this.offlineCommandCtrl.getAllOfflineCommand)

        // this.router.post('/', [Validator(offlineCommandSchema)], this.offlineCommandCtrl.createOfflineCommand)

        this.router.delete('/', this.offlineCommandCtrl.deleteAllOfflineCommand)

        this.router.post('/execute', [Validator(executeCommandSchema)], this.offlineCommandCtrl.executeOfflineCommands)
    }

}

