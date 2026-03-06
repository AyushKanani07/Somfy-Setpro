import type { TreeNode } from "primereact/treenode";
import type { Floor, FloorChild, RoomChild } from "~/interfaces/floor";

/**
 * Transforms Floor data structure into PrimeReact TreeNode format
 * @param floors - Array of Floor objects from the API
 * @returns Array of TreeNodes ready for PrimeReact Tree component
 */
export const transformFloorsToTreeNodes = (floors: Floor[]): TreeNode[] => {
  return floors.map((floor) => ({
    key: `fi:${floor.id}`,
    label: floor.name || "Unnamed Floor",
    field: floor.name || "Unnamed Floor",
    icon: "pi pi-fw pi-building",
    data: {
      id: floor.id,
      name: floor.name,
      type: floor.type,
      count: floor.count,
    },
    children: floor.child
      ? floor.child.map((room) => transformRoomToTreeNode(room, floor.id))
      : [],
  }));
};

/**
 * Transforms a single FloorChild (room) into a TreeNode
 * @param room - FloorChild object
 * @param floorId - Parent floor ID for reference
 * @returns TreeNode representing the room
 */
const transformRoomToTreeNode = (
  room: FloorChild,
  floorId: number
): TreeNode => {
  return {
    key: `fi:${floorId}-ri:${room.id}`,
    label: `${room.name || "Unnamed Room"} (Count: ${room.child.length})`,
    field: room.name || "Unnamed Room",
    icon: "pi pi-fw pi-home",
    data: {
      id: room.id,
      name: room.name,
      type: room.type,
      floorId: floorId,
    },
    children: room.child
      ? room.child.map((device) =>
          transformDeviceToTreeNode(device, floorId, room.id)
        )
      : [],
  };
};

/**
 * Transforms a single RoomChild (device) into a TreeNode
 * @param device - RoomChild object representing a device
 * @param floorId - Parent floor ID for reference
 * @returns TreeNode representing the device
 */
const transformDeviceToTreeNode = (
  device: RoomChild,
  floorId: number,
  roomId: number
): TreeNode => {
  return {
    key: `fi:${floorId}-ri:${roomId}-di:${device.id}`,
    label: `${device.name ? device.name : ""} (${device.address})`,
    field: device.name,
    // icon: getDeviceIcon(device.device_type),
    data: {
      id: device.id,
      name: device.name,
      device_type: device.device_type,
      type: device.type,
      address: device.address,
      model_no: device.model_no,
      floorId: floorId,
      key_count: device.key_count,
      group_count: device.group_count,
      is_limit_set: device.is_limit_set,
      isGlydea: device.isGlydea,
    },
    leaf: true,
  };
};

/**
 * Returns appropriate icon based on device type
 * @param deviceType - Type of device
 * @returns Icon class string
 */
const getDeviceIcon = (deviceType: string): string => {
  const deviceTypeLower = deviceType?.toLowerCase();

  const iconMap: Record<string, string> = {
    motor: "pi pi-fw pi-cog",
    blind: "pi pi-fw pi-window-minimize",
    shade: "pi pi-fw pi-square",
    shutter: "pi pi-fw pi-window-maximize",
    gateway: "pi pi-fw pi-server",
    controller: "pi pi-fw pi-sliders-h",
    default: "pi pi-fw pi-cube",
  };

  return iconMap[deviceTypeLower] || iconMap.default;
};
