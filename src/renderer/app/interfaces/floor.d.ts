export interface Floor {
  id: number;
  name: string;
  type: string;
  child: FloorChild[];
  count: number;
}

export interface FloorChild {
  id: number;
  name: string;
  type: string;
  parent_id: number;
  count: number;
  child: RoomChild[];
}

export interface RoomChild {
  id: number;
  name: string;
  device_type: string;
  type: string;
  address: string;
  model_no: number;
  parent_id: number;
  floor_id: string;
  key_count: number;
  group_count: number;
  is_limit_set: boolean;
  sub_node_id: number;
  isGlydea: boolean;
  disp_order: number;
}

export interface CreateMultipleFloorPayload {
  no_of_floors: number;
  floor_prefix: string;
  start_from: number;
}

export interface UpdateFloorPayload {
  floor_id: number;
  name: string;
}

export interface CreateFloorPayload {
  name: string;
}
