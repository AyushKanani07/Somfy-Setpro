import { Router } from "express";
import { TransmiterController } from "./transmiter.controller.ts";
import { Validator } from "../../middleware/validate.middleware.ts";
import { Channel_Mode_Schema, Control_Position_Schema, Dim_Frame_Count_Schema, Dim_Schema, Get_Channel_Mode_Schema, Get_Dim_Frame_Count_Schema, Get_Tilt_Frame_Count_Schema, Ip_Schema, Rts_Address_Schema, Set_Channel_Schema, Set_Dct_Lock_Schema, Set_OpenProg_Schema, Set_RTSAddress_Schema, Sun_Auto_Schema, Tilt_Frame_Count_Schema, Tilt_Schema } from "./transmiter.schema.ts";


export class TransmiterRoutes {
    router = Router();

    private transmiterCtrl: TransmiterController = new TransmiterController();

    constructor() {
        this.router.get('/:device_id', this.transmiterCtrl.getTransmiterDataById);
        this.router.post('/channel-mode', [Validator(Channel_Mode_Schema)], this.transmiterCtrl.setChannelMode);
        this.router.post('/get-channel-mode', [Validator(Get_Channel_Mode_Schema)], this.transmiterCtrl.getChannelMode);
        this.router.post('/get-rts-address', [Validator(Rts_Address_Schema)], this.transmiterCtrl.getRtsAddress);
        this.router.post('/ip', [Validator(Ip_Schema)], this.transmiterCtrl.setIp);
        this.router.post('/sun-mode', [Validator(Sun_Auto_Schema)], this.transmiterCtrl.setSunAuto);
        this.router.post('/control-position', [Validator(Control_Position_Schema)], this.transmiterCtrl.controlPosition);
        this.router.post('/tilt', [Validator(Tilt_Schema)], this.transmiterCtrl.sendTiltCommand);
        this.router.post('/dim', [Validator(Dim_Schema)], this.transmiterCtrl.sendDimCommand);
        this.router.post('/tilt-frame-count', [Validator(Tilt_Frame_Count_Schema)], this.transmiterCtrl.setTiltFrameCount);
        this.router.post('/get-tilt-frame-count', [Validator(Get_Tilt_Frame_Count_Schema)], this.transmiterCtrl.getTiltFrameCount);
        this.router.post('/dim-frame-count', [Validator(Dim_Frame_Count_Schema)], this.transmiterCtrl.setDimFrameCount);
        this.router.post('/get-dim-frame-count', [Validator(Get_Dim_Frame_Count_Schema)], this.transmiterCtrl.getDimFrameCount);
        this.router.get('/dct-lock/:device_id', this.transmiterCtrl.getDctLock);
        this.router.post('/dct-lock', [Validator(Set_Dct_Lock_Schema)], this.transmiterCtrl.setDctLock);
        this.router.post('/channel', [Validator(Set_Channel_Schema)], this.transmiterCtrl.setChannel);
        this.router.post('/open-prog', [Validator(Set_OpenProg_Schema)], this.transmiterCtrl.setOpenProg);
        this.router.post('/rts-address', [Validator(Set_RTSAddress_Schema)], this.transmiterCtrl.setRtsAddressChange);
    }
}