import { MotorController } from './motor.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { createMotorSchema, createMultipleMotorSchema, detailSchema, saveMotorLimitSchema, saveNodeStackSchema, unassignedDevicesSchema, updateMotorSchema } from './motor.schema.ts';

export class MotorRoutes {
    router = Router();

    private motorCtrl: MotorController = new MotorController();

    constructor() {
        this.router.get('/', this.motorCtrl.getMotor);

        this.router.get('/all', this.motorCtrl.getAllMotor);

        this.router.get('/by-room', this.motorCtrl.getMotorByRoom);

        this.router.get('/limit', this.motorCtrl.getMotorsLimit);

        this.router.get('/:device_id', this.motorCtrl.getMotorById);

        this.router.get('/detail/:device_id', this.motorCtrl.getMotorDetail);

        this.router.post('/', [Validator(createMotorSchema)], this.motorCtrl.createMotor);

        this.router.put('/detail/:device_id', [Validator(detailSchema)], this.motorCtrl.updateMotorDetail);

        this.router.post('/create-multiple', [Validator(createMultipleMotorSchema)], this.motorCtrl.createMultipleMotor);

        this.router.post('/update-multiple', [Validator(createMultipleMotorSchema)], this.motorCtrl.updateMultipleMotor);

        this.router.post('/unassigned', [Validator(unassignedDevicesSchema)], this.motorCtrl.saveUnassignedDevices);

        this.router.post('/limit', [Validator(saveMotorLimitSchema)], this.motorCtrl.saveMotorLimit);

        this.router.post('/node-stack', [Validator(saveNodeStackSchema)], this.motorCtrl.saveNodeStackVersion);

        this.router.put('/assign/:device_id', [Validator(updateMotorSchema)], this.motorCtrl.assignMotorToRoom);

        this.router.delete('/:device_id', this.motorCtrl.deleteMotor);
    }

}

