import type { TransmitterItem } from "~/interfaces/transmitter";
import { useAppDispatch, useAppSelector } from "./redux";
import { fetchTransmitterById, getAppVersionThunk, getChannelModeThunk, getDctLockThunk, getDimFrameCountThunk, getRtsAddressThunk, getStackVersionThunk, getTiltFrameCountThunk, setSelectedChannel, setSunModeThunk, setTransmitters } from "~/store/slices/transmitterSlice";


export const useTransmitter = () => {
    const dispatch = useAppDispatch();
    const transmitter = useAppSelector((state) => state.transmitter);

    //#region actions
    const actions = {
        setTransmitters: (transmitters: TransmitterItem[]) => dispatch(setTransmitters(transmitters)),
        setSelectedChannelToStore: (channel: number | null) => dispatch(setSelectedChannel(channel)),
    };

    const methods = {

    };

    const thunks = {
        fetchTransmitterById: (transmitterId: number) => dispatch(fetchTransmitterById(transmitterId)),
        getRtsAddressThunk: (payload: { device_id: number, channel: number }) => dispatch(getRtsAddressThunk(payload)),
        getChannelModeThunk: (payload: { device_id: number, channel: number }) => dispatch(getChannelModeThunk(payload)),
        setSunModeThunk: (payload: { device_id: number, sun_mode: "on" | "off" }) => dispatch(setSunModeThunk(payload)),
        getDimFrameCountThunk: (payload: { device_id: number, channel: number }) => dispatch(getDimFrameCountThunk(payload)),
        getTiltFrameCountThunk: (payload: { device_id: number, channel: number }) => dispatch(getTiltFrameCountThunk(payload)),
        getDctLockThunk: (device_id: number) => dispatch(getDctLockThunk(device_id)),
        getAppVersionThunk: (payload: { deviceId: number, isRefresh?: boolean }) => dispatch(getAppVersionThunk(payload)),
        getStackVersionThunk: (payload: { deviceId: number, isRefresh?: boolean }) => dispatch(getStackVersionThunk(payload)),

    };

    return {
        //state
        ...transmitter,

        //actions
        ...actions,

        //methods
        ...methods,

        //thunks
        ...thunks,
    };
}