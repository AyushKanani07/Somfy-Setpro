import { GroupController } from './group.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { groupMoveToSchema, groupSchema, groupStopSchema, groupUpdateSchema, winkGroupSchema } from './group.schema.ts';

export class GroupRoutes {
    router = Router();

    private groupCtrl: GroupController = new GroupController();

    constructor() {
        this.router.get('/', this.groupCtrl.getGroup)

        this.router.get('/:group_id', this.groupCtrl.getGroupById)

        this.router.post('/', [Validator(groupSchema)], this.groupCtrl.createGroup)

        this.router.put('/:group_id', [Validator(groupUpdateSchema)], this.groupCtrl.updateGroup)

        this.router.delete('/:group_id', this.groupCtrl.deleteGroup)

        this.router.post('/wink', [Validator(winkGroupSchema)], this.groupCtrl.winkGroup)

        this.router.post('/move-to', [Validator(groupMoveToSchema)], this.groupCtrl.groupMoveTo)

        this.router.post('/stop', [Validator(groupStopSchema)], this.groupCtrl.groupStop)
    }

}

