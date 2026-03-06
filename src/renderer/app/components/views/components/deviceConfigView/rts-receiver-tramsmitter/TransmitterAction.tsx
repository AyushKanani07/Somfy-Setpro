import ActionButton from "~/components/sharedComponent/ActionButton";
import { useComport } from "~/hooks/useComport";
import { useTransmitter } from "~/hooks/useTransmitter";

export const TransmitterAction = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedTransmitter, getStackVersionThunk, getAppVersionThunk } = useTransmitter();

    const getStackVersion = () => {
        if (!selectedTransmitter) return;
        getStackVersionThunk({ deviceId: selectedTransmitter.device_id, isRefresh: true });
    }

    const getAppVersion = () => {
        if (!selectedTransmitter) return;
        getAppVersionThunk({ deviceId: selectedTransmitter.device_id, isRefresh: true });
    }

    return (
        <div className="flex flex-col justify-center items-center w-full p-6 gap-4">
            <div className="flex flex-col justify-center items-center w-full">
                <span>{selectedTransmitter?.stack_version}</span>
                <div className="grid grid-cols-1 gap-4 max-w-[300px] ">
                    <ActionButton
                        disabled={!isComportConnected || isOfflineEditMode}
                        label={"Stack Version"}
                        onClick={getStackVersion}
                    />
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full">
                <span>{selectedTransmitter?.app_version}</span>
                <div className="grid grid-cols-1 gap-4 max-w-[300px] ">
                    <ActionButton
                        disabled={!isComportConnected || isOfflineEditMode}
                        label={"Software Version"}
                        onClick={getAppVersion}
                    />
                </div>
            </div>
        </div>
    )
}
