import { Ban } from "lucide-react";
import { useEffect, useState } from "react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useMotors } from "~/hooks/useMotors";
import type { MotorIpData } from "~/interfaces/motor";
import { cn } from "~/lib/utils";

type MotorIPProps = {
    currentIPIndex: number | null;
    setCurrentIPIndex: (index: number) => void;
}

export const MotorIP = ({
    currentIPIndex,
    setCurrentIPIndex
}: MotorIPProps) => {
    const {
        selectedMotor,
        selectedMotorId,
        moveMotorToPositionThunk,
    } = useMotors();
    const { motorActionDisabled } = useDeviceConfig();
    const [lstIp, setLstIp] = useState<Array<MotorIpData>>([
        { index: 1, pulse: null, percentage: null },
        { index: 2, pulse: null, percentage: null },
        { index: 3, pulse: null, percentage: null },
        { index: 4, pulse: null, percentage: null },
        { index: 5, pulse: null, percentage: null },
        { index: 6, pulse: null, percentage: null },
        { index: 7, pulse: null, percentage: null },
        { index: 8, pulse: null, percentage: null },
        { index: 9, pulse: null, percentage: null },
        { index: 10, pulse: null, percentage: null },
        { index: 11, pulse: null, percentage: null },
        { index: 12, pulse: null, percentage: null },
        { index: 13, pulse: null, percentage: null },
        { index: 14, pulse: null, percentage: null },
        { index: 15, pulse: null, percentage: null },
        { index: 16, pulse: null, percentage: null },
    ]);

    useEffect(() => {
        const ipData = selectedMotor?.tbl_motor.ip_data;
        if (!ipData || ipData.length === 0) return;

        setLstIp((prev) =>
            prev.map((item) => {
                const updated = ipData.find(
                    (ip) => ip.index === item.index
                );

                return updated
                    ? {
                        ...item,
                        pulse: updated.pulse,
                        percentage: updated.percentage,
                    }
                    : {
                        ...item,
                        pulse: null,
                        percentage: null,
                    };
            })
        );

    }, [selectedMotor?.tbl_motor.ip_data]);

    useEffect(() => {
        selectedMotor?.tbl_motor.ip_data?.forEach((ip) => {
            if (ip.pulse === selectedMotor.tbl_motor.pos_pulse && ip.pulse != null) {
                setCurrentIPIndex(ip.index);
            }
        });
    }, [selectedMotor?.tbl_motor.pos_pulse]);

    const goToIpPosition = (ip: MotorIpData) => {
        if (!selectedMotorId || ip.pulse == null || ip.pulse === selectedMotor?.tbl_motor.pos_pulse) return;
        moveMotorToPositionThunk({
            payload: {
                device_id: selectedMotorId,
                function_type: "ip",
                isACK: true,
                value_position: ip.index,
            },
            getPositionType: "pulse"
        });

    }

    return (
        <div className="w-full flex justify-center items-center">
            <div className="grid grid-cols-4 gap-3">
                {lstIp.map((ip, index) => (
                    <div
                        key={ip.index}
                        className={cn(
                            "w-[160px] h-9 px-4 bg-chipColor m-1 rounded-full shadow-none flex justify-start items-center text-textDarkColor",
                            motorActionDisabled
                                ? "opacity-50"
                                : "opacity-100 cursor-pointer",
                            (currentIPIndex === ip.index || (!currentIPIndex && selectedMotor?.tbl_motor.pos_pulse === ip.pulse && ip.pulse != null)) && "bg-buttonColor text-white"
                        )}
                        onClick={() => {
                            if (motorActionDisabled) return;
                            setCurrentIPIndex(ip.index);
                            goToIpPosition(ip);
                        }}
                    >
                        <span className="w-8">{ip.index} :</span>
                        {(() => {
                            return ip &&
                                ip.pulse != null &&
                                ip.percentage != null ? (
                                <span className="text-sm">
                                    {ip.pulse} ({ip.percentage}%)
                                </span>
                            ) : (
                                <Ban size={16} />
                            );
                        })()}
                    </div>
                ))}
            </div>
        </div>
    )
}
