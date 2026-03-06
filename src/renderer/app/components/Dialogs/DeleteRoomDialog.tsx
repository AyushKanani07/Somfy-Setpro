import { Trash2 } from "lucide-react";
import { useFloor } from "~/hooks/useFloor";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { useRooms } from "~/hooks/useRooms";

export default function DeleteRoomDialog() {
  const {
    deleteRoomDialog,
    roomToDelete,
    closeDeleteRoomDialog,
    deleteRoomThunk,
  } = useRooms();

  const handleConfirm = () => {
    if (roomToDelete) {
      deleteRoomThunk(roomToDelete);
    }
  };

  if (!roomToDelete) return null;

  const description = `Are you sure you want to delete room? This action cannot be undone and will permanently remove room from your project.`;

  return (
    <ConfirmDialog
      open={deleteRoomDialog}
      onOpenChange={closeDeleteRoomDialog}
      title="Delete Room"
      description={description}
      confirmText="Delete Room"
      cancelText="Cancel"
      onConfirm={handleConfirm}
      variant="destructive"
      icon={<Trash2 className="w-6 h-6 text-red-500" />}
    />
  );
}
