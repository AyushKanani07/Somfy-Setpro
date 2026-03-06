import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { useTransmitter } from "~/hooks/useTransmitter";
import type { DeviceConfigTabs } from "~/store/slices/deviceConfigSlice";
import { TransmitterControl } from "./TransmitterControl";
import { TransmitterSetting } from "./TransmitterSetting";
import { TransmitterAction } from "./TransmitterAction";
import { ReceiverGroup } from "./ReceiverGroup";
import { ReceiverSetting } from "./ReceiverSetting";
import { ReceiverAction } from "./ReceiverAction";
import { useReceiver } from "~/hooks/useReceiver";
import TransmitterDiag from "./TransmitterDiag";

export const RtsReceiverTransmitter = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedDeviceId, selectedDeviceType, findDeviceType, getGroupDeviceByIdThunk } = useDevice();
    const {
        selectedChannel,
        selectedTransmitter,
        fetchTransmitterById,
        getChannelModeThunk,
        getRtsAddressThunk,
        getTiltFrameCountThunk,
        getDimFrameCountThunk,
        getDctLockThunk,
        getStackVersionThunk,
        getAppVersionThunk
    } = useTransmitter();
    const { fetchReceiverById, getAllChannelStatus, getFirmwareVersion } = useReceiver();
    const { activeDeviceConfigTab, setDeviceConfigActiveTab } = useDeviceConfig();

    const [steps, setSteps] = useState<{ id: DeviceConfigTabs; label: string, isDisplay: boolean }[]>([
        { id: "control", label: "Control", isDisplay: true },
        { id: "group", label: "Group", isDisplay: true },
        { id: "settings", label: "Settings", isDisplay: true },
        { id: "actions", label: "Actions", isDisplay: true },
        { id: "diagnostics", label: "Diagnostics", isDisplay: true },
    ]);

    useEffect(() => {
        if (!selectedDeviceType) return;

        const hiddenStepsMap: Record<string, string[]> = {
            "rts-transmitter": ["group"],
            "rts-receiver": ["control", "diagnostics"],
        };

        const stepsToHide = hiddenStepsMap[selectedDeviceType] || [];

        setSteps((prevSteps) =>
            prevSteps.map((step) => ({
                ...step,
                isDisplay: !stepsToHide.includes(step.id),
            }))
        );

        if (selectedDeviceType === "rts-receiver") {
            setDeviceConfigActiveTab("group");
        }
        if (selectedDeviceType === "rts-transmitter") {
            setDeviceConfigActiveTab("control");
        }

    }, [selectedDeviceType]);

    useEffect(() => {
        if (!selectedDeviceId || !selectedDeviceType) return;
        if (selectedDeviceType === "rts-transmitter") {
            fetchTransmitterById(selectedDeviceId);
        } else if (selectedDeviceType === "rts-receiver") {
            fetchReceiverById(selectedDeviceId);
        }
    }, [selectedDeviceId, selectedDeviceType]);

    const renderStepContent = () => {
        switch (activeDeviceConfigTab) {
            case "control":
                return <TransmitterControl />;
            case "group":
                return <ReceiverGroup />;
            case "settings":
                return selectedDeviceType === "rts-receiver" ? <ReceiverSetting /> : <TransmitterSetting />;
            case "actions":
                return selectedDeviceType === "rts-receiver" ? <ReceiverAction /> : <TransmitterAction />;
            case "diagnostics":
                return <TransmitterDiag />;
            default:
                return null;
        }
    }

    const refreshData = () => {
        switch (activeDeviceConfigTab) {
            case "control":
                getRtsAddressThunk({ device_id: selectedDeviceId!, channel: selectedChannel! });
                getChannelModeThunk({ device_id: selectedDeviceId!, channel: selectedChannel! });
                break;
            case "group":
                getGroupDeviceByIdThunk(selectedDeviceId!, true);
                break;
            case "settings":
                if (selectedDeviceType === "rts-receiver") {
                    getAllChannelStatus(selectedDeviceId!, true);
                } else if (selectedDeviceType === "rts-transmitter") {
                    getChannelModeThunk({ device_id: selectedDeviceId!, channel: selectedChannel! });
                    getTiltFrameCountThunk({ device_id: selectedDeviceId!, channel: selectedChannel! });
                    getDimFrameCountThunk({ device_id: selectedDeviceId!, channel: selectedChannel! });
                    getDctLockThunk(selectedDeviceId!);
                }
                break;
            case "actions":
                if (selectedDeviceType === "rts-receiver") {
                    getFirmwareVersion(selectedDeviceId!, true);
                } else if (selectedDeviceType === "rts-transmitter") {
                    getStackVersionThunk({ deviceId: selectedDeviceId!, isRefresh: true });
                    getAppVersionThunk({ deviceId: selectedDeviceId!, isRefresh: true });
                }
                break;
            case "diagnostics":

                break;
            default:
                break;
        }
    }

    return (
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
            {/* motor info and position */}
            <div className="w-full flex flex-col justify-start items-start border-b border-borderColor/20 pb-4">
                <div className="flex justify-start items-start gap-2">
                    {selectedTransmitter?.name && (
                        <h1 className="text-base font-bold">{selectedTransmitter?.name}</h1>
                    )}
                    <span className="text-textDarkColor font-semibold text-base">
                        ({selectedTransmitter?.model_no ? findDeviceType(selectedTransmitter.model_no) : '0.0.0.0'})
                    </span>
                    <span className="text-textDarkColor font-semibold text-base">
                        ({selectedTransmitter?.address})
                    </span>
                </div>
                <div className="flex justify-start items-center gap-2">
                    {selectedDeviceType === "rts-receiver" && (
                        <span className="text-textDarkColor font-light text-base mr-4">
                            Firmware Version: {selectedTransmitter?.firmware_version || '0.0.0.0'}
                        </span>
                    )}
                    {selectedDeviceType === "rts-transmitter" && (
                        <span className="text-textDarkColor font-light text-base mr-4">
                            Stack Version: {selectedTransmitter?.stack_version || '0.0.0.0'}
                        </span>
                    )}

                    <TooltipComponent content="Refresh Motor Data" direction="top">
                        <button
                            disabled={!isComportConnected || isOfflineEditMode}
                            onClick={refreshData}
                            className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                        >
                            <RotateCw size={16} className="text-white" />
                        </button>
                    </TooltipComponent>
                </div>
            </div>

            {/* motor configuration steps */}
            <div className="w-full flex justify-start gap-5 lg:gap-5 pt-2 pb-4 border-b border-b-borderColor/20">
                {steps.map((step) =>
                    step.isDisplay && (
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
                    )
                )}
            </div>

            <div className="w-full h-full overflow-auto">{renderStepContent()}</div>
        </div>
    );
};
