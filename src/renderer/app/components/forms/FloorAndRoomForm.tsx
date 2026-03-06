import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { InputController } from "~/components/formControllers/InputController";
import ErrorMessage from "~/components/sharedComponent/ErrorMessage";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { useFloor } from "~/hooks/useFloor";
import { useRooms } from "~/hooks/useRooms";
import type {
  CreateFloorPayload,
  CreateMultipleFloorPayload,
} from "~/interfaces/floor";
import type {
  CreateMultipleRoomPayload,
  CreateRoomPayload,
} from "~/interfaces/room";
import {
  floorAndRoomFormSchema,
  type FloorAndRoomFormData,
} from "~/schemas/floorAndRoomSchema";

type FormMode =
  | "singleFloor"
  | "multipleFloors"
  | "singleRoom"
  | "multipleRooms";

interface FloorAndRoomFormProps {
  type: "floor" | "room";
}

function FloorAndRoomForm({ type }: FloorAndRoomFormProps) {
  const floorHook = useFloor();
  const roomsHook = useRooms();

  // Set initial form mode based on type
  const getInitialMode = (): FormMode => {
    return type === "floor" ? "singleFloor" : "singleRoom";
  };

  const [formMode, setFormMode] = useState<FormMode>(getInitialMode());
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FloorAndRoomFormData>({
    resolver: zodResolver(floorAndRoomFormSchema),
    defaultValues: {
      mode: formMode,
      floorName: "",
      numberOfFloors: "",
      floorPrefix: "",
      floorStartFrom: "",
      roomName: "",
      numberOfRooms: "",
      roomPrefix: "",
      roomStartFrom: "",
    },
  });

  // Handle form mode change
  const handleModeChange = (mode: FormMode) => {
    setFormMode(mode);
    reset(
      {
        mode,
        floorName: "",
        numberOfFloors: "",
        floorPrefix: "",
        floorStartFrom: "",
        roomName: "",
        numberOfRooms: "",
        roomPrefix: "",
        roomStartFrom: "",
      },
      { keepValues: false }
    );
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Get the modes to display based on type
  const getModes = () => {
    if (type === "floor") {
      return [
        { value: "singleFloor", label: "Single" },
        { value: "multipleFloors", label: "Multiple" },
      ];
    }
    return [
      { value: "singleRoom", label: "Single" },
      { value: "multipleRooms", label: "Multiple" },
    ];
  };

  const modes = getModes();

  // Handle form submission
  const onSubmit = async (data: FloorAndRoomFormData) => {
    // Check if floor is selected for room creation
    if (
      (data.mode === "singleRoom" || data.mode === "multipleRooms") &&
      !floorHook.selectedNode?.floorId
    ) {
      setErrorMessage("Please select a floor from the tree first");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (data.mode === "singleFloor") {
        const payload: CreateFloorPayload = {
          name: data.floorName,
        };
        await floorHook.createFloorThunk(payload);
      } else if (data.mode === "multipleFloors") {
        const payload: CreateMultipleFloorPayload = {
          no_of_floors: Number(data.numberOfFloors),
          floor_prefix: data.floorPrefix,
          start_from: Number(data.floorStartFrom),
        };
        await floorHook.createMultipleFloorsThunk(payload);
      } else if (data.mode === "singleRoom") {
        const payload: CreateRoomPayload = {
          floor_id: floorHook.selectedNode?.floorId as number,
          name: data.roomName,
        };
        const createdRoom = await roomsHook.createRoomThunk(payload).unwrap();
        if (createdRoom) {
          floorHook.fetchFloorsThunk();
        }
      } else if (data.mode === "multipleRooms") {
        const payload: CreateMultipleRoomPayload = {
          floor_id: floorHook.selectedNode?.floorId as number,
          no_of_rooms: Number(data.numberOfRooms),
          room_prefix: data.roomPrefix,
          start_from: Number(data.roomStartFrom),
        };
        const createdRooms = await roomsHook
          .createMultipleRoomsThunk(payload)
          .unwrap();
        if (createdRooms) {
          floorHook.fetchFloorsThunk();
        }
      }

      reset(
        {
          mode: data.mode,
          floorName: "",
          numberOfFloors: "",
          floorPrefix: "",
          floorStartFrom: "",
          roomName: "",
          numberOfRooms: "",
          roomPrefix: "",
          roomStartFrom: "",
        },
        { keepValues: false }
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An error occurred";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Tab Chip Mode Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value as FormMode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                formMode === mode.value
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error and Success Messages */}
      {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm animate-in fade-in-50 duration-300">
          {successMessage}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-4"
      >
        {/* Single Floor Form */}
        {formMode === "singleFloor" && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <InputController
              name="floorName"
              control={control}
              label="Floor Name"
              placeholder="Enter floor name"
              required
            />
          </div>
        )}

        {/* Multiple Floors Form */}
        {formMode === "multipleFloors" && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300 space-y-4">
            <InputController
              name="numberOfFloors"
              control={control}
              label="Number of Floors"
              type="number"
              placeholder="e.g., 5"
              required
            />
            <InputController
              name="floorPrefix"
              control={control}
              label="Floor Prefix"
              placeholder="e.g., Floor"
              required
            />
            <InputController
              name="floorStartFrom"
              control={control}
              label="Start From"
              type="number"
              placeholder="e.g., 1"
              required
            />
          </div>
        )}

        {/* Single Room Form */}
        {formMode === "singleRoom" && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300 space-y-4">
            {!floorHook.selectedNode?.floorId && (
              <ErrorMessage errorMessage="Please select a floor from the tree first" />
            )}
            <InputController
              name="roomName"
              control={control}
              label="Room Name"
              placeholder="Enter room name"
              required
              disabled={!floorHook.selectedNode?.floorId}
            />
          </div>
        )}

        {/* Multiple Rooms Form */}
        {formMode === "multipleRooms" && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300 space-y-4">
            {!floorHook.selectedNode?.floorId && (
              <ErrorMessage errorMessage="Please select a floor from the tree first" />
            )}
            <InputController
              name="numberOfRooms"
              control={control}
              label="Number of Rooms"
              type="number"
              placeholder="e.g., 3"
              required
              disabled={!floorHook.selectedNode?.floorId}
            />
            <InputController
              name="roomPrefix"
              control={control}
              label="Room Prefix"
              placeholder="e.g., Room"
              required
              disabled={!floorHook.selectedNode?.floorId}
            />
            <InputController
              name="roomStartFrom"
              control={control}
              label="Start From"
              type="number"
              placeholder="e.g., 1"
              required
              disabled={!floorHook.selectedNode?.floorId}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-2 pt-4">
          <SetProButton
            buttonType="cancel"
            onClick={() => reset()}
            disabled={isLoading}
            className="flex-1"
          >
            Reset
          </SetProButton>
          <SetProButton type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Create"}
          </SetProButton>
        </div>
      </form>
    </div>
  );
}

export default FloorAndRoomForm;
