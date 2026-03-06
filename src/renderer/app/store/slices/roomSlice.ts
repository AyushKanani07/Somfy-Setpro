import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import type {
  CreateMultipleRoomPayload,
  CreateRoomPayload,
  Room,
  UpdateRoomPayload,
} from "~/interfaces/room";
import { roomService } from "~/services/roomService";
import { getAxiosMessage } from "~/utils/helperFunctions";
import { fetchFloorsThunk } from "./floorSlice";

interface RoomState {
  rooms: Room[];
  selectedRoom: { id: number; name: string } | null;
  createRoomDialog: boolean;
  updateRoomDialog: boolean;
  deleteRoomDialog: boolean;
  roomToDelete: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  selectedRoom: null,
  createRoomDialog: false,
  updateRoomDialog: false,
  deleteRoomDialog: false,
  roomToDelete: null,
  loading: false,
  error: null,
};

//#region fetchRoomsThunk
export const fetchRoomsThunk = createAsyncThunk(
  "room/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomService.fetchRooms();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region Update RoomFloorIdThunk
export const updateRoomFloorIdThunk = createAsyncThunk(
  "room/updateRoomFloorId",
  async (payload: { roomId: number; floorId: number }, { rejectWithValue }) => {
    try {
      const { roomId, floorId } = payload;
      const response = await roomService.updateRoomFloorId(roomId, floorId);
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region createRoomThunk
export const createRoomThunk = createAsyncThunk(
  "room/createRoom",
  async (roomData: CreateRoomPayload, { rejectWithValue }) => {
    try {
      const response = await roomService.createSingleRoom(roomData);
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region createMultipleRoomThunk
export const createMultipleRoomsThunk = createAsyncThunk(
  "room/createMultipleRooms",
  async (
    roomData: CreateMultipleRoomPayload,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await roomService.createMultipleRooms(roomData);
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

//#region updateRoomThunk
export const updateRoomThunk = createAsyncThunk(
  "room/updateRoom",
  async (payload: UpdateRoomPayload, { rejectWithValue }) => {
    try {
      const response = await roomService.updateRoom(payload);
      const message = getAxiosMessage(response);
      toast.success(message);
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region deleteRoomThunk
export const deleteRoomThunk = createAsyncThunk(
  "room/deleteRoom",
  async (roomId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await roomService.deleteRoom(roomId);
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

//#region Room Slice

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<Room[]>) {
      state.rooms = action.payload;
    },

    openCreateRoomDialog(state) {
      state.createRoomDialog = true;
    },

    closeCreateRoomDialog(state) {
      state.createRoomDialog = false;
    },

    openUpdateRoomDialog(
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) {
      state.updateRoomDialog = true;
      state.selectedRoom = action.payload;
    },

    closeUpdateRoomDialog(state) {
      state.updateRoomDialog = false;
      state.selectedRoom = null;
    },

    openDeleteRoomDialog(state, action: PayloadAction<number>) {
      state.deleteRoomDialog = true;
      state.roomToDelete = action.payload;
    },

    closeDeleteRoomDialog(state) {
      state.deleteRoomDialog = false;
      state.roomToDelete = null;
    },
  },
  //#region extraReducers
  extraReducers: (builder) => {
    //#region fetchRoomsThunk builder
    builder.addCase(fetchRoomsThunk.fulfilled, (state, action) => {
      state.rooms = action.payload;
    });

    //#region updateRoomFloorIdThunk builder
    builder.addCase(updateRoomFloorIdThunk.fulfilled, (state, action) => {
      state.loading = false;
    });

    //#region createRoomThunk builder
    builder
      .addCase(createRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoomThunk.fulfilled, (state, action) => {
        const newRoom: Room = action.payload;
        state.rooms.push(newRoom);
        state.createRoomDialog = false;
      })
      .addCase(createRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region createMultipleRoomsThunk builder
    builder
      .addCase(createMultipleRoomsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleRoomsThunk.fulfilled, (state, action) => {
        const newRooms: Room[] = action.payload;
        state.rooms.push(...newRooms);
        state.createRoomDialog = false;
      })
      .addCase(createMultipleRoomsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region updateRoomThunk builder
    builder
      .addCase(updateRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.updateRoomDialog = false;
      })
      .addCase(updateRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region deleteRoomThunk builder
    builder
      .addCase(deleteRoomThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteRoomThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setRooms,
  openCreateRoomDialog,
  closeCreateRoomDialog,
  openUpdateRoomDialog,
  closeUpdateRoomDialog,
  openDeleteRoomDialog,
  closeDeleteRoomDialog,
} = roomSlice.actions;

export default roomSlice.reducer;
