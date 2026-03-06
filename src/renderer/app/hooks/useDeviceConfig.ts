import {
  setDeviceConfigActiveTab,
  type DeviceConfigTabs,
} from "~/store/slices/deviceConfigSlice";
import { useAppDispatch, useAppSelector } from "./redux";
import { useMotors } from "./useMotors";
import { useComport } from "./useComport";

export const useDeviceConfig = () => {
  const dispatch = useAppDispatch();
  const deviceConfigState = useAppSelector((state) => state.deviceConfig);
  // Custom hook logic for device configuration can be added here
  const { selectedMotor } = useMotors();
  const { isComportConnected } = useComport();
  const methods = {
    motorActionDisabled: !isComportConnected || !selectedMotor?.is_limit_set,
  };

  const actions = {
    setDeviceConfigActiveTab: (tab: DeviceConfigTabs) => {
      dispatch(setDeviceConfigActiveTab(tab));
    },
  };

  return {
    // stats
    ...deviceConfigState,

    // methods
    ...methods,

    // actions
    ...actions,
  };
};
