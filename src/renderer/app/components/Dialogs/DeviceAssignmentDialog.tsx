import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TreeSelect } from "primereact/treeselect";
import type { TreeNode } from "primereact/treenode";

import { useMotors } from "~/hooks/useMotors";
import { useRooms } from "~/hooks/useRooms";
import {
  deviceAssignmentSchema,
  type DeviceAssignmentFormData,
} from "~/schemas/floorAndRoomSchema";
import { getRoomTreeNodesForSelectFromRoomData } from "~/services/commonService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "~/components/ui/dialog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import ErrorMessage from "~/components/sharedComponent/ErrorMessage";
import { useDevice } from "~/hooks/useDevice";
import { useFloor } from "~/hooks/useFloor";

function DeviceAssignmentDialog() {
  const {
    selectedDeviceForAssignment,
    deviceAssignmentDialog,
    closeDeviceAssignmentDialog,
    updateDeviceRoomIdThunk,
  } = useDevice();
  const {
    loading,
  } = useMotors();
  const { fetchFloorsThunk } = useFloor();
  const { rooms } = useRooms();
  const [roomTreeNodes, setRoomTreeNodes] = useState<TreeNode[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceAssignmentFormData>({
    resolver: zodResolver(deviceAssignmentSchema),
    defaultValues: {
      room_id: undefined,
    },
  });

  // Transform rooms data to tree nodes when component mounts or rooms change
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const nodes = getRoomTreeNodesForSelectFromRoomData(rooms);
      setRoomTreeNodes(nodes);
    }
  }, [rooms]);

  const onSubmit = async (data: DeviceAssignmentFormData) => {
    if (!selectedDeviceForAssignment) {
      console.error("Device ID is required");
      return;
    }

    const response = await updateDeviceRoomIdThunk(selectedDeviceForAssignment, data.room_id).unwrap();

    if (response) {
      reset();
      fetchFloorsThunk();
      closeDeviceAssignmentDialog();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      closeDeviceAssignmentDialog();
    }
  };

  return (
    <Dialog open={deviceAssignmentDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Assign Device to Room
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-normal text-textDarkColor">
              Select Room
            </label>
            <Controller
              name="room_id"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <TreeSelect
                    value={field.value ? `room-${field.value}` : null}
                    onChange={(e) => {
                      const roomKey = e.value as string;
                      const roomId = parseInt(roomKey.split("-")[1], 10);
                      field.onChange(roomId);
                    }}
                    options={roomTreeNodes}
                    filter
                    filterPlaceholder="Search floors, rooms..."
                    appendTo="self"
                    className="w-full text-sm"
                    placeholder="Select floor and room..."
                    showClear
                    resetFilterOnHide={true}
                    scrollHeight="300px"
                  />
                </div>
              )}
            />
            {errors.room_id && (
              <ErrorMessage
                errorMessage={errors.room_id.message || "Room is required"}
              />
            )}
          </div>

          <DialogFooter className="gap-2 mt-4">
            <SetProButton
              buttonType="cancel"
              onClick={closeDeviceAssignmentDialog}
              disabled={loading}
            >
              Cancel
            </SetProButton>
            <SetProButton
              buttonType="submit"
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Assign
            </SetProButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceAssignmentDialog;
