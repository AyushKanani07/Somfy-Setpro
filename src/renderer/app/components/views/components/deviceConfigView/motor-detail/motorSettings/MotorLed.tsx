import { useEffect, useState } from "react";
import { HiOutlineLightBulb } from "react-icons/hi";
import { useComport } from "~/hooks/useComport";
import { useMotors } from "~/hooks/useMotors";

export const MotorLed = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const {
        selectedMotorId,
        selectedMotor,
        setMotorLedStatusThunk,
        getMotorLedStatusThunk,
    } = useMotors();
    const [ledStatus, setLedStatus] = useState<string | null>(selectedMotor?.tbl_motor.local_ui?.status!);

    useEffect(() => {
        if (!isComportConnected || isOfflineEditMode || !selectedMotorId) return;

        if (selectedMotor?.tbl_motor.local_ui?.status == null) {
            getMotorLedStatusThunk(selectedMotorId!, true);
        }
    }, []);

    useEffect(() => {
        setLedStatus(selectedMotor?.tbl_motor.local_ui?.status || null);
    }, [selectedMotor?.tbl_motor.local_ui?.status]);

    const onLedToggle = () => {
        const newStatus = ledStatus === "on" ? "off" : "on";
        if (!selectedMotorId) return;
        setMotorLedStatusThunk({ device_id: selectedMotorId, status: newStatus });
    }

    return (
        <div className="w-full flex flex-col justify-center items-center gap-8 py-8">
            <div onClick={onLedToggle} className="cursor-pointer flex justify-center items-center rounded-full bg-white shadow-md p-4">
                <HiOutlineLightBulb
                    size={80}
                    className={ledStatus === "on" ? "text-buttonColor" : "text-textLightColor"}
                />
            </div>
            <span className="text-base">LED Status: {ledStatus?.toUpperCase()}</span>
        </div>
    )
}
