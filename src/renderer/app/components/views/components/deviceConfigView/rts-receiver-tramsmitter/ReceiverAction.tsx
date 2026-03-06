import { useState } from "react";
import ActionButton from "~/components/sharedComponent/ActionButton"
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { useComport } from "~/hooks/useComport";
import { useReceiver } from "~/hooks/useReceiver";

export const ReceiverAction = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedReceiver, getFirmwareVersion, factoryReset } = useReceiver();

    const [factoryDefaultDialogOpen, setFactoryDefaultDialogOpen] = useState(false);

    const handleCheckFirmware = () => {
        if (!selectedReceiver) return;
        getFirmwareVersion(selectedReceiver.device_id, true);
    }

    const handleOnFactroryDefault = () => {
        if (!selectedReceiver) return;
        factoryReset(selectedReceiver.device_id);
        setFactoryDefaultDialogOpen(false);
    }

    return (
        <div className="flex flex-col justify-center items-center w-full p-6 gap-4">
            <div className="flex flex-col justify-center items-center w-full">
                <span>{selectedReceiver?.firmware_version}</span>
                <div className="grid grid-cols-1 gap-4 max-w-[300px] ">
                    <ActionButton
                        disabled={!isComportConnected || isOfflineEditMode}
                        label={"Check Firmware"}
                        onClick={handleCheckFirmware}
                    />
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full">
                <div className="grid grid-cols-1 gap-4 max-w-[300px] ">
                    <ActionButton
                        disabled={!isComportConnected || isOfflineEditMode}
                        label={"Factory Default"}
                        onClick={() => setFactoryDefaultDialogOpen(true)}
                    />
                </div>
            </div>

            <ConfirmDialog
                open={factoryDefaultDialogOpen}
                onOpenChange={setFactoryDefaultDialogOpen}
                title="Confirm Action"
                description="Are you sure you want to confirm this action?"
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={handleOnFactroryDefault}
                variant="destructive"
            />
        </div>
    )
}
