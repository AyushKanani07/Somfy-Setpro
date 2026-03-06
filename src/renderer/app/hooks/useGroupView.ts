import type {
  CreateMutipleDevice,
  DeleteGroupDevice,
  GroupData,
} from "~/interfaces/groupView";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  setGroups,
  setSelectedGroupId,
  openCreateGroupDialog,
  closeCreateGroupDialog,
  addMotorToGroupLocal,
  removeMotorFromGroupLocal,
  setCurrentDragItem,
  clearCurrentDragItem,
  fetchGroupsThunk,
  createGroupThunk,
  addMotorToGroupThunk,
  type CreateGroupPayload,
  type AddMotorToGroupPayload,
  type RemoveMotorFromGroupPayload,
  type DraggedDevice,
  fetchGroupDevicesThunk,
  createMultipleGroupDevicesThunk,
  deleteGroupDeviceThunk,
  openGroupScanningDialog,
  closeGroupScanningDialog,
  setGroupScanningStatus,
  deleteGroupThunk,
} from "~/store/slices/groupViewSlice";

export const useGroupView = () => {
  const dispatch = useAppDispatch();
  const groupView = useAppSelector((state) => state.groupView);

  const actions = {
    setGroups: (groups: GroupData[]) => dispatch(setGroups(groups)),
    setSelectedGroupId: (id: number | null) => dispatch(setSelectedGroupId(id)),
    openCreateGroupDialog: () => dispatch(openCreateGroupDialog()),
    closeCreateGroupDialog: () => dispatch(closeCreateGroupDialog()),
    addMotorToGroupLocal: (payload: AddMotorToGroupPayload) =>
      dispatch(addMotorToGroupLocal(payload)),
    removeMotorFromGroupLocal: (payload: RemoveMotorFromGroupPayload) =>
      dispatch(removeMotorFromGroupLocal(payload)),
    setCurrentDragItem: (item: DraggedDevice | null) =>
      dispatch(setCurrentDragItem(item)),
    clearCurrentDragItem: () => dispatch(clearCurrentDragItem()),
    openGroupScanningDialog: () => dispatch(openGroupScanningDialog()),
    closeGroupScanningDialog: () => dispatch(closeGroupScanningDialog()),
    setGroupScanningStatus: (status: boolean) =>
      dispatch(setGroupScanningStatus(status)),
  };

  const thunks = {
    fetchGroupsThunk: () => dispatch(fetchGroupsThunk()),
    fetchGroupDevicesThunk: () => dispatch(fetchGroupDevicesThunk()),
    createMultipleGroupDevicesThunk: (payload: CreateMutipleDevice) =>
      dispatch(createMultipleGroupDevicesThunk(payload)),
    deleteGroupDeviceThunk: (payload: DeleteGroupDevice) =>
      dispatch(deleteGroupDeviceThunk(payload)),
    deleteGroupThunk: (groupId: number) => dispatch(deleteGroupThunk(groupId)),
    createGroupThunk: (payload: CreateGroupPayload) =>
      dispatch(createGroupThunk(payload)),
    addMotorToGroupThunk: (payload: AddMotorToGroupPayload) =>
      dispatch(addMotorToGroupThunk(payload))
  };

  return {
    // State
    ...groupView,

    // Actions
    ...actions,

    // Thunks
    ...thunks,
  };
};
