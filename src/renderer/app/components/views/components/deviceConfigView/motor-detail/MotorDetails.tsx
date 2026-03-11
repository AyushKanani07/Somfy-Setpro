import { ArrowUpDown, RotateCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useComport } from "~/hooks/useComport";
import { useMotors } from "~/hooks/useMotors";
import { socket } from "~/services/socketService";
import { SOCKET_COMMAND } from "~/constant/constant";
import { toast } from "sonner";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import type { DeviceConfigTabs } from "~/store/slices/deviceConfigSlice";
import { useMotorPositionPolling } from "~/hooks/useMotorPositionPolling";
import { motorService } from "~/services/motorService";
import type { MotorIpData } from "~/interfaces/motor";
import { useDevice } from "~/hooks/useDevice";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import MotorControl from "./MotorControl";
import MotorIpPosition from "./MotorIpPosition";
import MotorGroup from "./MotorGroup";
import MotorSettings from "./MotorSettings";
import MotorActions from "./MotorActions";
import MotorDiagnostics from "./MotorDiagnostics";

const STEPS: { id: DeviceConfigTabs; label: string }[] = [
    { id: "control", label: "Control" },
    { id: "ip", label: "Intermediate Position" },
    { id: "group", label: "Group" },
    { id: "settings", label: "Settings" },
    { id: "actions", label: "Actions" },
    { id: "diagnostics", label: "Diagnostics" },
];

function MotorDetails() {
    useMotorPositionPolling();

    const { isComportConnected, isOfflineEditMode } = useComport();
    const {
        loading: motorLoading,
        motorIPLoading,
        selectedMotorId,
        selectedMotor,
        fetchMotorByIdThunk,
        startGetMotorCurrentPosition,
        getMotorLimitsThunk,
        getMotorTiltLimitsThunk,
        getAppModeThunk,
        updateMotorIpData,
        fetchMotorIpByIdThunk,
        getMotorDirectionThunk,
        getMotorNetworkLockThunk,
    } = useMotors();
    const { loading: deviceLoading, findDeviceType, getGroupDeviceByIdThunk, getAppVersionByDeviceIdThunk, findDeviceTypeBySubNode } = useDevice();
    const { activeDeviceConfigTab, setDeviceConfigActiveTab } = useDeviceConfig();

    useEffect(() => {
        const handleMotorIp = (data: {
            isError: boolean;
            message: string;
            data: MotorIpData;
        }) => {
            if (data.isError) {
                return;
            }
            updateMotorIpData({ ipData: data.data });
        };

        socket.on(SOCKET_COMMAND.MOTOR_ACTIONS.POST_MOTOR_IP, handleMotorIp);

        return () => {
            socket.off(SOCKET_COMMAND.MOTOR_ACTIONS.POST_MOTOR_IP, handleMotorIp);
        };
    }, []);

    useEffect(() => {
        if (selectedMotorId) {
            fetchMotorByIdThunk(selectedMotorId);
        }
        if (isComportConnected) {
            startGetMotorCurrentPosition("pulse");
        }
    }, [selectedMotorId]);

    const fetchMotorCurrentPosition = () => {
        if (selectedMotorId) {
            socket.emit(SOCKET_COMMAND.MOTOR_ACTIONS.GET_MOTOR_POSITION, {
                device_id: selectedMotorId,
            });
        }
    };


    if (!selectedMotorId) {
        return (
            <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
                <span className="text-2xl font-semibold text-textDarkColor">
                    No Device Selected
                </span>
                <span className="text-textLightColor text-base font-medium">
                    Select a device to view its configuration
                </span>
            </div>
        );
    }

    const motorType = findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0);

    const refreshMotorData = () => {
        fetchMotorCurrentPosition();
        switch (activeDeviceConfigTab) {
            case "control":
                getMotorLimitsThunk(selectedMotorId, true);
                getAppModeThunk(selectedMotorId, true);
                if (motorType === "lsu_40_ac") {
                    getMotorTiltLimitsThunk(selectedMotorId, true);
                }
                break;
            case "ip":
                fetchMotorIpByIdThunk(selectedMotorId, true);
                break;
            case "group":
                getGroupDeviceByIdThunk(selectedMotorId, true);
                break;
            case "settings":
                getAppModeThunk(selectedMotorId!, true);
                getMotorDirectionThunk(selectedMotorId!, true);
                getMotorLimitsThunk(selectedMotorId, true);
                getMotorNetworkLockThunk(selectedMotorId!, true);
                break;
            case "actions":
                getAppVersionByDeviceIdThunk(selectedMotorId!, true);
                break;
            case "diagnostics":
                break;
        }
    }

    const renderStepContent = () => {
        switch (activeDeviceConfigTab) {
            case "control":
                return <MotorControl />;
            case "ip":
                return <MotorIpPosition />;
            case "group":
                return <MotorGroup />;
            case "settings":
                return <MotorSettings />;
            case "actions":
                return <MotorActions />;
            case "diagnostics":
                return <MotorDiagnostics />;
            default:
                return null;
        }
    };

    const handleWinkMotor = async () => {
        try {
            const response = await motorService.winkMotor({ device_id: selectedMotorId, isACK: true });
            if (response && !response.success) {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error((error as Error).message || "An error occurred while winking the motor.");
        }
    }

    const isLimitSet = useMemo(() => {
        const isTiltLimitSet = selectedMotor?.tbl_motor.pos_tilt_per !== 255;
        return selectedMotor?.is_limit_set && (selectedMotor?.tbl_motor.app_mode === 1 ? isTiltLimitSet : true);
    }, [selectedMotor]);

    return (
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
            {/* motor info and position */}
            <div className="w-full flex flex-col justify-start items-start border-b border-borderColor/20 pb-4">
                <div className="flex justify-start items-start gap-2">
                    {selectedMotor?.name && (
                        <h1 className="text-base font-bold">{selectedMotor?.name}</h1>
                    )}
                    <span className="text-textDarkColor font-semibold text-base">
                        ({findDeviceType(selectedMotor?.model_no || 0)})
                    </span>
                    <span className="text-textDarkColor font-semibold text-base">
                        ({selectedMotor?.address})
                    </span>
                </div>
                <div className="flex justify-start items-center gap-2">
                    <span className="text-textDarkColor font-light text-base">
                        Current Position:{" "}
                        {selectedMotor?.is_limit_set
                            ? selectedMotor?.tbl_motor.pos_pulse !== undefined &&
                                selectedMotor?.tbl_motor.pos_per !== undefined
                                ? `${selectedMotor?.tbl_motor.pos_pulse} (${selectedMotor?.tbl_motor.pos_per}%)`
                                : "0 (0%)"
                            : "Limit Not Set"}
                    </span>

                    {(motorType === "lsu_40_ac" && (selectedMotor?.tbl_motor.app_mode == 1 || selectedMotor?.tbl_motor.app_mode == 3)) && (
                        <>
                         | Tilt Pos.:
                         {isLimitSet ? (
                            <>
                                <span>{"("}{selectedMotor?.tbl_motor.pos_tilt_per || 0}%{")"}</span>
                                <span> {"("}{selectedMotor?.tbl_motor.pos_tilt_degree || 0}<span>&#176;</span>{")"}</span>
                            </>
                         ) : (
                            <span>Limit not set</span>
                         )}
                        </>
                    )}

                    <TooltipComponent content="Refresh Motor Data" direction="top">
                        <button
                            disabled={!isComportConnected || isOfflineEditMode || motorLoading || motorIPLoading || deviceLoading}
                            onClick={refreshMotorData}
                            className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                        >
                            <RotateCw size={16} className="text-white" />
                        </button>
                    </TooltipComponent>

                    <TooltipComponent content="Wink Motor" direction="top">
                        <button onClick={handleWinkMotor}
                            disabled={!isComportConnected || isOfflineEditMode}
                            className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2"
                        >
                            <ArrowUpDown size={16} className="text-white" />
                        </button>
                    </TooltipComponent>
                </div>
            </div>

            {/* motor configuration steps */}
            <div className="w-full flex justify-start gap-5 lg:gap-5 pt-2 pb-4 border-b border-b-borderColor/20">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={`h-10 cursor-pointer px-4 py-2 flex justify-center items-center truncate rounded-full line-clamp-1 md:text-sm ${activeDeviceConfigTab === step.id
                            ? "bg-buttonColor text-white"
                            : "text-textLightColor"
                            }`}
                        onClick={() => setDeviceConfigActiveTab(step.id)}
                    >
                        {step.label}
                    </div>
                ))}
            </div>

            <div className="w-full h-full overflow-auto">{renderStepContent()}</div>
        </div>
    );
}

export default MotorDetails;
