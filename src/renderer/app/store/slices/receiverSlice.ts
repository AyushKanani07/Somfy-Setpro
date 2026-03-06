import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ReceiverItem } from "~/interfaces/receiver";
import { deviceService } from "~/services/deviceService";
import { ReceiverService } from "~/services/receiverService";
import { setLoadingDialog } from "./deviceSlice";


interface ReceiverState {
    receivers: ReceiverItem[];
    selectedReceiver: ReceiverItem | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ReceiverState = {
    receivers: [],
    selectedReceiver: null,
    isLoading: false,
    error: null,
};

//#region fetch receiver by id thunk
export const fetchReceiverById = createAsyncThunk(
    "receiver/fetchById",
    async (receiverId: number, { rejectWithValue }) => {
        try {
            const response = await ReceiverService.getReceiverById(receiverId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch receiver by id");
        }
    }
);

//#region get all channel status thunk
export const getAllChannelStatus = createAsyncThunk(
    "receiver/getAllChannelStatus",
    async (payload: { deviceId: number, isRefresh?: boolean }, { rejectWithValue, dispatch }) => {
        try {
            dispatch(setLoadingDialog({ isOpen: true, message: "Loading Channel Config..." }));
            const response = await ReceiverService.getAllChannelStatus(payload.deviceId, payload.isRefresh);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to get all channel status");
        } finally {
            dispatch(setLoadingDialog({ isOpen: false, message: "" }));
        }
    }
);

//#region get channel status thunk
export const getChannelStatus = createAsyncThunk(
    "receiver/getChannelStatus",
    async (payload: { deviceId: number, index: number, isRefresh?: boolean }, { rejectWithValue }) => {
        try {
            const response = await ReceiverService.getChannelStatus(payload.deviceId, payload.index, payload.isRefresh);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to get channel status");
        }
    }
);

//#region remove all channels thunk
export const removeAllChannels = createAsyncThunk(
    "receiver/removeAllChannels",
    async (deviceId: number, { rejectWithValue }) => {
        try {
            const response = await ReceiverService.removeAllChannels(deviceId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to remove all channels");
        }
    }
);

//#region get firmware version thunk
export const getFirmwareVersion = createAsyncThunk(
    "receiver/getFirmwareVersion",
    async (payload: { deviceId: number, isRefresh?: boolean }, { rejectWithValue }) => {
        try {
            const response = await deviceService.getFirmwareVersion(payload.deviceId, payload.isRefresh);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to get firmware version");
        }
    }
);

//#region factory reset thunk
export const factoryReset = createAsyncThunk(
    "receiver/factoryReset",
    async (receiverId: number, { rejectWithValue }) => {
        try {
            const response = await ReceiverService.factoryReset(receiverId);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to factory reset");
        }
    }
);


const receiverSlice = createSlice({
    name: "receiver",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReceiverById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReceiverById.fulfilled, (state, action) => {
                state.isLoading = false;
                const data = action.payload;
                state.selectedReceiver = {
                    ...data,
                    channelConfigData: data.tbl_rts_receiver || [],
                }
            })
            .addCase(fetchReceiverById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(getFirmwareVersion.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getFirmwareVersion.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data } = action.payload;
                if (state.selectedReceiver) {
                    state.selectedReceiver.firmware_version = data.firmware_version;
                }
            })
            .addCase(getFirmwareVersion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(factoryReset.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(factoryReset.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(factoryReset.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(getAllChannelStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllChannelStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data } = action.payload;
                if (state.selectedReceiver) {
                    state.selectedReceiver.channelConfigData = data || [];
                }
            })
            .addCase(getAllChannelStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(getChannelStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getChannelStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data } = action.payload;
                if (state.selectedReceiver && state.selectedReceiver.channelConfigData) {
                    const channelIndex = state.selectedReceiver.channelConfigData.findIndex(channel => channel.index === data.index);
                    if (channelIndex !== -1) {
                        state.selectedReceiver.channelConfigData![channelIndex] = data;
                    } else {
                        state.selectedReceiver.channelConfigData!.push(data);
                    }
                }
            })
            .addCase(getChannelStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(removeAllChannels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeAllChannels.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.selectedReceiver) {
                    state.selectedReceiver.channelConfigData = [
                        { index: 1, config: false },
                        { index: 2, config: false },
                        { index: 3, config: false },
                        { index: 4, config: false },
                        { index: 5, config: false },
                    ];
                }
            })
            .addCase(removeAllChannels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {

} = receiverSlice.actions;

export default receiverSlice.reducer;