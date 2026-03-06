import { Router } from 'express';
// import { QueryValidator, Validator } from '../../middleware/validate.middleware.ts';
import { DeviceController } from './device.controller.ts';
// import { getDeviceSchema, updateDeviceIdentitySchema, updateDeviceSchema } from './device.schema.ts';

export class DeviceRoutes {
    router = Router();
    private deviceCtrl: DeviceController = new DeviceController();

    constructor() {
        this.router.get('/assigned', this.deviceCtrl.getAssignedDevices);

        this.router.get('/unassigned', this.deviceCtrl.getUnassignedDevices);

        this.router.get('/firmware-version/:device_id', this.deviceCtrl.getFirmwareVersion);

        this.router.get('/app-version/:device_id', this.deviceCtrl.getNodeAppVersion);

        this.router.get('/stack-version/:device_id', this.deviceCtrl.getNodeStackVersion);

        // this.router.get('/get-all-clone', this.deviceCtrl.getAllDeviceClone);

        // this.router.get('/get-clone', [QueryValidator(getDeviceSchema)], this.deviceCtrl.getDeviceClone);

        // this.router.post('/update-clone', [Validator(updateDeviceSchema)], this.deviceCtrl.updateDeviceClone);

        // this.router.post('/update-identity', [Validator(updateDeviceIdentitySchema)], this.deviceCtrl.updateDeviceIdentity);

    }
}