import { useEffect, useState } from "react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useMotors } from "~/hooks/useMotors";
import { cn } from "~/lib/utils";
import MotorInputLabelComponent from "./MotorInputLabelComponent";
import { useComport } from "~/hooks/useComport";
import { toast } from "sonner";

function MotorTiltPosition({
  from = "control_panel",
  title,
  showIpButtons,
  showBottomText = true,
  disabled,
  ipValuePercentage,
  ipValuePosition,
  currentIpIndex,
}: {
  from?: "control_panel" | "ip_position";
  title?: string;
  showIpButtons?: boolean;
  showBottomText?: boolean;
  disabled?: boolean;
  ipValuePercentage?: string;
  ipValuePosition?: string;
  currentIpIndex?: number | null;
}) {
  const { isOfflineEditMode } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { selectedMotor, selectedMotorId, moveMotorToPositionThunk, setMotorIpThunk } =
    useMotors();
  const [valuePosition, setValuePosition] = useState("");
  const [valuePercentage, setValuePercentage] = useState("");

  const [tiltConfig, setTiltConfig] = useState<{limit: number, min_degree: number, max_degree: number}>({
    limit: 1000,
    min_degree: -80,
    max_degree: 80,
  });

  const [tiltPercentage, setTiltPercentage] = useState("");
  const [tiltPulse, setTiltPulse] = useState("");
  const [tiltDegree, setTiltDegree] = useState("");

  const handleClickGo = () => {
    if (motorActionDisabled || !selectedMotorId) return;
    const tiltValueInPulse = Number(tiltPulse);
    const positionValueInPulse = Number(valuePosition);
    const downLimit = selectedMotor?.tbl_motor.down_limit;
    if (tiltValueInPulse > tiltConfig.limit || tiltValueInPulse < 0) return toast.error(`Tilt pulse value should be within limit(0, ${tiltConfig.limit})`);
    if ((downLimit && positionValueInPulse > downLimit || positionValueInPulse < 0) && from === "ip_position") return toast.error(`Position pulse value should be within limit(0, ${downLimit})`);

    if (from === "ip_position") {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "pos_angle_pulse",
          isACK: true,
          value_position: positionValueInPulse,
          value_tilt: tiltValueInPulse,
        },
        getPositionType: "pulse"
      });
    } else {
      moveMotorToPositionThunk({
        payload: {
          device_id: selectedMotorId,
          function_type: "curr_pos_angle_pulse",
          isACK: true,
          value_position: 0,
          value_tilt: tiltValueInPulse,
        },
        getPositionType: "tilt_pulse"
      });
    }
  };

  useEffect(() => {
    setValuePosition("");
    setValuePercentage("");

    if (ipValuePercentage) {
      setValuePercentage(ipValuePercentage);
    }
    if (ipValuePosition) {
      setValuePosition(ipValuePosition);
    }
  }, []);

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

  const setPosAndTiltValueToIP = () => {
    const appMode = selectedMotor?.tbl_motor.app_mode;
    const downLimit = selectedMotor?.tbl_motor.down_limit;
    const percentageValue = Number(valuePercentage);
    const pulse = Number(valuePosition);
    const tiltPercentageValue = Number(tiltPercentage);
    const tiltPulseValue = Number(tiltPulse)
    if (percentageValue === 0 && appMode === 0) return toast.error("Position cannot be at 0%");
    if (percentageValue === 100 && appMode === 0) {
      return toast.error("Position cannot be at 100%")
    } else if (downLimit && (pulse < 1 || pulse >= downLimit) && appMode === 0) {
      return toast.error("Position pulse range should be from 1 and " + (downLimit));
    } else if (appMode === 1 && percentageValue === 100 && tiltPercentageValue === 100) {
      return toast.error("Position and Tilt cannot be at 100%")
    }
    if (tiltPulseValue > tiltConfig.limit || tiltPulseValue < 0) return toast.error(`Tilt pulse value should be within limit(0, ${tiltConfig.limit})`);

    if (currentIpIndex !== null || currentIpIndex !== undefined) {
      setMotorIpThunk({
        device_id: selectedMotorId!,
        function_type: "pos_angle_pulse",
        ip_index: currentIpIndex!,
        value_position: pulse,
        value_tilt: tiltPulseValue,
      });
    }
  }

  return (
    <div className="h-full flex flex-col justify-between items-center gap-4 p-4">
      <div
        className={cn(
          "h-full p-4 flex flex-col justify-center items-center gap-4 rounded-xl border-2 border-borderLightColor bg-white",
          from === "control_panel" ? "w-[180px]" : "w-fit"
        )}
      >
        <span className={cn("text-base text-textDarkColor font-semibold",
          ((isOfflineEditMode && from !== "ip_position") || motorActionDisabled) && "text-gray-400"
        )}>
          Go to Position
        </span>

        <div className="flex flex-row gap-4">
            {from == "ip_position" && (
                <div className="flex flex-col gap-2">
                    <MotorInputLabelComponent
                    value={valuePercentage}
                    placeholder="20"
                    labelText="%"
                    onChange={(value) => {
                        // Allow empty field during editing
                        if (value === "" || value === null) {
                        setValuePercentage("");
                        return;
                        }
                        const numericValue = Number(value); // Convert to number
                        setValuePercentage(value.toString());

                        if (selectedMotor?.tbl_motor?.down_limit != null) {
                        const downLimit = selectedMotor.tbl_motor.down_limit;
                        const updatedPosition = (numericValue / 100) * downLimit;
                        setValuePosition(Math.round(updatedPosition).toString());
                        }
                    }}
                    disabled={(isOfflineEditMode && from !== "ip_position") || motorActionDisabled || disabled}
                    />

                    <MotorInputLabelComponent
                    value={valuePosition}
                    placeholder="1000"
                    labelText="pulses"
                    onChange={(value) => {
                        if (value === "" || value === null) {
                        setValuePosition("");
                        return;
                        }

                        const numericValue = Number(value);

                        setValuePosition(value.toString());

                        if (selectedMotor?.tbl_motor?.down_limit != null) {
                        const downLimit = selectedMotor.tbl_motor.down_limit;
                        const updatedPercentage =
                            downLimit > 0 ? (numericValue / downLimit) * 100 : 0;

                        setValuePercentage(Math.round(updatedPercentage).toString());
                        }
                    }}
                    disabled={(isOfflineEditMode && from !== "ip_position") || motorActionDisabled || disabled}
                    />
                </div>
            )}
            <div>
                <div className="flex flex-col gap-2">
                    <MotorInputLabelComponent
                    value={tiltPercentage}
                    placeholder="0"
                    labelText="%"
                    onChange={(value) => {
                        // Allow empty field during editing
                        if (value === "" || value === null) {
                        setTiltPercentage("");
                        return;
                        }
                        const numericValue = Number(value);
                        setTiltPercentage(value.toString());

                        const pulse = +(((numericValue * (tiltConfig.limit - 0)) / 100) + 0).toFixed(0);
                        setTiltPulse(pulse.toString());

                        const degree = +(((numericValue * (tiltConfig.max_degree - tiltConfig.min_degree)) / 100) + tiltConfig.min_degree).toFixed(0);
                        setTiltDegree(degree.toString());

                    }}
                    disabled={(isOfflineEditMode && from !== "ip_position") || motorActionDisabled || disabled}
                    />

                    <MotorInputLabelComponent
                    value={tiltPulse}
                    placeholder="0"
                    labelText="pulses"
                    onChange={(value) => {
                        if (value === "" || value === null) {
                        setTiltPulse("");
                        return;
                        }

                        const numericValue = Number(value);
                        setTiltPulse(value.toString());

                        const percentage = +(((numericValue - 0) * 100) / (tiltConfig.limit - 0)).toFixed(0);
                        setTiltPercentage(percentage.toString());

                        const degree = +(((numericValue * (tiltConfig.max_degree - tiltConfig.min_degree)) / tiltConfig.limit) + tiltConfig.min_degree).toFixed(0);
                        setTiltDegree(degree.toString());
                    }}
                    disabled={(isOfflineEditMode && from !== "ip_position") || motorActionDisabled || disabled}
                    />

                    {from == "control_panel" && (
                      <MotorInputLabelComponent
                      value={tiltDegree}
                      placeholder="0"
                      labelText="degree"
                      isNagativeAllowed={true}
                      onChange={(value) => {
                          if (value === "" || value === null || value === "-") {
                          setTiltDegree(value ?? "");
                          return;
                          }
  
                          const numericValue = Number(value);
                          setTiltDegree(value.toString());
  
                          const percentage = +(((numericValue - tiltConfig.min_degree) * 100) / (tiltConfig.max_degree - tiltConfig.min_degree)).toFixed(0);
                          setTiltPercentage(percentage.toString());
  
                          const pulse = +(((numericValue - tiltConfig.min_degree) * tiltConfig.limit) / (tiltConfig.max_degree - tiltConfig.min_degree)).toFixed(0);
                          setTiltPulse(pulse.toString());
                      }}
                      disabled={isOfflineEditMode || motorActionDisabled || disabled}
                      />
                    )}

                </div>
            </div>
        </div>



        <div className="w-full flex justify-center items-center gap-4">
          <button
            className={cn(
              "w-full bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50",
              !showIpButtons && "w-1/2"
            )}
            onClick={handleClickGo}
            disabled={
              motorActionDisabled ||
              disabled ||
              (isOfflineEditMode && from !== "ip_position")
            }
          >
            Go
          </button>
          {showIpButtons && (
            <button
              className="w-full bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50"
              onClick={setPosAndTiltValueToIP}
              disabled={
                motorActionDisabled ||
                disabled
              }
            >
              Set
            </button>
          )}
        </div>
      </div>
      {showBottomText && (
        <span className="text-center line-clamp-1">
          {title}
        </span>
      )}
    </div>
  );
}

export default MotorTiltPosition;
