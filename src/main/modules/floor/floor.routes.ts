import { FloorController } from './floor.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { dispOrderSchema, floorSchema, multipleFloorSchema } from './floor.schema.ts';

export class FloorRoutes {
    router = Router();

    private floorCtrl: FloorController = new FloorController();

    constructor() {
        this.router.get('/', this.floorCtrl.getFloor)

        this.router.get('/:floor_id', this.floorCtrl.getFloorById)

        this.router.post('/', [Validator(floorSchema)], this.floorCtrl.createFloor)

        this.router.post('/multiple', [Validator(multipleFloorSchema)], this.floorCtrl.createMultipleFloors)

        this.router.post('/update-disp-order', [Validator(dispOrderSchema)], this.floorCtrl.updateDispOrder)

        this.router.put('/:floor_id', [Validator(floorSchema)], this.floorCtrl.updateFloor)

        this.router.delete('/:floor_id', this.floorCtrl.deleteFloor)
    }

}

