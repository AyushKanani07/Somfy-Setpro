import { RotateCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import InfoCard from "~/components/sharedComponent/DiagInfoCard";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useTransmitter } from "~/hooks/useTransmitter";
import { motorService } from "~/services/motorService";


function TransmitterDiag() {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedDeviceId } = useDevice();
    const { } = useTransmitter();

    const [isStatsShow, setIsStatsShow] = useState(true);
    const [isErrorsShow, setIsErrorsShow] = useState(true);
    const [resetConfirmDialog, setResetConfirmDialog] = useState(false);
    const [networkStats, setNetworkStats] = useState<any>(null);
    const [networkErrorStats, setNetworkErrorStats] = useState<any>(null);
    const [transmitterData, setTransmitterData] = useState<any>(null);

    useEffect(() => {
        getNetworkData();
        getTransmitterData();
    }, []);

    const getNetworkData = async () => {
        if (!selectedDeviceId || isOfflineEditMode || !isComportConnected) return;

        const results = await Promise.allSettled([
            motorService.getNetworkStats(selectedDeviceId),
            motorService.getNetworkErrorStats(selectedDeviceId),
        ]);

        if (results[0].status === "fulfilled") {
            setNetworkStats(results[0].value.data);
        } else {
            toast.error("Failed to fetch network stats");
        }

        if (results[1].status === "fulfilled") {
            setNetworkErrorStats(results[1].value.data);
        } else {
            toast.error("Failed to fetch network error stats");
        }
    };

    const getTransmitterData = async () => {
        if (!selectedDeviceId) return;

        try {
            const results = await Promise.allSettled([
                motorService.getTotalMoveCount(selectedDeviceId, true),
                motorService.getTotalRevolutionCount(selectedDeviceId, true),
                motorService.getThermalCount(selectedDeviceId, true),
                motorService.getObstacleCount(selectedDeviceId, true),
                motorService.getPowerCutCount(selectedDeviceId, true),
                motorService.getResetCount(selectedDeviceId, true),
            ]);

            setTransmitterData((prev: any) => ({
                ...prev,
                move_count:
                    results[0].status === "fulfilled"
                        ? results[0].value.data.move_count
                        : (prev?.move_count || 0),

                revolution_count:
                    results[1].status === "fulfilled"
                        ? results[1].value.data.revolution_count
                        : (prev?.revolution_count || 0),

                thermal_count:
                    results[2].status === "fulfilled"
                        ? results[2].value.data.thermal_count
                        : (prev?.thermal_count || 0),

                obstacle_count:
                    results[3].status === "fulfilled"
                        ? results[3].value.data.obstacle_count
                        : (prev?.obstacle_count || 0),

                power_cut_count:
                    results[4].status === "fulfilled"
                        ? results[4].value.data.power_cut_count
                        : (prev?.power_cut_count || 0),

                reset_count:
                    results[5].status === "fulfilled"
                        ? results[5].value.data.reset_count
                        : (prev?.reset_count || 0),
            }));

        } catch (error) {
            toast.error("Failed to fetch transmitter data");
        }
    };

    const resetNetworkData = async () => {
        if (!selectedDeviceId) return;

        try {
            const res = await motorService.resetNetworkStats(selectedDeviceId);
            if (res.success) {
                getNetworkData();
                toast.success("Network stats reset successfully");
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to reset network stats");
        }
    }


    return (
        <div className="grid grid-cols-6 gap-6 w-full relative 
    after:content-[''] 
    after:absolute after:z-[1] after:top-[30px] after:left-[33%] after:bottom-0 after:-translate-x-1/2 after:border-r after:border-gray-300
    ">
            <div className="col-span-2">
                <div className="text-2xl text-center font-extrabold tracking-tight leading-none">
                    Motor Data
                </div>
                <div className="text-right mt-4">
                    <TooltipComponent content="Refresh" direction="top">
                        <button
                            disabled={!isComportConnected || isOfflineEditMode}
                            onClick={getTransmitterData}
                            className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                        >
                            <RotateCw size={16} className="text-white" />
                        </button>
                    </TooltipComponent>
                </div>
                <div className="mt-16 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full align-item-center text-center">
                    <InfoCard title="Total Move Count" count={transmitterData?.move_count || 0} />
                    <InfoCard title="Total Revolution Count" count={transmitterData?.revolution_count || 0} />
                    <InfoCard title="Thermal Count" count={transmitterData?.thermal_count || 0} />
                    <InfoCard title="Post Thermal Count" count={transmitterData?.post_thermal_count || 0} />
                    <InfoCard title="Obstacle Count" count={transmitterData?.obstacle_count || 0} />
                    <InfoCard title="Post Obstacle Count" count={transmitterData?.post_obstacle_count || 0} />
                    <InfoCard title="Power Cut Count" count={transmitterData?.power_cut_count || 0} />
                    <InfoCard title="Reset Count" count={transmitterData?.reset_count || 0} />
                </div>
            </div>
            <div className="col-span-4">
                <div className="text-2xl text-center font-extrabold tracking-tight leading-none">
                    Network Data
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
                    <span className="pl-2 flex flex-row gap-4 items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <Switch checked={isStatsShow} onCheckedChange={setIsStatsShow} />
                            <Label>Stats</Label>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Switch checked={isErrorsShow} onCheckedChange={setIsErrorsShow} />
                            <Label>Errors</Label>
                        </div>
                    </span>
                    <span className="pr-2 ml-auto flex flex-row gap-2">
                        <TooltipComponent content="Refresh" direction="top">
                            <button
                                disabled={!isComportConnected || isOfflineEditMode}
                                onClick={getNetworkData}
                                className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                            >
                                <RotateCw size={16} className="text-white" />
                            </button>
                        </TooltipComponent>
                        <TooltipComponent content="Reset" direction="top">
                            <button
                                disabled={!isComportConnected}
                                onClick={() => setResetConfirmDialog(true)}
                                className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                            >
                                <Trash2 size={16} className="text-white" />
                            </button>
                        </TooltipComponent>
                    </span>
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 w-full items-center text-center">
                    {
                        isStatsShow && (
                            <>
                                <InfoCard title="Max Retry Count" count={networkStats?.maxRetry || 0} />
                                <InfoCard title="Sent Frames" count={networkStats?.sentFrames || 0} />
                                <InfoCard title="Received Frames" count={networkStats?.receivedFrames || 0} />
                                <InfoCard title="Seen Frames" count={networkStats?.seenFrames || 0} />
                                <InfoCard title="Busy Count" count={networkStats?.busy || 0} />
                                <InfoCard title="Max Slot Count" count={networkStats?.maxSlot || 0} />
                                <InfoCard title="Supervision Failures Count" count={networkStats?.supervisionFailures || 0} />
                            </>
                        )
                    }
                    {
                        isErrorsShow && (
                            <>
                                <InfoCard title="Tx Failures Count" count={networkErrorStats?.txFailures || 0} />
                                <InfoCard title="Collisions Count" count={networkErrorStats?.collisions || 0} />
                                <InfoCard title="Message Length Errors" count={networkErrorStats?.messageLengthError || 0} />
                                <InfoCard title="Unknown Message" count={networkErrorStats?.unknownMessage || 0} />
                                <InfoCard title="Rx Data Error" count={networkErrorStats?.rxDataError || 0} />
                                <InfoCard title="CRC Error" count={networkErrorStats?.crcError || 0} />
                                <InfoCard title="Bundle Size Error" count={networkErrorStats?.bundleSizeError || 0} />
                                <InfoCard title="Rx FIFO Full" count={networkErrorStats?.rxFifoFull || 0} />
                                <InfoCard title="Tx FIFO Full" count={networkErrorStats?.txFifoFull || 0} />
                            </>
                        )
                    }

                </div>
            </div>
            {
                resetConfirmDialog &&
                <ConfirmDialog
                    open={resetConfirmDialog}
                    onOpenChange={() => setResetConfirmDialog(false)}
                    title="Reset Network stats"
                    description="Are you sure you want to reset the network stats?"
                    confirmText="Confirm"
                    cancelText="Cancel"
                    onConfirm={resetNetworkData}
                    variant="destructive"
                />
            }
        </div>
    )
}

export default TransmitterDiag;
