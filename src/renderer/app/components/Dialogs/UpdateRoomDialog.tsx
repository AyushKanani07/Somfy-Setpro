import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { UpdateNameForm } from "~/components/forms/UpdateNameForm";
import { useRooms } from "~/hooks/useRooms";
import { useFloor } from "~/hooks/useFloor";

function UpdateRoomDialog() {
  const {
    loading,
    updateRoomDialog,
    selectedRoom,
    closeUpdateRoomDialog,
    updateRoomThunk,
  } = useRooms();
  const { fetchFloorsThunk } = useFloor();

  const handleSubmit = async (name: string) => {
    if (!selectedRoom || !selectedRoom.id) {
      throw new Error("Room ID is missing");
    }

    await updateRoomThunk({
      room_id: selectedRoom.id,
      name,
    });
    await fetchFloorsThunk();
  };

  return (
    <Dialog
      open={updateRoomDialog}
      onOpenChange={(open) => {
        if (!open) {
          closeUpdateRoomDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Room</DialogTitle>
        </DialogHeader>
        {selectedRoom && (
          <UpdateNameForm
            initialName={selectedRoom.name}
            onSubmit={handleSubmit}
            isLoading={loading}
            entityType="room"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UpdateRoomDialog;
