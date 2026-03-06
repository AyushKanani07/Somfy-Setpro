import { useFloor } from "~/hooks/useFloor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import FloorAndRoomForm from "../forms/FloorAndRoomForm";

function CreateFloorDialog() {
  const { createFloorDialog, closeCreateFloorDialog } = useFloor();

  return (
    <Dialog open={createFloorDialog} onOpenChange={closeCreateFloorDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Floor</DialogTitle>
        </DialogHeader>
        <FloorAndRoomForm type="floor" />
      </DialogContent>
    </Dialog>
  );
}

export default CreateFloorDialog;
