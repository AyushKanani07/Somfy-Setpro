import apiClient from "~/interceptor/interceptor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";


export const ReceiverService = {
    //#region get receiver by id
    getReceiverById: async (receiverId: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.RECEIVER.BASE}/${receiverId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region factory reset
    factoryReset: async (receiverId: number) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.RECEIVER.FACTORY_RESET}/${receiverId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set Channel status
    setChannelStatus: async (receiverId: number, index: number, action: "config" | "delete" | "close-config") => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.RECEIVER.CHANNEL_STATUS}`,
                {
                    device_id: receiverId,
                    index,
                    action,
                }
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get Channel status
    getChannelStatus: async (receiverId: number, index: number, isRefresh: boolean = false) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.RECEIVER.CHANNEL_STATUS}/${receiverId}?index=${index}&refresh=${isRefresh}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get all channels status for a receiver
    getAllChannelStatus: async (receiverId: number, isRefresh: boolean = false) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.RECEIVER.ALL_CHANNEL_STATUS}/${receiverId}?refresh=${isRefresh}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region remove all channels for a receiver
    removeAllChannels: async (receiverId: number) => {
        try {
            const response = await apiClient.delete(
                `${API_ENDPOINTS.RECEIVER.REMOVE_ALL_CHANNELS}/${receiverId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },


}