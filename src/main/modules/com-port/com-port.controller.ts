import type { NextFunction, Request, Response } from 'express';
import { SerialportConnectionService } from '../../services/serialport.connection.service.ts';
import HttpStatus from '../../helpers/http-status.ts';


export class ComPortController {

    private SerialConn: SerialportConnectionService = new SerialportConnectionService();

    public getAllComPorts = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const ports = await this.SerialConn.listAvailablePorts();

            return HttpStatus.OkResponse('Available COM Ports retrieved successfully', res, ports);

        } catch (error) {
            next(error);
        }
    }

    connectToComPort = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { port } = req.body;
            const result = await this.SerialConn.connectToPort(port);
            if (result.isError) {
                return HttpStatus.InternalServerErrorResponse(result.message, res);
            }
            return HttpStatus.OkResponse(result.message, res);
        } catch (error) {
            next(error);
        }
    }

    public disconnectComPort = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const disconnect = await this.SerialConn.disconnectPort();
            return HttpStatus.OkResponse('COM Port disconnected successfully', res, disconnect);
        } catch (error) {
            next(error);
        }
    }
}