import type {
  CreateMultipleRoomPayload,
  CreateRoomPayload,
  Room,
  UpdateRoomPayload,
} from "~/interfaces/room";
import {
  closeCreateRoomDialog,
  closeDeleteRoomDialog,
  closeUpdateRoomDialog,
  createMultipleRoomsThunk,
  createRoomThunk,
  deleteRoomThunk,
  fetchRoomsThunk,
  openCreateRoomDialog,
  openDeleteRoomDialog,
  openUpdateRoomDialog,
  setRooms,
  updateRoomFloorIdThunk,
  updateRoomThunk,
} from "~/store/slices/roomSlice";
import { useAppDispatch, useAppSelector } from "./redux";

export const useRooms = () => {
  const dispatch = useAppDispatch();
  const rooms = useAppSelector((state) => state.room);

  //#region actions
  const actions = {
    setRooms: (rooms: Room[]) => dispatch(setRooms(rooms)),
    openCreateRoomDialog: () => dispatch(openCreateRoomDialog()),
    closeCreateRoomDialog: () => dispatch(closeCreateRoomDialog()),
    openUpdateRoomDialog: (payload: { id: number; name: string }) =>
      dispatch(openUpdateRoomDialog(payload)),
    closeUpdateRoomDialog: () => dispatch(closeUpdateRoomDialog()),
    openDeleteRoomDialog: (roomId: number) =>
      dispatch(openDeleteRoomDialog(roomId)),
    closeDeleteRoomDialog: () => dispatch(closeDeleteRoomDialog()),
  };

  //#region thunks
  const thunks = {
    fetchRoomsThunk: () => dispatch(fetchRoomsThunk()),
    updateRoomFloorIdThunk: (payload: { roomId: number; floorId: number }) =>
      dispatch(updateRoomFloorIdThunk(payload)),
    updateRoomThunk: (payload: UpdateRoomPayload) =>
      dispatch(updateRoomThunk(payload)),
    createRoomThunk: (roomData: CreateRoomPayload) =>
      dispatch(createRoomThunk(roomData)),
    createMultipleRoomsThunk: (roomData: CreateMultipleRoomPayload) =>
      dispatch(createMultipleRoomsThunk(roomData)),
    deleteRoomThunk: (roomId: number) => dispatch(deleteRoomThunk(roomId)),
  };

  return {
    // state
    ...rooms,

    // actions
    ...actions,

    // thunks
    ...thunks,
  };
};
