import { Router } from "express";
import { ReceiverController } from "./receiver.controller.ts";
import { QueryValidator, Validator } from "../../middleware/validate.middleware.ts";
import { Channel_Status_Schema, Get_Channel_Status_Schema } from "./receiver.schema.ts";


export class ReceiverRoutes {
    router = Router();

    private receiverCtrl: ReceiverController = new ReceiverController();

    constructor() {
        this.router.get('/:device_id', this.receiverCtrl.getReceiverByDeviceId);
        this.router.get('/all-channel-status/:device_id', this.receiverCtrl.getAllChannelStatus);
        this.router.get('/channel-status/:device_id', QueryValidator(Get_Channel_Status_Schema), this.receiverCtrl.getChannelStatus);
        this.router.delete('/remove-all-channels/:device_id', this.receiverCtrl.removeAllChannels);
        this.router.post('/channel-status', [Validator(Channel_Status_Schema)], this.receiverCtrl.setChannelStatus);
        this.router.post('/factory-reset/:device_id', this.receiverCtrl.resetAllSettings);
    }
}