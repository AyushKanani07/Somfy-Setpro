import { Save } from 'lucide-react';
import { Slider } from 'primereact/slider';
import { useEffect, useState } from 'react';
import { HiReceiptRefund } from 'react-icons/hi';
import { toast } from 'sonner';
import { SetProButton } from '~/components/sharedComponent/setProButton';
import { useComport } from '~/hooks/useComport';
import { useDevice } from '~/hooks/useDevice';
import { useMotors } from '~/hooks/useMotors';
import type { range, SpeedType } from '~/interfaces/motor';
import { motorService } from '~/services/motorService';

export const MotorSpeedAdjustment = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const {
        selectedMotor,
        selectedMotorId,
        setMotorRollingSpeedThunk,
        getMotorRollingSpeedThunk
    } = useMotors();
    const { findDeviceTypeBySubNode } = useDevice();
    const [speeds, setSpeeds] = useState<Record<SpeedType, number>>({
        up: 10,
        down: 10,
        slow: 10,
    });
    const [rangeValues, setRangeValues] = useState<range>({
        up: { min: 6, max: 28 },
        down: { min: 6, max: 28 },
        slow: { min: 6, max: 28 }
    });
    const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);

    useEffect(() => {
        if (motorType === "glydea") {
            setRangeValues({
                up: { min: 87, max: 140 },
                down: { min: 87, max: 140 },
                slow: { min: 87, max: 140 }
            });
            setSpeeds({
                up: 87,
                down: 87,
                slow: 87
            });
        }

        if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;

        if (selectedMotor?.tbl_motor.up_speed == null || selectedMotor?.tbl_motor.down_speed == null || selectedMotor?.tbl_motor.slow_speed == null) {
            getMotorRollingSpeedThunk(selectedMotorId!, true);
        }
    }, []);

    useEffect(() => {
        setSpeeds({
            up: selectedMotor?.tbl_motor.up_speed || 10,
            down: selectedMotor?.tbl_motor.down_speed || 10,
            slow: selectedMotor?.tbl_motor.slow_speed || 10,
        });
    }, [selectedMotor?.tbl_motor.up_speed, selectedMotor?.tbl_motor.down_speed, selectedMotor?.tbl_motor.slow_speed]);

    const handleChange = (type: SpeedType, val: number) => {
        const clamped = Math.max(0, Math.min(rangeValues[type].max, val)); // keep within range
        setSpeeds((prev) => ({ ...prev, [type]: clamped }));
    };

    const handleDefaultClick = async () => {
        if (!selectedMotorId) return;

        try {
            await motorService.setDefaultRollingSpeed(selectedMotorId);
            if (!isOfflineEditMode) {
                getMotorRollingSpeedThunk(selectedMotorId!, true);
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to reset to default speeds.");
        }
    }

    const handleSaveClick = async () => {
        if (!selectedMotorId) return;
        if (motorType === "st_30" && (speeds.up < 6 || speeds.up > 28 || speeds.down < 6 || speeds.down > 28 || speeds.slow < 6 || speeds.slow > 28)) {
            return toast.error("The speed should range between 6 and 28");
        } else if (motorType === "st_50_dc" && (speeds.up < 10 || speeds.up > 25 || speeds.down < 10 || speeds.down > 25 || speeds.slow < 10 || speeds.slow > 25)) {
            return toast.error("The speed should range between 10 and 25");
        } else if (motorType === "qt_30" && (speeds.up < 10 || speeds.up > 28 || speeds.down < 10 || speeds.down > 28 || speeds.slow < 10 || speeds.slow > 28)) {
            return toast.error("The speed should range between 10 and 28");
        } else if (motorType === "glydea" && ![87, 105, 122, 140].includes(speeds.up)) {
            return toast.error("The speed should be 87, 105, 122, 140");
        }

        const payload = {
            device_id: selectedMotorId,
            up: speeds.up,
            down: speeds.down,
            slow: speeds.slow,
        };
        await setMotorRollingSpeedThunk(payload);
        if (!isOfflineEditMode) {
            getMotorRollingSpeedThunk(selectedMotorId!, true);
        }
    }

    return (
        <div className="w-full flex flex-col justify-center items-center gap-8 py-8 px-6 bg-gray-300">
            <div className='flex flex-col gap-4 w-full'>
                {
                    (Object.keys(speeds) as SpeedType[]).map((type) => {
                        if (motorType === "glydea" && type !== "up") return null;
                        return (
                            <div className="grid grid-cols-6 gap-2 w-full items-center px-6 py-7 rounded-lg bg-gray-100">
                                <span className="col-span-3">
                                    <span className="grid grid-cols-3 gap-2 items-center">
                                        <span className="col-span-1 margin-right-auto text-base text-gray-500">
                                            {type} speed
                                        </span>
                                        <span className="col-span-2">
                                            <Slider
                                                value={speeds[type]}
                                                onChange={(e) =>
                                                    handleChange(type, e.value as number)
                                                }
                                                className="w-14rem"
                                                min={rangeValues[type].min}
                                                max={rangeValues[type].max}
                                                step={motorType === "st_30" ? 0.1 : 1}
                                            />
                                        </span>
                                    </span>
                                </span>
                                <span className="col-span-3 ml-4">
                                    <div className="col-span-1 flex align-item-center">
                                        <div className="justify-start ms-pulse-input">
                                            <div className="flex w-30 items-center gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                <input
                                                    type="number"
                                                    min={rangeValues[type].min}
                                                    max={rangeValues[type].max}
                                                    step={motorType === "st_30" ? 0.1 : 1}
                                                    value={speeds[type]}
                                                    onChange={(e) => handleChange(type, Number(e.target.value))}
                                                    className="w-20 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                    placeholder="Enter value"
                                                />
                                                <div
                                                    className="px-6 py-2 bg-gray-700 text-white font-medium"
                                                >
                                                    RPM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </span>
                            </div>
                        )
                    })
                }

                <div className='flex w-full flex-row gap-5 justify-center'>
                    <SetProButton
                        disabled={!isComportConnected}
                        buttonType="submit"
                        onClick={handleDefaultClick}
                    >
                        <HiReceiptRefund size={18} />
                        Default
                    </SetProButton>

                    <SetProButton
                        disabled={!isComportConnected}
                        buttonType="submit"
                        onClick={handleSaveClick}
                    >
                        <Save size={18} />
                        Save
                    </SetProButton>
                </div>
            </div>
        </div >
    )
}
