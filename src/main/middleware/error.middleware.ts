import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import errorHandler from '../error-log/error-handler.ts';
import { LogError } from '../helpers/util.ts';

const errorMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    const success = false;
    LogError(error);
    const url = 'Location of Error : ' + request.originalUrl + "  Method : " + request.method + "  Request Body : " + JSON.stringify(request.body);
    errorHandler(error, url);
    response.status(status).send({ status, message, success });
};

export default errorMiddleware;

class HttpException extends Error {
    status: number;
    message: string;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}