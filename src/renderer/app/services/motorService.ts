import apiClient from "~/interceptor/interceptor";
import type {
  MotorIpPayload,
  MotorMoveOfPayload,
  MotorMoveToAllPayload,
  MotorMoveToPayload,
  MoveMotorPayload,
  rampValuesKey,
  SetMotorLimitPayload,
  SetRampTimePayload,
  SetRollingSpeedPayload,
  SetTiltLimitPayload,
  WinkMotorPayload,
} from "~/interfaces/motor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const motorService = {
  //#region get motor by id
  getMotorById: async (motorId: number) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR.BASE}/${motorId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#update motor roomId
  updateMotorRoom: async (motorId: number, roomId: number) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.MOTOR.MOTOR_ASSIGN}/${motorId}`,
        {
          room_id: roomId,
        }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region delete motor by id
  deleteMotor: async (motorId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.MOTOR.BASE}/${motorId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region wink motor by id
  winkMotor: async (winkPayload: WinkMotorPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.WINK}`,
        { ...winkPayload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region wink all motors
  winkAllMotors: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.WINK_ALL}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region move motor
  moveMotor: async (payload: MoveMotorPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_MOVE}`,
        { ...payload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region move motor to position
  moveMotorToPosition: async (payload: MotorMoveToPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_MOVE_TO}`,
        { ...payload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region move all motors
  motorMoveToAll: async (payload: MotorMoveToAllPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_MOVE_TO_ALL}`,
        { ...payload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region move motor of position
  moveMotorOfPosition: async (payload: MotorMoveOfPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_MOVE_OF}`,
        { ...payload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region stop motor
  stopMotor: async (device_id: number, isACK: boolean) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.STOP_MOTOR}`,
        { device_id, isACK }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region stop all motors
  stopAllMotors: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.STOP_ALL}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region fetch motor IP
  fetchMotorIP: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_IP}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set motor IP
  setMotorIP: async (payload: MotorIpPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.SET_MOTOR_IP}`,
        { ...payload }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region erase all motor IPs
  eraseAllMotorIPs: async (device_id: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.MOTOR_ACTION.ERASE_ALL_MOTOR_IPS}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region auto generate motor IPs
  autoGenerateMotorIPs: async (device_id: number, ip_count: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.AUTO_GENERATE_IPS}`,
        { device_id, ip_count }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set motor label
  setMotorLabel: async (device_id: number, label: string) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_LABEL}`,
        { device_id, label }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region setMotorLimit
  setMotorLimit: async (payload: SetMotorLimitPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_LIMIT}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get motor limit
  getMotorLimits: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_LIMIT}/${device_id}?refresh=${isRefresh}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get motor position
  getMotorPosition: async (device_id: number) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_POSITION}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region reset motor limit
  resetMotorLimit: async (device_id: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.MOTOR_ACTION.RESET_MOTOR_LIMITS}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get motor direction
  getMotorDirection: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_DIRECTION}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set motor direction
  setMotorDirection: async (device_id: number, direction: "forward" | "reverse") => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_DIRECTION}`,
        { device_id, direction }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set app mode
  setAppMode: async (device_id: number, app_mode: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.APP_MODE}`,
        { device_id, app_mode }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get app mode
  getAppMode: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.APP_MODE}/${device_id}?refresh=${isRefresh}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set led status
  setLedStatus: async (device_id: number, status: 'on' | 'off') => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.LED_STATUS}`,
        { device_id, status }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get led status
  getLedStatus: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.LED_STATUS}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get network lock status
  getNetworkLock: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.NETWORK_LOCK}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set network lock status
  setNetworkLock: async (device_id: number, isLocked: boolean, priority: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.NETWORK_LOCK}`,
        { device_id, isLocked, priority }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set default rolling speed
  setDefaultRollingSpeed: async (device_id: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.DEFAULT_ROLLING_SPEED}/${device_id}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set rolling speed
  setRollingSpeed: async (payload: SetRollingSpeedPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.ROLLING_SPEED}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get rolling speed
  getRollingSpeed: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.ROLLING_SPEED}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set default ramp time
  setDefaultRampTime: async (payload: { device_id: number, function_type: rampValuesKey }) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.DEFAULT_RAMP_TIME}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get ramp time
  getRampTime: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.RAMP_TIME}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set ramp time
  setRampTime: async (payload: SetRampTimePayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.RAMP_TIME}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region set motor tilt limit
  setMotorTiltLimit: async (payload: SetTiltLimitPayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_TILT_LIMIT}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get motor tilt limit
  getMotorTiltLimit: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.MOTOR_TILT_LIMIT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region factory reset motor
  factoryResetMotor: async (device_id: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.FACTORY_RESET}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get total move count 
  getTotalMoveCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_MOVE_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get total revolution count
  getTotalRevolutionCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_REV_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get thermal count
  getThermalCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_THERMAL_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get obstacle count
  getObstacleCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_OBSTACLE_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get power count
  getPowerCutCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_POWER_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get reset count
  getResetCount: async (device_id: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.DIAG_RESET_COUNT}/${device_id}${isRefresh ? '?refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get network stats
  getNetworkStats: async (device_id: number) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.NETWORK_STAT}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get network error stats
  getNetworkErrorStats: async (device_id: number) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.MOTOR_ACTION.NETWORK_ERROR_STAT}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region reset network stats
  resetNetworkStats: async (device_id: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.MOTOR_ACTION.NETWORK_RESET}/${device_id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

};
