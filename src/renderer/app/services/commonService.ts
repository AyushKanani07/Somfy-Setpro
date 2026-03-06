import type { TreeNode } from "primereact/treenode";
import type { Floor } from "~/interfaces/floor";
import type { Room } from "~/interfaces/room";

/**
 * Transforms floor data into PrimeReact TreeNode format
 * Only rooms are selectable (not floors)
 * @param floors - Array of Floor objects
 * @returns Array of TreeNodes with only rooms as leaf nodes
 */
export const getRoomTreeNodesForSelect = (floors: Floor[]): TreeNode[] => {
  return floors.map((floor) => ({
    key: `floor-${floor.id}`,
    label: floor.name,
    icon: "pi pi-fw pi-building",
    data: {
      id: floor.id,
      name: floor.name,
      type: floor.type,
    },
    selectable: false, // Floors are not selectable
    children: floor.child
      ? floor.child.map((room) => ({
          key: `room-${room.id}`,
          label: room.name,
          icon: "pi pi-fw pi-home",
          data: {
            id: room.id,
            name: room.name,
            type: room.type,
            floorId: floor.id,
          },
          selectable: true, // Only rooms are selectable
          leaf: true,
        }))
      : [],
  }));
};

/**
 * Transforms room data from useRooms hook into PrimeReact TreeNode format
 * Only rooms are selectable (not floors)
 * @param roomsData - Array of Room objects from useRooms hook
 * @returns Array of TreeNodes with rooms as leaf nodes
 */
export const getRoomTreeNodesForSelectFromRoomData = (
  roomsData: Room[]
): TreeNode[] => {
  return roomsData.map((floorGroup) => ({
    key: `floor-${floorGroup.floor}`,
    label: floorGroup.floor,
    icon: "pi pi-fw pi-building",
    data: {
      name: floorGroup.floor,
      type: "floor",
    },
    selectable: false, // Floors are not selectable
    children: floorGroup.room
      ? floorGroup.room.map((room) => ({
          key: `room-${room.id}`,
          label: room.name,
          icon: "pi pi-fw pi-home",
          data: {
            id: room.id,
            name: room.name,
            type: "room",
          },
          selectable: true, // Only rooms are selectable
          leaf: true,
        }))
      : [],
  }));
};

export const commonService = {
  getRoomTreeNodesForSelect,
  getRoomTreeNodesForSelectFromRoomData,
};
