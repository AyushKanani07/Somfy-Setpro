import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import type {
  CreateMultipleFloorPayload,
  Floor,
  UpdateFloorPayload,
} from "~/interfaces/floor";
import { floorService } from "~/services/floorService";
import { getAxiosMessage } from "~/utils/helperFunctions";

interface FloorState {
  floors: Floor[];
  selectedNode: { type: "floor" | "room"; floorId: number } | null;
  selectedFloor: { id: number; name: string } | null;
  floorToDelete: number | null;
  createFloorDialog: boolean;
  updateFloorDialog: boolean;
  deleteFloorDialog: boolean;
  loading: boolean;
  error: string | null;
}

//#region initialState
const initialState: FloorState = {
  floors: [],
  selectedNode: null,
  selectedFloor: null,
  createFloorDialog: false,
  updateFloorDialog: false,
  deleteFloorDialog: false,
  floorToDelete: null,
  loading: false,
  error: null,
};

//#region fetchFloorsThunk
export const fetchFloorsThunk = createAsyncThunk(
  "floor/fetchFloors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await floorService.fetchFloors();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region createFloorThunk
export const createFloorThunk = createAsyncThunk(
  "floor/createFloor",
  async (floorData: { name: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await floorService.createSingleFloor(floorData);
      const message = getAxiosMessage(response);
      toast.success(message);
      dispatch(fetchFloorsThunk());
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region createMultipleFloorsThunk
export const createMultipleFloorsThunk = createAsyncThunk(
  "floor/createMultipleFloors",
  async (
    floorData: CreateMultipleFloorPayload,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await floorService.createMultipleFloors(floorData);
      const message = getAxiosMessage(response);
      toast.success(message);
      dispatch(fetchFloorsThunk());
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region updateFloorThunk
export const updateFloorThunk = createAsyncThunk(
  "floor/updateFloor",
  async (payload: UpdateFloorPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await floorService.updateFloor(payload);
      const message = getAxiosMessage(response);
      dispatch(fetchFloorsThunk());
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region deleteFloorThunk
export const deleteFloorThunk = createAsyncThunk(
  "floor/deleteFloor",
  async (floorId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await floorService.deleteFloor(floorId);
      const message = getAxiosMessage(response);
      toast.success(message);
      dispatch(fetchFloorsThunk());
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

// #region floorSlice
const floorSlice = createSlice({
  name: "floor",
  initialState,
  reducers: {
    setFloors(state, action: PayloadAction<Floor[]>) {
      state.floors = action.payload;
    },

    setSelectedNode(
      state,
      action: PayloadAction<{ type: "floor" | "room"; floorId: number } | null>
    ) {
      state.selectedNode = action.payload;
    },

    openCreateFloorDialog(state) {
      state.createFloorDialog = true;
    },

    closeCreateFloorDialog(state) {
      state.createFloorDialog = false;
    },

    openUpdateFloorDialog(
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) {
      state.updateFloorDialog = true;
      state.selectedFloor = action.payload;
    },

    closeUpdateFloorDialog(state) {
      state.updateFloorDialog = false;
      state.selectedFloor = null;
    },

    openDeleteFloorDialog(state, action: PayloadAction<number>) {
      state.deleteFloorDialog = true;
      state.floorToDelete = action.payload;
    },

    closeDeleteFloorDialog(state) {
      state.deleteFloorDialog = false;
      state.floorToDelete = null;
    },
  },
  extraReducers: (builder) => {
    // #region fetchFloorsThunk builder
    builder
      .addCase(fetchFloorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFloorsThunk.fulfilled,
        (state, action: PayloadAction<Floor[]>) => {
          state.loading = false;
          state.floors = action.payload;
        }
      )
      .addCase(fetchFloorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region createFloorThunk builder
    builder
      .addCase(createFloorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createFloorThunk.fulfilled,
        (state, action: PayloadAction<Floor>) => {
          state.loading = false;
          state.createFloorDialog = false;
        }
      )
      .addCase(createFloorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region createMultipleFloorsThunk builder
    builder
      .addCase(createMultipleFloorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createMultipleFloorsThunk.fulfilled,
        (state, action: PayloadAction<Floor[]>) => {
          state.loading = false;
          state.createFloorDialog = false;
        }
      )
      .addCase(createMultipleFloorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region updateFloorThunk builder
    builder
      .addCase(updateFloorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateFloorThunk.fulfilled,
        (state, action: PayloadAction<Floor>) => {
          state.updateFloorDialog = false;
          state.loading = false;
        }
      )
      .addCase(updateFloorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region deleteFloorThunk builder
    builder
      .addCase(deleteFloorThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteFloorThunk.fulfilled,
        (state, action: PayloadAction<{}>) => {
          state.loading = false;
        }
      )
      .addCase(deleteFloorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const {
  setFloors,
  setSelectedNode,
  openCreateFloorDialog,
  closeCreateFloorDialog,
  openUpdateFloorDialog,
  closeUpdateFloorDialog,
  openDeleteFloorDialog,
  closeDeleteFloorDialog,
} = floorSlice.actions;
export default floorSlice.reducer;
