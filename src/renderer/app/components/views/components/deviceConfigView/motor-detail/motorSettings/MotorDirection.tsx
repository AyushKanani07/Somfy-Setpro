import { RotateCcw, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { useMotors } from "~/hooks/useMotors";
import { MotorHoldToMove } from "../motorControl/MotorHoldToMove";
import { useComport } from "~/hooks/useComport";
import { cn } from "~/lib/utils";

function MotorDirection() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const {
    selectedMotorId,
    selectedMotor,
    getMotorDirectionThunk,
    setMotorDirectionThunk
  } = useMotors();

  useEffect(() => {
    if (!isComportConnected || isOfflineEditMode || !selectedMotorId) return;

    if (selectedMotor?.tbl_motor.direction == null || selectedMotor?.tbl_motor.direction === "") {
      getMotorDirectionThunk(selectedMotorId!, true);
    }
  }, []);

  const onDirectionChange = (direction: 'forward' | 'reverse') => {
    if (!selectedMotorId || !isComportConnected) return;
    if (selectedMotor?.tbl_motor.direction === direction) return;

    setMotorDirectionThunk({ device_id: selectedMotorId, direction });
  }

  return (
    <div className="w-full flex justify-center items-center gap-8 py-8">
      <div className="flex justify-center items-center gap-8">
        <div className="flex flex-col gap-2 justify-center items-center">
          <div onClick={() => onDirectionChange('forward')} className={cn("w-16 h-16 flex justify-center items-center rounded-full bg-white shadow-md",
            isComportConnected && "cursor-pointer"
          )}>
            <RotateCw
              size={30}
              className={
                isComportConnected ? selectedMotor?.tbl_motor.direction === "forward"
                  ? "text-buttonColor" : "text-textLightColor"
                  : "text-textLightColor"
              }
            />
          </div>
          <span>Forward Movement</span>
        </div>

        <div className="flex flex-col gap-2 justify-center items-center">
          <div onClick={() => onDirectionChange('reverse')} className={cn("w-16 h-16 flex justify-center items-center rounded-full bg-white shadow-md",
            isComportConnected && "cursor-pointer"
          )}>
            <RotateCcw
              size={30}
              className={
                isComportConnected ? selectedMotor?.tbl_motor.direction === "reverse"
                  ? "text-buttonColor" : "text-textLightColor"
                  : "text-textLightColor"
              }
            />
          </div>
          <span>Reverse Movement</span>
        </div>
      </div>
      <MotorHoldToMove from="motor_settings" title="Hold to Move" />
    </div>
  );
}

export default MotorDirection;
