import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
  DEVICE_MOTOR_LIMIT,
  lstNodeType,
  lstSubNodeType,
} from "~/constant/constant";
import type { Device, SocketNewMotor } from "~/interfaces/device";
import type { groupDeviceData } from "~/interfaces/groupView";
import { deviceService } from "~/services/deviceService";
import { groupViewService } from "~/services/groupViewService";
import { motorService } from "~/services/motorService";
import { getAxiosMessage } from "~/utils/helperFunctions";
import { updateAppVersion } from "./motorSlice";
import { set } from "zod";

interface DeviceState {
  devices: Device[];
  assignedDevices: Device[];
  unassignedDevices: Device[];
  tempDeviceListWhileScanning: Device[];
  deviceGroup: groupDeviceData[] | null;
  deviceAssignmentDialog: boolean;
  selectedDeviceForAssignment: number | null;
  deviceScanningDialog: boolean;
  deviceScanningStatus: boolean;
  keypadFormDialog: boolean;
  scanningType: "device" | "keypad" | null;
  deleteDeviceDialog: boolean;
  selectedDeviceForDeletion: "all" | number | null;
  selectedDeviceId: number | null;
  selectedDeviceType: string | null;
  loading: boolean;
  loadingDialog: { isOpen: boolean; message: string };
  error: string | null;
}

const initialState: DeviceState = {
  devices: [],
  assignedDevices: [],
  unassignedDevices: [],
  tempDeviceListWhileScanning: [],
  deviceGroup: null,
  deviceAssignmentDialog: false,
  selectedDeviceForAssignment: null,
  deviceScanningDialog: false,
  deviceScanningStatus: false,
  keypadFormDialog: false,
  scanningType: null,
  deleteDeviceDialog: false,
  selectedDeviceForDeletion: null,
  selectedDeviceId: null,
  selectedDeviceType: null,
  loading: false,
  loadingDialog: { isOpen: false, message: '' },
  error: null,
};

//#region fetch allCloneDevices thunk

export const fetchAllCloneDevicesThunk = createAsyncThunk(
  "device/fetchAllCloneDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceService.getAllCloneDevices();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region fetch unassignedDevices thunk

export const fetchUnassignedDevicesThunk = createAsyncThunk(
  "device/fetchUnassignedDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceService.getUnassignedDevices();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region fetch assignedDevices thunk

export const fetchAssignedDevicesThunk = createAsyncThunk(
  "device/fetchAssignedDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceService.getAssignedDevices();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region delete all unassigned devices thunk

export const deleteAllUnassignedDevicesThunk = createAsyncThunk(
  "device/deleteAllUnassignedDevices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await deviceService.deleteAllUnassignedDevices();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region delete unassigned devices by IDs thunk
export const deleteUnassignedDevicesByIdsThunk = createAsyncThunk(
  "device/deleteUnassignedDevicesByIds",
  async (deviceIds: number, { rejectWithValue }) => {
    try {
      const response =
        await deviceService.deleteUnassignedDevicesByIds(deviceIds);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Update DeviceRoomIdThunk
export const updateDeviceRoomIdThunk = createAsyncThunk(
  "device/updateDeviceRoomId",
  async (payload: { deviceId: number; roomId: number }, { rejectWithValue }) => {
    try {
      const { roomId, deviceId } = payload;
      const response = await motorService.updateMotorRoom(deviceId, roomId);
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get group device by device id
export const getGroupDeviceByIdThunk = createAsyncThunk(
  "groupView/getGroupDeviceById",
  async ({ deviceId, isRefresh }: { deviceId: number, isRefresh?: boolean }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoadingDialog({ isOpen: true, message: "Loading Groups..." }));
      const response = await groupViewService.getGroupDeviceByDeviceId(deviceId, isRefresh);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get group device by device id");
    } finally {
      dispatch(setLoadingDialog({ isOpen: false, message: "" }));
    }
  }
);

//#region add device to group thunk
export const createGroupDeviceThunk = createAsyncThunk(
  "groupView/createGroupDevice",
  async ({ groupId, deviceId, index }: { groupId: number, deviceId: number, index?: number }, { rejectWithValue }) => {
    try {
      const response = await groupViewService.createGroupDevice({ group_id: groupId, device_id: deviceId, index });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove device from group");
    }
  }
);

//#region remove device from all groups thunk
export const removeDeviceFromAllGroupsThunk = createAsyncThunk(
  "groupView/removeDeviceFromAllGroups",
  async (device_id: number, { rejectWithValue }) => {
    try {
      const response = await groupViewService.removeDeviceFromAllGroups(device_id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove device from group");
    }
  }
);

//#region get app version by device id thunk
export const getAppVersionByDeviceIdThunk = createAsyncThunk(
  "device/getAppVersionByDeviceId",
  async ({ device_id, isRefresh }: { device_id: number, isRefresh?: boolean }, { rejectWithValue, dispatch }) => {
    try {
      const response = await deviceService.getAppVersion(device_id, isRefresh);
      dispatch(updateAppVersion({ app_version: response.data.app_version, device_id }));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get app version by device id");
    }
  }
);

//#region device slice

const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
    },

    openDeviceAssignmentDialog(
      state,
      action: PayloadAction<{ deviceId: number }>
    ) {
      state.deviceAssignmentDialog = true;
      state.selectedDeviceForAssignment = action.payload.deviceId;
    },

    closeDeviceAssignmentDialog(state) {
      state.deviceAssignmentDialog = false;
      state.selectedDeviceForAssignment = null;
    },

    setUnAssignedDevices: (state, action: PayloadAction<Device[]>) => {
      state.unassignedDevices = action.payload;
    },

    setAssignedDevices: (state, action: PayloadAction<Device[]>) => {
      state.assignedDevices = action.payload;
    },

    openDeviceScanningDialog: (state) => {
      state.deviceScanningDialog = true;
    },

    closeDeviceScanningDialog: (state) => {
      state.deviceScanningDialog = false;
    },

    openKeypadFormDialog: (state) => {
      state.keypadFormDialog = true;
    },

    closeKeypadFormDialog: (state) => {
      state.keypadFormDialog = false;
    },

    setDeviceScanningStatus: (state, action: PayloadAction<boolean>) => {
      state.deviceScanningStatus = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    moveDeviceToAssigned: (state, action: PayloadAction<number>) => {
      const deviceId = action.payload;
      const deviceIndex = state.unassignedDevices.findIndex(
        (d) => d.device_id === deviceId
      );

      if (deviceIndex > -1) {
        const [device] = state.unassignedDevices.splice(deviceIndex, 1);
        state.assignedDevices.push(device);
      }
    },

    moveDeviceToUnassigned: (state, action: PayloadAction<number>) => {
      const deviceId = action.payload;
      const deviceIndex = state.assignedDevices.findIndex(
        (d) => d.device_id === deviceId
      );

      if (deviceIndex > -1) {
        const [device] = state.assignedDevices.splice(deviceIndex, 1);
        state.unassignedDevices.push(device);
      }
    },

    setScanningType: (
      state,
      action: PayloadAction<"device" | "keypad" | null>
    ) => {
      state.scanningType = action.payload;
    },

    openDeleteDeviceDialog: (
      state,
      action: PayloadAction<"all" | number | null>
    ) => {
      state.deleteDeviceDialog = true;
      state.selectedDeviceForDeletion = action.payload;
    },

    closeDeleteDeviceDialog: (state) => {
      state.deleteDeviceDialog = false;
      state.selectedDeviceForDeletion = null;
    },

    setMotorLimitForDevice: (
      state,
      action: PayloadAction<{
        deviceId: number;
        downLimit: number;
        upLimit: number;
      }>
    ) => {
      const { deviceId, downLimit, upLimit } = action.payload;
      const unassignedDevice = state.unassignedDevices.find(
        (d) => d.device_id === deviceId
      );
      const device = state.devices.find((d) => d.device_id === deviceId);
      const assignedDevice = state.assignedDevices.find(
        (d) => d.device_id === deviceId
      );
      if (unassignedDevice) {
        // Assuming the device has properties for limits
        unassignedDevice.down_limit = downLimit;
        unassignedDevice.up_limit = upLimit;
        if (
          downLimit !== DEVICE_MOTOR_LIMIT ||
          upLimit !== DEVICE_MOTOR_LIMIT
        ) {
          unassignedDevice.is_limit_set = true;
        }
      }
      if (device) {
        device.down_limit = downLimit;
        device.up_limit = upLimit;
        if (
          downLimit !== DEVICE_MOTOR_LIMIT ||
          upLimit !== DEVICE_MOTOR_LIMIT
        ) {
          device.is_limit_set = true;
        }
      }
      if (assignedDevice) {
        assignedDevice.down_limit = downLimit;
        assignedDevice.up_limit = upLimit;
        if (
          downLimit !== DEVICE_MOTOR_LIMIT ||
          upLimit !== DEVICE_MOTOR_LIMIT
        ) {
          assignedDevice.is_limit_set = true;
        }
      }
    },

    addNewMotor: (state, action: PayloadAction<SocketNewMotor>) => {
      const newMotor = action.payload;
      const existsInAssigned = state.assignedDevices.some(
        (d) => d.device_id === newMotor.device_id
      );
      const existsInUnassigned = state.unassignedDevices.some(
        (d) => d.device_id === newMotor.device_id
      );
      if (!existsInAssigned && !existsInUnassigned) {
        state.unassignedDevices.push({
          ...newMotor,
          device_type: "motor",
          is_limit_set: false,
          model_name: lstNodeType.find((n) => n.node_id === newMotor.model_no)
            ?.node_type_name,
          sub_node_name: lstSubNodeType.find(
            (n) => n.sub_node_id === newMotor.sub_node_id
          )?.sub_node_name,
        } as Device);
      }
    },

    setTempDeviceListWhileScanning: (
      state,
      action: PayloadAction<Device[]>
    ) => {
      state.tempDeviceListWhileScanning = action.payload;
    },

    removeMotorFromAssigned: (state, action: PayloadAction<number>) => {
      const motorId = action.payload;
      const getAssignDevice = state.assignedDevices.find(device => device.device_id === motorId);
      if (getAssignDevice) {
        state.unassignedDevices.push(getAssignDevice);

        state.assignedDevices = state.assignedDevices.filter(
          (device) => device.device_id !== motorId
        );
      }
      state.devices = state.devices.filter(
        (device) => device.device_id !== motorId
      );
    },

    updateDeviceIsLimitSet: (state, action: PayloadAction<{ deviceId: number; isLimitSet: boolean }>) => {
      const { deviceId, isLimitSet } = action.payload;
      const device = state.assignedDevices.find(d => d.device_id === deviceId) || state.unassignedDevices.find(d => d.device_id === deviceId);
      if (device) {
        device.is_limit_set = isLimitSet;
      }
    },

    updateGroupDeviceOnDelete: (state, action: PayloadAction<number>) => {
      const group_id = action.payload;
      if (state.deviceGroup?.length) {
        state.deviceGroup = state.deviceGroup?.filter(device => device.group_id !== group_id);
      }
    },

    setSelectedDeviceId: (state, action: PayloadAction<number | null>) => {
      state.selectedDeviceId = action.payload;
    },

    setSelectedDeviceType: (state, action: PayloadAction<string | null>) => {
      state.selectedDeviceType = action.payload;
    },

    setLoadingDialog: (state, action: PayloadAction<{ isOpen: boolean; message: string }>) => {
      state.loadingDialog = action.payload;
    }


  },
  extraReducers: (builder) => {
    //#region fetch allCloneDevices builder
    builder.addCase(fetchAllCloneDevicesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllCloneDevicesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.devices = action.payload;
    });
    builder.addCase(fetchAllCloneDevicesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region fetch unassignedDevices builder
    builder.addCase(fetchUnassignedDevicesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUnassignedDevicesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.unassignedDevices = action.payload.map((element: Device) => ({
        ...element,
        model_name: lstNodeType.find((n) => n.node_id === element.model_no)
          ?.node_type_name,
        sub_node_name: lstSubNodeType.find(
          (n) => n.sub_node_id === element.sub_node_id
        )?.sub_node_name,
      }));
    });
    builder.addCase(fetchUnassignedDevicesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region fetch assignedDevices builder
    builder.addCase(fetchAssignedDevicesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAssignedDevicesThunk.fulfilled, (state, action) => {
      state.loading = false;
      const newData = action.payload.map((element: Device) => ({
        ...element,
        model_name: lstNodeType.find((n) => n.node_id === element.model_no)
          ?.node_type_name,
        sub_node_name: lstSubNodeType.find(
          (n) => n.sub_node_id === element.sub_node_id
        )?.sub_node_name,
      }));
      state.assignedDevices = newData;
    });
    builder.addCase(fetchAssignedDevicesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region delete all unassigned devices builder
    builder.addCase(deleteAllUnassignedDevicesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAllUnassignedDevicesThunk.fulfilled, (state) => {
      state.loading = false;
      state.unassignedDevices = [];
    });
    builder.addCase(
      deleteAllUnassignedDevicesThunk.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }
    );

    //#region delete unassigned devices by IDs builder
    builder.addCase(deleteUnassignedDevicesByIdsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deleteUnassignedDevicesByIdsThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        const deletedDeviceId = action.meta.arg;
        state.unassignedDevices = state.unassignedDevices.filter(
          (device) => device.device_id !== deletedDeviceId
        );
      }
    );
    builder.addCase(
      deleteUnassignedDevicesByIdsThunk.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      }
    );

    //#region update DeviceRoomIdThunk builder
    builder
      .addCase(updateDeviceRoomIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeviceRoomIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDevice: { device_id: number, room_id: number } = action.payload;
        const isAssignedDevice = state.assignedDevices.find(device => device.device_id === updatedDevice.device_id);
        if (isAssignedDevice) {
          state.assignedDevices.find(device => device.device_id === updatedDevice.device_id)!.room_id = updatedDevice.room_id;
        } else {
          let getUnassignedDevice = state.unassignedDevices.find(device => device.device_id === updatedDevice.device_id);
          if (getUnassignedDevice) {
            getUnassignedDevice.room_id = updatedDevice.room_id;
            state.unassignedDevices = state.unassignedDevices.filter(device => device.device_id !== updatedDevice.device_id);
            state.assignedDevices.push(getUnassignedDevice);
          }
        }
      })
      .addCase(updateDeviceRoomIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get group device by device id builder
    builder
      .addCase(getGroupDeviceByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGroupDeviceByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const groupData: groupDeviceData[] = action.payload.map((ele: any) => ({
          index: ele.device_group_pos,
          address: ele.tbl_group.address,
          name: ele.tbl_group.name,
          group_id: ele.group_id,
        }));
        state.deviceGroup = groupData;

      })
      .addCase(getGroupDeviceByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region create group device builder
    builder
      .addCase(createGroupDeviceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupDeviceThunk.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        const newGroupDevice: groupDeviceData = {
          index: data.device_group_pos,
          address: data.address,
          name: data.name,
          group_id: data.group_id,
        }
        state.deviceGroup = state.deviceGroup ? [...state.deviceGroup, newGroupDevice] : [newGroupDevice];
      })
      .addCase(createGroupDeviceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region remove device from all groups builder
    builder
      .addCase(removeDeviceFromAllGroupsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeDeviceFromAllGroupsThunk.fulfilled, (state) => {
        state.loading = false;
        state.deviceGroup = [];
      })
      .addCase(removeDeviceFromAllGroupsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get firmware version by device id builder
    builder
      .addCase(getAppVersionByDeviceIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppVersionByDeviceIdThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(getAppVersionByDeviceIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#endregion
  },
});
export const {
  setDevices,
  openDeviceAssignmentDialog,
  closeDeviceAssignmentDialog,
  setUnAssignedDevices,
  setAssignedDevices,
  openDeviceScanningDialog,
  closeDeviceScanningDialog,
  setDeviceScanningStatus,
  openKeypadFormDialog,
  closeKeypadFormDialog,
  setLoading,
  setError,
  moveDeviceToAssigned,
  moveDeviceToUnassigned,
  openDeleteDeviceDialog,
  closeDeleteDeviceDialog,
  setScanningType,
  setMotorLimitForDevice,
  addNewMotor,
  setTempDeviceListWhileScanning,
  removeMotorFromAssigned,
  updateDeviceIsLimitSet,
  updateGroupDeviceOnDelete,
  setSelectedDeviceId,
  setSelectedDeviceType,
  setLoadingDialog
} = deviceSlice.actions;
export default deviceSlice.reducer;
