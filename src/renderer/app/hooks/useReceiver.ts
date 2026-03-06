import { factoryReset, fetchReceiverById, getAllChannelStatus, getChannelStatus, getFirmwareVersion, removeAllChannels } from "~/store/slices/receiverSlice";
import { useAppDispatch, useAppSelector } from "./redux";


export const useReceiver = () => {
    const dispatch = useAppDispatch();
    const receiver = useAppSelector((state) => state.receiver);

    //#region actions
    const actions = {

    };

    const methods = {

    };

    const thunks = {
        fetchReceiverById: (receiverId: number) => dispatch(fetchReceiverById(receiverId)),
        getFirmwareVersion: (deviceId: number, isRefresh?: boolean) => dispatch(getFirmwareVersion({ deviceId, isRefresh })),
        factoryReset: (receiverId: number) => dispatch(factoryReset(receiverId)),
        getAllChannelStatus: (deviceId: number, isRefresh?: boolean) => dispatch(getAllChannelStatus({ deviceId, isRefresh })),
        getChannelStatus: (deviceId: number, index: number, isRefresh?: boolean) => dispatch(getChannelStatus({ deviceId, index, isRefresh })),
        removeAllChannels: (deviceId: number) => dispatch(removeAllChannels(deviceId)),
    };

    return {
        //state
        ...receiver,

        //actions
        ...actions,

        //methods
        ...methods,

        //thunks
        ...thunks,
    }
}