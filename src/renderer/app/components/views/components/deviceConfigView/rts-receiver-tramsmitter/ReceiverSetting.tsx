import { Check, CircleCheck, Trash2, X } from "lucide-react";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { SetProButton } from "~/components/sharedComponent/setProButton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { SOCKET_COMMAND } from "~/constant/constant";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useReceiver } from "~/hooks/useReceiver";
import { cn } from "~/lib/utils";
import { ReceiverService } from "~/services/receiverService";
import { socket } from "~/services/socketService";

export const ReceiverSetting = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedDeviceId, selectedDeviceType } = useDevice();
    const { selectedReceiver, getAllChannelStatus, getChannelStatus, removeAllChannels } = useReceiver();

    const [loading, setLoading] = useState<boolean>(false);
    const [channelConfig, setChannelConfig] = useState<Array<{ index: number; name: string, isConfig: boolean }>>([
        { index: 1, name: "Channel 1", isConfig: false },
        { index: 2, name: "Channel 2", isConfig: false },
        { index: 3, name: "Channel 3", isConfig: false },
        { index: 4, name: "Channel 4", isConfig: false },
        { index: 5, name: "Channel 5", isConfig: false },
    ]);
    const [deleteAllChannelDialogOpen, setDeleteAllChannelDialogOpen] = useState(false);
    const [setConfigMode, setSetConfigMode] = useState<{ index: number, isOpen: boolean, step: number, action: string }>({
        index: 0,
        isOpen: false,
        step: 0,
        action: "",
    });

    useEffect(() => {
        if (selectedReceiver?.channelConfigData.length === 0) {
            getAllChannelStatus(selectedDeviceId!, true);
        }

        const handlePostChannelStatus = (data: { index: number; config: boolean }) => {
            if (setConfigMode.step === 2) {
                if (setConfigMode.index !== data.index) {
                    setSetConfigMode(prev => ({ ...prev, step: 6, action: "" }));
                    return;
                }
                setSetConfigMode(prev => ({ ...prev, step: 3, action: "" }));
            }
        }

        socket.on(SOCKET_COMMAND.RECEIVER.ON_POST_CHANNEL_STATUS, handlePostChannelStatus);

        return () => {
            socket.off(SOCKET_COMMAND.RECEIVER.ON_POST_CHANNEL_STATUS, handlePostChannelStatus);
        }
    }, []);

    useEffect(() => {
        if (selectedReceiver?.channelConfigData) {
            setChannelConfig((prev) =>
                prev.map((channel) => {
                    const config = selectedReceiver.channelConfigData?.find((c) => c.index === channel.index);
                    return {
                        ...channel,
                        isConfig: config ? config.config : false,
                    };
                })
            );
        }
    }, [selectedReceiver?.channelConfigData]);

    const handleRemoveAllChannels = async () => {
        setLoading(true);
        await removeAllChannels(selectedDeviceId!);
        setDeleteAllChannelDialogOpen(false);
        setLoading(false);
    }

    useEffect(() => {
        if (!selectedDeviceId || !setConfigMode?.index || !setConfigMode?.isOpen || !setConfigMode?.action) return;

        switch (setConfigMode.action) {
            case "config":
                startConfigureChannel(setConfigMode.index);
                break;
            case "delete":
                deleteChannelConfig(setConfigMode.index);
                break;
            case "close-config":
                closeConfig(setConfigMode.index);
                break;
            default:
                break;
        }

    }, [setConfigMode]);

    const deleteChannelConfig = async (index: number) => {
        try {
            const res = await ReceiverService.setChannelStatus(selectedDeviceId!, index, "delete");
            if (res.success) {
                setSetConfigMode((prev) => ({ ...prev, step: 5, action: "" }));
                getChannelStatus(selectedDeviceId!, index, true);
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to delete channel configuration");
            return;
        }
    }

    const closeConfig = async (index: number) => {
        if (!selectedDeviceId) return;
        try {
            await ReceiverService.setChannelStatus(selectedDeviceId, index, "close-config");
        } catch (error) {
            toast.error((error as Error).message || "Failed to close configuration");
        }
        setSetConfigMode({ index: 0, isOpen: false, step: 0, action: "" });
        setLoading(false);
    }

    const startConfigureChannel = async (index: number) => {
        try {
            const res = await ReceiverService.setChannelStatus(selectedDeviceId!, index, "config");
            if (res.success) {
                setSetConfigMode(prev => ({ ...prev, index, isOpen: true, step: 2, action: "" }));
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to start channel configuration");
            return;
        }
    }

    return (
        <div className="flex flex-col mt-2 space-y-10">
            <div className="flex justify-end sm:ml-2 space-x-3">
                <SetProButton
                    disabled={!isComportConnected}
                    buttonType="submit"
                    onClick={() => setDeleteAllChannelDialogOpen(true)}
                >
                    <Trash2 size={18} />
                    Remove all channel
                </SetProButton>
            </div>

            <div className="flex flex-col gap-4 mx-12">
                {channelConfig.map((channel, index) => (
                    <div
                        key={channel.index}
                        className={cn(
                            "w-full h-12 px-4 bg-white shadow-md m-1 rounded-md flex justify-start items-center gap-2 text-textDarkColor border-l-8 border-buttonColor"
                        )}
                    >
                        <div className="flex flex-row items-center w-full">
                            <span className="w-8">{index + 1}: </span>
                            <div className="grid grid-cols-3 w-full items-center">
                                <span>{channel.name}</span>
                                {
                                    channel.isConfig ? (
                                        <span className="flex justify-center">
                                            <Check className="text-green-600" size={18} />
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 flex justify-center">
                                            <X className="text-red-600" size={18} />
                                        </span>
                                    )
                                }
                                <span className="flex justify-end">
                                    {channel.isConfig
                                        ?
                                        <Trash2
                                            onClick={() => {
                                                setSetConfigMode({ index: channel.index, isOpen: true, step: 4, action: "delete" });
                                            }}
                                            size={16}
                                            className="text-red-400 cursor-pointer hover:text-red-600"
                                        />
                                        :
                                        <SetProButton
                                            buttonType="submit"
                                            type="submit"
                                            disabled={!isComportConnected}
                                            onClick={() => setSetConfigMode({ index: channel.index, isOpen: true, step: 1, action: "config" })}
                                        >
                                            <CircleCheck size={18} />
                                            Configure
                                        </SetProButton>
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                showCross={false}
                isBackdropCloseDisabled={true}
                open={deleteAllChannelDialogOpen}
                onOpenChange={setDeleteAllChannelDialogOpen}
                title="Confirm action"
                description="Are you sure you want to confirm this action?"
                confirmText="Confirm"
                cancelText="Cancel"
                isLoading={loading}
                loadingText="Confirm"
                onConfirm={handleRemoveAllChannels}
                isManualCloseOnConfirm={true}
                variant="destructive"
            />

            <Dialog
                open={setConfigMode?.isOpen}
                onOpenChange={(value) => {
                    if (!value) {
                        setSetConfigMode({ index: 0, isOpen: false, step: 0, action: "" });
                    }
                }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <div className="flex">
                        {(setConfigMode?.step === 1 || setConfigMode?.step === 4) && (
                            <div className="p-3 flex flex-col gap-2 w-full justify-center items-center">
                                <ProgressSpinner
                                    className="h-10 w-10 custom-spinner"
                                    strokeWidth="5" />
                                <span className="text-2xl font-semibold p-4 leading-tight">
                                    Waiting for ACK
                                </span>
                            </div>
                        )}

                        {setConfigMode?.step === 2 && (
                            <div className="p-3 m-auto">
                                <div className="text-2xl font-semibold p-4 leading-tight text-amber-500">
                                    Click Program Button on RTS Remote
                                </div>
                            </div>
                        )}

                        {setConfigMode?.step === 3 && (
                            <div className="p-3 m-auto">
                                <div className="text-2xl font-semibold p-4 leading-tight text-green-500">
                                    Remote Programmed Successfully
                                </div>
                            </div>
                        )}

                        {setConfigMode?.step === 5 && (
                            <div className="p-3 m-auto">
                                <div className="text-2xl font-semibold p-4 leading-tight text-green-500">
                                    Channel Deleted Successfully
                                </div>
                            </div>
                        )}

                        {setConfigMode?.step === 6 && (
                            <div className="p-3 m-auto">
                                <div className="text-2xl font-semibold p-4 leading-tight text-red-500">
                                    Channel Already Configured on Index {setConfigMode?.index}
                                </div>
                            </div>
                        )}
                    </div>


                    <DialogFooter>
                        <SetProButton
                            buttonType="cancel"
                            disabled={loading}
                            onClick={() => {
                                setLoading(true);
                                setSetConfigMode(prev => ({ ...prev, action: "close-config" }))
                            }}
                            className="rounded-full"
                        >
                            Close
                        </SetProButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
