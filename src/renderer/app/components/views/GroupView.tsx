import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Plus,
  ScanLine,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import CreateGroupDialog from "~/components/Dialogs/CreateGroupDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComport } from "~/hooks/useComport";
import { useGroupView } from "~/hooks/useGroupView";
import { useMotors } from "~/hooks/useMotors";
import { cn } from "~/lib/utils";
import { GroupScanningDialog } from "../Dialogs/GroupScanningDialog";
import LoaderComponent from "../sharedComponent/LoaderComponent";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { AddGroupDialog } from "../Dialogs/AddGroupDialog";
import { groupViewService } from "~/services/groupViewService";

function GroupView() {
  const {
    groups,
    groupDevices,
    currentDragItem,
    groupScanningStatus,
    fetchGroupsThunk,
    openCreateGroupDialog,
    addMotorToGroupThunk,
    fetchGroupDevicesThunk,
    createMultipleGroupDevicesThunk,
    deleteGroupDeviceThunk,
    deleteGroupThunk,
    openGroupScanningDialog,
  } = useGroupView();
  const { isComportConnected, isOfflineEditMode } = useComport();
  const { motors, multipleSelectedMotorIds } = useMotors();
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverGroupId, setDragOverGroupId] = useState<number | null>(null);
  const [removeDeviceDialog, setRemoveDeviceDialog] = useState<boolean>(false);
  const [selectedDeviceForRemoval, setSelectedDeviceForRemoval] = useState<{ groupId: number; motorId: number } | null>(null);
  const [removeGroupDialog, setRemoveGroupDialog] = useState<boolean>(false);
  const [selectedGroupForRemoval, setSelectedGroupForRemoval] = useState<number | null>(null);
  const desc_group_device = `Are you sure you want to delete the selected device from this group?`;
  const desc_group = `Are you sure you want to delete the selected group?`;
  const [addMotorsDialog, setAddMotorsDialog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [winkingGroupId, setWinkingGroupId] = useState<number | null>(null);
  const winkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const winkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchGroupsThunk();
    fetchGroupDevicesThunk();

    //cleanup
    return () => {
      if (winkIntervalRef.current) {
        clearInterval(winkIntervalRef.current);
      }
      if (winkTimeoutRef.current) {
        clearTimeout(winkTimeoutRef.current);
      }
      setWinkingGroupId(null);
    };
  }, []);

  const normalizedQuery = searchQuery.toLocaleLowerCase();

  const normalizedDevicesByGroupId = useMemo(() => {
    const map = new Map<number, { address?: string; name?: string }[]>();

    for (const gd of groupDevices) {
      const device = gd.tbl_device;

      const normalizedDevice = {
        address: device.address?.toLowerCase(),
        name: device.name?.toLowerCase()
      };

      if (!map.has(gd.group_id)) {
        map.set(gd.group_id, []);
      }

      map.get(gd.group_id)!.push(normalizedDevice);
    }

    return map;
  }, [groupDevices]);

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;

    return groups.filter(group => {
      if (group.name?.toLowerCase().includes(normalizedQuery) ||
        group.address?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      const devices = normalizedDevicesByGroupId.get(group.group_id);
      if (!devices) return false;

      return devices.some(device =>
        device.address?.toLowerCase().includes(normalizedQuery) ||
        device.name?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [groups, normalizedQuery]);

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    groupId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Set drop effect and highlight the group
    e.dataTransfer.dropEffect = "move";
    setDragOverGroupId(groupId);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    groupId: number
  ) => {
    e.stopPropagation();
    // Only clear if leaving the current drag-over group
    if (dragOverGroupId === groupId) {
      setDragOverGroupId(null);
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    groupId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGroupId(null);

    // Use Redux state as primary source, fallback to dataTransfer
    let draggedItem = currentDragItem;
    console.log("draggedItem", draggedItem);

    // Fallback to dataTransfer if Redux state is not available
    if (!draggedItem) {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        try {
          draggedItem = JSON.parse(data);
        } catch (error) {
          console.error("❌ Error parsing drag data:", error);
          return;
        }
      }
    }

    if (draggedItem) {
      try {
        // Find the target group
        const targetGroup = groups.find((g) => g.group_id === groupId);
        const targetGroupDevice = groupDevices.filter(
          (g) => g.group_id === groupId
        );

        console.log("📦 Dropped item:", draggedItem);
        console.log("🎯 Dropped on group:", {
          groupId: targetGroup?.group_id,
          groupName: targetGroup?.name,
          groupAddress: targetGroup?.address,
          currentMotorCount: targetGroupDevice?.length,
        });

        if (draggedItem.type === "room-child-device") {
          const motorId = draggedItem.deviceId;

          // Check if motor is already in this group
          if (targetGroupDevice?.some((motor) => motor.device_id === motorId)) {
            console.log("⚠️ Motor already exists in this group");
            toast.info("Motor is already in this group");
            return;
          }

          console.log("✅ Adding motor to group...");
          // await addMotorToGroupThunk({ groupId, motor: draggedItem }).unwrap();
          const response = await createMultipleGroupDevicesThunk({
            group_id: groupId,
            device_id: [draggedItem.deviceId],
          }).unwrap();
          if (response) {
            fetchGroupDevicesThunk();
          }
          console.log("✅ Motor successfully added to group!");
        }
      } catch (error) {
        console.error("❌ Error handling drop on group:", error);
      }
    }
  };

  const handleRemoveMotor = async (
    groupId: number,
    motorId: number,
  ) => {
    if (!isComportConnected) {
      toast.error("Cannot remove motor from group. Comport is not connected.");
      return;
    }
    setSelectedDeviceForRemoval({ groupId, motorId });
    setRemoveDeviceDialog(true);
  };

  const handleConfirmForRemoveMotor = async () => {
    if (!selectedDeviceForRemoval) return;

    const { groupId, motorId } = selectedDeviceForRemoval;
    await deleteGroupDeviceThunk({
      group_id: groupId,
      device_id: motorId,
    }).unwrap();

    setRemoveDeviceDialog(false);
    setSelectedDeviceForRemoval(null);
  }

  const handleRemoveGroup = async (groupId: number) => {
    if (!isComportConnected) {
      toast.error("Cannot remove motor from group. Comport is not connected.");
      return;
    }
    setSelectedGroupForRemoval(groupId);
    setRemoveGroupDialog(true);
  }

  const handleConfirmForRemoveGroup = async () => {
    if (!selectedGroupForRemoval) return;

    await deleteGroupThunk(selectedGroupForRemoval).unwrap();

    setRemoveGroupDialog(false);
    setSelectedGroupForRemoval(null);
  }

  const handleAddGroupMotors = async () => {
    if (multipleSelectedMotorIds.length === 0) {
      return toast.error("Please select at least one device.");
    }
    setLoading(true);

    const payload = {
      group_id: parseInt(selectedGroupId),
      device_id: multipleSelectedMotorIds,
    }

    try {
      const response = await createMultipleGroupDevicesThunk(payload).unwrap();
      if (response) {
        fetchGroupDevicesThunk();
      }
      setLoading(false);
      setAddMotorsDialog(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (winkIntervalRef.current) {
      clearInterval(winkIntervalRef.current);
      winkIntervalRef.current = null;
    }
    if (winkTimeoutRef.current) {
      clearTimeout(winkTimeoutRef.current);
      winkTimeoutRef.current = null;
    }

    if (winkingGroupId !== null) {
      winkIntervalRef.current = setInterval(async () => {
        try {
          const response = await groupViewService.winkGroup(winkingGroupId);
          if (response && !response.success) {
            toast.error(response.message);
          }
        } catch (error) {
          toast.error((error as Error).message || "Error winking group motors");
        }
      }, 4 * 1000);

      winkTimeoutRef.current = setTimeout(() => {
        if (winkIntervalRef.current) {
          clearInterval(winkIntervalRef.current);
          winkIntervalRef.current = null;
        }
        setWinkingGroupId(null);
      }, 10 * 60 * 1000);
    }
  }, [winkingGroupId]);

  const handleGroupMove = async (groupId: number, action: 'up' | 'down') => {
    try {
      const response = await groupViewService.groupMoveTo(groupId, action);
      if (response && response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error((error as Error).message || "Error moving group motors up");
    }
  }

  const handleGroupStop = async (groupId: number) => {
    try {
      const response = await groupViewService.groupStop(groupId);
      if (response && response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error((error as Error).message || "Error stopping group motors");
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header with Options */}
      <div className="flex items-center gap-3 p-4 border-b border-borderColor/20">
        {/* Search Groups */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Groups"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-borderColor/30 outline-none rounded-full"
          />
        </div>

        {/* Add Motor to Group */}
        <Button
          variant="outline"
          className="h-10 gap-2 text-gray-600 border-borderColor/30 rounded-full"
          disabled={!isComportConnected}
          onClick={() => setAddMotorsDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Add Motor to Group
        </Button>

        {/* Scan Group */}
        <Button
          onClick={openGroupScanningDialog}
          variant="outline"
          className="h-10 gap-2 text-gray-600 border-borderColor/30 rounded-full"
          disabled={!isComportConnected || isOfflineEditMode}
        >
          {groupScanningStatus ? (
            <LoaderComponent className="!text-iconColor" />
          ) : (
            <ScanLine className="h-4 w-4" />
          )}
          Scan Group
        </Button>

        {/* Create New Group */}
        <Button
          className="h-10 gap-2 bg-buttonColor hover:bg-buttonColor/80 text-white rounded-full"
          onClick={openCreateGroupDialog}
        >
          <Plus className="h-4 w-4" />
          Create New Group
        </Button>
      </div>

      {/* Groups List with Accordion */}
      <div className="flex-1 overflow-auto p-4">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-lg">
              {searchQuery
                ? "No groups found matching your search"
                : "No groups created yet"}
            </p>
            {!searchQuery && (
              <Button
                className="h-10 gap-2 bg-buttonColor hover:bg-buttonColor/80 text-white rounded-full mt-4"
                onClick={openCreateGroupDialog}
              >
                <Plus className="h-4 w-4" />
                Create New Group
              </Button>
            )}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {filteredGroups.map((group) => {
              const groupedDevice = groupDevices?.filter(
                (device) => device.group_id === group.group_id
              );
              return (
                <AccordionItem
                  key={group.group_id}
                  value={`group-${group.group_id}`}
                  className={cn(
                    "bg-white rounded-lg transition-all overflow-hidden",
                    dragOverGroupId === group.group_id
                      ? "border-blue-500"
                      : "border-none",
                    !isComportConnected && "opacity-60"
                  )}
                  onDragOver={(e) => handleDragOver(e, group.group_id)}
                  onDragLeave={(e) => handleDragLeave(e, group.group_id)}
                  onDrop={(e) => handleDrop(e, group.group_id)}
                >
                  <AccordionTrigger
                    key={group.group_id}
                    className={cn(
                      "hover:no-underline py-3 border-none group",
                      // groupedDevice?.length === 0 &&
                      // "pointer-events-none cursor-default"
                    )}
                    showCustomArrow={groupedDevice?.length > 0}
                  >
                    <div className="flex items-center justify-start w-full pr-2 ">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-base !text-textDarkColor")}>
                          {group.name}
                        </span>
                        <span className="text-sm text-textDarkColor">
                          ({group?.address}) (Count:{groupedDevice?.length})
                        </span>
                      </div>
                      {isComportConnected && (
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                          {/* Action buttons - you can add more icons here */}
                          {!isOfflineEditMode &&
                            <>
                              <button
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Info"
                              >
                                <div onClick={() => setWinkingGroupId(winkingGroupId === group.group_id ? null : group.group_id)}
                                  title={winkingGroupId === group.group_id ? "Stop Wink" : "Wink Motor"}
                                  className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                  <ArrowDownUp size={12} className={cn(winkingGroupId === group.group_id ? "text-yellow-400" : "text-white hover:text-yellow-400")} />
                                </div>
                              </button>
                              <button onClick={() => handleGroupMove(group.group_id, 'up')}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Up"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                  <ArrowUp size={12} className="text-white" />
                                </div>
                              </button>
                              <button onClick={() => handleGroupMove(group.group_id, 'down')}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Down"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                  <ArrowDown size={12} className="text-white" />
                                </div>
                              </button>
                              <button onClick={() => handleGroupStop(group.group_id)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Stop"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                  <Square className="text-white" size={12} />
                                </div>
                              </button>
                            </>
                          }
                          <button
                            onClick={() => {
                              handleRemoveGroup(group.group_id);
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete Group"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="!bg-white">
                    {groupedDevice?.length === 0 ? (
                      <div className="text-sm text-gray-400 py-2 pl-4">
                        No motors in this group. Drag motors here to add them.
                      </div>
                    ) : (
                      <div className="space-y-2 pl-12">
                        <div className="space-y-1">
                          {groupedDevice?.map((motor) => {
                            return (
                              <div
                                key={motor?.device_id}
                                className="flex items-center justify-start py-2 px-3 hover:bg-gray-50 rounded group"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src="/svg/motor.svg"
                                    alt="Motor Icon"
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {motor?.tbl_device?.name} (
                                    {motor?.tbl_device?.address})
                                  </span>
                                </div>
                                {isComportConnected && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                    <button
                                      className="p-1 hover:bg-red-100 rounded"
                                      title="Remove group from device"
                                      onClick={() =>
                                        handleRemoveMotor(
                                          group.group_id,
                                          motor?.device_id
                                        )
                                      }
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Dialogs */}
      <CreateGroupDialog />
      <GroupScanningDialog />

      {
        removeDeviceDialog && (
          <ConfirmDialog
            open={removeDeviceDialog}
            onOpenChange={() => setRemoveDeviceDialog(false)}
            title="Delete Device"
            description={desc_group_device}
            confirmText="Delete Device"
            cancelText="Cancel"
            onConfirm={handleConfirmForRemoveMotor}
            variant="destructive"
            icon={<Trash2 className="w-6 h-6 text-red-500" />}
          />
        )
      }

      {
        removeGroupDialog && (
          <ConfirmDialog
            open={removeGroupDialog}
            onOpenChange={() => setRemoveGroupDialog(false)}
            title="Delete Group"
            description={desc_group}
            confirmText="Delete Group"
            cancelText="Cancel"
            onConfirm={handleConfirmForRemoveGroup}
            variant="destructive"
            icon={<Trash2 className="w-6 h-6 text-red-500" />}
          />
        )
      }

      {
        addMotorsDialog && (
          <AddGroupDialog
            open={addMotorsDialog}
            loading={loading}
            selectedValue={selectedGroupId}
            title="Add to Group"
            onSelectChange={setSelectedGroupId}
            onOpenChange={setAddMotorsDialog}
            onCancel={() => setAddMotorsDialog(false)}
            onSave={handleAddGroupMotors}
          />
        )
      }
    </div>
  );
}

export default GroupView;
