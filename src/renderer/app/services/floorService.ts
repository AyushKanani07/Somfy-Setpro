import apiClient from "~/interceptor/interceptor";
import type {
  CreateFloorPayload,
  CreateMultipleFloorPayload,
  UpdateFloorPayload,
} from "~/interfaces/floor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const floorService = {
  // Floor service methods would go here

  //#region fetchFloors
  fetchFloors: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FLOOR.BASE);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region createSingleFloor
  createSingleFloor: async (floorData: CreateFloorPayload) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.FLOOR.BASE,
        floorData
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region createMultipleFloors
  createMultipleFloors: async (floorData: CreateMultipleFloorPayload) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.FLOOR.CREATE_MULTIPLE,
        floorData
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region updateFloor
  updateFloor: async (payload: UpdateFloorPayload) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.FLOOR.BASE}/${payload.floor_id}`,
        { name: payload.name }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region deleteFloor
  deleteFloor: async (floorId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.FLOOR.BASE}/${floorId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },
  //#endregion
};
