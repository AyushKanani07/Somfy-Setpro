import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

const myFormat = () => {
    var currentTime = new Date();
    var currentOffset = currentTime.getTimezoneOffset();
    var ISTOffset = 330;   // IST offset UTC +5:30 
    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
    return ISTTime;
};
const resolvedDir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
class LoggerService {
    route: any;
    logger: winston.Logger;
    constructor(route: any) {
        this.route = route;
        const logger = winston.createLogger({
            transports: [
                new winston.transports.File({
                    filename: path.join(resolvedDir, `${route}.log`)
                })
            ],
            format: winston.format.printf((info: any) => {
                let message = `${myFormat()} | ${info.level.toUpperCase()} | ${route}.log | ${info.message} | `;
                message = info.obj.stack ? message + `Error Stack: ${JSON.stringify(info.obj.stack)} | ` : message;
                return message;
            })
        });
        this.logger = logger;
    }
    async error(obj: any, message: string) {
        this.logger.log('error', message, {
            obj
        });
    }
}

export default LoggerService;
