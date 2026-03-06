import {
  autoGenerateMotorIpsThunk,
  closeDeleteMotorDialog,
  closeUpdateMotorDialog,
  deleteMotorThunk,
  eraseAllMotorIpsThunk,
  fetchMotorByIdThunk,
  fetchMotorIpByIdThunk,
  getAppModeThunk,
  getMotorDirectionThunk,
  getMotorLedStatusThunk,
  getMotorLimitsThunk,
  getMotorMoveCountThunk,
  getMotorNetworkErrorStatsThunk,
  getMotorNetworkLockThunk,
  getMotorNetworkStatsThunk,
  getMotorObstacleCountThunk,
  getMotorPositionThunk,
  getMotorPowerCutCountThunk,
  getMotorRampTimeThunk,
  getMotorResetCountThunk,
  getMotorRevCountThunk,
  getMotorRollingSpeedThunk,
  getMotorThermalCountThunk,
  moveMotorOfFunctionThunk,
  moveMotorToPositionThunk,
  openDeleteMotorDialog,
  openUpdateMotorDialog,
  setMotorAppModeThunk,
  setMotorDirectionThunk,
  setMotorIpThunk,
  setMotorLedStatusThunk,
  setMotorNetworkLockThunk,
  setMotorRampTimeThunk,
  setMotorRollingSpeedThunk,
  setMotors,
  setMultipleSelectedMotorId,
  setSelectedMotor,
  setSelectedMotorId,
  startGetMotorCurrentPosition,
  stopGetMotorCurrentPosition,
  stopMotorThunk,
  updateMotorCurrentPosition,
  updateMotorIpData,
  updateMotorThunk,
  winkMotorThunk,
} from "~/store/slices/motorSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import type {
  MotorIpData,
  MotorIpPayload,
  MotorItem,
  MotorMoveOfPayload,
  MotorMoveToPayload,
  MotorSocketGetPositionResponse,
  SetRampTimePayload,
  SetRollingSpeedPayload,
  UpdateMotorPayload,
  WinkMotorPayload,
} from "~/interfaces/motor";
import { lstNodeType, lstSubNodeType } from "~/constant/constant";

export const useMotors = () => {
  const dispatch = useAppDispatch();
  const motors = useAppSelector((state) => state.motor);

  //#region actions
  const actions = {
    setMotors: (motors: MotorItem[]) => dispatch(setMotors(motors)),
    setSelectedMotor: (motor: MotorItem | null) =>
      dispatch(setSelectedMotor(motor)),
    setSelectedMotorId: (motorId: number | null) =>
      dispatch(setSelectedMotorId(motorId)),
    setMultipleSelectedMotorId: (motorIds: number[] | []) =>
      dispatch(setMultipleSelectedMotorId(motorIds)),
    openUpdateMotorDialog: (motor: { id: number; name: string }) =>
      dispatch(openUpdateMotorDialog(motor)),
    closeUpdateMotorDialog: () => dispatch(closeUpdateMotorDialog()),
    openDeleteMotorDialog: (motorId: number) =>
      dispatch(openDeleteMotorDialog(motorId)),
    closeDeleteMotorDialog: () => dispatch(closeDeleteMotorDialog()),
    startGetMotorCurrentPosition: () =>
      dispatch(startGetMotorCurrentPosition({ pos_type: "pulse" })),
    stopGetMotorCurrentPosition: () => dispatch(stopGetMotorCurrentPosition()),
    updateMotorCurrentPosition: (
      payload: MotorSocketGetPositionResponse["data"]
    ) => dispatch(updateMotorCurrentPosition(payload)),
    updateMotorIpData: (payload: { ipData: MotorIpData }) =>
      dispatch(updateMotorIpData(payload)),
  };

  const methods = {

  };

  //#region thunks
  const thunks = {
    fetchMotorByIdThunk: (motorId: number) =>
      dispatch(fetchMotorByIdThunk(motorId)),
    updateMotorThunk: (payload: UpdateMotorPayload) =>
      dispatch(updateMotorThunk(payload)),
    deleteMotorThunk: (motorId: number) => dispatch(deleteMotorThunk(motorId)),
    winkMotorThunk: (winkPayload: WinkMotorPayload) =>
      dispatch(winkMotorThunk(winkPayload)),
    moveMotorToPositionThunk: (payload: MotorMoveToPayload) =>
      dispatch(moveMotorToPositionThunk(payload)),
    moveMotorOfFunctionThunk: (payload: MotorMoveOfPayload) =>
      dispatch(moveMotorOfFunctionThunk(payload)),
    stopMotorThunk: (payload: { motorId: number; isACK?: boolean }) =>
      dispatch(stopMotorThunk(payload)),
    fetchMotorIpByIdThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(fetchMotorIpByIdThunk({ motorId, isRefresh })),
    setMotorIpThunk: (payload: MotorIpPayload) =>
      dispatch(setMotorIpThunk(payload)),
    eraseAllMotorIpsThunk: (device_id: number) =>
      dispatch(eraseAllMotorIpsThunk(device_id)),
    autoGenerateMotorIpsThunk: (params: {
      device_id: number;
      ip_count: number;
    }) => dispatch(autoGenerateMotorIpsThunk(params)),
    getMotorLimitsThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorLimitsThunk({ motorId, isRefresh })),
    getMotorPositionThunk: (motorId: number) =>
      dispatch(getMotorPositionThunk(motorId)),
    getMotorDirectionThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorDirectionThunk({ motorId, isRefresh })),
    setMotorDirectionThunk: (payload: { device_id: number; direction: "forward" | "reverse" }) =>
      dispatch(setMotorDirectionThunk(payload)),
    setMotorAppModeThunk: (payload: { device_id: number; app_mode: number }) =>
      dispatch(setMotorAppModeThunk(payload)),
    getAppModeThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getAppModeThunk({ motorId, isRefresh })),
    setMotorLedStatusThunk: (payload: { device_id: number; status: "on" | "off" }) =>
      dispatch(setMotorLedStatusThunk(payload)),
    getMotorLedStatusThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorLedStatusThunk({ motorId, isRefresh })),
    getMotorNetworkLockThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorNetworkLockThunk({ motorId, isRefresh })),
    setMotorNetworkLockThunk: (payload: { device_id: number; isLocked: boolean; priority: number }) =>
      dispatch(setMotorNetworkLockThunk(payload)),
    setMotorRollingSpeedThunk: (payload: SetRollingSpeedPayload) =>
      dispatch(setMotorRollingSpeedThunk(payload)),
    getMotorRollingSpeedThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorRollingSpeedThunk({ device_id: motorId, isRefresh })),
    getMotorRampTimeThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorRampTimeThunk({ device_id: motorId, isRefresh })),
    setMotorRampTimeThunk: (payload: SetRampTimePayload) =>
      dispatch(setMotorRampTimeThunk(payload)),
    getMotorMoveCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorMoveCountThunk({ motorId, isRefresh })),
    getMotorRevCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorRevCountThunk({ motorId, isRefresh })),
    getMotorThermalCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorThermalCountThunk({ motorId, isRefresh })),
    getMotorObstacleCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorObstacleCountThunk({ motorId, isRefresh })),
    getMotorPowerCutCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorPowerCutCountThunk({ motorId, isRefresh })),
    getMotorResetCountThunk: (motorId: number, isRefresh?: boolean) =>
      dispatch(getMotorResetCountThunk({ motorId, isRefresh })),
    getMotorNetworkStatsThunk: (motorId: number) =>
      dispatch(getMotorNetworkStatsThunk(motorId)),
    getMotorNetworkErrorStatsThunk: (motorId: number) =>
      dispatch(getMotorNetworkErrorStatsThunk(motorId)),

  };

  return {
    // state
    ...motors,

    // actions
    ...actions,

    // thunks
    ...thunks,

    // methods
    ...methods,
  };
};
