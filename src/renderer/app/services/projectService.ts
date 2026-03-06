import apiClient from "~/interceptor/interceptor";
import type { CreateProjectPayload, firmwareUpdatePayload } from "~/interfaces/project";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const projectService = {
  //#region Get all projects
  getProjects: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROJECT.BASE);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Get single project
  getProject: async (id: string) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PROJECT}/${id}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region import project
  importProject: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.IMPORT}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Create new project
  createProject: async (projectData: CreateProjectPayload) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PROJECT.BASE,
        projectData
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region update last open project
  updateLastOpenProject: async (id: string) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.PROJECT.UPDATE_LAST_OPENED}/${id}`,
        { version: 3 }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Update project
  updateProject: async (id: string, projectData: CreateProjectPayload) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.PROJECT.BASE}/${id}`,
        projectData
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region Delete project
  deleteProject: async (id: string) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.PROJECT.BASE}/${id}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region project dashboard count
  getProjectDashboardCount: async () => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.PROJECT.DASHBOARD_COUNT}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  getLastGroupAddress: async () => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.PROJECT.LAST_GROUP_ADDRESS}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  updateLastGroupAddress: async (address: string) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.PROJECT.LAST_GROUP_ADDRESS}`,
        { address }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  uploadFirmwareFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.FIRMWARE_FILE}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  updateFirmware: async (payload: firmwareUpdatePayload) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.FIRMWARE_UPDATE}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportProject: async (id: string) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.PROJECT.PROJECT_EXPORT}/${id}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportStart: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.EXPORT_START}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportClose: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.EXPORT_CLOSE}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportPause: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.EXPORT_PAUSE}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportResume: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.EXPORT_RESUME}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  exportRetry: async (payload: { device_id: number, step: "ip" | "group" | "setting" }) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.EXPORT_RETRY}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    };
  },

  importStart: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.IMPORT_START}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  importRetry: async (payload: { device_id: number, step: "ip" | "group" | "setting" }) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.IMPORT_RETRY}`,
        payload
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  importClose: async () => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.PROJECT.IMPORT_CLOSE}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

};
