import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import ControlMoveToEnd from "~/components/sharedComponent/ControlMoveToEnd";
import ControlStepMove from "~/components/sharedComponent/ControlSetpMove";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch";
import { useComport } from "~/hooks/useComport";
import { useTransmitter } from "~/hooks/useTransmitter";
import type { ChannelData } from "~/interfaces/transmitter";
import { TransmitterService } from "~/services/transmitter.Service";

export const TransmitterControl = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedTransmitter, getChannelModeThunk, getRtsAddressThunk, setSunModeThunk, setSelectedChannelToStore } = useTransmitter();
    const [selectedChannel, setSelectedChannel] = useState<string>("0");
    const [selectedCommand, setSelectedCommand] = useState<string>("97");
    const [selectedChannelData, setSelectedChannelData] = useState<ChannelData | null>(null);
    const [isSunMode, setIsSunMode] = useState(false);
    const [setIpConfirmDialog, setSetIpConfirmDialog] = useState(false);

    const [tiltInputValue, setTiltInputValue] = useState<string>("");
    const [dimInputValue, setDimInputValue] = useState<string>("");

    let isTiltAmplitudeDisabled = (selectedChannelData?.application_mode === "tilting" && selectedChannelData?.feature_set_mode === "normal") ||
        (selectedChannelData?.application_mode === "rolling" && selectedChannelData?.feature_set_mode === "normal");

    let isDimAmplitudeDisabled = (selectedChannelData?.application_mode === "tilting" && selectedChannelData?.feature_set_mode === "normal");

    useEffect(() => {
        if (!selectedTransmitter) return;
        setIsSunMode(selectedTransmitter.sun_mode === "on" ? true : false);
    }, [selectedTransmitter?.sun_mode]);

    const toggleSunMode = (checked: boolean) => {
        if (!selectedTransmitter) return;
        setSunModeThunk({ device_id: selectedTransmitter.device_id, sun_mode: isSunMode ? "on" : "off" });
        setIsSunMode(checked);
    }

    useEffect(() => {
        if (!selectedTransmitter) return;

        const channelData = selectedTransmitter.channelData?.find((data) => data.channel_no === Number(selectedChannel));
        if (!channelData && isComportConnected) {
            getChannelModeThunk({ device_id: selectedTransmitter.device_id, channel: Number(selectedChannel) });
            getRtsAddressThunk({ device_id: selectedTransmitter.device_id, channel: Number(selectedChannel) });
        }

        setSelectedChannelData(channelData || null);
        setSelectedChannelToStore(Number(selectedChannel));

    }, [selectedChannel]);

    useEffect(() => {
        if (!selectedTransmitter) return;
        const channelData = selectedTransmitter.channelData?.find((data) => data.channel_no === Number(selectedChannel));
        setSelectedChannelData(channelData || null);
    }, [selectedTransmitter?.channelData]);

    const sendPairCommand = async () => {
        try {
            switch (selectedCommand) {
                case "97":
                    await TransmitterService.setChannelCommand({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel) });
                    break;
                case "98":
                    await TransmitterService.setOpenProgCommand({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel) });
                    break;
            }

        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const changeRtsAddress = async () => {
        try {
            await TransmitterService.setRtsAddress({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel) });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleMoveToUpLimit = async () => {
        try {
            await TransmitterService.controlPosition({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel), function_type: "up" });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleMoveToDownLimit = async () => {
        try {
            await TransmitterService.controlPosition({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel), function_type: "down" });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleStop = async () => {
        try {
            await TransmitterService.controlPosition({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel), function_type: "stop" });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleMoveToIp = async () => {
        try {
            await TransmitterService.controlPosition({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel), function_type: "ip" });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleSetIp = async () => {
        try {
            await TransmitterService.setIp({ device_id: selectedTransmitter?.device_id!, channel: Number(selectedChannel) });
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleTilt = async (direction: "up" | "down") => {
        try {
            let tilt_amplitude = Number(tiltInputValue);
            if (isNaN(tilt_amplitude)) {
                return toast.error(`Please enter a valid tilt amplitude`);
            }
            if (selectedChannelData?.feature_set_mode === "modulis" && (tilt_amplitude < 1 || tilt_amplitude > 127)) {
                return toast.error(`Tilting amplitude must be between 1 and 127`);
            }
            const payload = {
                device_id: selectedTransmitter?.device_id!,
                channel: Number(selectedChannel),
                function_type: direction,
                tilt_amplitude: tilt_amplitude,
            }

            await TransmitterService.sendTiltCommand(payload);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const handleDim = async (direction: "up" | "down") => {
        try {
            let dim_amplitude = Number(dimInputValue);
            if (isNaN(dim_amplitude)) {
                return toast.error(`Please enter a valid dim amplitude`);
            }
            if (selectedChannelData?.feature_set_mode === "modulis" && (dim_amplitude < 1 || dim_amplitude > 127)) {
                return toast.error(`Dim amplitude must be between 1 and 127`);
            }

            const payload = {
                device_id: selectedTransmitter?.device_id!,
                channel: Number(selectedChannel),
                function_type: direction,
                dim_amplitude: dim_amplitude,
            }

            await TransmitterService.sendDimCommand(payload);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    return (
        <div className="flex flex-col mt-2 items-center space-y-10">
            <div className="flex justify-center items-center gap-4 mt-4">
                <span className="text-lg font-semibold text-nowrap">Select Channel:</span>
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
            </div>
            <div className="flex justify-center items-center gap-12 mt-4">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold">Command:</span>
                    <Select value={selectedCommand} onValueChange={setSelectedCommand}>
                        <SelectTrigger className="w-full min-w-[200px]">
                            <SelectValue placeholder="Select Command" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                            <SelectItem value="97">SET_CHANNEL</SelectItem>
                            <SelectItem value="98">SET_OPEN_PROG</SelectItem>
                        </SelectContent>
                    </Select>
                    <SetProButton
                        onClick={sendPairCommand}
                        buttonType="submit"
                        type="submit"
                        disabled={!isComportConnected}
                    >
                        Start Pairing
                    </SetProButton>
                </div>
                <div className="h-10 w-px bg-black"></div>
                <div>
                    <SetProButton
                        onClick={changeRtsAddress}
                        buttonType="submit"
                        type="submit"
                        disabled={!isComportConnected}
                    >
                        Change RTS Address
                    </SetProButton>
                </div>
            </div>
            <div className="flex justify-around items-center gap-4 mb-8">
                <span className="text-lg font-semibold ">RTS Address : {selectedChannelData?.rts_address || 'N/A'}</span>
                |
                <span className="text-lg font-semibold ">Frequency Mode : {selectedChannelData?.frequency_mode || 'N/A'}</span>
                |
                <span className="text-lg font-semibold ">Application Mode : {selectedChannelData?.application_mode || 'N/A'}</span>
                |
                <span className="text-lg font-semibold ">Feature set Mode : {selectedChannelData?.feature_set_mode || 'N/A'}</span>
            </div>
            <div className="w-full flex flex-row items-center justify-end mb-8">
                <div className="flex flex-row gap-4 items-center px-4 py-2 bg-gray-200 rounded-full">
                    <Label>Sun Mode: </Label>
                    <Switch className="data-[state=unchecked]:bg-gray-400" checked={isSunMode} onCheckedChange={(checked) => toggleSunMode(checked)} />
                </div>
            </div>
            <div className="flex w-full justify-around px-9">
                <div className="flex-col w-56 items-stretch">
                    <ControlMoveToEnd
                        buttonLable="Stop"
                        disabled={!isComportConnected}
                        handleMoveToTop={handleMoveToUpLimit}
                        handleMoveToBottom={handleMoveToDownLimit}
                        handleStop={handleStop}
                    />
                    <div className="text-secondary text-center mt-3">Position Controller</div>
                </div>
                <div className="flex-col w-56">
                    <div className="h-full w-full flex flex-col justify-center items-stretch p-4 px-8 gap-8 rounded-xl border-2 border-borderLightColor bg-white">
                        <SetProButton
                            buttonType="submit"
                            type="submit"
                            disabled={!isComportConnected}
                            onClick={handleMoveToIp}
                        >
                            Move To IP
                        </SetProButton>
                        <SetProButton
                            buttonType="submit"
                            type="submit"
                            disabled={!isComportConnected}
                            onClick={() => setSetIpConfirmDialog(true)}
                        >
                            Set IP
                        </SetProButton>
                    </div>
                </div>
                <div className="flex-col w-56">
                    <ControlStepMove
                        disabled={!isComportConnected || isTiltAmplitudeDisabled}
                        inputLableText="Amplitude"
                        inputValue={tiltInputValue}
                        setInputValue={setTiltInputValue}
                        handleUp={() => handleTilt("up")}
                        handleDown={() => handleTilt("down")}
                    />
                    <div className="text-secondary text-center mt-3">Tilt Controller</div>
                </div>
                <div className="flex-col w-56">
                    <ControlStepMove
                        disabled={!isComportConnected || isDimAmplitudeDisabled}
                        inputLableText="Amplitude"
                        inputValue={dimInputValue}
                        setInputValue={setDimInputValue}
                        handleUp={() => handleDim("up")}
                        handleDown={() => handleDim("down")}
                    />
                    <div className="text-secondary text-center mt-3">Dim Controller</div>
                </div>
            </div>
            {
                setIpConfirmDialog && (
                    <ConfirmDialog
                        open={setIpConfirmDialog}
                        onOpenChange={setSetIpConfirmDialog}
                        title="Initiate IP"
                        description="This action will delete IP of motor if motor is currently at IP position. Are you sure you want to proceed?"
                        confirmText="Confirm"
                        cancelText="Cancel"
                        onConfirm={handleSetIp}
                        variant="destructive"
                    />
                )
            }
        </div >
    )
}
