import { EllipsisVertical, Plus, TriangleAlert } from 'lucide-react';
import { FaListOl } from 'react-icons/fa';
import { Tree } from 'primereact/tree';
import type { TreeNode } from 'primereact/treenode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import DeleteFloorDialog from '~/components/Dialogs/DeleteFloorDialog';
import DeleteMotorDialog from '~/components/Dialogs/DeleteMotorDialog';
import DeleteRoomDialog from '~/components/Dialogs/DeleteRoomDialog';
import UpdateFloorDialog from '~/components/Dialogs/UpdateFloorDialog';
import UpdateMotorDialog from '~/components/Dialogs/UpdateMotorDialog';
import UpdateRoomDialog from '~/components/Dialogs/UpdateRoomDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import { ICON_WARNING_FILL_COLOR } from '~/constant/constant';
import { useComport } from '~/hooks/useComport';
import { useDevice } from '~/hooks/useDevice';
import { useFloor } from '~/hooks/useFloor';
import { useMotors } from '~/hooks/useMotors';
import { useRooms } from '~/hooks/useRooms';
import { useGroupView } from '~/hooks/useGroupView';
import type { UpdateFloorPayload } from '~/interfaces/floor';
import type { UpdateMotorPayload } from '~/interfaces/motor';
import type { UpdateRoomPayload } from '~/interfaces/room';
import { cn } from '~/lib/utils';
import { transformFloorsToTreeNodes } from '~/utils/floorTreeUtils';
import { SetProButton } from '~/components/sharedComponent/setProButton';
import { AddKeypadDialog } from '~/components/Dialogs/AddKeypadDialog';
import type { KeypadDataForEdit } from '~/interfaces/keypad';
import { useKeypad } from '~/hooks/useKeypad';
import { DeleteKeypadDialog } from '~/components/Dialogs/DeleteKeypadDialog';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { communicationLogService } from '~/services/communicationLogService';

function Sidebar() {
  const location = useLocation();
  const showCheckBoxes = location.pathname === '/group-view';
  const {
    floors,
    selectedNode,
    updateRoomFloorId,
    updateMotorRoomId,
    setSelectedNode,
    updateFloorThunk,
    fetchFloorsThunk,
    openUpdateFloorDialog,
    openDeleteFloorDialog,
    openCreateFloorDialog,
  } = useFloor();
  const { isComportConnected } = useComport();
  const {
    keypadFormDialog,
    moveDeviceToAssigned,
    setSelectedDeviceId,
    setSelectedDeviceType,
    openKeypadFormDialog,
  } = useDevice();
  const {
    updateRoomThunk,
    openUpdateRoomDialog,
    openCreateRoomDialog,
    openDeleteRoomDialog,
  } = useRooms();
  const {
    setSelectedMotorId,
    setMultipleSelectedMotorId,
    updateMotorThunk,
    openUpdateMotorDialog,
    openDeleteMotorDialog,
  } = useMotors();
  const { openDeleteKeypadDialog } = useKeypad();
  const { setCurrentDragItem, clearCurrentDragItem } = useGroupView();
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>('');
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null);
  const [editingNodeName, setEditingNodeName] = useState<string>('');
  const [dragOverRoomKey, setDragOverRoomKey] = useState<string | null>(null);
  const [draggingDeviceKey, setDraggingDeviceKey] = useState<string | null>(
    null,
  );
  const editInputRef = useRef<HTMLInputElement>(null);

  const treeNodes: TreeNode[] = transformFloorsToTreeNodes(floors);
  const defaultExpandedKeys: Record<string, boolean> = {};

  const [keypadDataForEdit, setKeypadDataForEdit] =
    useState<KeypadDataForEdit | null>(null);

  //#region handlers
  const handleClickOnEditFloor = (floorId: number, floorName: string) => {
    openUpdateFloorDialog({ id: floorId, name: floorName });
  };

  const handleDeleteFloor = (floorId: number) => {
    openDeleteFloorDialog(floorId);
  };

  const handleAddRoomToFloor = (floorId: number) => {
    openCreateRoomDialog();
  };

  const handleClickOnEditRoom = (roomId: number, roomName: string) => {
    openUpdateRoomDialog({ id: roomId, name: roomName });
  };

  const handleDeleteRoom = (roomId: number) => {
    openDeleteRoomDialog(roomId);
  };

  const handleDeleteMotor = (motorId: number) => {
    openDeleteMotorDialog(motorId);
  };

  const handleRenameMotor = (motorId: number, name: string) => {
    openUpdateMotorDialog({ id: motorId, name });
  };

  const handleEditKeypad = (keypadData: any) => {
    const payload: KeypadDataForEdit = {
      device_id: keypadData.id,
      name: keypadData.name,
      address: keypadData.address,
      key_count: keypadData.key_count,
    };
    setKeypadDataForEdit(payload);
    openKeypadFormDialog();
  };

  const handleDeleteKeypad = (keypadId: number) => {
    openDeleteKeypadDialog(keypadId);
  };

  /**
   * Initialize expanded keys with all floor-level parents expanded by default
   */
  useEffect(() => {
    treeNodes.forEach((floor) => {
      defaultExpandedKeys[floor.key as string] = true;
    });
    setExpandedKeys(defaultExpandedKeys);

    return () => {
      setMultipleSelectedMotorId([]);
      // setSelectedMotorId(null);
    };
  }, []);

  /**
   * Handle click outside to cancel editing
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingNodeKey &&
        editInputRef.current &&
        !editInputRef.current.contains(event.target as Node)
      ) {
        cancelEditingNode();
      }
    };

    if (editingNodeKey) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingNodeKey]);

  // #region Filters tree nodes based on search input
  /**
   * Filters tree nodes based on search input
   * Returns both filtered nodes and keys to expand
   */
  const { filteredTreeNodes, keysToExpand } = useMemo(() => {
    if (!filterValue.trim()) {
      return { filteredTreeNodes: treeNodes, keysToExpand: {} };
    }

    const searchTerm = filterValue.toLowerCase();
    const expandedKeysMap: Record<string, boolean> = {};

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map((node) => {
          const labelMatches =
            node.label?.toLowerCase().includes(searchTerm) || false;
          const children = node.children || [];
          const filteredChildren = filterNodes(children);
          const hasMatchingChildren = filteredChildren.length > 0;

          if (labelMatches || hasMatchingChildren) {
            // Expand node if it has matching children
            if (hasMatchingChildren) {
              expandedKeysMap[node.key as string] = true;
            }
            return {
              ...node,
              children:
                filteredChildren.length > 0 ? filteredChildren : children,
            } as TreeNode;
          }
          return null;
        })
        .filter((node): node is TreeNode => node !== null);
    };

    const filtered = filterNodes(treeNodes);
    return { filteredTreeNodes: filtered, keysToExpand: expandedKeysMap };
  }, [filterValue, treeNodes]);

  /**
   * Update expanded keys when filter results change
   */
  useEffect(() => {
    if (filterValue.trim()) {
      setExpandedKeys(keysToExpand);
    }
  }, [keysToExpand, filterValue]);

  const handleNodeSelect = (event: any) => {
    const node = event.value;
    console.log('node: ', node);
    setSelectedKey(node);
    setSelectedNode(null);

    if (typeof node === 'string') {
      if (node?.startsWith('fi:') && !node?.includes('ri:')) {
        const floorId = Number(node?.split('fi:')[1]);
        setSelectedNode({ type: 'floor', floorId });
      } else if (node?.includes('ri:') && !node?.includes('di:')) {
        const floorId = Number(node?.split('fi:')[1].split('-')[0]);
        // setSelectedNode({ type: "room", floorId });
      } else if (node?.includes('di:')) {
        const deviceId = Number(node?.split('di:')[1]);
        const floorId = Number(node?.split('fi:')[1].split('-')[0]);
        const roomId = Number(node?.split('ri:')[1].split('-')[0]);
        const deviceType =
          floors
            .find((floor) => floor.id === floorId)
            ?.child.find((room) => room.id === roomId)
            ?.child.find((device) => device.id === deviceId)?.device_type ||
          null;

        setSelectedMotorId(deviceId);
        setSelectedDeviceId(deviceId);
        setSelectedDeviceType(deviceType);
      }
    }

    if (typeof node === 'object' && node !== null) {
      const selectedDeviceIds = Object.keys(node)
        .filter((key) => key.includes('di:'))
        .map((key) => Number(key.split('di:')[1]));
      setMultipleSelectedMotorId(selectedDeviceIds);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  /**
   * Start editing a node - double click or edit trigger
   */
  const startEditingNode = (nodeKey: string, currentName: string) => {
    setEditingNodeKey(nodeKey);
    setEditingNodeName(currentName);
  };

  /**
   * Save the edited node name
   */
  const saveNodeName = async (node: TreeNode) => {
    const nodeKey = node.key as string;
    if (!editingNodeName.trim()) {
      setEditingNodeKey(null);
      return;
    }

    try {
      // Parse node key to determine type and call appropriate update function
      if (nodeKey.startsWith('fi:') && !nodeKey.includes('ri:')) {
        // Floor node - implement your API call
        const floorId = Number(nodeKey.split('fi:')[1]);
        const payload: UpdateFloorPayload = {
          floor_id: floorId,
          name: editingNodeName,
        };
        const response = await updateFloorThunk(payload).unwrap();
        if (response) {
          fetchFloorsThunk();
        }
      } else if (nodeKey.includes('ri:') && !nodeKey.includes('di:')) {
        // Room node - implement your API call
        const roomId = Number(nodeKey.split('ri:')[1]);
        const payload: UpdateRoomPayload = {
          room_id: roomId,
          name: editingNodeName,
        };
        const response = await updateRoomThunk(payload).unwrap();
        if (response) {
          fetchFloorsThunk();
        }
      } else if (nodeKey.includes('di:')) {
        // Device node - implement your API call
        const deviceId = Number(nodeKey.split('di:')[1]);
        const payload: UpdateMotorPayload = {
          motorId: deviceId,
          name: editingNodeName,
        };

        if (node.data.device_type === 'motor') {
          const response = await updateMotorThunk(payload).unwrap();
          if (response) {
            fetchFloorsThunk();
          }
        }
      }
      setEditingNodeKey(null);
    } catch (error) {
      console.error('Error updating node name:', error);
    }
  };

  /**
   * Cancel editing
   */
  const cancelEditingNode = () => {
    setEditingNodeKey(null);
    setEditingNodeName('');
  };

  /**
   * Custom node template to render custom icons for devices
   * Shows input field only when double-clicked
   */
  const nodeTemplate = (node: TreeNode) => {
    const isRoom =
      node.key?.toString().includes('ri:') &&
      !node.key?.toString().includes('di:');
    const isDevice = node.key?.toString().includes('di:');
    const isDragOverThis = dragOverRoomKey === node.key && isRoom;

    if (editingNodeKey === node.key) {
      return (
        <div className="flex gap-2 w-full">
          <input
            ref={editInputRef}
            type="text"
            value={editingNodeName}
            onChange={(e) => setEditingNodeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveNodeName(node);
              } else if (e.key === 'Escape') {
                cancelEditingNode();
              }
            }}
            className="border border-borderColor rounded px-2 py-1 text-sm flex-1 bg-transparent outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onSubmit={() => saveNodeName(node)}
          />
        </div>
      );
    }

    const type = node.data?.device_type?.toLowerCase();

    const renderDeviceIcon = () => {
      switch (type) {
        case 'motor':
          return (
            <div className="relative">
              <img
                src="/svg/motor.svg"
                alt="Motor Icon"
                className="inline-block mr-2 w-4 h-4"
              />
              {!node.data?.is_limit_set && (
                <TriangleAlert
                  size={16}
                  className="text-white absolute -top-2 -right-2 animate-pulse"
                  fill={ICON_WARNING_FILL_COLOR}
                />
              )}
            </div>
          );
        case 'keypad':
          return (
            <div>
              <img
                src="/svg/keypad.svg"
                alt="Keypad Icon"
                className="w-4 h-4 mr-1 text-iconColor"
              />
            </div>
          );
        case 'shade':
          return (
            <div>
              <img
                src="/svg/motor.svg"
                alt="Motor Icon"
                className="w-4 h-4 mr-1"
              />
            </div>
          );
        case 'controller':
          return (
            <div>
              <img
                src="/svg/controller.svg"
                alt="Controller Icon"
                className="w-4 h-4 mr-1"
              />
            </div>
          );
        default:
          return (
            <div>
              <img
                src="/svg/motor.svg"
                alt="Motor Icon"
                className="w-4 h-4 mr-1 opacity-50"
              />
            </div>
          );
      }
    };

    const dropDownItems: {
      label: string;
      action: () => void;
      show: boolean;
    }[] = (() => {
      if (isRoom) {
        return [
          {
            label: 'Edit Room',
            action: () => handleClickOnEditRoom(node.data.id, node.field ?? ''),
            show: true,
          },
          {
            label: 'Delete Room',
            action: () => handleDeleteRoom(node.data.id),
            show: true,
          },
        ];
      }
      if (isDevice) {
        const menuItems = [];
        if (node.data.device_type === 'motor') {
          menuItems.push(
            {
              label: 'Rename',
              action: () => handleRenameMotor(node.data.id, node.field ?? ''),
              show: isComportConnected,
            },
            {
              label: 'Delete Device',
              action: () => handleDeleteMotor(node.data.id),
              show: true,
            },
          );
        }

        if (node.data.device_type === 'keypad') {
          menuItems.push(
            {
              label: 'Edit Keypad',
              action: () => handleEditKeypad(node.data),
              show: true,
            },
            {
              label: 'Delete Keypad',
              action: () => handleDeleteKeypad(node.data.id),
              show: true,
            },
          );
        }
        return menuItems;
      }
      return [
        {
          label: 'Edit Floor',
          action: () => handleClickOnEditFloor(node.data.id, node.field ?? ''),
          show: true,
        },
        {
          label: 'Delete Floor',
          action: () => handleDeleteFloor(node.data.id),
          show: true,
        },
        {
          label: 'Add Room',
          action: () => handleAddRoomToFloor(node.data.id),
          show: true,
        },
      ];
    })();

    return (
      <div
        className="w-full flex justify-between items-center"
        data-tree-node-key={node.key}
        draggable={isDevice && showCheckBoxes} // Only make devices draggable when in group-view
        onDragStart={(e) => {
          if (isDevice && showCheckBoxes) {
            const deviceId = node.data.id;
            const dragData = {
              type: 'room-child-device' as const,
              deviceId: deviceId,
              deviceName: node.label as string,
              deviceType: node.data.device_type,
            };
            console.log('🚀 Dragging room child device:', dragData);

            // Set drag data in dataTransfer
            e.dataTransfer.setData(
              'application/json',
              JSON.stringify(dragData),
            );
            e.dataTransfer.effectAllowed = 'move';

            // Store in Redux state
            setCurrentDragItem(dragData);

            // Set local state for visual feedback
            setDraggingDeviceKey(node.key as string);
          }
        }}
        onDragEnd={(e) => {
          if (isDevice && showCheckBoxes) {
            console.log('✅ Drag ended for device:', node.data.id);

            // Clear Redux state
            clearCurrentDragItem();

            // Clear local state
            setDraggingDeviceKey(null);
          }
        }}
        onDoubleClick={() =>
          startEditingNode(node.key as string, node.field as string)
        }
        onDragOver={(e) => {
          if (isRoom) {
            e.preventDefault();
            e.stopPropagation();
            setDragOverRoomKey(node.key as string);
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (dragOverRoomKey === node.key) {
            setDragOverRoomKey(null);
          }
        }}
        onDrop={(e) => {
          setDragOverRoomKey(null);

          const data = e.dataTransfer.getData('text/plain');
          if (data && isRoom) {
            try {
              const draggedItem = JSON.parse(data);
              if (draggedItem.type === 'unassigned-device') {
                const targetRoomId = Number(
                  (node.key as string).split('ri:')[1],
                );
                const deviceId = draggedItem.deviceId;
                console.log(
                  '✅ Dropped device',
                  deviceId,
                  'to room',
                  targetRoomId,
                );
                // Update API
                updateMotorRoomId(deviceId, targetRoomId);
                // Update Redux state - move device from unassigned to assigned
                moveDeviceToAssigned(deviceId);
              }
            } catch (error) {
              console.error('Error handling drop on node:', error);
            }
          }
        }}
      >
        <span
          className={cn(
            'cursor-pointer px-1 rounded text-sm flex justify-start items-center gap-4',
            isDragOverThis ? 'bg-blue-100 text-blue-900 font-semibold' : '',
            draggingDeviceKey === node.key ? 'opacity-50 cursor-grabbing' : '',
          )}
        >
          {type ? renderDeviceIcon() : null}
          {node.label}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <EllipsisVertical
              size={20}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'text-iconColor absolute right-0 cursor-pointer',
                isRoom && '-right-[11px]',
                isDevice && '-right-[21px]',
              )}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropDownItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                disabled={!item.show}
                className="cursor-pointer text-textDarkColor hover:bg-secondaryBackground"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const handleDragDrop = (event: any) => {
    const dragNode = event.dragNode; // Room or device or floor
    const dropNode = event.dropNode; // Target

    // 2. Parse keys
    const dragKey = String(dragNode.key);
    const dropKey = String(dropNode.key);

    const isRoom = dragKey.includes('ri:') && !dragKey.includes('di:');
    const isDevice = dragKey.includes('di:');
    const isFloor = dragKey.startsWith('fi:') && !dragKey.includes('ri:');

    const isDropTargetFloor =
      dropKey.startsWith('fi:') && !dropKey.includes('ri:');
    const isDropTargetRoom =
      dropKey.includes('ri:') && !dropKey.includes('di:');

    // 3. Handle ROOM drag and drop to FLOOR
    if (isRoom && isDropTargetFloor) {
      // 5. Extract floor IDs
      const dragRoomId = Number(dragKey.split('ri:')[1]);
      const sourceFloorId = Number(dragKey.split('fi:')[1].split('-')[0]);
      const targetFloorId = Number(dropKey.split('fi:')[1]);

      // 6. Block dropping on same floor
      if (sourceFloorId === targetFloorId) {
        return; // no reassigning to same floor
      }

      // 7. Call API to update
      updateRoomFloorId(dragRoomId, targetFloorId);
      return;
    }

    // 4. Handle DEVICE drag and drop to ROOM
    if (isDevice && isDropTargetRoom) {
      // 5. Extract device and target room IDs
      const deviceParts = dragKey.split('-');
      const dragDeviceId = Number(deviceParts[2].split('di:')[1]);

      const dropRoomParts = dropKey.split('-');
      const targetRoomId = Number(dropRoomParts[1].split('ri:')[1]);

      // Extract source room ID from drag key
      const sourceRoomId = Number(dragKey.split('-')[1].split('ri:')[1]);

      // 6. Block dropping on same room
      if (sourceRoomId === targetRoomId) {
        return; // no reassigning to same room
      }

      // 7. Call API to update motor room
      updateMotorRoomId(dragDeviceId, targetRoomId);
      return;
    }

    // Reject all other drag operations
    return;
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const draggedItem = JSON.parse(data);
        if (draggedItem.type === 'unassigned-device') {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = 'move';
        }
      } catch (error) {
        // Not a valid JSON, ignore
      }
    }
  };

  const goToCommunicationLog = () => {
    communicationLogService.openCommunicationLogWindow();
  }

  const handleTreeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverRoomKey(null);
    // Drop handling is now done in nodeTemplate onDrop handler
  };

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="p-3 border-b border-borderColor/20">
        <Input
          placeholder="Search floors, rooms, devices..."
          value={filterValue}
          onChange={handleFilterChange}
          className="h-9 text-sm"
        />
      </div>
      <div className="flex mb-5 mt-2 px-2 flex-auto w-full">
        <div className="flex w-1/2">
          <SetProButton
            className="px-3 gap-1"
            type="submit"
            onClick={openCreateFloorDialog}
          >
            <Plus /> Add Floors
          </SetProButton>
        </div>
        <div className="flex w-1/2">
          <SetProButton
            className="px-3 gap-1"
            type="submit"
            disabled={!selectedNode}
            onClick={openCreateRoomDialog}
          >
            <Plus /> Add Rooms
          </SetProButton>
        </div>
      </div>
      <div
        className="h-full w-full overflow-y-auto"
        onDragOver={handleDragOver}
        onDrop={handleTreeDrop}
      >
        <Tree
          value={filteredTreeNodes}
          expandedKeys={expandedKeys}
          dragdropScope="room-move"
          onDragDrop={handleDragDrop}
          onToggle={(e) => setExpandedKeys(e.value as Record<string, boolean>)}
          selectionKeys={selectedKey}
          onSelectionChange={handleNodeSelect}
          selectionMode={showCheckBoxes ? 'checkbox' : 'single'}
          className="rounded-none p-0 h-full"
          nodeTemplate={nodeTemplate}
        />
      </div>
      <div className="bottom-0 relative flex flex-0 items-center justify-start h-14 px-4 md:px-3 z-49 bg-transparent print:hidden">
        <button className="" onClick={goToCommunicationLog}>
          <FaListOl />
        </button>
        <div
          onClick={goToCommunicationLog}
          className="border border-borderColor/50 rounded-full px-3 py-1 w-full ml-3 cursor-pointer"
        >
          <span>Completed</span>
          <span className="absolute right-6 top-4">
            <MdOutlineOpenInNew />
          </span>
        </div>
      </div>

      <UpdateFloorDialog />
      <UpdateRoomDialog />
      <UpdateMotorDialog />
      <DeleteMotorDialog />
      <DeleteFloorDialog />
      <DeleteRoomDialog />
      <DeleteKeypadDialog />
      {keypadDataForEdit && keypadFormDialog && (
        <AddKeypadDialog
          title="Edit Keypad"
          mode="edit"
          deviceId={keypadDataForEdit.device_id}
          defaultValues={{
            ...keypadDataForEdit,
            key_count: keypadDataForEdit.key_count.toString() as '6' | '8',
          }}
          setDataNull={setKeypadDataForEdit}
        ></AddKeypadDialog>
      )}
    </div>
  );
}

export default Sidebar;
