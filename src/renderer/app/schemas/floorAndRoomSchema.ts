import { z } from "zod";

// Single Floor Schema
export const createSingleFloorSchema = z.object({
  floorName: z.string().min(1, "Floor name is required").trim(),
});

// Multiple Floors Schema
export const createMultipleFloorsSchema = z.object({
  numberOfFloors: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Number of floors must be greater than 0",
    }),
  floorPrefix: z.string().min(1, "Floor prefix is required").trim(),
  floorStartFrom: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Start from must be a valid number",
    }),
});

// Single Room Schema
export const createSingleRoomSchema = z.object({
  roomName: z.string().min(1, "Room name is required").trim(),
});

// Multiple Rooms Schema
export const createMultipleRoomsSchema = z.object({
  numberOfRooms: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Number of rooms must be greater than 0",
    }),
  roomPrefix: z.string().min(1, "Room prefix is required").trim(),
  roomStartFrom: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Start from must be a valid number",
    }),
});

// Combined schema for all modes
export const floorAndRoomFormSchema = z.union([
  z.object({
    mode: z.literal("singleFloor"),
    floorName: z.string().min(1, "Floor name is required").trim(),
    numberOfFloors: z.string().optional(),
    floorPrefix: z.string().optional(),
    floorStartFrom: z.string().optional(),
    roomName: z.string().optional(),
    numberOfRooms: z.string().optional(),
    roomPrefix: z.string().optional(),
    roomStartFrom: z.string().optional(),
  }),
  z.object({
    mode: z.literal("multipleFloors"),
    floorName: z.string().optional(),
    numberOfFloors: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Number of floors must be greater than 0",
      }),
    floorPrefix: z.string().min(1, "Floor prefix is required").trim(),
    floorStartFrom: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Start from must be a valid number",
      }),
    roomName: z.string().optional(),
    numberOfRooms: z.string().optional(),
    roomPrefix: z.string().optional(),
    roomStartFrom: z.string().optional(),
  }),
  z.object({
    mode: z.literal("singleRoom"),
    floorName: z.string().optional(),
    numberOfFloors: z.string().optional(),
    floorPrefix: z.string().optional(),
    floorStartFrom: z.string().optional(),
    roomName: z.string().min(1, "Room name is required").trim(),
    numberOfRooms: z.string().optional(),
    roomPrefix: z.string().optional(),
    roomStartFrom: z.string().optional(),
  }),
  z.object({
    mode: z.literal("multipleRooms"),
    floorName: z.string().optional(),
    numberOfFloors: z.string().optional(),
    floorPrefix: z.string().optional(),
    floorStartFrom: z.string().optional(),
    roomName: z.string().optional(),
    numberOfRooms: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Number of rooms must be greater than 0",
      }),
    roomPrefix: z.string().min(1, "Room prefix is required").trim(),
    roomStartFrom: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Start from must be a valid number",
      }),
  }),
]);

export type FloorAndRoomFormData = z.infer<typeof floorAndRoomFormSchema>;

// Room Selection Schema for Device Assignment
export const deviceAssignmentSchema = z.object({
  room_id: z
    .number()
    .min(1, "Room selection is required")
    .positive("Please select a valid room"),
});

export type DeviceAssignmentFormData = z.infer<typeof deviceAssignmentSchema>;
