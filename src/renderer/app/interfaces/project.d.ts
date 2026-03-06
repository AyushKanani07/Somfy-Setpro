export interface Project {
  building_type_id: number;
  name: string;
  address: string;
  project_id: string;
  selected: boolean;
  last_opened: string;
}

export interface CreateProjectPayload {
  name: string;
  address: string | null;
  building_type_id: number;
}

export interface DashboardCount {
  floor_count: number;
  room_count: number;
  motor_count: number;
  keypad_count: number;
  group_count: number;
  assigned_motor_count: number;
  unassigned_motor_count: number;
  assigned_keypad_count: number;
  unassigned_keypad_count: number;
}

export interface firmwareUpdatePayload {
  device_id: number;
  isBricked: boolean;
  file_name: string;
}