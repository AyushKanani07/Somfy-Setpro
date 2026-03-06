export interface AddProject {
    project_id: string;
    name: string;
    address: string;
    building_type_id: number;
    last_opened: Date;
    selected: boolean;
}

export interface RoomWiseMotor {
    room_name: string;
    device: Device[]
}

export interface Device {
    id: number;
    name: string;
    address: string;
}

export interface ImportFloor {
    Floor: string;
    Room: string;
}

