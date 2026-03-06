import apiClient from "~/interceptor/interceptor";
import type { ControlPositionFunctionType } from "~/interfaces/transmitter";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";


export const TransmitterService = {
    //#region get transmitter by id
    getTransmitterById: async (transmitterId: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.TRANSMITTER.BASE}/${transmitterId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set channel command
    setChannelCommand: async (payload: { device_id: number; channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.CHANNEL,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set open prog command
    setOpenProgCommand: async (payload: { device_id: number; channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.OPEN_PROG,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set rts address
    setRtsAddress: async (payload: { device_id: number; channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.RTS_ADDRESS,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get channel mode
    getChannelMode: async (payload: { device_id: number, channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.GET_CHANNEL_MODE,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get rts address
    getRtsAddress: async (payload: { device_id: number, channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.GET_RTS_ADDRESS,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set sun mode
    setSunMode: async (payload: { device_id: number, sun_mode: "on" | "off" }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.SUN_MODE,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region control position
    controlPosition: async (payload: { device_id: number, channel: number, function_type: ControlPositionFunctionType }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.CONTROL_POSITION,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set ip
    setIp: async (payload: { device_id: number, channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.IP,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region send tilt command
    sendTiltCommand: async (payload: { device_id: number, channel: number, function_type: "up" | "down", tilt_amplitude: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.TILT,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region send dim command
    sendDimCommand: async (payload: { device_id: number, channel: number, function_type: "up" | "down", dim_amplitude: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.DIM,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set channel mode
    setChannelMode: async (payload: { device_id: number, channel: number, frequency_mode: "us" | "ce", application_mode: "rolling" | "tilting", feature_set_mode: "modulis" | "normal" }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.CHANNEL_MODE,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set tilt frame count
    setTiltFrameCount: async (payload: { device_id: number, channel: number, tilt_frame_us: number, tilt_frame_ce: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.TILT_FRAME_COUNT,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get tilt frame count
    getTiltFrameCount: async (payload: { device_id: number, channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.GET_TILT_FRAME_COUNT,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set dim frame count
    setDimFrameCount: async (payload: { device_id: number, channel: number, dim_frame: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.DIM_FRAME_COUNT,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get dim frame count
    getDimFrameCount: async (payload: { device_id: number, channel: number }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.GET_DIM_FRAME_COUNT,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get dct lock status
    getDctLock: async (device_id: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.TRANSMITTER.DCT_LOCK}/${device_id}`,
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set dct lock status
    setDctLock: async (payload: { device_id: number, index: number, isLocked: boolean }) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.TRANSMITTER.DCT_LOCK,
                payload
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    }
}