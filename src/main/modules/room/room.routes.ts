import { RoomController } from './room.controller.ts';
import { Router } from 'express';
import { Validator } from '../../middleware/validate.middleware.ts';
import { multiple_room_schema, roomSchema } from './room.schema.ts';

export class RoomRoutes {
    router = Router();

    private roomCtrl: RoomController = new RoomController();

    constructor() {
        this.router.get('/', this.roomCtrl.getRoom);

        this.router.get('/:room_id', this.roomCtrl.getRoomById);

        this.router.post('/', [Validator(roomSchema)], this.roomCtrl.createRoom);

        this.router.post('/multiple', [Validator(multiple_room_schema)], this.roomCtrl.createMultipleRooms);

        this.router.put('/:room_id', this.roomCtrl.updateRoom);

        this.router.delete('/:room_id', this.roomCtrl.deleteRoom);
    }

}

