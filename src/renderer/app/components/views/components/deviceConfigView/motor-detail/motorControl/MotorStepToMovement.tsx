import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useMotors } from "~/hooks/useMotors";
import MotorActionIcon from "./MotorActionIcon";
import MotorInputLabelComponent from "./MotorInputLabelComponent";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useComport } from "~/hooks/useComport";

function MotorStepToMovement({
  from = "device_config",
  showMsInput = true,
  showPulsesInput = true,
  title,
}: {
  from?: "motor_control_panel" | "device_config";
  showMsInput?: boolean;
  showPulsesInput?: boolean;
  title?: string;
}) {
  const { isOfflineEditMode } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { selectedMotor, selectedMotorId, moveMotorOfFunctionThunk } =
    useMotors();
  const [valuePulses, setValuePulses] = useState("");
  const [valuePositionInMs, setValuePositionInMs] = useState("");

  const handleMsClick = (direction: "up" | "down") => {
    const valueInMs = Number(valuePositionInMs);
    if (valueInMs < 1 || valueInMs > 1000) return toast.error("The value should range between 1 and 1000 ms.");
    const function_type = direction === "up" ? "jog_up_ms" : "jog_down_ms";
    moveMotorOfFunctionThunk({
      device_id: selectedMotorId!,
      function_type,
      isACK: true,
      value_position: valueInMs,
    });
  }

  const handlePulsesClick = (direction: "up" | "down") => {
    const valueInPulses = Number(valuePulses);
    if (valueInPulses < 1 || valueInPulses > 1000) return toast.error("The value should range between 1 and 1000 pulses.");
    const function_type = direction === "up" ? "jog_up_pulse" : "jog_down_pulse";
    moveMotorOfFunctionThunk({
      device_id: selectedMotorId!,
      function_type,
      isACK: true,
      value_position: valueInPulses,
    });
  }

  return (
    <div className="h-full flex flex-col justify-between items-center p-4">
      <div
        className={cn(
          "w-full flex h-full justify-center items-center",
          from === "motor_control_panel" ? "gap-8" : "gap-16",
          title ? "mb-3" : ""
        )}
      >
        {showMsInput && (
          <div
            className={cn(
              "h-full p-8 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white",
              from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
            )}
          >
            <MotorActionIcon
              Icon={ChevronUp}
              onClick={() => handleMsClick("up")}
              tooltip="Move up"
              disabled={motorActionDisabled || isOfflineEditMode}
            />
            <MotorInputLabelComponent
              value={valuePositionInMs}
              placeholder="50"
              labelText="ms*10"
              onChange={(value) => {
                setValuePositionInMs(value.toString());
              }}
              disabled={motorActionDisabled || isOfflineEditMode}
            />
            <MotorActionIcon
              Icon={ChevronDown}
              onClick={() => handleMsClick("down")}
              tooltip="Move down"
              disabled={motorActionDisabled || isOfflineEditMode}
            />
          </div>
        )}
        {showPulsesInput && (
          <div
            className={cn(
              "h-full p-8 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white",
              from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
            )}
          >
            <MotorActionIcon
              Icon={ChevronUp}
              onClick={() => handlePulsesClick("up")}
              tooltip="Move up"
              disabled={
                motorActionDisabled ||
                Number(valuePulses) > selectedMotor?.tbl_motor?.down_limit! ||
                Number(valuePulses) < 0 ||
                isOfflineEditMode
              }
            />
            <MotorInputLabelComponent
              value={valuePulses}
              placeholder="1000"
              labelText="pulses"
              onChange={(value) => {
                setValuePulses(value.toString());
              }}
              disabled={motorActionDisabled || isOfflineEditMode}
            />
            <MotorActionIcon
              Icon={ChevronDown}
              onClick={() => handlePulsesClick("down")}
              tooltip="Move down"
              disabled={
                motorActionDisabled ||
                Number(valuePulses) > selectedMotor?.tbl_motor?.down_limit! ||
                Number(valuePulses) < 0 ||
                isOfflineEditMode
              }
            />
          </div>
        )}
      </div>
      <span>{title}</span>
    </div>
  );
}

export default MotorStepToMovement;
