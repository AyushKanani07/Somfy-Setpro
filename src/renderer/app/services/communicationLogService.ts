import apiClient from '~/interceptor/interceptor';
import { API_ENDPOINTS } from '~/utils/api-endpoints';
import { getAxiosMessage } from '~/utils/helperFunctions';

export const communicationLogService = {
  //#region delete communication log
  deleteCommunicationLog: async () => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.LOG.COMMUNICATION_LOG}/0`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get all offline command
  getAllOfflineCommands: async () => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.OFFLINE_COMMAND.BASE}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region delete all offline command
  deleteAllOfflineCommands: async () => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.OFFLINE_COMMAND.BASE}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  // #region execute offline command
  executeOfflineCommand: async (commandIds: number[]) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.OFFLINE_COMMAND.EXECUTE}`,
        { ids: commandIds },
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get communication logs
  getCommunicationLogs: async (page: number, limit: number, type?: string) => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type ? { type } : {}),
      }).toString();
      const response = await apiClient.get(
        `${API_ENDPOINTS.LOG.COMMUNICATION_LOG}?${query}`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region get communication log count
  getCommunicationLogCount: async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.LOG.COUNT}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region delete all communication logs
  deleteAllCommunicationLogs: async () => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.LOG.COMMUNICATION_LOG}/0`,
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  openCommunicationLogWindow: () => {
    const url = `${window.location.origin}/communication-log`;
    const payload = {
      url: url,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    window.serialPort.openNewWindow(payload);
  },
};
