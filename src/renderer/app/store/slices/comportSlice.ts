import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import type { ComportItem } from "~/interfaces/comport";
import { comportService } from "~/services/comportService";
import { getAxiosMessage } from "~/utils/helperFunctions";

interface ComportState {
  comports: ComportItem[];
  isComportConnected: boolean;
  isOfflineEditMode: boolean;
  selectedComport: ComportItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: ComportState = {
  comports: [],
  isComportConnected: false,
  isOfflineEditMode: false,
  selectedComport: null,
  loading: false,
  error: null,
};

// fetch comports thunk
export const fetchComportsThunk = createAsyncThunk(
  "comport/fetchComports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await comportService.getComports();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Connect comport thunk
export const connectComportThunk = createAsyncThunk(
  "comport/connectComport",
  async (port: ComportItem, { rejectWithValue }) => {
    try {
      const response = await comportService.connectComport(port.path);
      const message = getAxiosMessage(response);
      toast.success(message);
      return { data: response.data, port };
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Disconnect comport thunk
export const disconnectComportThunk = createAsyncThunk(
  "comport/disconnectComport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await comportService.disconnectComport();
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

const comportSlice = createSlice({
  name: "comport",
  initialState,
  reducers: {
    setComports: (state, action: PayloadAction<ComportItem[]>) => {
      state.comports = action.payload;
    },

    setIsComportConnected: (state, action: PayloadAction<{ isConnected: boolean, port: ComportItem | null }>) => {
      state.isComportConnected = action.payload.isConnected;
      state.isOfflineEditMode = (action.payload.isConnected && action.payload.port?.path === "offline-edit") || false;
      state.selectedComport = (action.payload.isConnected && action.payload.port) ? action.payload.port : null;
    },
  },
  extraReducers: (builder) => {
    // fetchComports
    builder.addCase(fetchComportsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchComportsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.comports = action.payload;
    });
    builder.addCase(fetchComportsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region connectComport
    builder.addCase(connectComportThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(connectComportThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.isComportConnected = true;
      state.isOfflineEditMode = action.payload.port.path === "offline-edit";
      state.selectedComport = action.payload.port;
    });
    builder.addCase(connectComportThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region disconnectComport
    builder.addCase(disconnectComportThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(disconnectComportThunk.fulfilled, (state) => {
      state.loading = false;
      state.isComportConnected = false;
      state.isOfflineEditMode = false;
      state.selectedComport = null;
    });
    builder.addCase(disconnectComportThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setComports, setIsComportConnected } = comportSlice.actions;
export default comportSlice.reducer;
