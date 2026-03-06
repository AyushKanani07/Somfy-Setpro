import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { TransmitterItem } from "~/interfaces/transmitter";
import { deviceService } from "~/services/deviceService";
import { TransmitterService } from "~/services/transmitter.Service";


interface TransmitterState {
    transmiters: TransmitterItem[];
    selectedTransmitter: TransmitterItem | null;
    selectedChannel: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: TransmitterState = {
    transmiters: [],
    selectedTransmitter: null,
    selectedChannel: null,
    loading: false,
    error: null,
};

//#region fetch transmitter by id
export const fetchTransmitterById = createAsyncThunk(
    "transmitter/fetchById",
    async (transmitterId: number, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getTransmitterById(transmitterId);
            return response.data;
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get channel mode
export const getChannelModeThunk = createAsyncThunk(
    "transmitter/getChannelMode",
    async (payload: { device_id: number, channel: number }, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getChannelMode(payload);
            return { data: response.data, channel: payload.channel, device_id: payload.device_id };
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get rts address
export const getRtsAddressThunk = createAsyncThunk(
    "transmitter/getRtsAddress",
    async (payload: { device_id: number, channel: number }, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getRtsAddress(payload);
            return { data: response.data, channel: payload.channel, device_id: payload.device_id };
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region set sun mode
export const setSunModeThunk = createAsyncThunk(
    "transmitter/setSunMode",
    async (payload: { device_id: number, sun_mode: "on" | "off" }, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.setSunMode(payload);
            return payload;
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get tilt frame count
export const getTiltFrameCountThunk = createAsyncThunk(
    "transmitter/getTiltFrameCount",
    async (payload: { device_id: number, channel: number }, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getTiltFrameCount(payload);
            return { data: response.data, payload };
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get dim frame count
export const getDimFrameCountThunk = createAsyncThunk(
    "transmitter/getDimFrameCount",
    async (payload: { device_id: number, channel: number }, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getDimFrameCount(payload);
            return { data: response.data, payload };
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get dct lock
export const getDctLockThunk = createAsyncThunk(
    "transmitter/getDctLock",
    async (device_id: number, { rejectWithValue }) => {
        try {
            const response = await TransmitterService.getDctLock(device_id);
            return { data: response.data, device_id };
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get stack version
export const getStackVersionThunk = createAsyncThunk(
    "transmitter/getStackVersion",
    async ({ deviceId, isRefresh }: { deviceId: number, isRefresh?: boolean }, { rejectWithValue }) => {
        try {
            const response = await deviceService.getStackVersion(deviceId, isRefresh);
            return response.data;
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

//#region get app version
export const getAppVersionThunk = createAsyncThunk(
    "transmitter/getAppVersion",
    async ({ deviceId, isRefresh }: { deviceId: number, isRefresh?: boolean }, { rejectWithValue }) => {
        try {
            const response = await deviceService.getAppVersion(deviceId, isRefresh);
            return response.data;
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            return rejectWithValue(errMessage);
        }
    }
);

const transmitterSlice = createSlice({
    name: "transmitter",
    initialState,
    reducers: {
        setTransmitters: (state, action) => {
            state.transmiters = action.payload;
        },
        setSelectedChannel: (state, action) => {
            state.selectedChannel = action.payload;
        }
    },
    extraReducers: (builder) => {
        //#region fetch transmitter by id
        builder
            .addCase(fetchTransmitterById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransmitterById.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload;
                state.selectedTransmitter = {
                    ...data,
                    channelData: data.tbl_rts_transmitter || [],
                }
            })
            .addCase(fetchTransmitterById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get channel mode
        builder
            .addCase(getChannelModeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getChannelModeThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data, channel, device_id } = action.payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    const channelData = state.selectedTransmitter.channelData?.find((ch) => ch.channel_no === channel);
                    if (channelData) {
                        channelData.frequency_mode = data.frequency_mode;
                        channelData.application_mode = data.application_mode;
                        channelData.feature_set_mode = data.feature_set_mode;
                    } else {
                        state.selectedTransmitter.channelData?.push({
                            channel_no: channel,
                            frequency_mode: data.frequency_mode,
                            application_mode: data.application_mode,
                            feature_set_mode: data.feature_set_mode,
                        });
                    }
                }
            })
            .addCase(getChannelModeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get rts address
        builder
            .addCase(getRtsAddressThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRtsAddressThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data, channel, device_id } = action.payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    const channelData = state.selectedTransmitter.channelData?.find((ch) => ch.channel_no === channel);
                    if (channelData) {
                        channelData.rts_address = data.rts_address;
                    } else {
                        state.selectedTransmitter.channelData?.push({
                            channel_no: channel,
                            rts_address: data.rts_address,
                        });
                    }
                }
            })
            .addCase(getRtsAddressThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region set sun mode
        builder
            .addCase(setSunModeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setSunModeThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { device_id, sun_mode } = action.payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    state.selectedTransmitter.sun_mode = sun_mode;
                }
            })
            .addCase(setSunModeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                if (state.selectedTransmitter?.sun_mode) {
                    state.selectedTransmitter.sun_mode = state.selectedTransmitter.sun_mode === "on" ? "off" : "on";
                } else {
                    state.selectedTransmitter!.sun_mode = "off";
                }
            });

        //#region get tilt frame count
        builder
            .addCase(getTiltFrameCountThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTiltFrameCountThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data, payload } = action.payload;
                const { device_id, channel } = payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    const channelData = state.selectedTransmitter.channelData?.find((ch) => ch.channel_no === channel);
                    if (channelData) {
                        channelData.tilt_frame_us = data.tilt_frame_us;
                        channelData.tilt_frame_ce = data.tilt_frame_ce;
                    } else {
                        state.selectedTransmitter.channelData?.push({
                            channel_no: channel,
                            tilt_frame_us: data.tilt_frame_us,
                            tilt_frame_ce: data.tilt_frame_ce,
                        });
                    }
                }
            })
            .addCase(getTiltFrameCountThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get dim frame count
        builder
            .addCase(getDimFrameCountThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDimFrameCountThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data, payload } = action.payload;
                const { device_id, channel } = payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    const channelData = state.selectedTransmitter.channelData?.find((ch) => ch.channel_no === channel);
                    if (channelData) {
                        channelData.dim_frame = data.dim_frame;
                    } else {
                        state.selectedTransmitter.channelData?.push({
                            channel_no: channel,
                            dim_frame: data.dim_frame,
                        });
                    }
                }
            })
            .addCase(getDimFrameCountThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get dct lock
        builder
            .addCase(getDctLockThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDctLockThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data, device_id } = action.payload;
                if (state.selectedTransmitter && state.selectedTransmitter.device_id === device_id) {
                    state.selectedTransmitter.dct_lock = data.dctLocks;
                }
            })
            .addCase(getDctLockThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get stack version
        builder
            .addCase(getStackVersionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStackVersionThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data } = action.payload;
                if (state.selectedTransmitter) {
                    state.selectedTransmitter.stack_version = data.stack_version;
                }
            })
            .addCase(getStackVersionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region get app version
        builder
            .addCase(getAppVersionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAppVersionThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { data } = action.payload;
                if (state.selectedTransmitter) {
                    state.selectedTransmitter.app_version = data.app_version;
                }
            })
            .addCase(getAppVersionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setTransmitters,
    setSelectedChannel
} = transmitterSlice.actions;

export default transmitterSlice.reducer;