import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DeviceConfigTabs =
  | "control"
  | "ip"
  | "group"
  | "settings"
  | "actions"
  | "diagnostics";

interface DeviceConfigState {
  activeDeviceConfigTab: DeviceConfigTabs;
}

const initialState: DeviceConfigState = {
  activeDeviceConfigTab: "control",
};

const deviceConfigSlice = createSlice({
  name: "deviceConfig",
  initialState,
  reducers: {
    setDeviceConfigActiveTab(state, action: PayloadAction<DeviceConfigTabs>) {
      state.activeDeviceConfigTab = action.payload;
    },
  },
});

export const { setDeviceConfigActiveTab } = deviceConfigSlice.actions;
export default deviceConfigSlice.reducer;
