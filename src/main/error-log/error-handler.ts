import Logger from './logger-service.ts';
const logger = new Logger('errors');

export default (err: any, url: any) => {
    logger.error(err, url);
};