import { Joi } from "celebrate";

export const communicationLogSchema = Joi.array().items({
    command: Joi.string().required(),
    data: Joi.string().required().allow("", null),
    destination: Joi.string().required().allow("", null),
    frame: Joi.string().required().allow("", null),
    source_node_type: Joi.string().required().allow("", null),
    destination_node_type: Joi.string().required().allow("", null),
    type: Joi.string().required().allow('sent', 'received', 'unknown-received', 'unknown-sent'),
    source: Joi.string().required().allow("", null),
    ack: Joi.string().required().allow("", null),
    time: Joi.date().required(),
});

export const getCommunicationLogSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    type: Joi.string().valid('rx', 'tx').optional(),
});