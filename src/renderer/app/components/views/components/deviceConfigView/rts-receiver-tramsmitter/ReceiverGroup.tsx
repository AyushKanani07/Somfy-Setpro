import { CirclePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddGroupDialog } from "~/components/Dialogs/AddGroupDialog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useGroupView } from "~/hooks/useGroupView";
import { cn } from "~/lib/utils";

export const ReceiverGroup = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { deleteGroupDeviceThunk } = useGroupView();
    const { deviceGroup, selectedDeviceId, getGroupDeviceByIdThunk, createGroupDeviceThunk, removeDeviceFromAllGroupsThunk } = useDevice();
    const [group, setGroup] = useState<Array<{ index: number; name: string, address: string }>>([
        { index: 1, name: "", address: "" },
        { index: 2, name: "", address: "" },
        { index: 3, name: "", address: "" },
        { index: 4, name: "", address: "" },
        { index: 5, name: "", address: "" },
    ]);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteAllGroupDialogOpen, setDeleteAllGroupDialogOpen] = useState(false);
    const [addToGroupDialog, setAddToGroupDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (!isComportConnected || isOfflineEditMode || !selectedDeviceId) return;

        getGroupDeviceByIdThunk(selectedDeviceId!);

    }, [selectedDeviceId]);

    useEffect(() => {
        if (!deviceGroup) return;

        setGroup((prev) =>
            prev.map((item) => {
                const updated = deviceGroup.find(
                    (group) => group.index == item.index
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
        if (!selectedDeviceId) return;
        removeDeviceFromAllGroupsThunk(selectedDeviceId);
        setDeleteAllGroupDialogOpen(false);
    }

    const handleConfirmRemove = () => {
        if (selectedGroupIndex === null || !selectedDeviceId) return;
        const getSelectedGroupId = deviceGroup?.find(group => group.index === selectedGroupIndex)?.group_id;
        if (!getSelectedGroupId) return toast.error("Group not found for removal.");

        deleteGroupDeviceThunk({
            group_id: getSelectedGroupId,
            device_id: selectedDeviceId,
        });
        setDeleteDialogOpen(false);
    }

    const handleAddToGroup = async () => {
        if (!selectedDeviceId || selectedGroupIndex === null) return;
        if (selectedGroupId === "" || !selectedGroupId) return toast.error("Please select a group.");
        setLoading(true);

        const payload = {
            groupId: parseInt(selectedGroupId),
            deviceId: selectedDeviceId,
            index: selectedGroupIndex,
        }

        try {
            await createGroupDeviceThunk(payload).unwrap();
            setLoading(false);
            setAddToGroupDialog(false);
        } catch (error) {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col mt-2 space-y-10">
            <div className="flex justify-end sm:ml-2 space-x-3">
                <SetProButton
                    disabled={!isComportConnected}
                    buttonType="submit"
                    onClick={() => setDeleteAllGroupDialogOpen(true)}
                >
                    <Trash2 size={18} />
                    Remove from all groups
                </SetProButton>
            </div>
            <div className="flex flex-col gap-4 mx-12">
                {group.map((group, index) => (
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
                                    {group.address === ""
                                        ? <CirclePlus className="cursor-pointer"
                                            onClick={() => {
                                                setSelectedGroupIndex(group.index);
                                                setAddToGroupDialog(true)
                                            }}
                                            size={16} />
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
                            Are you sure you want to confirm this action?
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

            <Dialog open={deleteAllGroupDialogOpen} onOpenChange={setDeleteAllGroupDialogOpen}>
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
                            onClick={() => setDeleteAllGroupDialogOpen(false)}
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

            <AddGroupDialog
                open={addToGroupDialog}
                loading={loading}
                selectedValue={selectedGroupId}
                title="Add to Group"
                onSelectChange={setSelectedGroupId}
                onOpenChange={setAddToGroupDialog}
                onCancel={() => setAddToGroupDialog(false)}
                onSave={handleAddToGroup}
            />
        </div>
    )
}
