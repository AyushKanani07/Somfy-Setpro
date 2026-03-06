import { deleteAllOfflineCommandsThunk, getAllOfflineCommandsThunk } from "~/store/slices/communicationLogSlice";
import { useAppDispatch, useAppSelector } from "./redux";


export const useCommunicationLog = () => {
    const dispatch = useAppDispatch();
    const communicationLog = useAppSelector((state) => state.communicationLog);

    //#region actions
    const actions = {

    };

    const methods = {

    };

    const thunks = {
        getAllOfflineCommands: () => dispatch(getAllOfflineCommandsThunk()),
        deleteAllOfflineCommandsThunk: () => dispatch(deleteAllOfflineCommandsThunk()),
    };

    return {
        //state
        ...communicationLog,

        //actions
        ...actions,

        //methods
        ...methods,

        //thunks
        ...thunks,
    }
}