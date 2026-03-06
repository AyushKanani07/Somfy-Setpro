import type { Response } from 'express';
import type { ResponseStatus } from "../interface/http-status-interface.ts";

const OkResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Ok';
    let OkResponseObj: ResponseStatus = { status: 200, success: true, data: data, message: message }
    if (res) {
        return res.status(200).json(OkResponseObj);
    } else {
        return OkResponseObj;
    }
};
const UnauthorizedResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Unauthorized Request';
    let UnauthorizedResponseObj: ResponseStatus = { status: 401, success: false, data: data, message: message }
    if (res) {
        return res.status(401).json(UnauthorizedResponseObj);
    } else {
        return UnauthorizedResponseObj;
    }
};
const BadRequestResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Bad Request';
    let BadRequestResponseObj: ResponseStatus = { status: 400, success: false, data: data, message: message }
    if (res) {
        return res.status(400).json(BadRequestResponseObj);
    } else {
        return BadRequestResponseObj;
    }
};
const ConflictRequestResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Conflict Request';
    let BadRequestResponseObj: ResponseStatus = { status: 400, success: false, data: data, message: message }
    if (res) {
        return res.status(409).json(BadRequestResponseObj);
    } else {
        return BadRequestResponseObj;
    }
};
const NotFoundResponse = (message: string, res: any, data: any = null) => {
    message = message || 'No Record(s) found';
    let NotFoundResponseObj: ResponseStatus = { status: 400, success: false, data: data, message: message }
    if (res) {
        return res.status(400).json(NotFoundResponseObj);
    } else {
        return NotFoundResponseObj;
    }
};
const ForbiddenResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Forbidden Request';
    let ForbiddenResponseObj: ResponseStatus = { status: 403, success: false, data: data, message: message }
    if (res) {
        return res.status(403).json(ForbiddenResponseObj);
    } else {
        return ForbiddenResponseObj;
    }
};
const InternalServerErrorResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Internal Server Error';
    let InternalServerErrorResponseObj: ResponseStatus = { status: 500, success: false, data: data, message: message }
    if (res) {
        return res.status(500).json(InternalServerErrorResponseObj);
    } else {
        return InternalServerErrorResponseObj;
    }
};
const MethodNotAllowedResponse = (message: string, res: any, data: any = null) => {
    message = message || 'Method Not Allowed';
    let MethodNotAllowedResponseObj: ResponseStatus = { status: 405, success: false, data: data, message: message }
    if (res) {
        return res.status(405).json(MethodNotAllowedResponseObj);
    } else {
        return MethodNotAllowedResponseObj;
    }
};
const InvalidTokenResponse = (res: Response) => {
    var message = 'Invalid Token';
    let InvalidTokenResponseObj: ResponseStatus = { status: 401, success: false, data: "TOKEN", message: message }
    if (res) {
        return res.status(401).json(InvalidTokenResponseObj);
    } else {
        return InvalidTokenResponseObj;
    }
};

const UnprocessableResponse = (message: string, res: Response, data: any = null) => {
    // var message = 'Invalid Token';
    let UnprocessableResponseObj: ResponseStatus = { status: 422, success: false, data: data, message: message }
    if (res) {
        return res.status(422).json(UnprocessableResponseObj);
    } else {
        return UnprocessableResponseObj;
    }
};

const CannotDeleteResponse = (message: string, res: Response, data: any = null) => {
    var message = message || "This Record Can't Deleted, It Contain References to other data...";
    let UnprocessableResponseObj: ResponseStatus = { status: 422, success: false, data: data, message: message }
    if (res) {
        return res.status(422).json(UnprocessableResponseObj);
    } else {
        return UnprocessableResponseObj;
    }
};

export default { OkResponse, CannotDeleteResponse, ConflictRequestResponse, UnauthorizedResponse, BadRequestResponse, NotFoundResponse, ForbiddenResponse, UnprocessableResponse, InternalServerErrorResponse, MethodNotAllowedResponse, InvalidTokenResponse };
