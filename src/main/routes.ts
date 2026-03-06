import express from 'express';

import { ComPortRoutes } from './modules/com-port/com-port.routes.ts';
import { CommunicationLogRoutes } from './modules/communication-log/communication-log.routes.ts';
import { DeviceRoutes } from './modules/device/device.routes.ts';
import { FloorRoutes } from './modules/floor/floor.routes.ts';
import { GroupDeviceRoutes } from './modules/group-device/group-device.routes.ts';
import { GroupRoutes } from './modules/group/group.routes.ts';
import { KeypadRoutes } from './modules/keypad/keypad.routes.ts';
import { MotorActionRoutes } from './modules/motor-action/motor-action.routes.ts';
import { MotorRoutes } from './modules/motor/motor.routes.ts';
import { OfflineCommandRoutes } from './modules/offline-command/offline-command.routes.ts';
import { ProjectRoutes } from './modules/project/project.routes.ts';
import { ReportRoutes } from './modules/report/report.routes.ts';
import { RoomRoutes } from './modules/room/room.routes.ts';
import { TransmiterRoutes } from './modules/transmiter/transmiter.routes.ts';
import { ReceiverRoutes } from './modules/receiver/receiver.routes.ts';


export class Routes {
    router = express.Router();

    path() {
        this.router.use('/project', new ProjectRoutes().router);
        this.router.use('/floor', new FloorRoutes().router);
        this.router.use('/room', new RoomRoutes().router);
        this.router.use('/motor', new MotorRoutes().router);
        this.router.use('/motor-action', new MotorActionRoutes().router);
        this.router.use('/transmitter', new TransmiterRoutes().router);
        this.router.use('/receiver', new ReceiverRoutes().router);
        this.router.use('/com-port', new ComPortRoutes().router);
        this.router.use('/keypad', new KeypadRoutes().router);
        this.router.use('/group', new GroupRoutes().router);
        this.router.use('/group-device', new GroupDeviceRoutes().router);
        this.router.use('/communication-log', new CommunicationLogRoutes().router);
        this.router.use('/offline-command', new OfflineCommandRoutes().router);
        this.router.use('/report', new ReportRoutes().router);
        this.router.use('/device', new DeviceRoutes().router);
        return this.router;
    }

}

