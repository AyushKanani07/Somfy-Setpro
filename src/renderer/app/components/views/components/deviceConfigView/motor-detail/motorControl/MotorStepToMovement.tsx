import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
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
  showTiltInput = false,
  title,
}: {
  from?: "motor_control_panel" | "device_config";
  showMsInput?: boolean;
  showPulsesInput?: boolean;
  showTiltInput?: boolean;
  title?: string;
}) {
  const { isOfflineEditMode } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { selectedMotor, selectedMotorId, moveMotorOfFunctionThunk } =
    useMotors();
  const [valuePulses, setValuePulses] = useState("");
  const [valuePositionInMs, setValuePositionInMs] = useState("");
  const [tiltPulse, setTiltPulse] = useState("10");
  const [tiltDegree, setTiltDegree] = useState("10");

  const [tiltConfig, setTiltConfig] = useState<{limit: number, min_degree: number, max_degree: number}>({
    limit: 1000,
    min_degree: -80,
    max_degree: 80,
  });

  useEffect(() => {
      if (!selectedMotor) return;
      setTiltConfig(prev => {
        let newConfig = {...prev};
        if (selectedMotor?.tbl_motor.tilt_limit !== null && selectedMotor?.tbl_motor.tilt_limit !== undefined) {
          newConfig.limit = selectedMotor.tbl_motor.tilt_limit!;
        }
        if (selectedMotor?.tbl_motor.tilt_min_degree !== null && selectedMotor?.tbl_motor.tilt_min_degree !== undefined) {
          newConfig.min_degree = selectedMotor.tbl_motor.tilt_min_degree!;
        }
        if (selectedMotor?.tbl_motor.tilt_max_degree !== null && selectedMotor?.tbl_motor.tilt_max_degree !== undefined) {
          newConfig.max_degree = selectedMotor.tbl_motor.tilt_max_degree!;
        }
        return newConfig;
      })
    }, [selectedMotor?.tbl_motor.tilt_limit, selectedMotor?.tbl_motor.tilt_min_degree, selectedMotor?.tbl_motor.tilt_max_degree]);

  const handleMsClick = (direction: "up" | "down") => {
    const valueInMs = Number(valuePositionInMs);
    if (valueInMs < 1 || valueInMs > 1000) return toast.error("The value should range between 1 and 1000 ms.");
    const function_type = direction === "up" ? "jog_up_ms" : "jog_down_ms";
    moveMotorOfFunctionThunk({
      payload: {
        device_id: selectedMotorId!,
        function_type,
        isACK: true,
        value_position: valueInMs,
      },
      getPositionType: "pulse"
    });
  }

  const handlePulsesClick = (direction: "up" | "down") => {
    const valueInPulses = Number(valuePulses);
    if (valueInPulses < 1 || valueInPulses > 1000) return toast.error("The value should range between 1 and 1000 pulses.");
    const function_type = direction === "up" ? "jog_up_pulse" : "jog_down_pulse";
    moveMotorOfFunctionThunk({
      payload: {
        device_id: selectedMotorId!,
        function_type,
        isACK: true,
        value_position: valueInPulses,
      },
      getPositionType: "pulse"
    });
  }

  const handleTiltDegree = (direction: "up" | "down") => {
    const tiltMaxDegree = tiltConfig.max_degree - tiltConfig.min_degree;
    const tiltDegreeValue = Number(tiltDegree);
    if (tiltDegreeValue > tiltMaxDegree) return toast.error(`Degree value should be less than limit(${tiltMaxDegree})`);

    const function_type = direction === "up" ? "tilt_up_deg" : "tilt_down_deg";
    moveMotorOfFunctionThunk({
      payload: {
      device_id: selectedMotorId!,
        function_type,
        isACK: true,
        value_position: tiltDegreeValue,
      },
      getPositionType: "tilt_pulse"
    });
  }

  const handleTiltPulse = (direction: "up" | "down") => {
    const tiltPulseValue = Number(tiltPulse);
    if (tiltPulseValue > tiltConfig.limit) return toast.error(`Pulse value should be less than limit(${tiltConfig.limit})`);

    const function_type = direction === "up" ? "tilt_up_pulse" : "tilt_down_pulse";
    moveMotorOfFunctionThunk({
      payload: {
        device_id: selectedMotorId!,
        function_type,
        isACK: true,
        value_position: tiltPulseValue,
      },
      getPositionType: "tilt_pulse"
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
        {showTiltInput && (
          <>
            <div
              className={cn(
                "h-full p-8 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white",
                from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
              )}
            >
              <MotorActionIcon
                Icon={ChevronUp}
                onClick={() => handleTiltDegree("up")}
                tooltip="Move up"
                disabled={
                  motorActionDisabled ||
                  isOfflineEditMode
                }
              />
              <MotorInputLabelComponent
                value={tiltDegree}
                placeholder="10"
                labelText="degree"
                onChange={(value) => {
                  setTiltDegree(value.toString());
                }}
                disabled={motorActionDisabled || isOfflineEditMode}
              />
              <MotorActionIcon
                Icon={ChevronDown}
                onClick={() => handleTiltDegree("down")}
                tooltip="Move down"
                disabled={
                  motorActionDisabled ||
                  isOfflineEditMode
                }
              />
            </div>
            <div
              className={cn(
                "h-full p-8 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white",
                from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
              )}
            >
              <MotorActionIcon
                Icon={ChevronUp}
                onClick={() => handleTiltPulse("up")}
                tooltip="Move up"
                disabled={
                  motorActionDisabled ||
                  isOfflineEditMode
                }
              />
              <MotorInputLabelComponent
                value={tiltPulse}
                placeholder="10"
                labelText="Pulse"
                onChange={(value) => {
                  setTiltPulse(value.toString());
                }}
                disabled={motorActionDisabled || isOfflineEditMode}
              />
              <MotorActionIcon
                Icon={ChevronDown}
                onClick={() => handleTiltPulse("down")}
                tooltip="Move down"
                disabled={
                  motorActionDisabled ||
                  isOfflineEditMode
                }
              />
            </div>
          </>
        )}
      </div>
      <span>{title}</span>
    </div>
  );
}

export default MotorStepToMovement;
