import { AxiosError, type AxiosResponse } from "axios";

function getAxiosMessage(input: unknown): string {
  // Extract data from either a response or an error
  const data =
    (input as AxiosResponse)?.data ||
    (input as AxiosError)?.response?.data ||
    {};

  // Try to get message from common places
  if (typeof data === "object" && data?.message) return data.message;
  if (typeof data === "string") return data;

  // Fallbacks
  if ((input as any)?.message) return (input as any).message;

  return "Unknown response";
}

function formatLastOpened(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function value2decArray(value: number): number[] {
  return [value & 0x00FF, (value & 0XFF00) >> 8];
}

function decArray2value(dec: number[]): number {
  return dec[0] + (dec[1] << 8);
}

export { getAxiosMessage, formatLastOpened, sleep, value2decArray, decArray2value };