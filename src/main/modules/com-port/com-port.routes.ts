import { Router } from "express";
import { ComPortController } from "./com-port.controller.ts";
import { Validator } from "../../middleware/validate.middleware.ts";
import { connectComPortSchema } from "./com-port.schema.ts";


export class ComPortRoutes {
    router = Router();
    private comPortCtrl: ComPortController = new ComPortController();

    constructor() {
        this.router.get('/', this.comPortCtrl.getAllComPorts);
        this.router.post('/connect', [Validator(connectComPortSchema)], this.comPortCtrl.connectToComPort);
        this.router.post('/disconnect', this.comPortCtrl.disconnectComPort);
    }
}