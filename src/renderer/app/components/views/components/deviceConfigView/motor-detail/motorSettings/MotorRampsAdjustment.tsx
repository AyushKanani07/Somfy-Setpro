import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons/Icons";
import { Switch } from "~/components/ui/switch";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { useComport } from "~/hooks/useComport";
import { Save } from "lucide-react";
import { Slider } from "primereact/slider";
import "./MotorRampsAdjustment.css"
import { HiReceiptRefund } from "react-icons/hi";
import { useMotors } from "~/hooks/useMotors";
import type { rampValuesKey, SetRampTimePayload } from "~/interfaces/motor";
import { motorService } from "~/services/motorService";
import { toast } from "sonner";
import { useDevice } from "~/hooks/useDevice";

type rampValuesType = {
    start_up: {
        enabled: boolean;
        value: number;
    },
    start_down: {
        enabled: boolean;
        value: number;
    },
    stop_up: {
        enabled: boolean;
        value: number;
    },
    stop_down: {
        enabled: boolean;
        value: number;
    }
}
export const MotorRampsAdjustment = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const {
        selectedMotor,
        selectedMotorId,
        getMotorRampTimeThunk,
        setMotorRampTimeThunk,
    } = useMotors();
    const { findDeviceTypeBySubNode } = useDevice();
    const [rampValues, setRampValues] = useState<rampValuesType>({
        start_up: { enabled: false, value: 0 },
        start_down: { enabled: false, value: 0 },
        stop_up: { enabled: false, value: 0 },
        stop_down: { enabled: false, value: 0 }
    });
    const [rampRange, setRampRange] = useState<{
        min: number;
        max: number;
    }>({
        min: 0,
        max: 255
    });

    const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);

    useEffect(() => {
        if (motorType === "qt_30") {
            setRampRange({
                min: 87,
                max: 140
            });
        }

        if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;

        if (selectedMotor?.tbl_motor.ramp == null) {
            getMotorRampTimeThunk(selectedMotorId!, true);
        }
    }, []);

    const handleChange = (type: rampValuesKey, val: number) => {
        const clamped = Math.max(0, Math.min(rampRange.max, val));
        setRampValues((prev) => ({ ...prev, [type]: { ...prev[type], value: clamped } }));
    };

    const setDefaultRampTime = async (mode: rampValuesKey) => {
        const payload = {
            device_id: selectedMotorId!,
            function_type: mode
        }
        try {
            await motorService.setDefaultRampTime(payload);
        } catch (error) {
            toast.error((error as Error).message);
            return;
        }
        if (!isOfflineEditMode) {
            getMotorRampTimeThunk(selectedMotorId!, true);
        }
    }

    const handleSaveClick = async () => {
        if (!selectedMotorId) return;

        const payload: SetRampTimePayload = {
            device_id: selectedMotorId,
            start_up: {
                enabled: rampValues.start_up.enabled,
                value: rampValues.start_up.value
            },
            start_down: {
                enabled: rampValues.start_down.enabled,
                value: rampValues.start_down.value
            },
            stop_up: {
                enabled: rampValues.stop_up.enabled,
                value: rampValues.stop_up.value
            },
            stop_down: {
                enabled: rampValues.stop_down.enabled,
                value: rampValues.stop_down.value
            },
        }

        await setMotorRampTimeThunk(payload);
        if (!isOfflineEditMode) {
            getMotorRampTimeThunk(selectedMotorId!, true);
        }
    }

    const getDisplayValue = (type: rampValuesKey) => {
        switch (type) {
            case "start_up":
                return {
                    mode_text: "Soft Start",
                    mode_icon: <Icons.softStart />,
                    direction_text: "Upward",
                    direction_icon: <Icons.upward />
                }
            case "start_down":
                return {
                    mode_text: "Soft Start",
                    mode_icon: <Icons.softStart />,
                    direction_text: "Downward",
                    direction_icon: <Icons.downward />
                }
            case "stop_up":
                return {
                    mode_text: "Soft Stop",
                    mode_icon: <Icons.softStop />,
                    direction_text: "Upward",
                    direction_icon: <Icons.upward />
                }
            case "stop_down":
                return {
                    mode_text: "Soft Stop",
                    mode_icon: <Icons.softStop />,
                    direction_text: "Downward",
                    direction_icon: <Icons.downward />
                }
        }
    }

    return (
        <div className="w-full flex flex-col justify-center items-center gap-8 py-8 px-6 bg-gray-300" >
            <div className="motor-table-wrapper">
                <table className="motor-table">
                    <thead>
                        <tr className="text-center text-gray-600">
                            <th className="motor-th w-[18%]">Mode</th>
                            <th className="motor-th w-[18%]">Direction</th>
                            <th className="motor-th w-[10%] text-center">Enable</th>
                            <th className="motor-th w-[39%]">Ramp Time</th>
                            <th className="motor-th w-[15%] text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (Object.keys(rampValues) as rampValuesKey[]).map((key) => {
                                const displayValue = getDisplayValue(key);
                                return (
                                    <tr
                                        className={cn(
                                            "border-t transition",
                                            rampValues[key].enabled
                                                ? "bg-gray-50"
                                                : "bg-white"
                                        )}
                                    >
                                        <td className="motor-td">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className={cn("border-2 rounded-full p-2",
                                                    rampValues[key].enabled ? "border-buttonColor" : "border-[#E3E3E3]"
                                                )}>
                                                    {displayValue?.mode_icon}
                                                </div>
                                                <span>{displayValue?.mode_text}</span>
                                            </div>
                                        </td>
                                        <td className="motor-td">
                                            <div className="flex flex-row items-center gap-3">
                                                <div className={cn("border-2 rounded-full p-2",
                                                    rampValues[key].enabled ? "border-buttonColor" : "border-[#E3E3E3]"
                                                )}>
                                                    {displayValue?.direction_icon}
                                                </div>
                                                <span>{displayValue?.direction_text}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-4 text-center align-middle border-[4px] border-gray-200">
                                            <Switch
                                                disabled={!isComportConnected}
                                                checked={rampValues[key].enabled}
                                                onCheckedChange={(checked) =>
                                                    setRampValues(prev => ({ ...prev, [key]: { ...prev[key], enabled: checked } }))
                                                }
                                            />
                                        </td>
                                        <td className="motor-td">
                                            <div className="flex items-center gap-4 pr-2 pl-6">
                                                <div className="flex-1">
                                                    <Slider
                                                        disabled={!rampValues[key].enabled || !isComportConnected}
                                                        value={rampValues[key].value}
                                                        onChange={(e) =>
                                                            handleChange(key, e.value as number)
                                                        }
                                                        className="w-14rem"
                                                        min={rampRange.min}
                                                        max={rampRange.max}
                                                    // step={motorType === "st_30" ? 0.1 : 1}
                                                    />
                                                </div>
                                                <div className="flex w-30 items-center gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                    <input
                                                        disabled={!rampValues[key].enabled || !isComportConnected}
                                                        type="number"
                                                        min={rampRange.min}
                                                        max={rampRange.max}
                                                        // step={motorType === "st_30" ? 0.1 : 1}
                                                        value={rampValues[key].value}
                                                        onChange={(e) => handleChange(key, Number(e.target.value))}
                                                        className="w-20 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                        placeholder="Enter value"
                                                    />
                                                    <div
                                                        className={cn("px-6 py-2 bg-gray-700 text-white font-medium",
                                                            !rampValues[key].enabled || !isComportConnected ? "opacity-50" : "opacity-100"
                                                        )}
                                                    >
                                                        ms*10
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="motor-td">
                                            <div className="w-full flex justify-center">
                                                <SetProButton
                                                    disabled={!isComportConnected}
                                                    buttonType="submit"
                                                    onClick={() => setDefaultRampTime(key)}
                                                >
                                                    <HiReceiptRefund size={18} />
                                                    Default
                                                </SetProButton>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <SetProButton
                disabled={!isComportConnected}
                buttonType="submit"
                onClick={handleSaveClick}
            >
                <Save size={18} />
                Save
            </SetProButton>
        </div >
    )
}
