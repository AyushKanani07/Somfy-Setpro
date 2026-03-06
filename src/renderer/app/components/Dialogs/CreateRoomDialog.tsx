import { useRooms } from "~/hooks/useRooms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import FloorAndRoomForm from "../forms/FloorAndRoomForm";

function CreateRoomDialog() {
  const { createRoomDialog, closeCreateRoomDialog } = useRooms();

  return (
    <Dialog open={createRoomDialog} onOpenChange={closeCreateRoomDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Room</DialogTitle>
        </DialogHeader>
        <FloorAndRoomForm type="room" />
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomDialog;
