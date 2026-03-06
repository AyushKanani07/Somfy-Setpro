import { GroupDeviceController } from './group-device.controller.ts';
import { Router } from 'express';
import { QueryValidator, Validator } from '../../middleware/validate.middleware.ts';
import { create_multiple_schema, delete_group_device_schema, delete_multiple_group_device_schema, getGroupDeviceById, group_device_position_schema, groupDeviceSchema, new_group_device_schema } from './group-device.schema.ts';

export class GroupDeviceRoutes {
    router = Router();

    private groupCtrl: GroupDeviceController = new GroupDeviceController();

    constructor() {
        this.router.get('/', [QueryValidator(getGroupDeviceById)], this.groupCtrl.getGroupDevice)

        this.router.get('/all', this.groupCtrl.getAllGroupDevice)

        this.router.get('/discover-group', this.groupCtrl.discoverGroups);

        this.router.get('/discover-group/:device_id', this.groupCtrl.discoverGroupsByDeviceId);

        this.router.get('/get-vaccant-group-position', this.groupCtrl.getVaccantDeviceGroupPosition)

        this.router.get('/:group_device_map_id', this.groupCtrl.getGroupDeviceById)

        this.router.post('/', [Validator(groupDeviceSchema)], this.groupCtrl.createGroupDevice)

        this.router.post('/create/multiple', [Validator(create_multiple_schema)], this.groupCtrl.creteMultipleGroupDevice)

        this.router.post('/delete/multiple', [Validator(delete_multiple_group_device_schema)], this.groupCtrl.deleteMultipleGroupDevice)

        this.router.post('/new', [Validator(new_group_device_schema)], this.groupCtrl.createNewGroupDevice)

        this.router.post('/position', [Validator(group_device_position_schema)], this.groupCtrl.checkDeviceGroupPosition)

        this.router.put('/:group_device_map_id', this.groupCtrl.updateGroupDevice)

        this.router.post('/delete', [Validator(delete_group_device_schema)], this.groupCtrl.deleteGroupDevice)

        this.router.delete('/all/:device_id', this.groupCtrl.deleteAllGroupDevice)
    }

}

