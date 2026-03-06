import apiClient from "~/interceptor/interceptor";
import { API_ENDPOINTS } from "~/utils/api-endpoints";
import { getAxiosMessage } from "~/utils/helperFunctions";


export const ReportService = {
    //#region get report
    getReport: async () => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.REPORT.BASE,
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

    //#region get communication log report
    getCommunicationLogReport: async () => {
        try {
            const response = await apiClient.get(
                API_ENDPOINTS.REPORT.COMMUNICATION_LOG,
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

}