import { Save, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useComport } from "~/hooks/useComport";
import MotorInputLabelComponent from "../motorControl/MotorInputLabelComponent";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { useMotors } from "~/hooks/useMotors";
import MotorMoveToEnd from "../motorControl/MotorMoveToEnd";
import { MotorHoldToMove } from "../motorControl/MotorHoldToMove";
import { toast } from "sonner";
import { motorService } from "~/services/motorService";
import type { SetMotorLimitPayload } from "~/interfaces/motor";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { useFloor } from "~/hooks/useFloor";
import { useDevice } from "~/hooks/useDevice";

function MotorLimit() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const {
    selectedMotor,
    getMotorLimitsThunk,
    getMotorPositionThunk,
  } = useMotors();
  const { findDeviceTypeBySubNode } = useDevice();
  const {
    fetchFloorsThunk,
  } = useFloor();
  const [bottomLimit, setBottomLimit] = useState<string>("");
  const [resetLimitConfirmDialog, setResetLimitConfirmDialog] = useState(false);

  useEffect(() => {
    if (!selectedMotor || isOfflineEditMode || !isComportConnected) return;

    if (selectedMotor.tbl_motor.down_limit == null || selectedMotor.tbl_motor.up_limit == null) {
      const fetchLimits = async () => {
        await getMotorLimitsThunk(selectedMotor?.device_id!, true);
        fetchFloorsThunk();
      }
      fetchLimits();
    }
  }, [])

  const handleBottomLimitSet = async () => {
    if (bottomLimit === "") return toast.error("Please enter bottom limit.");
    const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);
    if (!motorType) return toast.error("Unable to determine motor type");

    if (motorType == 'lsu_50_ac' && (Number(bottomLimit) < 0x0020 || Number(bottomLimit) > 0xFCFF)) {
      return toast.error(`Bottom limit should be between ${0x0020} and ${0xFCFF}`);
    } else if (motorType == 'st_50_dc' && (Number(bottomLimit) < 0x0696 || Number(bottomLimit) > 0xFCFF)) {
      return toast.error(`Bottom limit should be between ${0x0696} and ${0xFCFF}`);
    } else if (motorType == 'lsu_40_ac' && (Number(bottomLimit) < 0x00B4 || Number(bottomLimit) > 0xFCFF)) {
      return toast.error(`Bottom limit should be between ${0x00B4} and ${0xFCFF}`);
    } else if (motorType == 'st_30' && (Number(bottomLimit) < 0x0140 || Number(bottomLimit) > 0x37C0)) {
      return toast.error(`Bottom limit should be between ${0x0140} and ${0x37C0}`);
    } else if (motorType == 'qt_30' && (Number(bottomLimit) < 0x0632 || Number(bottomLimit) > 0xF6E0)) {
      return toast.error(`Bottom limit should be between ${0x0632} and ${0xF6E0}`);
    } else if (Number(bottomLimit) < 100) {
      return toast.error("Bottom limit should be greater than 100 pulses.");
    }
    try {
      const payload: SetMotorLimitPayload = {
        device_id: selectedMotor?.device_id!,
        function_type: 'pulse',
        value_position: Number(bottomLimit),
      }
      const res = await motorService.setMotorLimit(payload);
      if (res && !res.success) {
        throw new Error(res.message);
      }
      await getMotorLimitsThunk(selectedMotor?.device_id!, true);
      await fetchFloorsThunk();
      const downLimit = selectedMotor?.tbl_motor.down_limit;
      const upLimit = selectedMotor?.tbl_motor.up_limit;
      if (downLimit && downLimit !== 65535 && upLimit !== 65535) {
        await Promise.all([
          getMotorPositionThunk(selectedMotor?.device_id!),
          // get motor Ip Thunk call
        ])
      }

    } catch (error) {
      toast.error((error as Error).message || "An error occurred while setting the bottom limit.");
    }
  };

  const handleTopLimitCurent = async () => {
    try {
      const payload: SetMotorLimitPayload = {
        device_id: selectedMotor?.device_id!,
        function_type: 'top',
      }
      const res = await motorService.setMotorLimit(payload);
      if (res && !res.success) {
        throw new Error(res.message);
      }
      await getMotorLimitsThunk(selectedMotor?.device_id!, true);
    } catch (error) {
      toast.error((error as Error).message || "An error occurred while setting the top limit.");
    }
  };

  const handleResetLimits = async () => {
    try {
      const res = await motorService.resetMotorLimit(selectedMotor?.device_id!);
      if (res && !res.success) {
        throw new Error(res.message);
      }
      await getMotorLimitsThunk(selectedMotor?.device_id!, true);
      await fetchFloorsThunk();
      const downLimit = selectedMotor?.tbl_motor.down_limit;
      const upLimit = selectedMotor?.tbl_motor.up_limit;
      if (downLimit && downLimit == 65535 && upLimit == 65535) {
        await Promise.all([
          getMotorPositionThunk(selectedMotor?.device_id!),
          // get motor Ip Thunk call
        ])
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred while resetting the motor limits.");
    }
  };

  const handleBottomLimitCurrent = async () => {
    try {
      const payload: SetMotorLimitPayload = {
        device_id: selectedMotor?.device_id!,
        function_type: 'bottom',
      }
      const res = await motorService.setMotorLimit(payload);
      if (res && !res.success) {
        throw new Error(res.message);
      }
      await getMotorLimitsThunk(selectedMotor?.device_id!, true);
      const downLimit = selectedMotor?.tbl_motor.down_limit;
      const upLimit = selectedMotor?.tbl_motor.up_limit;
      if (downLimit && downLimit !== 65535 && upLimit !== 65535) {
        await Promise.all([
          getMotorPositionThunk(selectedMotor?.device_id!),
          // get motor Ip Thunk call
        ])
      }

    } catch (error) {
      toast.error((error as Error).message || "An error occurred while setting the bottom limit.");
    }
  }

  return (
    <div className="w-full h-full flex flex-row gap-8 justify-between px-10 items-center py-8">
      <div className="h-full flex flex-col justify-center items-start gap-8">
        {/* Top Limit Column */}
        <div className="flex flex-col justify-center items-center gap-5">
          <div className="flex flex-col justify-center items-center">
            <div className="w-20 h-20 flex justify-start pl-2 rounded-full border-2 border-borderLightColor">
              <img src="svg/top_limit.svg" alt="" />
            </div>
            <span className="text-textLightColor capitalize text-sm mt-1">
              Set top limit: {selectedMotor?.tbl_motor.up_limit || 0} pulses
            </span>
          </div>
          <SetProButton
            buttonType="submit"
            onClick={handleTopLimitCurent}
            disabled={!isComportConnected || isOfflineEditMode}>
            <Save size={18} />
            Set Top Limit At Current
          </SetProButton>
        </div>
        {/* Bottom Limit Column */}
        <div className="flex flex-col justify-center items-center gap-5">
          <div className="flex flex-col justify-center items-center">
            <div className="w-20 h-20 flex justify-start pl-2 rounded-full border-2 border-borderLightColor">
              <img src="svg/bottom_limit.svg" alt="" />
            </div>
            <span className="text-textLightColor capitalize text-sm mt-1">
              Set bottom limit: {selectedMotor?.tbl_motor.down_limit || 0} pulses
            </span>
          </div>
          <SetProButton
            disabled={!isComportConnected || isOfflineEditMode}
            buttonType="submit"
            onClick={handleBottomLimitCurrent}
          >
            <Save size={18} />
            Set Bottom Limit At Current
          </SetProButton>
          <div className="flex justify-center items-center gap-2">
            <MotorInputLabelComponent
              labelText="pulse"
              value={bottomLimit}
              onChange={(value) => {
                setBottomLimit(value.toString());
              }}
              disabled={!isComportConnected || isOfflineEditMode}
              placeholder="50"
            />
            <SetProButton
              disabled={!isComportConnected || isOfflineEditMode || bottomLimit === ""}
              buttonType="submit"
              onClick={handleBottomLimitSet}
            >
              Set
            </SetProButton>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 mx-auto">
        <div className="flex flex-row">
          <MotorMoveToEnd from="motor_settings" title="Continues Movement" />
          <MotorHoldToMove from="motor_settings" title="Hold to Move" />
        </div>
        <div className="mx-auto">
          <SetProButton
            buttonType="submit"
            disabled={!isComportConnected || isOfflineEditMode}
            onClick={() => setResetLimitConfirmDialog(true)}
          >
            <SaveIcon size={16} />
            Reset Limits to Default
          </SetProButton>
        </div>
      </div>
      <ConfirmDialog
        open={resetLimitConfirmDialog}
        onOpenChange={() => setResetLimitConfirmDialog(false)}
        title="Reset Motor Limit"
        description="Are you sure you want to reset the motor limit?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleResetLimits}
        variant="destructive"
      />
    </div>

  );
}

export default MotorLimit;
