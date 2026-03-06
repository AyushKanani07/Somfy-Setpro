import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SOCKET_COMMAND } from "~/constant/constant";
import { useGroupView } from "~/hooks/useGroupView";
import type { GroupScanningInfo } from "~/interfaces/groupView";
import { socket } from "~/services/socketService";
import { SetProButton } from "../sharedComponent/setProButton";

export const GroupScanningDialog = () => {
    const {
        groupScanningDialog,
        closeGroupScanningDialog,
        setGroupScanningStatus,
        fetchGroupsThunk,
        fetchGroupDevicesThunk
    } = useGroupView();

    const [progressMessage, setProgressMessage] = useState("Scanning groups...");

    const handleCancel = () => {
        socket.emit(SOCKET_COMMAND.GROUP_DISCOVERY.STOP);
    }

    useEffect(() => {
        if (!groupScanningDialog) return;

        const handleGroupInfo = (info: GroupScanningInfo) => {
            switch (info.status) {
                case 'start':
                    setProgressMessage("Group scanning started...");
                    setGroupScanningStatus(true);
                    break;
                case 'progress':
                    setProgressMessage(info.message);
                    break;
                case 'error':
                    setGroupScanningStatus(false);
                    closeGroupScanningDialog();
                    toast.error(info.message || "An error occurred during group scanning.");
                    break;
                case 'stopped':
                    setGroupScanningStatus(false);
                    closeGroupScanningDialog();
                    toast.info("Group scanning stopped.");
                    break;
                case 'completed':
                    fetchGroupsThunk();
                    fetchGroupDevicesThunk();
                    setGroupScanningStatus(false);
                    closeGroupScanningDialog();
                    toast.success("Group scanning completed.");
                    break;
            }
        }

        socket.on(SOCKET_COMMAND.GROUP_DISCOVERY.INFO, handleGroupInfo);

        socket.emit(SOCKET_COMMAND.GROUP_DISCOVERY.START);

        return () => {
            socket.off(SOCKET_COMMAND.GROUP_DISCOVERY.INFO, handleGroupInfo);
        }
    }, [groupScanningDialog]);

    return (
        <Dialog
            open={groupScanningDialog}
            onOpenChange={(open) => {
                if (!open) return;
            }}
        >
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md border-none"
                showCross={false}
            >
                <DialogHeader>
                    <DialogTitle>Group Scanning...</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="text-center">
                        <p className="text-lg font-medium text-textDarkColor truncate">
                            {progressMessage}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <SetProButton buttonType="cancel" onClick={handleCancel}>
                        Cancel
                    </SetProButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
