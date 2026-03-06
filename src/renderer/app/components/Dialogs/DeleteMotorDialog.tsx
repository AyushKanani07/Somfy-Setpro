import { Trash2 } from "lucide-react";
import { useDevice } from "~/hooks/useDevice";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { useMotors } from "~/hooks/useMotors";

export default function DeleteMotorDialog() {
  const {
    deleteMotorDialog,
    motorToDelete,
    closeDeleteMotorDialog,
    deleteMotorThunk,
  } = useMotors();

  const handleConfirm = () => {
    if (motorToDelete) {
      deleteMotorThunk(motorToDelete);
    }
  };

  if (!motorToDelete) return null;

  const description = `Are you sure you want to delete motor? This action cannot be undone and will permanently remove motor from your project.`;

  return (
    <ConfirmDialog
      open={deleteMotorDialog}
      onOpenChange={closeDeleteMotorDialog}
      title="Delete Motor"
      description={description}
      confirmText="Delete Motor"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      variant="destructive"
      icon={<Trash2 className="w-6 h-6 text-red-500" />}
    />
  );
}
