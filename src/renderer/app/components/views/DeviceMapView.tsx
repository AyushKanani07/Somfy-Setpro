import {
  ArrowUpDown,
  Merge,
  Radar,
  Search,
  Settings,
  Trash,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { useDevice } from "~/hooks/useDevice";
import type { Device } from "~/interfaces/device";
import { cn } from "~/lib/utils";
import { SetProButton } from "../sharedComponent/setProButton";
import TooltipComponent from "../sharedComponent/TooltipComponent";
import DeviceAssignmentDialog from "../Dialogs/DeviceAssignmentDialog";
import { useRooms } from "~/hooks/useRooms";
import { ICON_WARNING_FILL_COLOR, SOCKET_COMMAND } from "~/constant/constant";
import DeviceScanningDialog from "../Dialogs/DeviceScanningDialog";
import { useComport } from "~/hooks/useComport";
import LoaderComponent from "../sharedComponent/LoaderComponent";
import DeleteDeviceDialog from "../Dialogs/DeleteDeviceDialog";
import { GroupScanningDialog } from "../Dialogs/GroupScanningDialog";
import { toast } from "sonner";
import { motorService } from "~/services/motorService";
import { useMotors } from "~/hooks/useMotors";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { socket } from "~/services/socketService";
import type { discoverKeypadData, keypadScanningInfo } from "~/interfaces/keypad";
import { AddKeypadDialog } from "../Dialogs/AddKeypadDialog";
import { Spinner } from "../ui/spinner";

interface GroupedDevices {
  [key: string]: Device[];
}

const DeviceMapView = () => {
  const navigate = useNavigate();
  const {
    deviceScanningStatus,
    assignedDevices,
    unassignedDevices,
    scanningType,
    keypadFormDialog,
    openDeviceAssignmentDialog,
    openDeviceScanningDialog,
    setScanningType,
    openDeleteDeviceDialog,
    openKeypadFormDialog,
    setSelectedDeviceId,
    setSelectedDeviceType
  } = useDevice();
  const {
    setSelectedMotorId
  } = useMotors();
  const { isComportConnected, isOfflineEditMode } = useComport();
  const { fetchRoomsThunk } = useRooms();
  const [winkingMotorId, setWinkingMotorId] = useState<number | null>(null);
  const winkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const winkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredDeviceId, setHoveredDeviceId] = useState<number | null>(null);
  const [openUnassignedGroups, setOpenUnassignedGroups] = useState<string[]>([]);
  const [openAssignedGroups, setOpenAssignedGroups] = useState<string[]>([]);

  const [isKeypadScanning, setIsKeypadScanning] = useState(false);
  const [discoverKeypad, setDiscoverKeypad] = useState<discoverKeypadData | null>(null);

  const handleDiscoveryCancel = () => {
    socket.emit(SOCKET_COMMAND.KEYPAD_DISCOVERY.STOP);
  }

  useEffect(() => {
    if (!isKeypadScanning) return;

    const handleKeypadInfo = (info: keypadScanningInfo) => {
      switch (info.status) {
        case 'start':
          setIsKeypadScanning(true);
          break;
        case 'stop':
          setIsKeypadScanning(false);
          break;
        case 'error':
          // setIsKeypadScanning(false);
          toast.error(info.message || "An error occurred during keypad scanning.");
          break;
        case 'discover':
          setIsKeypadScanning(false);
          setDiscoverKeypad(info.data!);
          openKeypadFormDialog();
          toast.success(info.message || "Keypad discovered.");
          break;
      }
    }

    socket.on(SOCKET_COMMAND.KEYPAD_DISCOVERY.INFO, handleKeypadInfo);

    socket.emit(SOCKET_COMMAND.KEYPAD_DISCOVERY.START);

    return () => {
      socket.off(SOCKET_COMMAND.KEYPAD_DISCOVERY.INFO, handleKeypadInfo);
    }

  }, [isKeypadScanning]);

  const handleMouseEnter = (deviceId: number) => {
    setHoveredDeviceId(deviceId);
  };

  const handleMouseLeave = () => {
    setHoveredDeviceId(null);
  };

  // Group devices by sub_node_id
  const groupDevicesBySubNodeId = (devices: Device[]): GroupedDevices => {
    return devices.reduce((acc, device) => {
      const groupKey = device.sub_node_name || device.model_name || "No Node";
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(device);
      return acc;
    }, {} as GroupedDevices);
  };

  // Filter devices based on search term
  const filterDevicesByName = (devices: Device[]): Device[] => {
    if (!searchTerm) return devices;
    return devices.filter(
      (device) =>
        device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.device_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.model_no?.toString().includes(searchTerm) ||
        device.sub_node_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        device.address?.toString().includes(searchTerm)
    );
  };

  const filteredAssigned = filterDevicesByName(assignedDevices);
  const filteredUnassigned = filterDevicesByName(unassignedDevices);

  const groupedAssigned = groupDevicesBySubNodeId(filteredAssigned);
  const groupedUnassigned = groupDevicesBySubNodeId(filteredUnassigned);

  const handleClearUnassigned = () => {
    openDeleteDeviceDialog("all");
  };

  useEffect(() => {

    // Cleanup
    return () => {
      if (winkIntervalRef.current) {
        clearInterval(winkIntervalRef.current);
        winkIntervalRef.current = null;
      }
      if (winkTimeoutRef.current) {
        clearTimeout(winkTimeoutRef.current);
        winkTimeoutRef.current = null;
      }
      setWinkingMotorId(null);
    };
  }, []);

  useEffect(() => {
    if (winkIntervalRef.current) {
      clearInterval(winkIntervalRef.current);
      winkIntervalRef.current = null;
    }
    if (winkTimeoutRef.current) {
      clearTimeout(winkTimeoutRef.current);
      winkTimeoutRef.current = null;
    }

    if (winkingMotorId !== null) {
      winkIntervalRef.current = setInterval(async () => {
        try {
          const response = await motorService.winkMotor({ device_id: winkingMotorId, isACK: true });
          if (response && !response.success) {
            toast.error(response.message);
          }
        } catch (error) {
          toast.error((error as Error).message || "An error occurred while winking the motor.");
        }
      }, 4 * 1000);

      // Stop winking after 10 minutes
      winkTimeoutRef.current = setTimeout(() => {
        if (winkIntervalRef.current) {
          clearInterval(winkIntervalRef.current);
          winkIntervalRef.current = null;
        }
        setWinkingMotorId(null);
      }, 10 * 60 * 1000);
    }

  }, [winkingMotorId]);

  const handleClickDeviceAssignDevice = (deviceId: number) => {
    openDeviceAssignmentDialog(deviceId);
    fetchRoomsThunk();
  };

  const handleClickDeleteDevice = (deviceId: number) => {
    openDeleteDeviceDialog(deviceId);
  };

  const handleClickOnDeviceSettings = (deviceId: number, deviceType: string) => {
    console.log("Open settings for device with ID:", deviceId);
    setSelectedMotorId(deviceId);
    setSelectedDeviceId(deviceId);
    setSelectedDeviceType(deviceType);
    navigate('/device-config');
  };

  const DeviceGroupSection = ({
    title,
    devices,
    groupedDevices,
  }: {
    title: string;
    devices: Device[];
    groupedDevices: GroupedDevices;
  }) => {
    const isUnassigned = title === "Unassigned Devices";
    const openGroups = isUnassigned ? openUnassignedGroups : openAssignedGroups;
    const setOpenGroups = isUnassigned
      ? setOpenUnassignedGroups
      : setOpenAssignedGroups;

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {title} ({devices.length})
          </h2>
          {title === "Unassigned Devices" && devices.length > 0 && (
            <SetProButton buttonType="submit" onClick={handleClearUnassigned}>
              <Trash fill="white" /> Clear
            </SetProButton>
          )}
        </div>

        <Accordion
          type="multiple"
          value={openGroups}
          onValueChange={setOpenGroups}
        >
          {Object.entries(groupedDevices)
            .sort(([keyA], [keyB]) => {
              if (keyA === "No Node") return 1;
              if (keyB === "No Node") return -1;
              return parseInt(keyA) - parseInt(keyB);
            })
            .map(([groupKey, groupDevices], index) => (
              <AccordionItem
                key={`${groupKey}-${index}-${title}`}
                value={groupKey}
                className="border-none"
              >
                <AccordionTrigger showCustomArrow className="py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-textDarkColor">
                      {groupKey}
                    </span>
                    <span className="text-sm text-textLightColor">
                      (Count: {groupDevices.length})
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pl-5">
                  <div>
                    {groupDevices.map((device: Device) => {
                      return (
                        <div
                          key={device.id}
                          className={cn(
                            "px-4 py-3 bg-white hover:bg-hoverGrayColor transition-colors rounded border-l-4 border-l-transparent",
                            isUnassigned
                              ? "cursor-move hover:border-l-blue-500"
                              : ""
                          )}
                          onMouseDown={(e) => e.stopPropagation()}
                          draggable={isUnassigned}
                          onDragStart={(e) => {
                            if (isUnassigned) {
                              requestAnimationFrame(() => { });

                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData(
                                "text/plain",
                                JSON.stringify({
                                  type: "unassigned-device",
                                  deviceId: device.device_id,
                                  deviceName: device.name,
                                })
                              );
                            }
                          }}
                          onMouseEnter={
                            () => handleMouseEnter(device.device_id)
                            // console.log("mouse hovered on, ", device.device_id)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-2">
                              {device.device_type === "motor" && (
                                <div className="relative">
                                  <img
                                    src="/svg/motor.svg"
                                    alt="Motor Icon"
                                    className={cn("inline-block w-5 h-5")}
                                  />
                                  {!device.is_limit_set && (
                                    <TriangleAlert
                                      size={18}
                                      className="text-white absolute -top-2.5 -right-4 animate-pulse"
                                      fill={ICON_WARNING_FILL_COLOR}
                                    />
                                  )}
                                </div>
                              )}
                              {device.device_type === "keypad" && (
                                <img
                                  src="/svg/keypad.svg"
                                  alt="Keypad Icon"
                                  className="inline-block w-5 h-5"
                                />
                              )}
                              <p
                                className={cn(
                                  "font-medium text-textDarkColor truncate",
                                  !device.is_limit_set && "ml-4"
                                )}
                              >
                                {device.name} {`(${device.address})`}
                              </p>
                            </div>

                            {/* Device options */}
                            <div className="justify-center items-center gap-2 flex">
                              {/* wink motor - visible on hover or when winked */}
                              {device.device_type === "motor" &&
                                isComportConnected && !isOfflineEditMode && isUnassigned &&
                                (hoveredDeviceId === device.device_id ||
                                  winkingMotorId === device.device_id) && (
                                  <TooltipComponent
                                    content={winkingMotorId === device.device_id ? "Stop Wink" : "Wink Motor"}
                                    direction="top"
                                  >
                                    <ArrowUpDown
                                      size={18}
                                      className={cn(
                                        "cursor-pointer",
                                        winkingMotorId === device.device_id
                                          ? "text-primaryColor"
                                          : "text-iconColor hover:text-primaryColor"
                                      )}
                                      onClick={() =>
                                        setWinkingMotorId(winkingMotorId === device.device_id ? null : device.device_id)
                                      }
                                    />
                                  </TooltipComponent>
                                )}

                              {/* assign device - visible on hover */}
                              {hoveredDeviceId === device.device_id &&
                                isUnassigned && (
                                  <TooltipComponent
                                    content="Assign device to room"
                                    direction="top"
                                  >
                                    <Merge
                                      size={18}
                                      className="text-iconColor cursor-pointer hover:text-primaryColor"
                                      onClick={() =>
                                        handleClickDeviceAssignDevice(
                                          device.device_id
                                        )
                                      }
                                    />
                                  </TooltipComponent>
                                )}

                              {/* delete device - visible on hover */}
                              {hoveredDeviceId === device.device_id &&
                                isUnassigned && (
                                  <TooltipComponent
                                    content="Remove device"
                                    direction="top"
                                  >
                                    <Trash
                                      size={18}
                                      className="text-iconColor cursor-pointer hover:text-deleteButtonColor"
                                      onClick={() =>
                                        handleClickDeleteDevice(
                                          device.device_id
                                        )
                                      }
                                    />
                                  </TooltipComponent>
                                )}

                              {/* device settings - visible on hover */}
                              {hoveredDeviceId === device.device_id &&
                                isUnassigned && (
                                  <TooltipComponent
                                    content="Device settings"
                                    direction="top"
                                  >
                                    <Settings
                                      size={18}
                                      className="text-iconColor cursor-pointer hover:text-primaryColor"
                                      onClick={() =>
                                        handleClickOnDeviceSettings(
                                          device.device_id, device.device_type
                                        )
                                      }
                                    />
                                  </TooltipComponent>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    );
  };

  return (
    <div
      className="h-full overflow-auto bg-white"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="sticky top-0 bg-white p-4 z-10">
        <div className="flex justify-start gap-3">
          <div className="w-1/2 flex justify-start items-center rounded-full border border-borderColor">
            <Search size={16} className="ml-3 text-iconColor" />
            <Input
              type="text"
              placeholder="Search devices"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none outline-none focus:ring-0 focus:outline-none focus-visible:border-none focus-visible:ring-0"
            />
          </div>
          <SetProButton
            type="button"
            onClick={() => {
              openDeviceScanningDialog();
              setScanningType("device");
            }}
            disabled={!isComportConnected || isOfflineEditMode}
          >
            {deviceScanningStatus && scanningType === "device" ? (
              <LoaderComponent className="!text-iconColor" />
            ) : (
              <Radar />
            )}
            Scan Device
          </SetProButton>
          <SetProButton
            onClick={() => setIsKeypadScanning(true)}
            type="button" disabled={!isComportConnected || isOfflineEditMode}>
            <Radar />
            Scan Keypad
          </SetProButton>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-6">
          <DeviceGroupSection
            title="Unassigned Devices"
            devices={filteredUnassigned}
            groupedDevices={groupedUnassigned}
          />
          <div className="w-px bg-gray-300"></div>
          <DeviceGroupSection
            title="Assigned Devices"
            devices={filteredAssigned}
            groupedDevices={groupedAssigned}
          />
        </div>
      </div>

      <DeviceAssignmentDialog />
      <DeviceScanningDialog />
      <DeleteDeviceDialog />
      <GroupScanningDialog />

      {
        isKeypadScanning && (
          <Dialog
            open={isKeypadScanning}
            onOpenChange={setIsKeypadScanning}
          >
            <DialogContent className="max-w-[360px] h-[500px]" showCross={false}
              onPointerDownOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <div className="w-[300px] flex flex-col justify-center items-center mx-auto">
                <Spinner className="size-10 text-buttonColor" />
                <div className="text-xl font-semibold p-4 leading-tight">Scanning Keypad</div>
                <img src="/public/scan_keypad.gif" alt="Local Loading GIF" style={{ width: 160, height: 180 }} />
              </div>
              <DialogFooter className="flex mx-auto">
                <SetProButton className="text-buttonColor bg-buttonColor/10 hover:bg-buttonColor/20 hover:text-buttonColor" buttonType="cancel" onClick={handleDiscoveryCancel}>
                  Stop
                </SetProButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }

      {
        discoverKeypad && keypadFormDialog && (
          <AddKeypadDialog title="Add Keypad" mode="add" defaultValues={{
            ...discoverKeypad,
            key_count: discoverKeypad.key_count.toString() as "6" | "8"
          }} setDataNull={setDiscoverKeypad}></AddKeypadDialog>
        )

      }
    </div>
  );
};

export default DeviceMapView;
