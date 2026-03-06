import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { KeypadItem } from "~/interfaces/keypad";
import { keypadService } from "~/services/keypad.Service";
import { getAxiosMessage } from "~/utils/helperFunctions";
import { fetchFloorsThunk } from "./floorSlice";
import { setSelectedDeviceId, setSelectedDeviceType } from "./deviceSlice";


interface KeypadState {
    keypads: KeypadItem[];
    selectedKeypad: KeypadItem | null;
    deleteKeypadDialog: boolean;
    keypadToDelete: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: KeypadState = {
    keypads: [],
    selectedKeypad: null,
    deleteKeypadDialog: false,
    keypadToDelete: null,
    loading: false,
    error: null,
};

//#region fetch keypad by id
export const fetchKeypadById = createAsyncThunk(
    "keypad/fetchById",
    async (deviceId: number, { rejectWithValue }) => {
        try {
            const response = await keypadService.getKeypadById(deviceId);
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            return rejectWithValue(errMessage);
        }
    }
);

//#region delete keypad
export const deleteKeypad = createAsyncThunk(
    "keypad/delete",
    async (deviceId: number, { rejectWithValue, dispatch, getState }) => {
        try {
            const response = await keypadService.deleteKeypad(deviceId);
            dispatch(fetchFloorsThunk());
            const state = getState() as any;
            if (state.device.selectedDeviceId === deviceId) {
                dispatch(setSelectedDeviceId(null));
                dispatch(setSelectedDeviceType(null));
            }
            return response.data;
        } catch (error) {
            const errMessage = getAxiosMessage(error);
            return rejectWithValue(errMessage);
        }
    }
);

const keypadSlice = createSlice({
    name: "keypad",
    initialState,
    reducers: {
        setKeypads(state, action: PayloadAction<KeypadItem[]>) {
            state.keypads = action.payload;
        },

        openDeleteKeypadDialog(state, action: PayloadAction<number>) {
            state.keypadToDelete = action.payload;
            state.deleteKeypadDialog = true;
        },

        closeDeleteKeypadDialog(state) {
            state.keypadToDelete = null;
            state.deleteKeypadDialog = false;
        },
    },
    extraReducers: (builder) => {
        //#region fetch keypad by id
        builder
            .addCase(fetchKeypadById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchKeypadById.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload;
                state.selectedKeypad = {
                    ...data,
                    keypadData: data.tbl_keypads || [],
                };
            })
            .addCase(fetchKeypadById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        //#region delete keypad
        builder
            .addCase(deleteKeypad.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteKeypad.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedKeypad = null;
                state.deleteKeypadDialog = false;
                state.keypadToDelete = null;
            })
            .addCase(deleteKeypad.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setKeypads,
    openDeleteKeypadDialog,
    closeDeleteKeypadDialog,
} = keypadSlice.actions;

export default keypadSlice.reducer;