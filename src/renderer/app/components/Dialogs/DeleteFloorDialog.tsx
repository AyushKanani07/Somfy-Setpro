import { Trash2 } from "lucide-react";
import { useMotors } from "~/hooks/useMotors";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { useFloor } from "~/hooks/useFloor";

export default function DeleteFloorDialog() {
  const {
    deleteFloorDialog,
    floorToDelete,
    closeDeleteFloorDialog,
    deleteFloorThunk,
  } = useFloor();

  const handleConfirm = () => {
    if (floorToDelete) {
      deleteFloorThunk(floorToDelete);
    }
  };

  if (!floorToDelete) return null;

  const description = `Are you sure you want to delete floor? This action cannot be undone and will permanently remove floor from your project.`;

  return (
    <ConfirmDialog
      open={deleteFloorDialog}
      onOpenChange={closeDeleteFloorDialog}
      title="Delete Floor"
      description={description}
      confirmText="Delete Floor"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      variant="destructive"
      icon={<Trash2 className="w-6 h-6 text-red-500" />}
    />
  );
}
