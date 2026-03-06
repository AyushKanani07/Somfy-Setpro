import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import type {
  CreateMutipleDevice,
  DeleteGroupDevice,
  GroupData,
  GroupDeviceData,
} from "~/interfaces/groupView";
import { groupViewService } from "~/services/groupViewService";
import { updateGroupDeviceOnDelete } from "./deviceSlice";

export interface CreateGroupPayload {
  address: string;
  name: string;
}

export interface AddMotorToGroupPayload {
  groupId: number;
  motor: DraggedDevice;
}

export interface RemoveMotorFromGroupPayload {
  groupId: number;
  motorId: number;
}

export interface DraggedDevice {
  type: "room-child-device";
  deviceId: number;
  deviceName: string;
  deviceType: string;
}

interface GroupViewState {
  groups: GroupData[];
  groupDevices: GroupDeviceData[];
  selectedGroupId: number | null;
  openCreateNewGroupDialog: boolean;
  currentDragItem: DraggedDevice | null;
  groupScanningDialog: boolean;
  groupScanningStatus: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: GroupViewState = {
  groups: [],
  groupDevices: [],
  selectedGroupId: null,
  openCreateNewGroupDialog: false,
  groupScanningDialog: false,
  groupScanningStatus: false,
  currentDragItem: null,
  loading: false,
  error: null,
};

//#region fetchGroups
export const fetchGroupsThunk = createAsyncThunk(
  "groupView/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await groupViewService.getGroups();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch groups");
    }
  }
);

//#region fetchGroupDevices
export const fetchGroupDevicesThunk = createAsyncThunk(
  "groupView/fetchGroupDevices",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const response = await groupViewService.getGroupDevices();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch group devices");
    }
  }
);

//#region create multiple group devices
export const createMultipleGroupDevicesThunk = createAsyncThunk(
  "groupView/createMultipleGroupDevices",
  async (payload: CreateMutipleDevice, { rejectWithValue }) => {
    try {
      const response =
        await groupViewService.createMultipleGroupDevices(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to create multiple group devices"
      );
    }
  }
);

//#region delete group device
export const deleteGroupDeviceThunk = createAsyncThunk(
  "groupView/deleteGroupDevice",
  async (payload: DeleteGroupDevice, { rejectWithValue, dispatch }) => {
    try {
      const response = await groupViewService.deleteGroupDevice(payload);
      dispatch(updateGroupDeviceOnDelete(payload.group_id));
      return { data: response.data, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete group device");
    }
  }
);

//#region delete group
export const deleteGroupThunk = createAsyncThunk(
  "groupView/deleteGroup",
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await groupViewService.deleteGroup(groupId);
      return { data: response.data, groupId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete group");
    }
  });

//#region createGroup
export const createGroupThunk = createAsyncThunk(
  "groupView/createGroup",
  async (payload: CreateGroupPayload, { rejectWithValue }) => {
    try {
      const response = await groupViewService.createGroup(payload);
      toast.success("Group created successfully");
      return response.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
      return rejectWithValue(error.message || "Failed to create group");
    }
  }
);

//#region addMotorToGroup
export const addMotorToGroupThunk = createAsyncThunk(
  "groupView/addMotorToGroup",
  async (payload: AddMotorToGroupPayload, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await groupService.addMotorToGroup(payload);
      // toast.success("Motor added to group");
      // return response.data;

      toast.success("Motor added to group");
      return payload;
    } catch (error: any) {
      toast.error(error.message || "Failed to add motor to group");
      return rejectWithValue(error.message || "Failed to add motor to group");
    }
  }
);

//#region groupViewSlice
const groupViewSlice = createSlice({
  name: "groupView",
  initialState,
  reducers: {
    setGroups(state, action: PayloadAction<GroupData[]>) {
      state.groups = action.payload;
    },

    setSelectedGroupId(state, action: PayloadAction<number | null>) {
      state.selectedGroupId = action.payload;
    },

    openCreateGroupDialog(state) {
      state.openCreateNewGroupDialog = true;
    },

    closeCreateGroupDialog(state) {
      state.openCreateNewGroupDialog = false;
    },

    openGroupScanningDialog(state) {
      state.groupScanningDialog = true;
    },

    closeGroupScanningDialog(state) {
      state.groupScanningDialog = false;
    },

    setGroupScanningStatus(state, action: PayloadAction<boolean>) {
      state.groupScanningStatus = action.payload;
    },

    // Local action for adding motor to group (optimistic update)
    addMotorToGroupLocal(state, action: PayloadAction<AddMotorToGroupPayload>) {
      const groupedDevices = state.groupDevices.filter(
        (d) => d.group_id === action.payload.groupId
      );
      const hasMotorInGroup = groupedDevices?.some(
        (motor) => motor.device_id === action.payload.motor?.deviceId
      );
      if (!hasMotorInGroup) {
        const newDevicePayload: GroupDeviceData = {
          device_id: action.payload.motor?.deviceId,
          group_id: action.payload.groupId,
          tbl_device: {
            device_id: action?.payload?.motor?.deviceId,
            name: action?.payload?.motor?.deviceName,
            address: action?.payload?.motor?.type,
          },
          tbl_group: {
            group_id: action.payload.groupId,
            name: state.groups?.find(
              (g) => g.group_id === action.payload.groupId
            )?.name,
            address: state.groups?.find(
              (g) => g.group_id === action.payload.groupId
            )?.address,
          },
        };
        groupedDevices.push(newDevicePayload);
      }
    },

    // Local action for removing motor from group (optimistic update)
    removeMotorFromGroupLocal(
      state,
      action: PayloadAction<RemoveMotorFromGroupPayload>
    ) {
      const groupedDevices = state.groupDevices.filter(
        (d) => d.group_id === action.payload.groupId
      );
      if (groupedDevices) {
        state.groupDevices = groupedDevices.filter(
          (motor) => motor.device_id !== action.payload.motorId
        );
      }
    },

    // Set current drag item
    setCurrentDragItem(state, action: PayloadAction<DraggedDevice | null>) {
      state.currentDragItem = action.payload;
    },

    // Clear current drag item
    clearCurrentDragItem(state) {
      state.currentDragItem = null;
    },
  },
  extraReducers: (builder) => {
    //#region fetchGroups
    builder
      .addCase(fetchGroupsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroupsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region fetchGroupDevices
    builder
      .addCase(fetchGroupDevicesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupDevicesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.groupDevices = action.payload;
      })
      .addCase(fetchGroupDevicesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region createMultipleGroupDevices
    builder
      .addCase(createMultipleGroupDevicesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleGroupDevicesThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createMultipleGroupDevicesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region deleteGroupDevice
    builder
      .addCase(deleteGroupDeviceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroupDeviceThunk.fulfilled, (state, action) => {
        const { data, payload } = action.payload;
        state.loading = false;
        state.groupDevices = state.groupDevices.filter(
          (motor) =>
            motor.group_id !== payload.group_id ||
            motor.device_id !== payload.device_id
        );
      })
      .addCase(deleteGroupDeviceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region deleteGroup
    builder
      .addCase(deleteGroupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.groupDevices = state.groupDevices.filter(
          (motor) => motor.group_id !== action.payload.groupId
        );
        state.groups = state.groups.filter(
          (group) => group.group_id !== action.payload.groupId
        );
      })
      .addCase(deleteGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region createGroup
    builder
      .addCase(createGroupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
        state.openCreateNewGroupDialog = false;
      })
      .addCase(createGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region addMotorToGroup
    builder
      .addCase(addMotorToGroupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMotorToGroupThunk.fulfilled, (state, action) => {
        state.loading = false;
        const groupedDevices = state.groupDevices.filter(
          (d) => d.group_id === action.payload.groupId
        );
        const hasMotorInGroup = groupedDevices?.some(
          (motor) => motor.device_id === action.payload.motor?.deviceId
        );
        if (!hasMotorInGroup) {
          const newDevicePayload: GroupDeviceData = {
            device_id: action.payload.motor?.deviceId,
            group_id: action.payload.groupId,
            tbl_device: {
              device_id: action?.payload?.motor?.deviceId,
              name: action?.payload?.motor?.deviceName,
              address: action?.payload?.motor?.type,
            },
            tbl_group: {
              group_id: action.payload.groupId,
              name: state.groups?.find(
                (g) => g.group_id === action.payload.groupId
              )?.name,
              address: state.groups?.find(
                (g) => g.group_id === action.payload.groupId
              )?.address,
            },
          };
          groupedDevices.push(newDevicePayload);
        }
      })
      .addCase(addMotorToGroupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setGroups,
  setSelectedGroupId,
  openCreateGroupDialog,
  closeCreateGroupDialog,
  openGroupScanningDialog,
  closeGroupScanningDialog,
  setGroupScanningStatus,
  addMotorToGroupLocal,
  removeMotorFromGroupLocal,
  setCurrentDragItem,
  clearCurrentDragItem,
} = groupViewSlice.actions;

export default groupViewSlice.reducer;
