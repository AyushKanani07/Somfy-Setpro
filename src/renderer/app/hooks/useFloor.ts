import type {
  CreateFloorPayload,
  CreateMultipleFloorPayload,
  Floor,
  UpdateFloorPayload,
} from "~/interfaces/floor";
import {
  closeCreateFloorDialog,
  closeDeleteFloorDialog,
  closeUpdateFloorDialog,
  createFloorThunk,
  createMultipleFloorsThunk,
  deleteFloorThunk,
  fetchFloorsThunk,
  openCreateFloorDialog,
  openDeleteFloorDialog,
  openUpdateFloorDialog,
  setFloors,
  setSelectedNode,
  updateFloorThunk,
} from "~/store/slices/floorSlice";
import { updateDeviceRoomIdThunk } from "~/store/slices/deviceSlice";
import { updateRoomFloorIdThunk } from "~/store/slices/roomSlice";
import { useAppDispatch, useAppSelector } from "./redux";

export const useFloor = () => {
  // Hook logic would go here
  const dispatch = useAppDispatch();
  const floors = useAppSelector((state) => state.floor);

  //#region actions
  const actions = {
    setFloors: (floors: Floor[]) => dispatch(setFloors(floors)),
    setSelectedNode: (node: {
      type: "floor" | "room";
      floorId: number;
    } | null) => dispatch(setSelectedNode(node)),
    openCreateFloorDialog: () => dispatch(openCreateFloorDialog()),
    closeCreateFloorDialog: () => dispatch(closeCreateFloorDialog()),
    openUpdateFloorDialog: (payload: { id: number; name: string }) =>
      dispatch(openUpdateFloorDialog(payload)),
    closeUpdateFloorDialog: () => dispatch(closeUpdateFloorDialog()),
    openDeleteFloorDialog: (floorId: number) =>
      dispatch(openDeleteFloorDialog(floorId)),
    closeDeleteFloorDialog: () => dispatch(closeDeleteFloorDialog()),
  };

  // #region Thunks
  const thunks = {
    fetchFloorsThunk: () => dispatch(fetchFloorsThunk()),
    createFloorThunk: (floorData: CreateFloorPayload) =>
      dispatch(createFloorThunk(floorData)),
    createMultipleFloorsThunk: (floorData: CreateMultipleFloorPayload) =>
      dispatch(createMultipleFloorsThunk(floorData)),
    updateFloorThunk: (payload: UpdateFloorPayload) =>
      dispatch(updateFloorThunk(payload)),
    deleteFloorThunk: (floorId: number) => dispatch(deleteFloorThunk(floorId)),
  };

  //#region Methods
  const methods = {
    updateRoomFloorId: async (roomId: number, floorId: number) => {
      const response = await dispatch(
        updateRoomFloorIdThunk({ roomId, floorId })
      ).unwrap();
      if (response) {
        dispatch(fetchFloorsThunk());
      }
    },

    updateMotorRoomId: async (motorId: number, roomId: number) => {
      const response = await dispatch(updateDeviceRoomIdThunk({ deviceId: motorId, roomId })).unwrap();
      if (response) {
        dispatch(fetchFloorsThunk());
      }
    },
  };

  return {
    // state
    ...floors,

    // actions
    ...actions,

    // thunks
    ...thunks,

    // methods
    ...methods,
  };
};
