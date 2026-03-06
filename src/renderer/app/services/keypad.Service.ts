import apiClient from "~/interceptor/interceptor";
import type { discoverKeypadData, SwitchSettings } from "~/interfaces/keypad";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const keypadService = {
    //#region Add keypad
    addKeypad: async (data: discoverKeypadData) => {
        try {
            const response = await apiClient.post(
                API_ENDPOINTS.KEYPAD.BASE,
                data
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region Edit keypad
    editKeypad: async (deviceId: number, data: { name: string; key_count: number }) => {
        try {
            const response = await apiClient.put(
                `${API_ENDPOINTS.KEYPAD.BASE}/${deviceId}`,
                data
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region Delete keypad
    deleteKeypad: async (deviceId: number) => {
        try {
            const response = await apiClient.delete(
                `${API_ENDPOINTS.KEYPAD.BASE}/${deviceId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get keypad by id
    getKeypadById: async (deviceId: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.KEYPAD.BASE}/${deviceId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get motor list by room
    getMotorListByRoom: async () => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.MOTOR.MOTOR_BY_ROOM
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region factory reset keypad
    resetKeypad: async (deviceId: number) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.KEYPAD.RESET}/${deviceId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region delete unassigned keypads
    deleteUnassignedKeypads: async (deviceId: number) => {
        try {
            const response = await apiClient.delete(
                `${API_ENDPOINTS.KEYPAD.KEYPAD_UNASSIGNED}/${deviceId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set keypad type
    setKeypadType: async (keypadId: number, type: number) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.KEYPAD.TYPE}`,
                { keypad_id: keypadId, type }
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set keypad switch settings
    setKeypadSwitchSettings: async (keypadId: number, switchSettings: SwitchSettings) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.KEYPAD.SWITCH_SETTING}`,
                { keypad_id: keypadId, switch_data: switchSettings }
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get switch setting
    getSwitchSetting: async (keypadId: number, keyId: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.KEYPAD.SWITCH_SETTING}?keypad_id=${keypadId}&button_id=${keyId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get keypad config schema
    getKeypadConfigSchema: async () => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.KEYPAD.CONFIG_SCHEMA}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region add keypad config schema
    addKeypadConfigSchema: async (configData: any) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.KEYPAD.CONFIG_SCHEMA}`,
                configData
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region get switch group
    getIndividualSwitchGroup: async (deviceId: number) => {
        try {
            const response = await apiClient.get(
                `${API_ENDPOINTS.KEYPAD.SWITCH_GROUP}/${deviceId}`
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        }
    },

    //#region set switch group
    setIndividualSwitchGroup: async (keypad_id: number, group_addresses: any) => {
        try {
            const response = await apiClient.post(
                `${API_ENDPOINTS.KEYPAD.SWITCH_GROUP}`,
                { keypad_id, group_addresses }
            );
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            throw new Error(errMessage);
        };
    }


}