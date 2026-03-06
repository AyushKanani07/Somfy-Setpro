/**
 * Check if running on client side
 */
const isClient = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * LocalStorage Service
 * Provides a centralized way to interact with browser's localStorage
 * Works on both client and server side (gracefully handles server)
 */
export const localStorageService = {
  /**
   * Set an item in localStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be stringified if object)
   */
  setItem: (key: string, value: any): void => {
    try {
      if (isClient()) {
        const serialized =
          typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } else {
        console.debug(
          `[Server] localStorage.setItem("${key}") - Skipped on server side`
        );
      }
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
    }
  },

  /**
   * Get an item from localStorage
   * @param key - The key to retrieve
   * @param parse - Whether to parse JSON (default: true)
   * @returns The stored value or null if not found
   */
  getItem: (key: string, parse: boolean = true): any => {
    try {
      if (isClient()) {
        const item = localStorage.getItem(key);
        return item ? (parse ? JSON.parse(item) : item) : null;
      } else {
        console.debug(
          `[Server] localStorage.getItem("${key}") - Returns null on server side`
        );
        return null;
      }
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  removeItem: (key: string): void => {
    try {
      if (isClient()) {
        localStorage.removeItem(key);
      } else {
        console.debug(
          `[Server] localStorage.removeItem("${key}") - Skipped on server side`
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): void => {
    try {
      if (isClient()) {
        localStorage.clear();
      } else {
        console.debug("[Server] localStorage.clear() - Skipped on server side");
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  /**
   * Get all keys from localStorage
   */
  getAllKeys: (): string[] => {
    try {
      if (isClient()) {
        return Object.keys(localStorage);
      }
      console.debug(
        "[Server] localStorage.getAllKeys() - Returns empty array on server side"
      );
      return [];
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  },

  /**
   * Get the number of items in localStorage
   */
  length: (): number => {
    try {
      if (isClient()) {
        return localStorage.length;
      }
      console.debug(
        "[Server] localStorage.length() - Returns 0 on server side"
      );
      return 0;
    } catch (error) {
      console.error("Error getting localStorage length:", error);
      return 0;
    }
  },

  /**
   * Check if running on client side
   */
  isClient: (): boolean => isClient(),
};

/**
 * SessionStorage Service
 * Provides a centralized way to interact with browser's sessionStorage
 * Works on both client and server side (gracefully handles server)
 */
export const sessionStorageService = {
  /**
   * Set an item in sessionStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be stringified if object)
   */
  setItem: (key: string, value: any): void => {
    try {
      if (isClient()) {
        const serialized =
          typeof value === "string" ? value : JSON.stringify(value);
        sessionStorage.setItem(key, serialized);
      } else {
        console.debug(
          `[Server] sessionStorage.setItem("${key}") - Skipped on server side`
        );
      }
    } catch (error) {
      console.error(`Error setting sessionStorage item "${key}":`, error);
    }
  },

  /**
   * Get an item from sessionStorage
   * @param key - The key to retrieve
   * @param parse - Whether to parse JSON (default: true)
   * @returns The stored value or null if not found
   */
  getItem: (key: string, parse: boolean = true): any => {
    try {
      if (isClient()) {
        const item = sessionStorage.getItem(key);
        return item ? (parse ? JSON.parse(item) : item) : null;
      } else {
        console.debug(
          `[Server] sessionStorage.getItem("${key}") - Returns null on server side`
        );
        return null;
      }
    } catch (error) {
      console.error(`Error getting sessionStorage item "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove an item from sessionStorage
   * @param key - The key to remove
   */
  removeItem: (key: string): void => {
    try {
      if (isClient()) {
        sessionStorage.removeItem(key);
      } else {
        console.debug(
          `[Server] sessionStorage.removeItem("${key}") - Skipped on server side`
        );
      }
    } catch (error) {
      console.error(`Error removing sessionStorage item "${key}":`, error);
    }
  },

  /**
   * Clear all items from sessionStorage
   */
  clear: (): void => {
    try {
      if (isClient()) {
        sessionStorage.clear();
      } else {
        console.debug(
          "[Server] sessionStorage.clear() - Skipped on server side"
        );
      }
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  },

  /**
   * Get all keys from sessionStorage
   */
  getAllKeys: (): string[] => {
    try {
      if (isClient()) {
        return Object.keys(sessionStorage);
      }
      console.debug(
        "[Server] sessionStorage.getAllKeys() - Returns empty array on server side"
      );
      return [];
    } catch (error) {
      console.error("Error getting sessionStorage keys:", error);
      return [];
    }
  },

  /**
   * Get the number of items in sessionStorage
   */
  length: (): number => {
    try {
      if (isClient()) {
        return sessionStorage.length;
      }
      console.debug(
        "[Server] sessionStorage.length() - Returns 0 on server side"
      );
      return 0;
    } catch (error) {
      console.error("Error getting sessionStorage length:", error);
      return 0;
    }
  },

  /**
   * Check if running on client side
   */
  isClient: (): boolean => isClient(),
};
