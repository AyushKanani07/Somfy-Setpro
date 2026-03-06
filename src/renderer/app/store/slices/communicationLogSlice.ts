import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { OfflineCommand } from "~/interfaces/communicationLog";
import { communicationLogService } from "~/services/communicationLogService";
import { getAxiosMessage } from "~/utils/helperFunctions";


interface CommunicationLogState {
    offlineCommandLst: OfflineCommand[];
    loading: boolean;
    error: string | null;
}

const initialState: CommunicationLogState = {
    offlineCommandLst: [],
    loading: false,
    error: null,
};

//#region get all offline commands
export const getAllOfflineCommandsThunk = createAsyncThunk(
    "communicationLog/getAllOfflineCommands",
    async (_, { rejectWithValue }) => {
        try {
            const response = await communicationLogService.getAllOfflineCommands();
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            return rejectWithValue(errMessage);
        }
    }
);

//#region delete all offline commands
export const deleteAllOfflineCommandsThunk = createAsyncThunk(
    "communicationLog/deleteAllOfflineCommands",
    async (_, { rejectWithValue }) => {
        try {
            const response = await communicationLogService.deleteAllOfflineCommands();
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            return rejectWithValue(errMessage);
        }
    }
);

const communicationLogSlice = createSlice({
    name: "communicationLog",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        // #region get all offline commands
        builder.addCase(getAllOfflineCommandsThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getAllOfflineCommandsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.offlineCommandLst = action.payload;
        });
        builder.addCase(getAllOfflineCommandsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // #region delete all offline commands
        builder.addCase(deleteAllOfflineCommandsThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteAllOfflineCommandsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.offlineCommandLst = [];
        });
        builder.addCase(deleteAllOfflineCommandsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

    }
});

export const {

} = communicationLogSlice.actions;

export default communicationLogSlice.reducer;