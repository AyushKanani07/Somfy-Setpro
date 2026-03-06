import { RefreshCcw, Save } from "lucide-react";
import { Slider } from "primereact/slider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useComport } from "~/hooks/useComport";
import { useTransmitter } from "~/hooks/useTransmitter";
import type { ChannelData } from "~/interfaces/transmitter";
import { cn } from "~/lib/utils";
import { TransmitterService } from "~/services/transmitter.Service";
import { Chip } from 'primereact/chip';
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";

export const TransmitterSetting = () => {
    const { isComportConnected } = useComport();
    const { selectedTransmitter, getChannelModeThunk, getTiltFrameCountThunk, getDimFrameCountThunk, getDctLockThunk } = useTransmitter();
    const [selectedChannel, setSelectedChannel] = useState<string>("0");
    const [selectedChannelData, setSelectedChannelData] = useState<ChannelData | null>(null);
    const [frequencyMode, setFrequencyMode] = useState<"us" | "ce">("us");
    const [applicationMode, setApplicationMode] = useState<"rolling" | "tilting">("rolling");
    const [featureSetMode, setFeatureSetMode] = useState<"modulis" | "normal">("modulis");
    const [tiltFrameCount, setTiltFrameCount] = useState<{ us: number, ce: number }>({ us: 4, ce: 4 });
    const [dimFrameCount, setDimFrameCount] = useState<number>(4);
    const [dctLock, setDctLock] = useState<{ name: string, isLocked: boolean }[]>([
        { name: 'DCT1', isLocked: false },
        { name: 'DCT2', isLocked: false },
        { name: 'DCT3', isLocked: false },
        { name: 'DCT4', isLocked: false },
        { name: 'DCT5', isLocked: false },
    ]);

    useEffect(() => {
        if (!selectedTransmitter) return;

        const channelData = selectedTransmitter.channelData?.find((data) => data.channel_no === Number(selectedChannel));
        if (!channelData && isComportConnected) {
            getChannelModeThunk({ device_id: selectedTransmitter.device_id, channel: Number(selectedChannel) });
            getTiltFrameCountThunk({ device_id: selectedTransmitter.device_id, channel: Number(selectedChannel) });
            getDimFrameCountThunk({ device_id: selectedTransmitter.device_id, channel: Number(selectedChannel) });
            getDctLockThunk(selectedTransmitter.device_id);
        }

        setSelectedChannelData(channelData || null);

    }, [selectedChannel]);

    useEffect(() => {
        if (!selectedTransmitter) return;
        const channelData = selectedTransmitter.channelData?.find((data) => data.channel_no === Number(selectedChannel));
        setSelectedChannelData(channelData || null);
    }, [selectedTransmitter?.channelData]);

    useEffect(() => {
        if (!selectedChannelData) return;
        setFrequencyMode(selectedChannelData.frequency_mode || "us");
        setApplicationMode(selectedChannelData.application_mode || "rolling");
        setFeatureSetMode(selectedChannelData.feature_set_mode || "modulis");
        setTiltFrameCount({
            us: selectedChannelData.tilt_frame_us || 4,
            ce: selectedChannelData.tilt_frame_ce || 4
        });
        setDimFrameCount(selectedChannelData.dim_frame || 4);
    }, [selectedChannelData]);

    useEffect(() => {
        if (!selectedTransmitter) return;
        if (selectedTransmitter.dct_lock && selectedTransmitter.dct_lock.length) {
            dctLock.forEach((dct, index) => {
                setDctLock((prev) => {
                    const newLockState = selectedTransmitter.dct_lock?.find((lock) => lock.index === index + 1)?.isLocked || false;
                    return prev.map((d, i) => i === index ? { ...d, isLocked: newLockState } : d);
                });
            });
        }
    }, [selectedTransmitter?.dct_lock]);

    const onTiltFrameCount = (mode: "us" | "ce", value: number) => {
        setTiltFrameCount((prev) => ({ ...prev, [mode]: value }));
    }

    const handleSaveClick = async () => {
        try {
            TransmitterService.setChannelMode({
                device_id: selectedTransmitter!.device_id,
                channel: Number(selectedChannel),
                frequency_mode: frequencyMode,
                application_mode: applicationMode,
                feature_set_mode: featureSetMode,
            });

            TransmitterService.setTiltFrameCount({
                device_id: selectedTransmitter!.device_id,
                channel: Number(selectedChannel),
                tilt_frame_us: tiltFrameCount.us,
                tilt_frame_ce: tiltFrameCount.ce,
            });

            TransmitterService.setDimFrameCount({
                device_id: selectedTransmitter!.device_id,
                channel: Number(selectedChannel),
                dim_frame: dimFrameCount,
            });

            getChannelModeThunk({ device_id: selectedTransmitter!.device_id, channel: Number(selectedChannel) });
            getTiltFrameCountThunk({ device_id: selectedTransmitter!.device_id, channel: Number(selectedChannel) });
            getDimFrameCountThunk({ device_id: selectedTransmitter!.device_id, channel: Number(selectedChannel) });
        } catch (error) {
            toast.error((error as Error).message || "Failed to save settings");
        }
    }

    const handleRefreshClick = () => {
        getDctLockThunk(selectedTransmitter!.device_id);
    }

    const handleDctLockClick = (index: number) => {
        try {
            TransmitterService.setDctLock({
                device_id: selectedTransmitter!.device_id,
                index: index + 1,
                isLocked: !dctLock[index].isLocked,
            })
        } catch (error) {
            toast.error((error as Error).message || "Failed to toggle DCT lock");
        }
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 justify-start items-center pt-4 overflow-auto scrollbar-none">
            <Accordion
                type="multiple"
                className="w-full !rounded-lg border border-borderLightColor ring-0"
                defaultValue={[]}
            >
                <AccordionItem value="item-1" className="w-full">
                    <AccordionTrigger className="bg-accordionColor hover:bg-accordionColor/80 text-textDarkColor !rounded-none font-semibold pl-10 focus:ring-0 ring-0">
                        Channels
                    </AccordionTrigger>
                    <AccordionContent className="w-full border-none rounded-b-lg !bg-transparent">
                        <div className="bg-white p-8 rounded">
                            <div className="grid grid-cols-[170px_200px] gap-5 items-center mx-auto">
                                <span className="text-lg font-semibold">Select Channel:</span>
                                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                    <SelectTrigger className="w-full min-w-[200px]">
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {Array.from({ length: 16 }, (_, i) => (
                                            <SelectItem key={i} value={i.toString()}>
                                                Channel {i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className="text-lg font-semibold">Frequency mode:</span>
                                <Select value={frequencyMode} onValueChange={(value) => setFrequencyMode(value as "us" | "ce")}>
                                    <SelectTrigger className="w-full min-w-[200px]">
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {["us", "ce"].map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                                {mode.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className="text-lg font-semibold">Application mode:</span>
                                <Select value={applicationMode} onValueChange={(value) => setApplicationMode(value as "rolling" | "tilting")}>
                                    <SelectTrigger className="w-full min-w-[200px]">
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {["rolling", "tilting"].map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className="text-lg font-semibold">Feature set mode:</span>
                                <Select value={featureSetMode} onValueChange={(value) => setFeatureSetMode(value as "modulis" | "normal")}>
                                    <SelectTrigger className="w-full min-w-[200px]">
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {["modulis", "normal"].map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <span className="text-lg font-semibold">Tilt Frame:</span>
                                <div className="grid grid-cols-2 gap-4 w-[425px] items-center">
                                    <div className="flex-1">
                                        {frequencyMode === "us" && (
                                            <Slider
                                                disabled={!isComportConnected}
                                                value={tiltFrameCount["us"]}
                                                onChange={(e) =>
                                                    onTiltFrameCount("us", e.value as number)
                                                }
                                                className="w-14rem"
                                                min={4}
                                                max={255}
                                                step={1}
                                            />
                                        )}
                                        {frequencyMode === "ce" && (
                                            <Slider
                                                disabled={!isComportConnected}
                                                value={tiltFrameCount["ce"]}
                                                onChange={(e) =>
                                                    onTiltFrameCount("ce", e.value as number)
                                                }
                                                className="w-14rem"
                                                min={2}
                                                max={13}
                                                step={1}
                                            />
                                        )}
                                    </div>
                                    <div className="flex w-40 items-center gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                        {frequencyMode === "us" && (
                                            <input
                                                disabled={!isComportConnected}
                                                type="number"
                                                min={4}
                                                max={255}
                                                value={tiltFrameCount["us"]}
                                                onChange={(e) => onTiltFrameCount("us", Number(e.target.value))}
                                                className="w-20 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                placeholder="Enter value"
                                            />
                                        )}
                                        {frequencyMode === "ce" && (
                                            <input
                                                disabled={!isComportConnected}
                                                type="number"
                                                min={2}
                                                max={13}
                                                value={tiltFrameCount["ce"]}
                                                onChange={(e) => onTiltFrameCount("ce", Number(e.target.value))}
                                                className="w-20 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                placeholder="Enter value"
                                            />
                                        )}
                                        <div className={cn("px-6 py-2 bg-gray-700 text-white font-medium", !isComportConnected ? "opacity-50" : "opacity-100")}>
                                            Amp
                                        </div>
                                    </div>
                                </div>

                                <span className="text-lg font-semibold">Dim Frame:</span>
                                <div className="grid grid-cols-2 gap-4 w-[425px] items-center">
                                    <div className="flex-1">
                                        <Slider
                                            disabled={!isComportConnected}
                                            value={dimFrameCount}
                                            onChange={(e) =>
                                                setDimFrameCount(e.value as number)
                                            }
                                            className="w-14rem"
                                            min={4}
                                            max={255}
                                            step={1}
                                        />
                                    </div>
                                    <div className="flex w-40 items-center gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                        <input
                                            disabled={!isComportConnected}
                                            type="number"
                                            min={4}
                                            max={255}
                                            value={dimFrameCount}
                                            onChange={(e) => setDimFrameCount(Number(e.target.value))}
                                            className="w-20 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                            placeholder="Enter value"
                                        />
                                        <div className={cn("px-6 py-2 bg-gray-700 text-white font-medium", !isComportConnected ? "opacity-50" : "opacity-100")}>
                                            Amp
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center items-center gap-4 mt-10">
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <Accordion
                type="multiple"
                className="w-full !rounded-lg border border-borderLightColor ring-0"
                defaultValue={[]}
            >
                <AccordionItem value="item-1" className="w-full">
                    <AccordionTrigger className="bg-accordionColor hover:bg-accordionColor/80 text-textDarkColor !rounded-none font-semibold pl-10 focus:ring-0 ring-0">
                        DCT Lock
                    </AccordionTrigger>
                    <AccordionContent className="w-full border-none rounded-b-lg !bg-transparent">
                        <div className="flex justify-end items-center my-4 mr-10">
                            <SetProButton
                                type="submit"
                                disabled={!isComportConnected}
                                onClick={handleRefreshClick}
                            >
                                <RefreshCcw size={14} className="text-white" />
                                <span className="text-sm text-white">Refresh</span>
                            </SetProButton>
                        </div>
                        <div className="flex justify-center items-center gap-4 mb-8">
                            {dctLock.map((dct, index) => (
                                <TooltipComponent
                                    content={dct.isLocked ? "Click to unlock" : "Click to lock"}
                                    direction="bottom"
                                    key={index}
                                >
                                    <div>
                                        <Chip className={cn("cursor-pointer", dct.isLocked ? "bg-buttonColor" : "")}
                                            onClick={() => handleDctLockClick(index)}
                                            label={`${dct.name}: ${dct.isLocked ? 'Locked' : 'Unlocked'}`} />
                                    </div>
                                </TooltipComponent>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
