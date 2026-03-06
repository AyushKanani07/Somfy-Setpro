import { useAppDispatch, useAppSelector } from "./redux";
import type { KeypadItem } from "~/interfaces/keypad";
import { closeDeleteKeypadDialog, deleteKeypad, fetchKeypadById, openDeleteKeypadDialog, setKeypads } from "~/store/slices/keypadSlice";


export const useKeypad = () => {
    const dispatch = useAppDispatch();
    const keypad = useAppSelector((state) => state.keypad);

    const actions = {
        setKeypads: (keypads: KeypadItem[]) => dispatch(setKeypads(keypads)),
        openDeleteKeypadDialog: (keypadId: number) => dispatch(openDeleteKeypadDialog(keypadId)),
        closeDeleteKeypadDialog: () => dispatch(closeDeleteKeypadDialog()),
    };

    const methods = {

    };

    const thunks = {
        fetchKeypadById: (deviceId: number) => dispatch(fetchKeypadById(deviceId)),
        deleteKeypad: (deviceId: number) => dispatch(deleteKeypad(deviceId)),
    };

    return {
        //state
        ...keypad,

        //actions
        ...actions,

        //methods
        ...methods,

        //thunks
        ...thunks,
    }
}