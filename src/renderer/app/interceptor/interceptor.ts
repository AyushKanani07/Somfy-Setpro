import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import { toast } from "sonner";
import { getAxiosMessage } from "~/utils/helperFunctions";

export const API_BASE_URL = "http://localhost:3339/api/";

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60 * 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available

    // Add request ID for tracking
    if (config.headers) {
      config.headers["X-Request-ID"] = generateRequestId();
    }

    // Log request in development (disabled to prevent duplicate logs)
    // if (process.env.NODE_ENV === "development") {
    //   console.log("🚀 Request:", {
    //     method: config.method?.toUpperCase(),
    //     url: config.url,
    //     baseURL: config.baseURL,
    //     headers: config.headers,
    //     data: config.data,
    //   });
    // }

    return config;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development (disabled to prevent duplicate logs)
    // if (process.env.NODE_ENV === "development") {
    //   console.log("✅ Response:", {
    //     status: response.status,
    //     statusText: response.statusText,
    //     url: response.config.url,
    //     data: response.data,
    //   });
    // }

    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      const errMessage = getAxiosMessage(error.response);
      toast.error(
        errMessage || "An error occurred while processing your request."
      );
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          break;

        case 403:
          // Forbidden
          console.error(
            "Access denied. You do not have permission to access this resource."
          );
          break;

        case 404:
          // Not found
          console.error("Resource not found.");
          break;

        case 500:
          // Internal server error
          console.error("Internal server error. Please try again later.");
          break;

        case 503:
          // Service unavailable
          console.error(
            "Service temporarily unavailable. Please try again later."
          );
          break;

        default:
          const errorMessage =
            (data as any)?.message || error.message || "An error occurred";
          console.error("An error occurred:", errorMessage);
      }

      // Log error details in development
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Response Error:", {
          status,
          statusText: error.response.statusText,
          url: error.config?.url,
          data,
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network error. Please check your internet connection.");

      if (process.env.NODE_ENV === "development") {
        console.error("❌ Network Error:", error.request);
      }
    } else {
      // Something else happened
      console.error("An unexpected error occurred:", error.message);

      if (process.env.NODE_ENV === "development") {
        console.error("❌ Unexpected Error:", error);
      }
    }

    return Promise.reject(error);
  }
);

// Utility function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export the axios instance for advanced usage
export default apiClient;
