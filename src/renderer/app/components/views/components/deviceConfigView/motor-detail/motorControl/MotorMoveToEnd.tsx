import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useMotors } from "~/hooks/useMotors";
import MotorActionIcon from "./MotorActionIcon";
import { cn } from "~/lib/utils";
import { useComport } from "~/hooks/useComport";

function MotorMoveToEnd({
  from = "device_config",
  type,
  title
}: {
  from?: "motor_control_panel" | "device_config" | "motor_settings";
  title?: string;
  type: "tilt" | "normal"
}) {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { selectedMotorId, moveMotorToPositionThunk, stopMotorThunk } =
    useMotors();

  const handleMoveToTop = async () => {
    // Implement move to top logic
    if (motorActionDisabled && from !== "motor_settings") return;
    if (!selectedMotorId) return;

    if (type === "normal") {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "up",
          isACK: true,
        },
        getPositionType: "pulse"
      });
    }
    if (type === "tilt") {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "curr_pos_angle_pulse",
          value_tilt: 0,
          isACK: true,
        },
        getPositionType: "tilt_pulse"
      });
    }
  };

  const handleMoveToBottom = async () => {
    // Implement move to bottom logic
    if (motorActionDisabled && from !== "motor_settings") return;
    if (!selectedMotorId) return;
    if (type === "normal") {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "down",
          isACK: true,
        },
        getPositionType: "pulse"
      });
    }
    if (type === "tilt") {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "curr_pos_angle_per",
          value_tilt: 100,
          isACK: true,
        },
        getPositionType: "tilt_pulse"
      });
    }
  };

  const handleStopMotor = () => {
    // Implement stop motor logic
    if (motorActionDisabled && from !== "motor_settings") return;
    if (!selectedMotorId) return;
    stopMotorThunk({ motorId: selectedMotorId });
  };

  return (
    <div className="h-full flex flex-col justify-between items-center gap-4 p-4">
      <div
        className={cn(
          "h-full p-4 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white",
          from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
        )}
      >
        <MotorActionIcon
          Icon={ArrowUpToLine}
          onClick={handleMoveToTop}
          tooltip="Move to top"
          disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
        />
        <button
          disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
          onClick={handleStopMotor}
          className="relative w-24 bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50"
        >
          Stop
          {/* <span className="absolute top-0 right-0 left-0 w-[200px] h-1 bg-buttonGrayColor"></span> */}
        </button>
        <MotorActionIcon
          Icon={ArrowDownToLine}
          onClick={handleMoveToBottom}
          tooltip="Move to bottom"
          disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
        />
      </div>
      <span>{title}</span>
    </div>
  );
}

export default MotorMoveToEnd;
