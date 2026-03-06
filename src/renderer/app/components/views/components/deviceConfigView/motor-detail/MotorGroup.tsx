import { List, Trash2 } from "lucide-react";
import { useDeviceConfig } from "~/hooks/useDeviceConfig";
import { cn } from "~/lib/utils";
import MotorActionIcon from "./motorControl/MotorActionIcon";
import { useEffect, useState } from "react";
import { useDevice } from "~/hooks/useDevice";
import { useMotors } from "~/hooks/useMotors";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { toast } from "sonner";
import { useGroupView } from "~/hooks/useGroupView";
import { AddGroupDialog } from "~/components/Dialogs/AddGroupDialog";
import { useComport } from "~/hooks/useComport";

function MotorGroup() {
  const { isOfflineEditMode, isComportConnected } = useComport();
  const { motorActionDisabled } = useDeviceConfig();
  const { deviceGroup, getGroupDeviceByIdThunk, createGroupDeviceThunk, removeDeviceFromAllGroupsThunk } = useDevice();
  const { selectedMotorId } = useMotors();
  const { deleteGroupDeviceThunk } = useGroupView();
  const [motorGroups, setMotorGroups] = useState<Array<{ index: number; name: string, address: string }>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [addMotorsToGroupDialog, setAddMotorsToGroupDialog] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [removeFromAllGroupsDialogOpen, setRemoveFromAllGroupsDialogOpen] = useState(false);

  useEffect(() => {
    setMotorGroups([
      { index: 0, name: "", address: "" },
      { index: 1, name: "", address: "" },
      { index: 2, name: "", address: "" },
      { index: 3, name: "", address: "" },
      { index: 4, name: "", address: "" },
      { index: 5, name: "", address: "" },
      { index: 6, name: "", address: "" },
      { index: 7, name: "", address: "" },
      { index: 8, name: "", address: "" },
      { index: 9, name: "", address: "" },
      { index: 10, name: "", address: "" },
      { index: 11, name: "", address: "" },
      { index: 12, name: "", address: "" },
      { index: 13, name: "", address: "" },
      { index: 14, name: "", address: "" },
      { index: 15, name: "", address: "" },
    ]);

  }, []);

  useEffect(() => {
    if (!isComportConnected || isOfflineEditMode || !selectedMotorId) return;

    getGroupDeviceByIdThunk(selectedMotorId!);

  }, [selectedMotorId]);

  useEffect(() => {
    if (!deviceGroup) return;

    setMotorGroups((prev) =>
      prev.map((item) => {
        const updated = deviceGroup.find(
          (group) => group.index === item.index
        );
        return updated
          ? {
            ...item,
            name: updated.name,
            address: updated.address,
          }
          : {
            ...item,
            name: "",
            address: "",
          };
      })
    );
  }, [deviceGroup]);

  const handleRemoveFromAllGroups = () => {
    // Logic to remove motor from all groups
    if (!selectedMotorId) return;
    removeDeviceFromAllGroupsThunk(selectedMotorId);
    setRemoveFromAllGroupsDialogOpen(false);
  };

  const handleConfirmRemove = () => {
    if (selectedGroupIndex === null || !selectedMotorId) return;
    const getSelectedGroupId = deviceGroup?.find(group => group.index === selectedGroupIndex)?.group_id;
    if (!getSelectedGroupId) return toast.error("Group not found for removal.");

    deleteGroupDeviceThunk({
      group_id: getSelectedGroupId,
      device_id: selectedMotorId,
    });
    setDeleteDialogOpen(false);
  }

  const handleAddGroupMotors = async () => {
    if (!selectedMotorId) return;
    if (selectedGroupId === "" || !selectedGroupId) return toast.error("Please select a group.");
    setLoading(true);

    const payload = {
      groupId: parseInt(selectedGroupId),
      deviceId: selectedMotorId,
    }

    try {
      await createGroupDeviceThunk(payload).unwrap();
      setLoading(false);
      setAddMotorsToGroupDialog(false);
    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-start gap-8 px-4 pb-4">
      <div className="sticky top-0 z-20 w-full flex justify-end items-center bg-white pb-2">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setAddMotorsToGroupDialog(true)}
            disabled={motorActionDisabled}
            className="flex justify-center items-center gap-2 bg-buttonColor px-6 py-2 rounded-full disabled:opacity-50"
          >
            <List size={16} className="text-white" />
            <span className="text-white text-sm">Add to Existing Group</span>
          </button>
          <MotorActionIcon
            Icon={Trash2}
            tooltip="Remove from All Group"
            disabled={motorActionDisabled}
            onClick={() => setRemoveFromAllGroupsDialogOpen(true)}
            className="border-none bg-deleteButtonColor"
            iconClassName="text-white"
            iconFill="white"
          />
        </div>
      </div>

      <div className="w-full grid grid-cols-1 gap-2">
        {motorGroups.map((group, index) => (
          <div
            key={group.index}
            className={cn(
              "w-full h-12 px-4 bg-white shadow-md m-1 rounded-md flex justify-start items-center gap-2 text-textDarkColor border-l-8 border-buttonColor"
            )}
          >
            <div className="flex flex-row w-full">
              <span className="w-8">{index + 1}: </span>
              <div className="grid grid-cols-3 w-full items-center">
                <span>{group.name}</span>
                <span className="text-gray-500 flex justify-center">{group.address}</span>
                <span className="flex justify-end">
                  {group.name === "" || group.address === ""
                    ? ""
                    : <Trash2
                      onClick={() => {
                        setSelectedGroupIndex(group.index);
                        setDeleteDialogOpen(true);
                      }}
                      size={16}
                      className="text-red-400 cursor-pointer hover:text-red-600"
                    />
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm action
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to remove this motor from group {selectedGroupIndex}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <SetProButton
              buttonType="cancel"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </SetProButton>

            <SetProButton
              buttonType="submit"
              onClick={handleConfirmRemove}
              className="rounded-full bg-deleteButtonColor text-white hover:bg-deleteButtonColor/90"
            >
              Confirm
            </SetProButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeFromAllGroupsDialogOpen} onOpenChange={setRemoveFromAllGroupsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm action
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to confirm this action?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <SetProButton
              buttonType="cancel"
              onClick={() => setRemoveFromAllGroupsDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </SetProButton>

            <SetProButton
              buttonType="submit"
              onClick={handleRemoveFromAllGroups}
              className="rounded-full bg-deleteButtonColor text-white hover:bg-deleteButtonColor/90"
            >
              Confirm
            </SetProButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {
        addMotorsToGroupDialog && (
          <AddGroupDialog
            open={addMotorsToGroupDialog}
            loading={loading}
            selectedValue={selectedGroupId}
            title="Add to Group"
            onSelectChange={setSelectedGroupId}
            onOpenChange={setAddMotorsToGroupDialog}
            onCancel={() => setAddMotorsToGroupDialog(false)}
            onSave={handleAddGroupMotors}
          />
        )
      }
    </div>
  );
}

export default MotorGroup;
