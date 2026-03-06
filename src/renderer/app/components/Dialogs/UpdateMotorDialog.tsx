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
import { useMotors } from "~/hooks/useMotors";
import type { UpdateMotorPayload } from "~/interfaces/motor";

function UpdateMotorDialog() {
  const {
    loading,
    updateMotorDialog,
    selectedMotorForUpdate,
    closeUpdateMotorDialog,
    updateMotorThunk,
  } = useMotors();
  const { fetchFloorsThunk } = useFloor();

  const handleSubmit = async (name: string) => {
    if (!selectedMotorForUpdate || !selectedMotorForUpdate.id) {
      throw new Error("Motor ID is missing");
    }

    const payload: UpdateMotorPayload = {
      motorId: selectedMotorForUpdate.id,
      name,
    };

    await updateMotorThunk(payload);
    await fetchFloorsThunk();
  };

  return (
    <Dialog
      open={updateMotorDialog}
      onOpenChange={(open) => {
        if (!open) {
          closeUpdateMotorDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Motor</DialogTitle>
        </DialogHeader>
        {selectedMotorForUpdate && (
          <UpdateNameForm
            initialName={selectedMotorForUpdate.name}
            onSubmit={handleSubmit}
            isLoading={loading}
            entityType="motor"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UpdateMotorDialog;
