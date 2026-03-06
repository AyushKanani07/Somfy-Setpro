import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { SOCKET_COMMAND } from "~/constant/constant";
import { useDevice } from "~/hooks/useDevice";
import type {
  Device,
  DeviceScanningInfo,
  DeviceScanningProgress,
} from "~/interfaces/device";
import { socket } from "~/services/socketService";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { SetProButton } from "../sharedComponent/setProButton";
import { useGroupView } from "~/hooks/useGroupView";

function DeviceScanningDialog() {
  const {
    tempDeviceListWhileScanning,
    unassignedDevices,
    deviceScanningDialog,
    deviceScanningStatus,
    closeDeviceScanningDialog,
    setUnAssignedDevices,
    setDeviceScanningStatus,
    setMotorLimitForDevice,
    addNewMotor,
    setTempDeviceListWhileScanning,
  } = useDevice();
  const { openGroupScanningDialog } = useGroupView();
  const [progress, setProgress] = useState<DeviceScanningProgress | null>(null);
  // const [wantCancel, setWantCancel] = useState(false);
  const [deviceScanningCompleted, setDeviceScanningCompleted] = useState(false);
  const [foundedMotor, setFoundedMotor] = useState(0);
  const [foundMotorLimit, setFoundMotorLimit] = useState(0);
  const [foundMotorLabelCount, setFoundMotorLabelCount] = useState(0);
  const [motorInfo, setMotorInfo] = useState<
    "start" | "new_device" | "motor_limit" | "device_label" | null
  >(null);

  //#region Handlers
  const handleCancel = () => {
    socket.emit(SOCKET_COMMAND.DEVICE_DISCOVERY.STOP);
  };

  const handleCloseDialog = () => {
    closeDeviceScanningDialog();
    setDeviceScanningCompleted(false);
    setDeviceScanningStatus(false);
    setFoundedMotor(0);
    setFoundMotorLimit(0);
    setFoundMotorLabelCount(0);
    setMotorInfo(null);
    setProgress(null);
  };

  //#region Device Scanning Socket Handlers
  useEffect(() => {
    if (!deviceScanningDialog) return;
    const handleDeviceScanningInfo = (info: DeviceScanningInfo) => {
      switch (info.status) {
        case "start":
          console.log("Device scanning started.", info);
          setMotorInfo("start");
          setDeviceScanningStatus(true);
          // Save current unassignedDevices before clearing
          setTempDeviceListWhileScanning(unassignedDevices);
          // Clear unassignedDevices to show only new motors during scanning
          setUnAssignedDevices([]);
          break;

        case "progress":
          console.log("Scanning progress:", info.message);
          break;

        case "error":
          setDeviceScanningStatus(false);
          toast.error(info.message);
          break;

        case "new_device":
          if (motorInfo !== "new_device") {
            setMotorInfo("new_device");
          }
          console.log("New device found:", info);
          if (info.count) {
            setFoundedMotor(info.count);
          }
          if (info.new_device) {
            addNewMotor({
              address: info.new_device.address,
              device_id: info.new_device.device_id,
              model_no: info.new_device.model_no,
              sub_node_id: info.new_device.sub_node_id,
            });
          }
          break;

        case "motor_limit":
          if (motorInfo !== "motor_limit") {
            setMotorInfo("motor_limit");
          }
          console.log("Motor limit info:", info);
          setFoundMotorLimit((prev) => prev + 1);
          setMotorLimitForDevice(
            info.device_id ?? 0,
            info.limit?.down_limit ?? 0,
            info.limit?.up_limit ?? 0
          );
          break;

        case "device_label":
          if (motorInfo !== "device_label") {
            setMotorInfo("device_label");
          }
          console.log("Device label info:", info);
          setFoundMotorLabelCount((prev) => prev + 1);
          break;

        case "completed":
          setDeviceScanningStatus(false);
          setDeviceScanningCompleted(true);
          setTempDeviceListWhileScanning([]);
          toast.success("Device scanning completed.");
          break;

        case "stopped":
          console.log("Device scanning stopped by user.", info);
          console.log(
            "tempDeviceListWhileScanning before restore: ",
            tempDeviceListWhileScanning
          );
          setUnAssignedDevices([]);
          // Restore previous devices
          if (
            tempDeviceListWhileScanning &&
            tempDeviceListWhileScanning.length > 0
          ) {
            setUnAssignedDevices(tempDeviceListWhileScanning);
          }
          setTempDeviceListWhileScanning([]);
          // Then close dialog
          setTimeout(() => {
            handleCloseDialog();
          }, 0);
          break;

        default:
          console.log("Device scanning info:", info);
      }
    };

    const handleDeviceScanningProgress = (progress: DeviceScanningProgress) => {
      console.log("progress: ", progress);
      setProgress(progress);
    };

    socket.on(SOCKET_COMMAND.DEVICE_DISCOVERY.INFO, handleDeviceScanningInfo);

    socket.on(
      SOCKET_COMMAND.DEVICE_DISCOVERY.PROGRESS,
      handleDeviceScanningProgress
    );

    // Correct emit
    socket.emit(SOCKET_COMMAND.DEVICE_DISCOVERY.START);

    return () => {
      socket.off(
        SOCKET_COMMAND.DEVICE_DISCOVERY.INFO,
        handleDeviceScanningInfo
      );
      socket.off(
        SOCKET_COMMAND.DEVICE_DISCOVERY.PROGRESS,
        handleDeviceScanningProgress
      );
    };
  }, [deviceScanningDialog]);

  // if (wantCancel) {
  //   return (
  //     <ConfirmDialog
  //       open={wantCancel}
  //       onOpenChange={setWantCancel}
  //       title="Are you sure to want cancel device scanning ?"
  //       description="Canceling device scanning will stop the current scanning process."
  //       onConfirm={() => {
  //         handleCancel();
  //         setWantCancel(false);
  //       }}
  //       onCancel={() => setWantCancel(false)}
  //       cancelText="No"
  //       confirmText="Yes"
  //     />
  //   );
  // }

  const dialogTitles = () => {
    switch (motorInfo) {
      case "start":
        return "Available device count: " + foundedMotor;
      case "new_device":
        return `Available device count: ${foundedMotor}`;
      case "motor_limit":
        return `Fetching motor limits... ${foundMotorLimit}/${foundedMotor}`;
      case "device_label":
        return `Fetching device labels... ${foundMotorLabelCount}/${foundedMotor}`;
      default:
        return "Scanning for available devices.";
    }
  };

  const handleGroupScanConfirm = () => {
    handleCloseDialog();
    openGroupScanningDialog();
  }

  if (deviceScanningCompleted) {
    return (
      <ConfirmDialog
        open={deviceScanningCompleted}
        onOpenChange={setDeviceScanningCompleted}
        title="Group scan?"
        description="Do you wish to run a scan on the group?"
        onConfirm={handleGroupScanConfirm}
        onCancel={() => {
          handleCloseDialog();
        }}
        cancelText="No"
        confirmText="Yes"
      />
    );
  }

  return (
    <Dialog
      open={deviceScanningDialog}
      onOpenChange={(open) => {
        // Prevent closing via outside click - only close button works
        if (!open) return;
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-md border-none"
        showCross={false}
      >
        <DialogHeader className="flex justify-center items-center">
          <DialogTitle className="text-textDarkColor font-medium">
            {dialogTitles()}
          </DialogTitle>
        </DialogHeader>

        <style>{`
          @keyframes scanningGlow {
            0% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
            }
            50% {
              box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
          .scanning-glow {
            animation: scanningGlow 2s infinite;
          }
        `}</style>

        <div className="flex flex-col items-center justify-center py-8 gap-4">
          {progress && (
            <div className="flex flex-col items-center gap-6">
              {/* Circular Progress with Glow */}
              <div className="relative w-24 h-24 scanning-glow rounded-full flex items-center justify-center">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-primaryColor opacity-20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress.progress / 100)}`}
                    className="text-primaryColor transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage text in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-textDarkColor">
                    {Math.round(progress.progress)}%
                  </span>
                </div>
              </div>

              {/* Message below progress */}
              <div className="text-center">
                <p className="text-lg font-medium text-textDarkColor truncate">
                  {progress.message}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex !justify-center items-center">
          <SetProButton buttonType="cancel" onClick={handleCancel}>
            Cancel
          </SetProButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceScanningDialog;
