import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import type {
  MotorIpData,
  MotorIpPayload,
  MotorItem,
  MotorMoveOfPayload,
  MotorMoveToPayload,
  MotorSocketGetPositionResponse,
  SetRampTimePayload,
  SetRollingSpeedPayload,
  UpdateMotorPayload,
  WinkMotorPayload,
} from "~/interfaces/motor";
import { motorService } from "~/services/motorService";
import { getAxiosMessage } from "~/utils/helperFunctions";
import { fetchFloorsThunk } from "./floorSlice";
import { removeMotorFromAssigned, updateDeviceIsLimitSet } from "./deviceSlice";
import { DEVICE_MOTOR_LIMIT } from "~/constant/constant";

interface MotorState {
  motors: MotorItem[];
  winkedMotorId: number | null;
  selectedMotorForUpdate: { id: number; name: string } | null;
  selectedMotor: MotorItem | null;
  selectedMotorId: number | null;
  multipleSelectedMotorIds: number[] | [];
  getMotorCurrentPosition: boolean;
  getPositionType: "pulse" | "tilt_pulse";
  deleteMotorDialog: boolean;
  motorToDelete: number | null;
  updateMotorDialog: boolean;
  loading: boolean;
  motorIPLoading: boolean;
  error: string | null;
}

const initialState: MotorState = {
  motors: [],
  winkedMotorId: null,
  selectedMotorForUpdate: null,
  selectedMotor: null,
  selectedMotorId: null,
  multipleSelectedMotorIds: [],
  updateMotorDialog: false,
  deleteMotorDialog: false,
  getMotorCurrentPosition: false,
  getPositionType: "pulse",
  motorToDelete: null,
  loading: false,
  motorIPLoading: false,
  error: null,
};

//#region fetch MotorsThunk by id
export const fetchMotorByIdThunk = createAsyncThunk(
  "motor/fetchMotorById",
  async (motorId: number, { rejectWithValue }) => {
    try {
      const response = await motorService.getMotorById(motorId);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Update MotorThunk
export const updateMotorThunk = createAsyncThunk(
  "motor/updateMotor",
  async (payload: UpdateMotorPayload, { rejectWithValue }) => {
    try {
      if (!payload.name) return;
      const response = await motorService.setMotorLabel(payload.motorId, payload.name);
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Delete MotorThunk
export const deleteMotorThunk = createAsyncThunk(
  "motor/deleteMotor",
  async (motorId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await motorService.deleteMotor(motorId);
      const message = getAxiosMessage(response);

      dispatch(removeMotorFromAssigned(motorId));
      toast.success(message);
      dispatch(fetchFloorsThunk());
      return { data: response.data, id: motorId };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Wink MotorThunk
export const winkMotorThunk = createAsyncThunk(
  "motor/winkMotor",
  async (winkPayload: WinkMotorPayload, { rejectWithValue }) => {
    try {
      const response = await motorService.winkMotor(winkPayload);
      return { data: response.data, id: winkPayload.device_id };
    } catch (error) {
      return rejectWithValue(getAxiosMessage(error));
    }
  }
);

//#region Move Motor to Position Thunk
export const moveMotorToPositionThunk = createAsyncThunk(
  "motor/moveMotorToPosition",
  async (payload: MotorMoveToPayload, { rejectWithValue }) => {
    try {
      const response = await motorService.moveMotorToPosition(payload);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Move Motor of Function Thunk
export const moveMotorOfFunctionThunk = createAsyncThunk(
  "motor/moveMotorOfFunction",
  async (payload: MotorMoveOfPayload, { rejectWithValue }) => {
    try {
      const response = await motorService.moveMotorOfPosition(payload);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Stop Motor Thunk
export const stopMotorThunk = createAsyncThunk(
  "motor/stopMotor",
  async (
    { motorId, isACK = true }: { motorId: number; isACK?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await motorService.stopMotor(motorId, isACK);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region fetch motor Ip by id
export const fetchMotorIpByIdThunk = createAsyncThunk(
  "motor/fetchMotorIpById",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.fetchMotorIP(motorId, isRefresh);
      return response.data as MotorIpData[];
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set motor Ip thunk
export const setMotorIpThunk = createAsyncThunk(
  "motor/setMotorIp",
  async (payload: MotorIpPayload, { rejectWithValue }) => {
    try {
      const response = await motorService.setMotorIP(payload);
      return { data: response.data, payload };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region erase all motor IPs thunk
export const eraseAllMotorIpsThunk = createAsyncThunk(
  "motor/eraseAllMotorIps",
  async (device_id: number, { rejectWithValue }) => {
    try {
      const response = await motorService.eraseAllMotorIPs(device_id);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region auto generate motor IPs thunk
export const autoGenerateMotorIpsThunk = createAsyncThunk(
  "motor/autoGenerateMotorIps",
  async (
    params: { device_id: number; ip_count: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await motorService.autoGenerateMotorIPs(
        params.device_id,
        params.ip_count
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor limits
export const getMotorLimitsThunk = createAsyncThunk(
  "motor/getMotorLimits",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue, dispatch }) => {
    try {
      const response = await motorService.getMotorLimits(motorId, isRefresh);
      const isLimitSet = response.data.up_limit !== 65535 && response.data.down_limit !== 65535;
      dispatch(updateDeviceIsLimitSet({ deviceId: motorId, isLimitSet }))
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor position
export const getMotorPositionThunk = createAsyncThunk(
  "motor/getMotorPosition",
  async (motorId: number, { rejectWithValue }) => {
    try {
      const response = await motorService.getMotorPosition(motorId);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor direction
export const getMotorDirectionThunk = createAsyncThunk(
  "motor/getMotorDirection",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getMotorDirection(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  });

//#region set motor direction
export const setMotorDirectionThunk = createAsyncThunk(
  "motor/setMotorDirection",
  async (payload: { device_id: number; direction: "forward" | "reverse" }, { rejectWithValue }) => {
    try {
      const response = await motorService.setMotorDirection(payload.device_id, payload.direction);
      return { data: response.data, direction: payload.direction };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set app mode
export const setMotorAppModeThunk = createAsyncThunk(
  "motor/setMotorAppMode",
  async (payload: { device_id: number; app_mode: number }, { rejectWithValue }) => {
    try {
      const response = await motorService.setAppMode(payload.device_id, payload.app_mode);
      return { data: response.data, app_mode: payload.app_mode };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get app mode
export const getAppModeThunk = createAsyncThunk(
  "motor/getMotorAppMode",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getAppMode(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set led status
export const setMotorLedStatusThunk = createAsyncThunk(
  "motor/setMotorLedStatus",
  async (payload: { device_id: number; status: "on" | "off" }, { rejectWithValue }) => {
    try {
      const response = await motorService.setLedStatus(payload.device_id, payload.status);
      return { data: response.data, status: payload.status };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get led status
export const getMotorLedStatusThunk = createAsyncThunk(
  "motor/getMotorLedStatus",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getLedStatus(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get notwork lock status
export const getMotorNetworkLockThunk = createAsyncThunk(
  "motor/getMotorNetworkLock",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getNetworkLock(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set network lock status
export const setMotorNetworkLockThunk = createAsyncThunk(
  "motor/setMotorNetworkLock",
  async (payload: { device_id: number; isLocked: boolean; priority: number }, { rejectWithValue }) => {
    try {
      const response = await motorService.setNetworkLock(payload.device_id, payload.isLocked, payload.priority);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set rolling speed
export const setMotorRollingSpeedThunk = createAsyncThunk(
  "motor/setMotorRollingSpeed",
  async (payload: SetRollingSpeedPayload, { rejectWithValue }) => {
    try {
      const response = await motorService.setRollingSpeed(payload);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get rolling speed
export const getMotorRollingSpeedThunk = createAsyncThunk(
  "motor/getMotorRollingSpeed",
  async ({ device_id, isRefresh }: { device_id: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getRollingSpeed(device_id, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor ramp time
export const getMotorRampTimeThunk = createAsyncThunk(
  "motor/getMotorRampTime",
  async ({ device_id, isRefresh }: { device_id: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getRampTime(device_id, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region set ramp time
export const setMotorRampTimeThunk = createAsyncThunk(
  "motor/setMotorRampTime",
  async (payload: SetRampTimePayload, { rejectWithValue }) => {
    try {
      const response = await motorService.setRampTime(payload);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor move count
export const getMotorMoveCountThunk = createAsyncThunk(
  "motor/getMotorMoveCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getTotalMoveCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor thermal count
export const getMotorThermalCountThunk = createAsyncThunk(
  "motor/getMotorThermalCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getThermalCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor rev count
export const getMotorRevCountThunk = createAsyncThunk(
  "motor/getMotorRevCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getTotalRevolutionCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor obstacle count
export const getMotorObstacleCountThunk = createAsyncThunk(
  "motor/getMotorObstacleCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getObstacleCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor power cut count
export const getMotorPowerCutCountThunk = createAsyncThunk(
  "motor/getMotorPowerCutCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getPowerCutCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get motor reset count
export const getMotorResetCountThunk = createAsyncThunk(
  "motor/getMotorResetCount",
  async ({ motorId, isRefresh }: { motorId: number, isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await motorService.getResetCount(motorId, isRefresh);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region network stats
export const getMotorNetworkStatsThunk = createAsyncThunk(
  "motor/getMotorNetworkStats",
  async (motorId: number, { rejectWithValue }) => {
    try {
      const response = await motorService.getNetworkStats(motorId);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region network error stats
export const getMotorNetworkErrorStatsThunk = createAsyncThunk(
  "motor/getMotorNetworkErrorStats",
  async (motorId: number, { rejectWithValue }) => {
    try {
      const response = await motorService.getNetworkErrorStats(motorId);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region motor Slice

const motorSlice = createSlice({
  name: "motor",
  initialState,
  reducers: {
    setMotors(state, action: PayloadAction<MotorItem[]>) {
      state.motors = action.payload;
    },

    setSelectedMotor(state, action: PayloadAction<MotorItem | null>) {
      state.selectedMotor = action.payload;
    },

    setSelectedMotorId(state, action: PayloadAction<number | null>) {
      state.selectedMotorId = action.payload;
    },

    setMultipleSelectedMotorId(state, action: PayloadAction<number[] | []>) {
      state.multipleSelectedMotorIds = action.payload;
    },

    openUpdateMotorDialog(
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) {
      state.selectedMotorForUpdate = action.payload;
      state.updateMotorDialog = true;
    },

    closeUpdateMotorDialog(state) {
      state.selectedMotorForUpdate = null;
      state.updateMotorDialog = false;
    },

    openDeleteMotorDialog(state, action: PayloadAction<number>) {
      state.motorToDelete = action.payload;
      state.deleteMotorDialog = true;
    },

    closeDeleteMotorDialog(state) {
      state.motorToDelete = null;
      state.deleteMotorDialog = false;
    },

    startGetMotorCurrentPosition(state, action: PayloadAction<{ pos_type: "pulse" | "tilt_pulse" }>) {
      state.getPositionType = action.payload.pos_type;
      state.getMotorCurrentPosition = true;
    },

    stopGetMotorCurrentPosition(state) {
      state.getMotorCurrentPosition = false;
    },

    updateMotorCurrentPosition(
      state,
      action: PayloadAction<MotorSocketGetPositionResponse["data"]>
    ) {
      const { ip, position_percentage, position_pulse, tilting_percentage } =
        action.payload;
      if (state.selectedMotor) {
        state.selectedMotor.tbl_motor.pos_pulse = position_pulse;
        state.selectedMotor.tbl_motor.pos_per = position_percentage;
        state.selectedMotor.tbl_motor.pos_tilt_per = tilting_percentage;
      }
    },

    updateMotorIpData(
      state,
      action: PayloadAction<{ ipData: MotorIpData }>
    ) {
      if (!state.selectedMotor) return;

      const { ipData } = action.payload;
      const motor = state.selectedMotor.tbl_motor;

      motor.ip_data ??= [];

      const isLimit = ipData.pulse === DEVICE_MOTOR_LIMIT && ipData.percentage === 255;

      const newIpData = {
        ...ipData,
        pulse: ipData.pulse === DEVICE_MOTOR_LIMIT ? null : ipData.pulse,
        percentage: ipData.percentage === 255 ? null : ipData.percentage,
      };

      const index = motor.ip_data.findIndex((ip) => ip.index === ipData.index);

      if (index !== -1) {
        if (isLimit) {
          motor.ip_data.splice(index, 1);
        } else {
          motor.ip_data[index] = newIpData;
        }
      } else if (!isLimit) {
        motor.ip_data.push(newIpData);
      }
    },

    updateAppVersion(state, action: PayloadAction<{ app_version: string, device_id: number }>) {
      if (state.selectedMotor && state.selectedMotor.device_id === action.payload.device_id) {
        state.selectedMotor.app_version = action.payload.app_version;
      }
    }
  },
  //#region extraReducers
  extraReducers: (builder) => {
    //#region fetch MotorByIdThunk builder
    builder
      .addCase(fetchMotorByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMotorByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const localUi = action.payload.tbl_motor.local_ui;
        const ledStatus = (localUi && localUi.length) ? localUi[0] == 0x01 ? 'off' : 'on' : null;

        const networkLock = action.payload.tbl_motor.network_lock;
        const lockStatus = (networkLock && networkLock.length >= 3) ? {
          isLocked: networkLock[0] == 0x01 ? true : false,
          priority: networkLock[2],
        } : null;

        const rampData = action.payload.tbl_motor.ramp;
        const rampFormatted = (rampData && rampData.length >= 8) ? {
          start_status_up: rampData[0] == 0x01 ? true : false,
          start_value_up: rampData[1],
          stop_status_up: rampData[2] == 0x01 ? true : false,
          stop_value_up: rampData[3],
          start_status_down: rampData[4] == 0x01 ? true : false,
          start_value_down: rampData[5],
          stop_status_down: rampData[6] == 0x01 ? true : false,
          stop_value_down: rampData[7],
        } : null;

        state.selectedMotor = {
          ...action.payload,
          tbl_motor: {
            ...action.payload.tbl_motor,
            local_ui: ledStatus ? { status: ledStatus, } : null,
            network_lock: lockStatus,
            ramp: rampFormatted,
          },
        };
      })
      .addCase(fetchMotorByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region update Motor builder
    builder
      .addCase(updateMotorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMotorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.updateMotorDialog = false;
      })
      .addCase(updateMotorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region delete Motor builder
    builder
      .addCase(deleteMotorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMotorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMotorId =
          state.selectedMotorId === action.payload.id
            ? null
            : state.selectedMotorId;
        state.multipleSelectedMotorIds = state.multipleSelectedMotorIds.filter(
          (id) => id !== action.payload.id
        );
        state.selectedMotor =
          state.selectedMotor?.device_id === action.payload.id
            ? null
            : state.selectedMotor;
        state.deleteMotorDialog = false;
      })
      .addCase(deleteMotorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region wink Motor builder
    builder
      .addCase(winkMotorThunk.pending, (state, action) => {
        action;
      })
      .addCase(winkMotorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.winkedMotorId = action.payload.id;
      })
      .addCase(winkMotorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.winkedMotorId = null;
      });

    //#region move Motor to Position builder
    builder
      .addCase(moveMotorToPositionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveMotorToPositionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.getPositionType = "pulse";
        state.getMotorCurrentPosition = true;
      })
      .addCase(moveMotorToPositionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region stop Motor builder
    builder.addCase(stopMotorThunk.fulfilled, (state, action) => {
      state.loading = false;
      // state.getMotorCurrentPosition = false;
    });

    //#region move Motor of Position builder
    builder.addCase(moveMotorOfFunctionThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.getMotorCurrentPosition = true;
    });

    //#region fetch MotorIpByIdThunk builder
    builder
      .addCase(fetchMotorIpByIdThunk.pending, (state) => {
        state.motorIPLoading = true;
        state.error = null;
      })
      .addCase(fetchMotorIpByIdThunk.fulfilled, (state, action) => {
        state.motorIPLoading = false;
      })
      .addCase(fetchMotorIpByIdThunk.rejected, (state, action) => {
        state.motorIPLoading = false;
        state.error = action.payload as string;
      });

    //#region set MotorIp thunk builder
    builder
      .addCase(setMotorIpThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(setMotorIpThunk.fulfilled, (state, action) => {
        state.motorIPLoading = false;
        if (action.payload.payload.function_type === 'delete' && state.selectedMotor?.tbl_motor.ip_data) {
          state.selectedMotor!.tbl_motor.ip_data = state.selectedMotor!.tbl_motor.ip_data.filter(
            (ip) => ip.index !== action.payload.payload.ip_index
          );
        }
      })
      .addCase(setMotorIpThunk.rejected, (state, action) => {
        state.motorIPLoading = false;
        state.error = action.payload as string;
      });

    //#region erase all Motor IPs thunk builder
    builder
      .addCase(eraseAllMotorIpsThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(eraseAllMotorIpsThunk.fulfilled, (state, action) => {
        state.motorIPLoading = false;
      })
      .addCase(eraseAllMotorIpsThunk.rejected, (state, action) => {
        state.motorIPLoading = false;
        state.error = action.payload as string;
      });

    //#region auto generate Motor IPs thunk builder
    builder
      .addCase(autoGenerateMotorIpsThunk.pending, (state) => {
        state.motorIPLoading = true;
        state.error = null;
      })
      .addCase(autoGenerateMotorIpsThunk.fulfilled, (state, action) => {
        state.motorIPLoading = false;
      })
      .addCase(autoGenerateMotorIpsThunk.rejected, (state, action) => {
        state.motorIPLoading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Limits thunk builder
    builder
      .addCase(getMotorLimitsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorLimitsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const upLimit = payload.up_limit;
        const downLimit = payload.down_limit;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.up_limit = upLimit;
          state.selectedMotor.tbl_motor.down_limit = downLimit;
          state.selectedMotor.is_limit_set = upLimit !== 65535 && downLimit !== 65535;
        }
      })
      .addCase(getMotorLimitsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Position thunk builder
    builder
      .addCase(getMotorPositionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorPositionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.getMotorCurrentPosition = false;
        const { ip, position_percentage, position_pulse, tilting_percentage } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.pos_pulse = position_pulse;
          state.selectedMotor.tbl_motor.pos_per = position_percentage;
          state.selectedMotor.tbl_motor.pos_tilt_per = tilting_percentage;
        }
      })
      .addCase(getMotorPositionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Direction thunk builder
    builder
      .addCase(getMotorDirectionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorDirectionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const direction = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.direction = direction;
        }
      })
      .addCase(getMotorDirectionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor Direction thunk builder
    builder
      .addCase(setMotorDirectionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorDirectionThunk.fulfilled, (state, action) => {
        state.loading = false;
        const direction = action.payload.direction;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.direction = direction;
        }
      })
      .addCase(setMotorDirectionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor App Mode thunk builder
    builder
      .addCase(setMotorAppModeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorAppModeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const app_mode = action.payload.app_mode;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.app_mode = app_mode;
        }
      })
      .addCase(setMotorAppModeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor App Mode thunk builder
    builder
      .addCase(getAppModeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppModeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const app_mode = action.payload.mode;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.app_mode = app_mode;
        }
      })
      .addCase(getAppModeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor Led Status thunk builder
    builder
      .addCase(setMotorLedStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorLedStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        const status = action.payload.status;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.local_ui = { status };
        }
      })
      .addCase(setMotorLedStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Led Status thunk builder
    builder
      .addCase(getMotorLedStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorLedStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        const status = action.payload.status;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.local_ui = { status };
        }
      })
      .addCase(getMotorLedStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Network Lock thunk builder
    builder
      .addCase(getMotorNetworkLockThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorNetworkLockThunk.fulfilled, (state, action) => {
        state.loading = false;
        const networkPayload = {
          isLocked: action.payload?.isLocked,
          priority: action.payload?.priority,
        }
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.network_lock = networkPayload;
        }
      })
      .addCase(getMotorNetworkLockThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor Network Lock thunk builder
    builder
      .addCase(setMotorNetworkLockThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorNetworkLockThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(setMotorNetworkLockThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor Rolling Speed thunk builder
    builder
      .addCase(setMotorRollingSpeedThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorRollingSpeedThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(setMotorRollingSpeedThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Rolling Speed thunk builder
    builder
      .addCase(getMotorRollingSpeedThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorRollingSpeedThunk.fulfilled, (state, action) => {
        state.loading = false;
        const speed = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.up_speed = speed.up_speed;
          state.selectedMotor.tbl_motor.down_speed = speed.down_speed;
          state.selectedMotor.tbl_motor.slow_speed = speed.slow_speed;
        }
      })
      .addCase(getMotorRollingSpeedThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Ramp Time thunk builder
    builder
      .addCase(getMotorRampTimeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorRampTimeThunk.fulfilled, (state, action) => {
        state.loading = false;
        const ramp_time = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.ramp = {
            start_status_up: ramp_time.start_status_up,
            start_value_up: ramp_time.start_value_up,
            start_status_down: ramp_time.start_status_down,
            start_value_down: ramp_time.start_value_down,
            stop_status_up: ramp_time.stop_status_up,
            stop_value_up: ramp_time.stop_value_up,
            stop_status_down: ramp_time.stop_status_down,
            stop_value_down: ramp_time.stop_value_down,
          };
        }
      })
      .addCase(getMotorRampTimeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region set Motor Ramp Time thunk builder
    builder
      .addCase(setMotorRampTimeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setMotorRampTimeThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(setMotorRampTimeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Move Count thunk builder
    builder
      .addCase(getMotorMoveCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorMoveCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { move_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.move_count = move_count;
        }
      })
      .addCase(getMotorMoveCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Rev Count thunk builder
    builder
      .addCase(getMotorRevCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorRevCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { revolution_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.revolution_count = revolution_count;
        }
      })
      .addCase(getMotorRevCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Thermal Count thunk builder
    builder
      .addCase(getMotorThermalCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorThermalCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { thermal_count, post_thermal_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.thermal_count = thermal_count;
          state.selectedMotor.tbl_motor.post_thermal_count = post_thermal_count;
        }
      })
      .addCase(getMotorThermalCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Obstacle Count thunk builder
    builder
      .addCase(getMotorObstacleCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorObstacleCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { obstacle_count, post_obstacle_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.obstacle_count = obstacle_count;
          state.selectedMotor.tbl_motor.post_obstacle_count = post_obstacle_count;
        }
      })
      .addCase(getMotorObstacleCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Power Cut Count thunk builder
    builder
      .addCase(getMotorPowerCutCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorPowerCutCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { power_cut_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.power_cut_count = power_cut_count;
        }
      })
      .addCase(getMotorPowerCutCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Reset Count thunk builder
    builder
      .addCase(getMotorResetCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorResetCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { reset_count } = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.reset_count = reset_count;
        }
      })
      .addCase(getMotorResetCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Network Stats thunk builder
    builder
      .addCase(getMotorNetworkStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorNetworkStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const network_stats = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.network_stats = network_stats;
        }
      })
      .addCase(getMotorNetworkStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region get Motor Network Error Stats thunk builder
    builder
      .addCase(getMotorNetworkErrorStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMotorNetworkErrorStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const network_error_stats = action.payload;
        if (state.selectedMotor) {
          state.selectedMotor.tbl_motor.network_error_stats = network_error_stats;
        }
      })
      .addCase(getMotorNetworkErrorStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setMotors,
  setSelectedMotor,
  setSelectedMotorId,
  setMultipleSelectedMotorId,
  openUpdateMotorDialog,
  closeUpdateMotorDialog,
  openDeleteMotorDialog,
  closeDeleteMotorDialog,
  startGetMotorCurrentPosition,
  stopGetMotorCurrentPosition,
  updateMotorCurrentPosition,
  updateMotorIpData,
  updateAppVersion,
} = motorSlice.actions;

export default motorSlice.reducer;
