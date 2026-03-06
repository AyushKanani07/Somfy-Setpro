import {
  connectComportThunk,
  disconnectComportThunk,
  fetchComportsThunk,
  setComports,
  setIsComportConnected,
} from "~/store/slices/comportSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import type { ComportItem } from "~/interfaces/comport";

export const useComport = () => {
  // Hook logic to manage comports can be added here
  const dispatch = useAppDispatch();
  const comports = useAppSelector((state) => state.comport);

  const actions = {
    // Define actions to interact with comport state here
    setComports: (comportsData: ComportItem[]) =>
      dispatch(setComports(comportsData)),

    setIsComportConnected: (isConnected: boolean, port: ComportItem | null) =>
      dispatch(setIsComportConnected({ isConnected, port })),
  };

  const thunks = {
    // Define thunks to fetch or manipulate comport data here
    fetchComportsThunk: () => dispatch(fetchComportsThunk()),
    connectComportThunk: (port: ComportItem) =>
      dispatch(connectComportThunk(port)),
    disconnectComportThunk: () => dispatch(disconnectComportThunk()),
  };

  return {
    // State
    ...comports,

    // Actions
    ...actions,

    // Thunks
    ...thunks,
  };
};
