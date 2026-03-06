import { useEffect } from "react";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useMotors } from "~/hooks/useMotors";
import { cn } from "~/lib/utils";

function MotorApplicationMode() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const {
    selectedMotor,
    selectedMotorId,
    setMotorAppModeThunk,
    getAppModeThunk,
  } = useMotors();
  const { findDeviceTypeBySubNode } = useDevice();

  useEffect(() => {
    if (!isComportConnected || isOfflineEditMode || !selectedMotorId) return;

    if (selectedMotor?.tbl_motor.app_mode == null) {
      getAppModeThunk(selectedMotorId!, true);
    }
  }, []);

  const modeType: {
    id: string;
    appMode: number;
    name: string;
    icon: string;
    show: boolean;
  }[] = [
      { id: "roller", appMode: 0, name: "Roller", icon: "/svg/roller.svg", show: findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0) !== 'glydea' },
      { id: "venetian", appMode: 1, name: "Venetian", icon: "/svg/venetian.svg", show: findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0) == 'lsu_40_ac' },
      { id: "curtain", appMode: 2, name: "Curtain", icon: "/svg/curtain.svg", show: findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0) == 'glydea' },
      { id: "tilt", appMode: 3, name: "Tilt Only", icon: "/svg/tilt.svg", show: findDeviceTypeBySubNode(selectedMotor?.sub_node_id || 0) == 'lsu_40_ac' },
    ];

  const handleModeSelect = (appMode: number) => {
    if (!selectedMotor || selectedMotor.tbl_motor.app_mode === appMode || !isComportConnected) return;
    setMotorAppModeThunk({ device_id: selectedMotor.device_id, app_mode: appMode });
  }

  return (
    <div className="w-full flex gap-10 justify-center items-center p-4 py-12">
      {modeType
        .filter((mode) => mode.show)
        .map((mode) => (
          <div
            key={mode.id}
            className="flex flex-col gap-2 justify-center items-center"
          >
            <div onClick={() => handleModeSelect(mode.appMode)}
              className={cn(
                "w-20 h-20 rounded-full flex justify-center items-center border-2 border-borderColor cursor-pointer",
                selectedMotor?.tbl_motor.app_mode === mode.appMode && "border-buttonColor"
              )}
            >
              <img
                src={mode.icon}
                alt={mode.name.toLowerCase()}
                className="w-10 h-10"
              />
            </div>
            <span className="text-textDarkColor text-base font-semibold">
              {mode.name}
            </span>
          </div>
        ))}
    </div>
  );
}

export default MotorApplicationMode;
