export interface Room {
  floor: string;
  room: {
    id: number;
    name: string;
  }[];
}

export type RoomData = Room[];
export interface CreateRoomPayload {
  floor_id: number;
  name: string;
}

export interface CreateMultipleRoomPayload {
  floor_id: number;
  no_of_rooms: number;
  room_prefix: string;
  start_from: number;
}

export interface UpdateRoomPayload {
  room_id: number;
  name: string;
}
