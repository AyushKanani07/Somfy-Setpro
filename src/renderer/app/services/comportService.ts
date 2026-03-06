import apiClient from "~/interceptor/interceptor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const comportService = {
  //#region Get all comports
  getComports: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMPORT.BASE);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Connect to a comport
  connectComport: async (port: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMPORT.CONNECT, {
        port,
      });
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Disconnect from a comport
  disconnectComport: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMPORT.DISCONNECT);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },
};
