import apiClient from "~/interceptor/interceptor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const deviceService = {
  //#region Get all clone devices
  getAllCloneDevices: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DEVICE.GET_ALL_CLONE);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Get unassigned devices
  getUnassignedDevices: async () => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DEVICE.UNASSIGNED_DEVICES
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Get assigned devices
  getAssignedDevices: async () => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DEVICE.ASSIGNED_DEVICES
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Delete all unassigned devices
  deleteAllUnassignedDevices: async () => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.DEVICE.DELETE_UNASSIGNED_DEVICES}/all/all`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Delete unassigned devices by IDs
  deleteUnassignedDevicesByIds: async (deviceIds: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.DEVICE.DELETE_UNASSIGNED_DEVICES}/${deviceIds}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get app version
  getAppVersion: async (deviceId: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.DEVICE.APP_VERSION}/${deviceId}${isRefresh ? "?refresh=true" : ""}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get firmware version
  getFirmwareVersion: async (deviceId: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.DEVICE.FIRMWARE_VERSION}/${deviceId}${isRefresh ? "?refresh=true" : ""}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get stack version
  getStackVersion: async (deviceId: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.DEVICE.STACK_VERSION}/${deviceId}${isRefresh ? "?refresh=true" : ""}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },
};
