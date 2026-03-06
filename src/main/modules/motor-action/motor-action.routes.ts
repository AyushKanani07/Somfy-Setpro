import { Router } from "express";
import { MotorActionController } from "./motor-action.controller.ts";
import { Validator } from "../../middleware/validate.middleware.ts";
import { Motor_Move_Of_Schema, Move_To_Schema, Set_App_Mode, Set_Direction_Schema, Set_Motor_Ip_Schema, Set_Motor_Limit_Schema, Set_Rolling_Speed_Schema, Set_Motor_Tilt_Limit_Schema, Stop_Motor_Schema, Wink_Motor_Schema, Default_Ramp_Time_Schema, Save_Ramp_Time_Schema, Set_Led_Status_Schema, Network_Lock_Schema, Set_Motor_Ip_Auto_Schema, Set_Motor_Label_Schema, All_Move_To_Schema, Motor_Move_Schema } from "./motor-action.schema.ts";


export class MotorActionRoutes {
    router = Router();

    private motorActionCtrl: MotorActionController = new MotorActionController();

    constructor() {
        this.router.post('/move', [Validator(Motor_Move_Schema)], this.motorActionCtrl.motorMove);
        this.router.post('/move-to', [Validator(Move_To_Schema)], this.motorActionCtrl.motorMoveTo);
        this.router.post('/move-to-all', [Validator(All_Move_To_Schema)], this.motorActionCtrl.allMotorMoveTo);
        this.router.post('/move-of', [Validator(Motor_Move_Of_Schema)], this.motorActionCtrl.motorMoveOf);
        this.router.get('/discovery', this.motorActionCtrl.discoveryMotors);
        this.router.get('/position/:device_id', this.motorActionCtrl.getMotorPosition);
        this.router.get('/label/:device_id', this.motorActionCtrl.getMotorLabel);
        this.router.post('/label', [Validator(Set_Motor_Label_Schema)], this.motorActionCtrl.setMotorLabel);
        this.router.post('/ip', [Validator(Set_Motor_Ip_Schema)], this.motorActionCtrl.setMotorIp);
        this.router.post('/ip-auto', [Validator(Set_Motor_Ip_Auto_Schema)], this.motorActionCtrl.setMotorIpAuto);
        this.router.get('/ip/:device_id', this.motorActionCtrl.getMotorIp);
        this.router.delete('/erase-all-ip/:device_id', this.motorActionCtrl.eraseAllMotorIp);
        this.router.delete('/reset-motor-limits/:device_id', this.motorActionCtrl.resetMotorLimits);
        this.router.post('/stop', [Validator(Stop_Motor_Schema)], this.motorActionCtrl.stopMotor);
        this.router.post('/stop-all', this.motorActionCtrl.stopAllMotors);
        this.router.post('/wink', [Validator(Wink_Motor_Schema)], this.motorActionCtrl.winkMotor);
        this.router.post('/wink-all', this.motorActionCtrl.winkAllMotors);
        this.router.post('/app-mode', [Validator(Set_App_Mode)], this.motorActionCtrl.setAppMode);
        this.router.get('/app-mode/:device_id', this.motorActionCtrl.getAppMode);
        this.router.post('/direction', [Validator(Set_Direction_Schema)], this.motorActionCtrl.setMotorDirection);
        this.router.get('/direction/:device_id', this.motorActionCtrl.getMotorDirection);
        this.router.post('/limit', [Validator(Set_Motor_Limit_Schema)], this.motorActionCtrl.setMotorLimits);
        this.router.get('/limit/:device_id', this.motorActionCtrl.getMotorLimits);
        this.router.post('/tilt-limit', [Validator(Set_Motor_Tilt_Limit_Schema)], this.motorActionCtrl.setMotorTiltLimits);
        this.router.get('/tilt-limit/:device_id', this.motorActionCtrl.getMotorTiltLimits);
        this.router.post('/rolling-speed', [Validator(Set_Rolling_Speed_Schema)], this.motorActionCtrl.setMotorRollingSpeed);
        this.router.post('/default-rolling-speed/:device_id', this.motorActionCtrl.setDefaultRollingSpeed);
        this.router.get('/rolling-speed/:device_id', this.motorActionCtrl.getMotorRollingSpeed);
        this.router.post('/default-ramp-time', [Validator(Default_Ramp_Time_Schema)], this.motorActionCtrl.setDefaultRampTime);
        this.router.get('/ramp-time/:device_id', this.motorActionCtrl.getMotorRampTime);
        this.router.post('/ramp-time', [Validator(Save_Ramp_Time_Schema)], this.motorActionCtrl.saveMotorRampTime);
        this.router.post('/led-status', [Validator(Set_Led_Status_Schema)], this.motorActionCtrl.setMotorLedStatus);
        this.router.get('/led-status/:device_id', this.motorActionCtrl.getMotorLedStatus);
        this.router.post('/network-lock', [Validator(Network_Lock_Schema)], this.motorActionCtrl.setNetworkLock);
        this.router.get('/network-lock/:device_id', this.motorActionCtrl.getNetworkLock);
        this.router.get('/diag-move-count/:device_id', this.motorActionCtrl.getTotalMoveCount);
        this.router.get('/diag-rev-count/:device_id', this.motorActionCtrl.getTotalRevCount);
        this.router.get('/diag-thermal-count/:device_id', this.motorActionCtrl.getThermalCount);
        this.router.get('/diag-obstacle-count/:device_id', this.motorActionCtrl.getObstacleCount);
        this.router.get('/diag-power-count/:device_id', this.motorActionCtrl.getPowerCount);
        this.router.get('/diag-reset-count/:device_id', this.motorActionCtrl.getResetCount);
        this.router.get('/network-stat/:device_id', this.motorActionCtrl.getNetworkStat);
        this.router.get('/network-error-stat/:device_id', this.motorActionCtrl.getNetworkErrorStat);
        this.router.post('/network-reset/:device_id', this.motorActionCtrl.setNetworkReset);
        this.router.post('/factory-reset/:device_id', this.motorActionCtrl.resetAllSettings);
    }
}