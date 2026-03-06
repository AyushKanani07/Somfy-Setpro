import { EllipsisVertical, Link2, Link2Off, Plus } from "lucide-react";
import { useProject } from "~/hooks";
import CreateNewProjectDialog from "../Dialogs/CreateNewProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./../../components/ui/dropdown-menu";
import { useComport } from "~/hooks/useComport";
import { useRooms } from "~/hooks/useRooms";
import CreateFloorDialog from "../Dialogs/CreateFloorDialog";
import CreateRoomDialog from "../Dialogs/CreateRoomDialog";
import { communicationLogService } from "~/services/communicationLogService";
import { useNavigate } from "react-router";
import { disconnectSocket, socket } from "~/services/socketService";
import type { ComportItem } from "~/interfaces/comport";
import { useEffect } from "react";
import { SOCKET_COMMAND } from "~/constant/constant";
import { cn } from "~/lib/utils";
import { useCommunicationLog } from "~/hooks/useCommunicationLog";

function Header() {
  const { selectedProject, openCreateProjectDialog } = useProject();
  const {
    comports,
    isComportConnected,
    isOfflineEditMode,
    selectedComport,
    fetchComportsThunk,
    connectComportThunk,
    disconnectComportThunk,
    setIsComportConnected
  } = useComport();
  const { getAllOfflineCommands } = useCommunicationLog();
  // const { selectedNode, openCreateFloorDialog } = useFloor();
  const { openCreateRoomDialog } = useRooms();
  const navigate = useNavigate();

  const handleEdit = () => {
    openCreateProjectDialog();
  };

  useEffect(() => {
    if (isComportConnected && !isOfflineEditMode) {
      getOfflineCommands();
    }
  }, [selectedComport]);

  const getOfflineCommands = async () => {
    try {
      const response = await getAllOfflineCommands().unwrap();
      if (response.length > 0) {
        navigate("/offline-to-online");
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchComportsThunk();

    const onPortStatusHandler = (data: any) => {
      let port = null;
      if (data.isConnected) {
        port = { path: data.path };
      }
      setIsComportConnected(data.isConnected, port);
    };

    socket.on(SOCKET_COMMAND.COM_PORT.ON_PORT_STATUS, onPortStatusHandler);
    socket.emit(SOCKET_COMMAND.COM_PORT.REQUEST_PORT_STATUS);

    return () => {
      socket.off(SOCKET_COMMAND.COM_PORT.ON_PORT_STATUS, onPortStatusHandler);
    };
  }, []);


  const handleClose = async () => {
    const response = await communicationLogService.deleteCommunicationLog();
    if (response) {
      disconnectSocket();
      navigate("/");
    }
  };

  const handleComportSelect = (comportPath: ComportItem) => {
    connectComportThunk(comportPath);
  };

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fetchComportsThunk();
  };

  return (
    <div className="w-full flex justify-between items-center px-4 py-2 border-b border-b-borderColor">
      <div className="w-24">
        <img src="images/logo_somfy.svg" alt="Somfy Logo" />
      </div>

      <div className="flex justify-center items-center gap-4">
        {isComportConnected ? (
          <button
            className="flex justify-center items-center gap-2 px-5 rounded-full bg-transparent py-2 cursor-pointer"
            onClick={disconnectComportThunk}
          >
            <Link2 size={18} className={selectedComport?.path === "offline-edit" ? "text-yellow-600" : "text-green-600"} />
            <span className={cn("text-base font-semibold truncate",
              selectedComport?.path === "offline-edit" ? "text-yellow-600" : "text-green-600"
            )}>
              {selectedComport?.path == "offline-edit" ? "Offline Edit" : selectedComport?.path}
            </span>
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="outline-none focus:ring-0">
              <button className="flex justify-center items-center gap-2 px-5 rounded-full bg-transparent py-2 cursor-pointer">
                <Link2Off
                  size={18}
                  className="text-deleteButtonColor animate-pulse"
                />
                <span className="text-deleteButtonColor text-base font-semibold truncate animate-pulse">
                  Disconnected
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {comports?.map((comport) => (
                <DropdownMenuItem
                  key={comport.path}
                  className="p-3 text-textDarkColor text-base hover:bg-secondaryBackground"
                  onClick={() => handleComportSelect(comport)}
                >
                  {comport.path}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                key={"offline-edit"}
                className="p-3 text-textDarkColor text-base hover:bg-secondaryBackground"
                onClick={() => handleComportSelect({ path: "offline-edit" })}
              >
                Offline Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                key="refresh"
                onClick={handleRefreshClick}
                className="p-3 text-textDarkColor text-base hover:bg-secondaryBackground"
              >
                Refresh List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* <SetProButton type="submit" onClick={openCreateFloorDialog}>
          <Plus /> Add Floor
        </SetProButton>
        <SetProButton
          type="submit"
          disabled={selectedNode.floorId === null}
          onClick={openCreateRoomDialog}
        >
          <Plus /> Add Room
        </SetProButton> */}

        <div className="flex justify-center items-center gap-2 px-5 rounded-full bg-lightGrayColor py-2">
          <div className="text-base">🏢</div>
          <span className="text-textDarkColor text-base font-semibold truncate">
            {selectedProject?.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="cursor-pointer hover:bg-hoverGrayColor"
                title="Project Options"
              >
                <EllipsisVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleClose}
                className="text-deleteButtonColor cursor-pointer"
              >
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CreateNewProjectDialog mode="edit" />
      <CreateFloorDialog />
      <CreateRoomDialog />
    </div>
  );
}

export default Header;
