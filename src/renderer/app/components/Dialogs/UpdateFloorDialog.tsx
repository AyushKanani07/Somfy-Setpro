import { UpdateNameForm } from "~/components/forms/UpdateNameForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useFloor } from "~/hooks/useFloor";

function UpdateFloorDialog() {
  const {
    loading,
    updateFloorDialog,
    selectedFloor,
    closeUpdateFloorDialog,
    updateFloorThunk,
    fetchFloorsThunk,
  } = useFloor();

  const handleSubmit = async (name: string) => {
    if (!selectedFloor || !selectedFloor.id) {
      throw new Error("Floor ID is missing");
    }

    await updateFloorThunk({
      floor_id: selectedFloor.id,
      name,
    });
  };

  return (
    <Dialog
      open={updateFloorDialog}
      onOpenChange={(open) => {
        if (!open) {
          closeUpdateFloorDialog();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Floor</DialogTitle>
        </DialogHeader>
        {selectedFloor && (
          <UpdateNameForm
            initialName={selectedFloor.name}
            onSubmit={handleSubmit}
            isLoading={loading}
            entityType="floor"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UpdateFloorDialog;
