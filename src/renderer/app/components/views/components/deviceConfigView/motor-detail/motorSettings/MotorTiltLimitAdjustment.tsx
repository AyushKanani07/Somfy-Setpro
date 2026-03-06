import { ChevronUp, Save, SaveIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Icons } from "~/components/icons/Icons";
import LoaderComponent from "~/components/sharedComponent/LoaderComponent";
import { SetProButton } from "~/components/sharedComponent/setProButton"
import { useComport } from "~/hooks/useComport";
import { useMotors } from "~/hooks/useMotors";
import MotorActionIcon from "../motorControl/MotorActionIcon";
import MotorInputLabelComponent from "../motorControl/MotorInputLabelComponent";
import { motorService } from "~/services/motorService";
import type { SetTiltLimitPayload } from "~/interfaces/motor";
import { toast } from "sonner";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { useDevice } from "~/hooks/useDevice";

type TiltLimitType = "flat" | "bottom";

export const MotorTiltLimitAdjustment = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const {
        selectedMotor,
        selectedMotorId,
    } = useMotors();
    const { findDeviceTypeBySubNode } = useDevice();
    const [tiltInitiated, setTiltInitiated] = useState(false);
    const [initiatedLoading, setInitiatedLoading] = useState(false);
    const [pulseValue, setPulseValue] = useState("10");
    const [msValue, setMsValue] = useState("10");
    const [tiltPulseLimit, setTiltPulseLimit] = useState<number | null>(1000);
    const [tiltDegree, setTiltDegree] = useState<{ min_degree: number, max_degree: number }>({ min_degree: -80, max_degree: 80 });
    const [resetTiltConfirmation, setResetTiltConfirmation] = useState(false);
    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);

    useEffect(() => {
        if (motorType == "lsu_40_ac") {
            const fetchMotorLimits = async () => {
                try {
                    const res = await motorService.getMotorTiltLimit(selectedMotorId!);
                    console.log('res: ', res);
                } catch (error) {
                    toast.error((error as Error).message);
                    return;
                }
            }
            if (isComportConnected && !isOfflineEditMode) {
                fetchMotorLimits();
            }
        }
    }, [selectedMotorId]);

    const handleInitiateClick = async () => {
        if (!selectedMotorId) return;
        setInitiatedLoading(true);
        try {
            const payload: SetTiltLimitPayload = {
                device_id: selectedMotorId,
                function_type: "initial",
            }
            const res = await motorService.setMotorTiltLimit(payload);
            if (res.success) {
                setTiltInitiated(true);
                toast.success("Tilt limit adjustment initiated");
            }
        } catch (error) {
            toast.error((error as Error).message);
            return;
        } finally {
            setInitiatedLoading(false);
        }
    }

    const handleInitiateCancle = () => {
        setTiltInitiated(false);
    }

    const setMotorTiltLimit = async (type: TiltLimitType) => {
        if (!selectedMotorId) return;
        try {
            const payload: SetTiltLimitPayload = {
                device_id: selectedMotorId,
                function_type: type === "flat" ? "flat_current_pos" : "current_pos",
            }
            const res = await motorService.setMotorTiltLimit(payload);


        } catch (error) {
            toast.error((error as Error).message);
            return;
        }
    }

    const stopInterval = () => {
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    };

    const tiltUp = (type: "pulse" | "ms") => {
        const value = type === "pulse" ? Number(pulseValue) : Number(msValue);
        if (!value) {
            return toast.error(type === "pulse" ? "Please enter pulse value" : "Please enter ms value");
        }

        const payload: SetTiltLimitPayload = {
            device_id: selectedMotorId!,
            function_type: type === "pulse" ? "jog_up_pulse" : "jog_up_ms",
            value_position: value,
        }

        const executeTilt = async () => {
            try {
                await motorService.setMotorTiltLimit(payload);
            } catch (error) {
                toast.error((error as Error).message);
                stopInterval();
            }
        };

        // Clear any previous interval before starting
        stopInterval();

        if (type === "pulse") {
            executeTilt();
            return;
        }

        // For ms mode
        executeTilt();
        moveIntervalRef.current = setInterval(() => {
            executeTilt();
        }, value * 10);
    }

    const resetMotorTiltLimit = () => {
        try {
            const payload: SetTiltLimitPayload = {
                device_id: selectedMotorId!,
                function_type: "delete",
            }
            motorService.setMotorTiltLimit(payload);
        } catch (error) {
            toast.error((error as Error).message);
            return;
        }
    }

    return (
        <div className="px-10 py-8">
            <div className="flex justify-end gap-4">
                <SetProButton
                    disabled={!isComportConnected || isOfflineEditMode || tiltInitiated || initiatedLoading}
                    type="submit"
                    onClick={handleInitiateClick}
                >
                    {initiatedLoading && <LoaderComponent />}
                    {initiatedLoading ? 'Initiating' : 'Initiate'}
                </SetProButton>
                <SetProButton
                    disabled={!isComportConnected || !tiltInitiated}
                    buttonType="cancel"
                    onClick={handleInitiateCancle}
                >
                    Cancel
                </SetProButton>
            </div>
            <div className="w-full h-full flex flex-row gap-8 justify-between items-center">
                <div className="h-full flex flex-col justify-center items-start gap-8">
                    <div className="flex flex-col justify-center items-center gap-5">
                        <div className="flex flex-col justify-center items-center">
                            <div className="w-20 h-20 flex items-center pl-2 rounded-full border-2 border-borderLightColor">
                                <Icons.tiltEndLimit width={60} height={60} />
                            </div>
                            <span className="text-textLightColor capitalize text-sm mt-1">
                                Set Flat limit: 0 pulses
                            </span>
                        </div>
                        <SetProButton
                            disabled={!isComportConnected || isOfflineEditMode || !tiltInitiated}
                            type="submit"
                            onClick={() => setMotorTiltLimit("flat")}
                        >
                            <Save size={18} />
                            Set Flat Limit At Current
                        </SetProButton>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-5">
                        <div className="flex flex-col justify-center items-center">
                            <div className="w-20 h-20 flex items-center pl-2 rounded-full border-2 border-borderLightColor">
                                <Icons.tiltFlatLimit width={60} height={60} />
                            </div>
                            <span className="text-textLightColor capitalize text-sm mt-1">
                                Set End Limit: Pulses
                            </span>
                        </div>
                        <SetProButton
                            disabled={!isComportConnected || isOfflineEditMode || !tiltInitiated}
                            type="submit"
                            onClick={() => setMotorTiltLimit("bottom")}
                        >
                            <Save size={18} />
                            Set End Limit At Current
                        </SetProButton>
                    </div>
                </div>
                <div className="flex flex-col gap-6 mx-auto">
                    <div className="flex flex-row gap-9 justify-between">
                        <div className="w-full flex flex-col h-full justify-center items-center gap-3">
                            <div className="h-full p-4 w-[200px] flex flex-col justify-center items-center gap-6 rounded-xl border-2 border-borderLightColor bg-white">
                                <MotorActionIcon
                                    Icon={ChevronUp}
                                    onClick={() => tiltUp("pulse")}
                                    tooltip="Move up"
                                    disabled={!isComportConnected || !tiltInitiated}
                                />
                                <MotorInputLabelComponent
                                    value={pulseValue}
                                    placeholder="Enter value"
                                    labelText="pulse"
                                    onChange={(value) => {
                                        setPulseValue(value.toString());
                                    }}
                                    disabled={!isComportConnected || !tiltInitiated}
                                />
                                <Icons.tiltOpening width={70} height={70} />
                            </div>
                            <span>Pulse Movement</span>
                        </div>
                        <div className="w-full flex flex-col h-full justify-center items-center gap-3">
                            <div className="h-full p-4 w-[200px] flex flex-col justify-center items-center gap-6 rounded-xl border-2 border-borderLightColor bg-white">
                                <MotorActionIcon
                                    Icon={ChevronUp}
                                    isContinuous={true}
                                    onMouseDown={stopInterval}
                                    onMouseUp={() => tiltUp("ms")}
                                    tooltip="Move up"
                                    disabled={!isComportConnected || !tiltInitiated}
                                />
                                <MotorInputLabelComponent
                                    value={msValue}
                                    placeholder="Enter value"
                                    labelText="ms"
                                    onChange={(value) => {
                                        setMsValue(value.toString());
                                    }}
                                    disabled={!isComportConnected || !tiltInitiated}
                                />
                                <Icons.tiltOpening width={70} height={70} />
                            </div>
                            <span>Hold to Move</span>
                        </div>
                    </div>
                    <div className="mx-auto">
                        <SetProButton
                            buttonType="submit"
                            disabled={!isComportConnected || isOfflineEditMode || !tiltInitiated}
                            onClick={() => setResetTiltConfirmation(true)}
                        >
                            <SaveIcon size={16} />
                            Reset Tilt Limit
                        </SetProButton>
                    </div>
                </div>
            </div>
            {
                resetTiltConfirmation && (
                    <ConfirmDialog
                        open={resetTiltConfirmation}
                        onOpenChange={() => setResetTiltConfirmation(false)}
                        title="Reset Motor Tilt Limit"
                        description="Are you sure you want to reset the motor tilt limit?"
                        confirmText="Confirm"
                        cancelText="Cancel"
                        onConfirm={resetMotorTiltLimit}
                        variant="destructive"
                    />
                )
            }
        </div>
    )
}
