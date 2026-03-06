export interface dbInstance {
    sequelize?: any,
    floorModel?: any,
    roomModel?: any,
    motorModel?: any,
    deviceCloneModel?: any,
    keypadModel?: any,
    deviceModel?: any,
    groupModel?: any,
    groupDeviceMapModel?: any,
    auditLogModel?: any,
    projectModel?: any,
    communicationLogModel?: any,
    offlineCommandModel?: any,
    rtsTransmitterModel?: any,
    rtsReceiverModel?: any,
    error?: any;
}


export interface MotorCommandList {
    cmd_id: number;
    name: string;
    builder_method?: string;
    parser_method?: string;
}

export interface getAckResponse {
    message: string;
    isError: boolean;
    data?: any;
}