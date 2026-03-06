import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { UploadFile } from "~/components/Dialogs/UploadFile";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useComport } from "~/hooks/useComport";
import { useFloor } from "~/hooks/useFloor";
import { useMotors } from "~/hooks/useMotors";
import { motorService } from "~/services/motorService";
import { projectService } from "~/services/projectService";
import { Checkbox } from 'primereact/checkbox';
import { socket } from "~/services/socketService";
import { SOCKET_COMMAND } from "~/constant/constant";
import { useDevice } from "~/hooks/useDevice";
import ActionButton from "~/components/sharedComponent/ActionButton";

interface FirmwareCommand {
  completed: number;
  total: number;
  error_msg: string;
  current_execution_msg: string;
  success_msg?: string;
}

function MotorActions() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const { fetchFloorsThunk } = useFloor();
  const { getAppVersionByDeviceIdThunk } = useDevice();
  const {
    selectedMotor,
    selectedMotorId,
    fetchMotorByIdThunk,
  } = useMotors();
  const [firmwareVersion, setFirmwareVersion] = useState<string>("");
  const [factoryResetConfirmation, setFactoryResetConfirmation] = useState(false);
  const [uploadFileDialog, setUploadFileDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorOnStart, setErrorOnStart] = useState<string>("");
  const [firmwareUpdateDialog, setFirmwareUpdateDialog] = useState(false);
  const [isBricked, setIsBricked] = useState<boolean>(false);
  const [command, setCommand] = useState<FirmwareCommand>({ completed: 0, total: 500, error_msg: "", current_execution_msg: "" });
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setErrorOnStart("");
  }, [uploadFileDialog])

  useEffect(() => {
    if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;

    if (selectedMotor?.app_version == null) {
      getAppVersionByDeviceIdThunk(selectedMotorId!, true);
    }
  }, [selectedMotor]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onUpdateStart = async () => {
    try {
      if (!selectedFile) return toast.error("No file selected for upload.");
      const res = await projectService.uploadFirmwareFile(selectedFile);
      if (!res.success) {
        throw new Error(res.message);
      }
      const updateRes = await projectService.updateFirmware({
        device_id: selectedMotorId!,
        file_name: res.data.file,
        isBricked,
      });
    } catch (error) {
      setErrorOnStart((error as Error).message || "An error occurred while starting the firmware update.");
    }
  }

  const onRetry = (isRetry: boolean) => {
    const data = {
      confirmed: isRetry,
    };
    socket.emit(SOCKET_COMMAND.FIRMWARE_UPDATE.ON_USER_ACTION, data);
    if (isRetry) {
      setCommand({ ...command, error_msg: "", current_execution_msg: "Retrying firmware update...", success_msg: "" });
    } else {
      setFirmwareUpdateDialog(false);
      setIsCompleted(false);
      setSelectedFile(null);
      setCommand({ completed: 0, total: 500, error_msg: "", current_execution_msg: "", success_msg: "" });
    }
  }

  const onConfirmWarning = (isConfirmed: boolean) => {
    const data = {
      confirmed: isConfirmed,
    };
    socket.emit(SOCKET_COMMAND.FIRMWARE_UPDATE.ON_USER_ACTION, data);
    setConfirmDialog(false);
    setWarningMessage("");
  }

  useEffect(() => {
    const firmwareInfoData = (data: any) => {
      switch (data.status) {
        case "start":
          setCommand({ ...command, current_execution_msg: "Firmware update started..." });
          setUploadFileDialog(false);
          setFirmwareUpdateDialog(true);
          break;
        case "progress":
          setCommand(prev => ({ ...prev, current_execution_msg: data.message }));
          break;
        case "error":
          setCommand(prev => ({ ...prev, error_msg: data.message, current_execution_msg: "", completed: prev.total }));
          break;
        case "warning":
          setWarningMessage(data.message);
          setConfirmDialog(true);
          break;
        case "success":
          setCommand(prev => ({ ...prev, success_msg: data.message }));
          break;
        case "completed":
          setCommand(prev => ({ ...prev, completed: prev.total, current_execution_msg: "", error_msg: "" }));
          setIsCompleted(true);
          break;
      }
    };

    const firmwareProgressData = (data: any) => {
      setCommand(prev => ({ ...prev, completed: data.completed, total: data.total }));
    };

    socket.on(SOCKET_COMMAND.FIRMWARE_UPDATE.INFO, firmwareInfoData);
    socket.on(SOCKET_COMMAND.FIRMWARE_UPDATE.PROGRESS, firmwareProgressData);

    return () => {
      socket.off(SOCKET_COMMAND.FIRMWARE_UPDATE.INFO, firmwareInfoData);
      socket.off(SOCKET_COMMAND.FIRMWARE_UPDATE.PROGRESS, firmwareProgressData);
    }
  }, []);

  const getFirmwareVersion = async () => {
    if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;
    getAppVersionByDeviceIdThunk(selectedMotorId!, true);
  }

  const handleWinkMotor = async () => {
    try {
      const response = await motorService.winkMotor({ device_id: selectedMotorId!, isACK: true });
      if (response && !response.success) {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred while winking the motor.");
    }
  }

  const setFactoryReset = async () => {
    try {
      if (!selectedMotorId) return;
      const response = await motorService.factoryResetMotor(selectedMotorId);
      if (response && !response.success) {
        throw new Error(response.message);
      }

      if (!isOfflineEditMode) {
        fetchFloorsThunk();
        fetchMotorByIdThunk(selectedMotorId);
      }

    } catch (error) {
      toast.error((error as Error).message || "An error occurred while resetting the motor.");
    }
  }

  const actions = [
    {
      icon: "/svg/check_firmware.svg",
      label: "Check Firmware",
      onClick: () => getFirmwareVersion(),
      disabled: !isComportConnected || isOfflineEditMode,
    },
    {
      icon: "/svg/update_firmware.svg",
      label: "Update Firmware",
      onClick: () => {
        setUploadFileDialog(true);
      },
      disabled: !isComportConnected || isOfflineEditMode,
    },
    {
      icon: "/svg/visual_feedback.svg",
      label: "Visual Feedback",
      onClick: () => handleWinkMotor(),
      disabled: !isComportConnected || isOfflineEditMode,
    },
    {
      icon: "/svg/factory_default.svg",
      label: "Factory Default",
      onClick: () => setFactoryResetConfirmation(true),
      disabled: !isComportConnected,
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full p-6 gap-4">
      <span>{selectedMotor?.app_version}</span>
      {/* Grid Container */}
      <div className="grid grid-cols-1 gap-4 max-w-[300px] ">
        {actions.map((action, index) => (
          <ActionButton
            disabled={action.disabled}
            key={index}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
          />
        ))}
      </div>
      {
        factoryResetConfirmation &&
        <ConfirmDialog
          open={factoryResetConfirmation}
          onOpenChange={() => setFactoryResetConfirmation(false)}
          title="Factory Reset"
          description="Are you sure you want to confirm this action?"
          confirmText="Confirm"
          cancelText="Cancel"
          onConfirm={setFactoryReset}
          variant="destructive"
        />
      }

      {
        uploadFileDialog &&

        <Dialog open={uploadFileDialog} onOpenChange={setUploadFileDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Firmware</DialogTitle>
            </DialogHeader>
            <UploadFile
              allowed_extension={['bpk']}
              onFileUpload={(file) => handleFileSelect(file)}
              onFileRemove={() => removeFile()}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <span>Recover Bricked Motor?</span>
              <Checkbox className="text-buttonColor" onChange={e => setIsBricked(!!e.checked)} checked={isBricked}></Checkbox>
              <span className="text-red-500">{errorOnStart}</span>
            </div>
            <DialogFooter>
              <SetProButton buttonType="cancel" onClick={() => setUploadFileDialog(false)}>
                Cancel
              </SetProButton>
              <SetProButton type='submit' onClick={onUpdateStart} disabled={!selectedFile}>
                Update
              </SetProButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      {
        firmwareUpdateDialog &&
        <Dialog open={firmwareUpdateDialog} onOpenChange={setFirmwareUpdateDialog}>
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Update Firmware</DialogTitle>
            </DialogHeader>
            <div className="h-5 w-full rounded-[10px] bg-[#d0d0d0] relative">
              <div className="w-0 h-full absolute z-1 top-0 left-0 rounded-[10px] transition-all duration-500"
                style={{
                  backgroundColor: command.error_msg ? 'red' : 'green',
                  width: `${(command.completed / command.total) * 100}%`,
                }}>
              </div>
            </div>
            <div className="text-lg mt-4">
              {command.success_msg && <p className="text-green-500">{command.success_msg}</p>}
              {command.current_execution_msg && <p className="text-green-500">{command.current_execution_msg}</p>}
              {command.error_msg && <p className="text-red-500">{command.error_msg}</p>}
            </div>
            <DialogFooter>
              <SetProButton
                onClick={() => onRetry(false)}
                disabled={!(command.error_msg || isCompleted)} buttonType="cancel">
                Close
              </SetProButton>
              {
                command.error_msg &&
                <SetProButton type='submit' onClick={() => onRetry(true)}>
                  Retry
                </SetProButton>
              }
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
      {
        confirmDialog &&
        <ConfirmDialog
          isBackdropCloseDisabled={true}
          open={confirmDialog}
          onOpenChange={() => setConfirmDialog(false)}
          title="Confirm Action"
          description={warningMessage}
          confirmText="Confirm"
          cancelText="Cancel"
          onConfirm={() => onConfirmWarning(true)}
          onCancel={() => onConfirmWarning(false)}
          variant="destructive"
        />
      }
    </div>
  );
}

export default MotorActions;
