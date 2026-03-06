import type { Device, SocketNewMotor } from "~/interfaces/device";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  addNewMotor,
  closeDeleteDeviceDialog,
  closeDeviceAssignmentDialog,
  closeDeviceScanningDialog,
  closeKeypadFormDialog,
  createGroupDeviceThunk,
  deleteAllUnassignedDevicesThunk,
  deleteUnassignedDevicesByIdsThunk,
  fetchAllCloneDevicesThunk,
  fetchAssignedDevicesThunk,
  fetchUnassignedDevicesThunk,
  getAppVersionByDeviceIdThunk,
  getGroupDeviceByIdThunk,
  moveDeviceToAssigned,
  moveDeviceToUnassigned,
  openDeleteDeviceDialog,
  openDeviceAssignmentDialog,
  openDeviceScanningDialog,
  openKeypadFormDialog,
  removeDeviceFromAllGroupsThunk,
  setAssignedDevices,
  setDevices,
  setDeviceScanningStatus,
  setError,
  setLoading,
  setLoadingDialog,
  setMotorLimitForDevice,
  setScanningType,
  setSelectedDeviceId,
  setSelectedDeviceType,
  setTempDeviceListWhileScanning,
  setUnAssignedDevices,
  updateDeviceRoomIdThunk,
} from "~/store/slices/deviceSlice";
import { lstNodeType, lstSubNodeType } from "~/constant/constant";

export const useDevice = () => {
  // Hook logic to manage device-related state and actions
  const dispatch = useAppDispatch();
  const devices = useAppSelector((state) => state.device);

  const actions = {
    setDevices: (devices: Device[]) => dispatch(setDevices(devices)),
    openDeviceAssignmentDialog: (deviceId: number) =>
      dispatch(openDeviceAssignmentDialog({ deviceId })),
    closeDeviceAssignmentDialog: () => dispatch(closeDeviceAssignmentDialog()),
    setUnAssignedDevices: (devices: Device[]) =>
      dispatch(setUnAssignedDevices(devices)),
    setAssignedDevices: (devices: Device[]) =>
      dispatch(setAssignedDevices(devices)),
    openDeviceScanningDialog: () => dispatch(openDeviceScanningDialog()),
    closeDeviceScanningDialog: () => dispatch(closeDeviceScanningDialog()),
    setDeviceScanningStatus: (status: boolean) =>
      dispatch(setDeviceScanningStatus(status)),
    openKeypadFormDialog: () => dispatch(openKeypadFormDialog()),
    closeKeypadFormDialog: () => dispatch(closeKeypadFormDialog()),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    moveDeviceToAssigned: (deviceId: number) =>
      dispatch(moveDeviceToAssigned(deviceId)),
    moveDeviceToUnassigned: (deviceId: number) =>
      dispatch(moveDeviceToUnassigned(deviceId)),
    setScanningType: (scanningType: "device" | "keypad" | null) =>
      dispatch(setScanningType(scanningType)),
    openDeleteDeviceDialog: (deviceId: "all" | number | null) =>
      dispatch(openDeleteDeviceDialog(deviceId)),
    closeDeleteDeviceDialog: () => dispatch(closeDeleteDeviceDialog()),
    setMotorLimitForDevice: (
      deviceId: number,
      downLimit: number,
      upLimit: number
    ) => dispatch(setMotorLimitForDevice({ deviceId, downLimit, upLimit })),
    addNewMotor: (motor: SocketNewMotor) => dispatch(addNewMotor(motor)),
    setTempDeviceListWhileScanning: (motors: Device[]) =>
      dispatch(setTempDeviceListWhileScanning(motors)),
    updateDeviceRoomIdThunk: (deviceId: number, roomId: number) =>
      dispatch(updateDeviceRoomIdThunk({ deviceId, roomId })),
    setSelectedDeviceId: (deviceId: number | null) =>
      dispatch(setSelectedDeviceId(deviceId)),
    setSelectedDeviceType: (deviceType: string | null) =>
      dispatch(setSelectedDeviceType(deviceType)),
    setLoadingDialog: (data: { isOpen: boolean, message: string }) =>
      dispatch(setLoadingDialog(data)),
  };

  const methods = {
    findDeviceType: (node_id: number) => {
      return lstNodeType.find((motor) => motor.node_id === node_id)
        ?.node_type_name;
    },
    findDeviceTypeBySubNode: (sub_node_id: number) => {
      if (!sub_node_id || sub_node_id === 0) return;
      return lstSubNodeType.find((subNode) => subNode.sub_node_id === sub_node_id)?.key;
    }
  };

  const thunks = {
    fetchAllCloneDevices: () => dispatch(fetchAllCloneDevicesThunk()),
    fetchUnassignedDevices: () => dispatch(fetchUnassignedDevicesThunk()),
    fetchAssignedDevices: () => dispatch(fetchAssignedDevicesThunk()),
    deleteAllUnassignedDevices: () =>
      dispatch(deleteAllUnassignedDevicesThunk()),
    deleteUnassignedDevicesByIds: (deviceIds: number) =>
      dispatch(deleteUnassignedDevicesByIdsThunk(deviceIds)),
    getGroupDeviceByIdThunk: (deviceId: number, isRefresh?: boolean) =>
      dispatch(getGroupDeviceByIdThunk({ deviceId, isRefresh })),
    createGroupDeviceThunk: (payload: { groupId: number; deviceId: number; index?: number }) =>
      dispatch(createGroupDeviceThunk(payload)),
    removeDeviceFromAllGroupsThunk: (deviceId: number) =>
      dispatch(removeDeviceFromAllGroupsThunk(deviceId)),
    getAppVersionByDeviceIdThunk: (device_id: number, isRefresh?: boolean) =>
      dispatch(getAppVersionByDeviceIdThunk({ device_id, isRefresh })),
  };

  return {
    // State
    ...devices,

    // Actions
    ...actions,

    // Methods
    ...methods,

    // Thunks
    ...thunks,
  };
};
