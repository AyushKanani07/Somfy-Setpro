import { useEffect, useState } from "react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useMotors } from "~/hooks/useMotors";
import { cn } from "~/lib/utils";
import MotorInputLabelComponent from "./MotorInputLabelComponent";
import { useComport } from "~/hooks/useComport";

function MotorGoToPosition({
  from = "device_config",
  title,
  showIpButtons,
  onIpButtonClick,
  showBottomText = true,
  disabled,
  currentIpIndex,
  ipValuePercentage,
  ipValuePosition,
}: {
  from?: "motor_control_panel" | "device_config" | "motor_ip_position";
  title?: string;
  showIpButtons?: boolean;
  onIpButtonClick?: (value_position: number) => void;
  showBottomText?: boolean;
  disabled?: boolean;
  currentIpIndex?: number | null;
  ipValuePercentage?: string;
  ipValuePosition?: string;
}) {
  const { isOfflineEditMode } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { selectedMotor, selectedMotorId, moveMotorToPositionThunk } =
    useMotors();
  const [valuePosition, setValuePosition] = useState("");
  const [valuePercentage, setValuePercentage] = useState("");

  const handleClickGo = () => {
    if (motorActionDisabled || !selectedMotorId) return;
    moveMotorToPositionThunk({
      device_id: selectedMotorId,
      function_type: "pos_pulse",
      isACK: true,
      value_position: Number(valuePosition),
    });
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

  return (
    <div className="h-full flex flex-col justify-between items-center gap-4 p-4">
      <div
        className={cn(
          "h-full p-4 flex flex-col justify-center items-center gap-4 rounded-xl border-2 border-borderLightColor bg-white",
          from === "motor_control_panel" ? "w-[180px]" : "w-[200px]"
        )}
      >
        <span className={cn("text-base text-textDarkColor font-semibold",
          ((isOfflineEditMode && from !== "motor_ip_position") || motorActionDisabled) && "text-gray-400"
        )}>
          Go to Position
        </span>

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
          disabled={(isOfflineEditMode && from !== "motor_ip_position") || motorActionDisabled || disabled}
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
          disabled={(isOfflineEditMode && from !== "motor_ip_position") || motorActionDisabled || disabled}
        />

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
              Number(valuePosition) > selectedMotor?.tbl_motor?.down_limit! ||
              Number(valuePosition) < 0 ||
              (isOfflineEditMode && from !== "motor_ip_position")
            }
          >
            Go
          </button>
          {showIpButtons && (
            <button
              className="w-full bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50"
              onClick={() => {
                if (onIpButtonClick) {
                  onIpButtonClick(Number(valuePosition));
                }
              }}
              disabled={
                motorActionDisabled ||
                disabled ||
                Number(valuePosition) > selectedMotor?.tbl_motor?.down_limit!
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

export default MotorGoToPosition;
