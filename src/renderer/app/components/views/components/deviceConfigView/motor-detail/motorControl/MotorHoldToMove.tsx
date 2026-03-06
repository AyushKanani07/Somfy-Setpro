import { cn } from "~/lib/utils";
import MotorActionIcon from "./MotorActionIcon";
import { ChevronDown, ChevronUp } from "lucide-react";
import MotorInputLabelComponent from "./MotorInputLabelComponent";
import { useRef, useState } from "react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { toast } from "sonner";
import { useMotors } from "~/hooks/useMotors";
import type { MoveMotorPayload } from "~/interfaces/motor";
import { motorService } from "~/services/motorService";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";

export const MotorHoldToMove = (
    {
        from = "motor_settings",
        showMsInput = true,
        // showPulsesInput = true,
        title,
    }: {
        from?: "motor_settings";
        showMsInput?: boolean;
        // showPulsesInput?: boolean;
        title?: string;
    }
) => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { motorActionDisabled } = useDeviceConfig();
    const { selectedMotor } = useMotors();
    const { findDeviceTypeBySubNode } = useDevice();
    const [valuePositionInMs, setValuePositionInMs] = useState("5");
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseDownMs = async (direction: "up" | "down") => {
        if (valuePositionInMs === "") return toast.error("Please enter a value");
        const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);
        if (!motorType) return toast.error("Unable to determine motor type");

        if (motorType == 'lsu_40_ac' && (Number(valuePositionInMs) < 2 || Number(valuePositionInMs) > 255)) {
            return toast.error("Duration should be between 2 and 255");
        } else if (motorType == 'st_30' && (Number(valuePositionInMs) < 10 || Number(valuePositionInMs) > 255)) {
            return toast.error("Duration should be between 10 and 255");
        } else if (motorType == 'glydea' && (Number(valuePositionInMs) < 75 || Number(valuePositionInMs) > 255)) {
            return toast.error("Duration should be between 75 and 255");
        }

        const speed = "slow";
        const payload: MoveMotorPayload = {
            device_id: selectedMotor?.device_id!,
            direction: direction,
            duration: Number(valuePositionInMs),
            speed: speed,
            isACK: true,
        }
        try {
            const res = await motorService.moveMotor(payload);
            if (!res.success) {
                throw new Error(res.message);
            }
        } catch (error) {
            toast.error((error as Error).message);
            return;
        }

        moveIntervalRef.current = setInterval(async () => {
            try {
                const res = await motorService.moveMotor(payload);
                if (!res.success) {
                    throw new Error(res.message);
                }
            } catch (error) {
                toast.error((error as Error).message);
                if (moveIntervalRef.current) {
                    clearInterval(moveIntervalRef.current);
                    moveIntervalRef.current = null;
                }
                return;
            }
        }, Number(valuePositionInMs) + 1200);
        // startGetMotorCurrentPosition();
    }

    const stopMotorMovement = async () => {
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }

    return (
        <div className="h-full flex flex-col justify-between items-center gap-4 p-4">
            <div className={cn("w-full flex flex-wrap h-full justify-center items-center gap-8")}>
                {showMsInput && (
                    <div
                        className={cn(
                            "h-full p-8 flex flex-col justify-center items-center gap-8 rounded-xl border-2 border-borderLightColor bg-white w-[200px]"
                        )}
                    >
                        <MotorActionIcon
                            disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
                            Icon={ChevronUp}
                            isContinuous={true}
                            onMouseDown={() => handleMouseDownMs("up")}
                            onMouseUp={() => {
                                if (moveIntervalRef.current) {
                                    clearInterval(moveIntervalRef.current);
                                    moveIntervalRef.current = null;
                                }
                            }}
                            tooltip="Move up"
                        />

                        <MotorInputLabelComponent
                            value={valuePositionInMs}
                            placeholder="Enter value"
                            labelText="ms*10"
                            onChange={(value) => {
                                setValuePositionInMs(value.toString());
                            }}
                            disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
                        />

                        <MotorActionIcon
                            disabled={(motorActionDisabled && from !== "motor_settings") || !isComportConnected || isOfflineEditMode}
                            Icon={ChevronDown}
                            isContinuous={true}
                            onMouseDown={() => handleMouseDownMs("down")}
                            onMouseUp={stopMotorMovement}
                            tooltip="Move down"
                        />
                    </div>
                )}

            </div>
            <span>{title}</span>
        </div>
    )
}
