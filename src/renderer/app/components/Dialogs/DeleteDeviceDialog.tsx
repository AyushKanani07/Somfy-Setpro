import { Trash2 } from "lucide-react";
import { useDevice } from "~/hooks/useDevice";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";

export default function DeleteDeviceDialog() {
  const {
    deleteDeviceDialog,
    selectedDeviceForDeletion,
    closeDeleteDeviceDialog,
    deleteUnassignedDevicesByIds,
    deleteAllUnassignedDevices,
  } = useDevice();

  const handleConfirm = () => {
    if (selectedDeviceForDeletion === "all") {
      deleteAllUnassignedDevices();
    } else if (typeof selectedDeviceForDeletion === "number") {
      deleteUnassignedDevicesByIds(selectedDeviceForDeletion);
    }
  };

  if (!selectedDeviceForDeletion) return null;

  const description =
    selectedDeviceForDeletion === "all"
      ? `Are you sure you want to delete all unassigned devices? This action cannot be undone and will permanently remove all unassigned devices from your project.`
      : `Are you sure you want to delete the selected device? This action cannot be undone and will permanently remove this device from your project.`;

  return (
    <ConfirmDialog
      open={deleteDeviceDialog}
      onOpenChange={closeDeleteDeviceDialog}
      title="Delete Device"
      description={description}
      confirmText="Delete Device"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      variant="destructive"
      icon={<Trash2 className="w-6 h-6 text-red-500" />}
    />
  );
}
