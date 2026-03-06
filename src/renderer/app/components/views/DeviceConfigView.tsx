import { useEffect } from "react";
import { useDevice } from "~/hooks/useDevice";
import MotorDetails from "./components/deviceConfigView/motor-detail/MotorDetails";
import { RtsReceiverTransmitter } from "./components/deviceConfigView/rts-receiver-tramsmitter/RtsReceiverTransmitter";
import { Keypad } from "./components/deviceConfigView/keypad/Keypad";

function DeviceConfigView() {
  const { selectedDeviceId, selectedDeviceType } = useDevice();

  useEffect(() => {

  }, [selectedDeviceId]);

  if (!selectedDeviceId) {
    return (
      <div className="w-full h-full flex flex-col gap-1 justify-center items-center">
        <span className="text-2xl font-semibold text-textDarkColor">
          No Device Selected
        </span>
        <span className="text-textLightColor text-base font-medium">
          Select a device to view its configuration
        </span>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (selectedDeviceType) {
      case "motor":
        return <MotorDetails />;
      case "rts-receiver":
      case "rts-transmitter":
        return <RtsReceiverTransmitter />;
      case "keypad":
        return <Keypad />;
      default:
        return null;
    }
  }


  return (
    <div className="w-full h-full overflow-auto">{renderStepContent()}</div>
  );
}

export default DeviceConfigView;
