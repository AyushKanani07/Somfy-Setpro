import apiClient from "~/interceptor/interceptor";
import type {
  CreateMutipleDevice,
  DeleteGroupDevice,
} from "~/interfaces/groupView";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const groupViewService = {
  //#region Get all groups
  getGroups: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GROUP.BASE);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Get group devices
  getGroupDevices: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GROUP_DEVICE.ALL);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region create multiple group devices
  createMultipleGroupDevices: async (data: CreateMutipleDevice) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUP_DEVICE.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region create single group device
  createGroupDevice: async (data: { group_id: number; device_id: number, index?: number }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUP_DEVICE.BASE,
        data
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region delete group device
  deleteGroupDevice: async (data: DeleteGroupDevice) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUP_DEVICE.DELETE,
        data
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#regiondelete group
  deleteGroup: async (groupId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.GROUP.BASE}/${groupId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region create group
  createGroup: async (data: { name: string, address: string }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.GROUP.BASE,
        data
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region wink group
  winkGroup: async (groupId: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUP.WINK_GROUP}`,
        { group_id: groupId }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region group move to
  groupMoveTo: async (groupId: number, action: 'up' | 'down') => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUP.MOVE_TO}`,
        { group_id: groupId, action }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region group stop
  groupStop: async (groupId: number) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.GROUP.STOP}`,
        { group_id: groupId }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get group device by device id
  getGroupDeviceByDeviceId: async (deviceId: number, isRefresh?: boolean) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.GROUP_DEVICE.BASE}?device_id=${deviceId}${isRefresh ? '&refresh=true' : ''}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region remove device from all groups
  removeDeviceFromAllGroups: async (deviceId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.GROUP_DEVICE.ALL}/${deviceId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },
};
