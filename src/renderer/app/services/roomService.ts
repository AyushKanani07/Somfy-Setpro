import apiClient from "~/interceptor/interceptor";
import type {
  CreateMultipleRoomPayload,
  CreateRoomPayload,
  UpdateRoomPayload,
} from "~/interfaces/room";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const roomService = {
  //#region fetch Rooms
  fetchRooms: async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.ROOM.BASE}`);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region update RoomFloorId
  updateRoomFloorId: async (roomId: number, floorId: number) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.ROOM.BASE}/${roomId}`,
        { floor_id: floorId }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region createSingleRoom
  createSingleRoom: async (roomData: CreateRoomPayload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ROOM.BASE, roomData);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region createMultipleRooms
  createMultipleRooms: async (roomData: CreateMultipleRoomPayload) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ROOM.CREATE_MULTIPLE,
        roomData
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region updateRoom
  updateRoom: async (payload: UpdateRoomPayload) => {
    try {
      const response = await apiClient.put(
        `${API_ENDPOINTS.ROOM.BASE}/${payload.room_id}`,
        { name: payload.name }
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },

  //#region deleteRoom
  deleteRoom: async (roomId: number) => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.ROOM.BASE}/${roomId}`
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      throw new Error(errMessage);
    }
  },
  //#endregion
};
