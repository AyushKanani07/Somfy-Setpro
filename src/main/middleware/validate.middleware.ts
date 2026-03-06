import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';

import HttpStatus from '../helpers/http-status.ts';

const Validator = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.validate(req.body);
        if (result.error) {
            return HttpStatus.UnprocessableResponse(result.error.details[0].message, res, result.error);
        } else {
            return next();
        }
    };

};

const QueryValidator = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.validate(req.query);
        if (result.error) {
            return HttpStatus.UnprocessableResponse(result.error.details[0].message, res, result.error);
        } else {
            return next();
        }
    };

};
export { Validator, QueryValidator };