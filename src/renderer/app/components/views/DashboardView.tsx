import { useAppSelector } from "~/hooks/redux";
import { Button } from "~/components/ui/button";
import { ArrowDownToLine, ArrowUpToLine, Download, Edit } from "lucide-react";
import { useProject } from "~/hooks";
import CreateNewProjectDialog from "../Dialogs/CreateNewProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { ReportService } from "~/services/reportService";
import { useState } from "react";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { projectService } from "~/services/projectService";
import { ImportExportProjectDialog } from "../Dialogs/ImportExportProjectDialog";
import MotorActionIcon from "./components/deviceConfigView/motor-detail/motorControl/MotorActionIcon";
import { useComport } from "~/hooks/useComport";
import { Icons } from "../icons/Icons";
import { motorService } from "~/services/motorService";

interface ProjectStats {
  rooms: number;
  motors: number;
  keypads: number;
  groups: number;
}

function DashboardView() {
  const { isComportConnected, isOfflineEditMode } = useComport();

  const [exportSettingDialogOpen, setExportSettingDialogOpen] = useState(false);
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);

  const selectedProject = useAppSelector(
    (state) => state.project.selectedProject,
  );

  const { dashboardCount, openCreateProjectDialog } = useProject();

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please select a project first</p>
      </div>
    );
  }

  const integrationReport = async () => {
    try {
      const data = await ReportService.getReport();
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FloorPlan.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onlyExportFloorPlan = async () => {
    try {
      const data = await projectService.exportProject(
        selectedProject.project_id,
      );
      const url = window.URL.createObjectURL(data);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedProject.project_id}.somfy`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleMoveToTopAll = async () => {
    try {
      await motorService.motorMoveToAll({ function_type: "up" });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleMoveToBottomAll = async () => {
    try {
      await motorService.motorMoveToAll({ function_type: "down" });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleStopMotor = async () => {
    try {
      await motorService.stopAllMotors();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const jogAll = async () => {
    try {
      await motorService.winkAllMotors();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const sendMotorTo = async (position: number) => {
    try {
      await motorService.motorMoveToAll({
        function_type: "pos_per",
        value_position: position,
      });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const openLogs = () => {};

  const openUserGuide = () => {};

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-500 font-bold">📍</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {selectedProject.name}
              </h1>
              <p className="text-sm text-gray-500">{selectedProject.address}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={openCreateProjectDialog}
              variant="outline"
              className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Edit size={18} />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="outline-none focus:ring-0"
              >
                <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                  <Download size={18} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  key={"export"}
                  className="p-3 text-textDarkColor text-base hover:bg-secondaryBackground"
                  onClick={() => setExportSettingDialogOpen(true)}
                >
                  Export Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  key={"report"}
                  className="p-3 text-textDarkColor text-base hover:bg-secondaryBackground"
                  onClick={integrationReport}
                >
                  Integration Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-row p-10 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col gap-4 items-center justify-center min-w-72 max-w-90">
          <div className="flex flex-col gap-4 justify-center items-center">
            <MotorActionIcon
              Icon={ArrowUpToLine}
              onClick={handleMoveToTopAll}
              tooltip="Move to top"
              disabled={!isComportConnected}
              className="border-none bg-buttonColor h-14 w-14"
              iconSize={20}
            />
            <button
              disabled={!isComportConnected}
              onClick={handleStopMotor}
              className="relative w-24 bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50"
            >
              Stop
              {/* <span className="absolute top-0 right-0 left-0 w-[200px] h-1 bg-buttonGrayColor"></span> */}
            </button>
            <MotorActionIcon
              Icon={ArrowDownToLine}
              onClick={handleMoveToBottomAll}
              tooltip="Move to bottom"
              disabled={!isComportConnected}
              className="border-none bg-buttonColor h-14 w-14"
              iconSize={20}
            />
          </div>
          <button
            disabled={!isComportConnected}
            onClick={jogAll}
            className="mt-4 w-40 border font-semibold border-gray-300 rounded-full py-2 text-buttonColor hover:bg-buttonColor/5 cursor-pointer disabled:opacity-50 disabled:bg-white disabled:text-gray-400 disabled:cursor-default"
          >
            Jog All
          </button>
          <div className="text-center text-base mb-1">Send motor to</div>
          <button
            disabled={!isComportConnected}
            onClick={() => sendMotorTo(25)}
            className="w-40 mb-3 border border-gray-300 rounded-full py-2 text-black hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:bg-white disabled:text-gray-400 disabled:cursor-default"
          >
            25%
          </button>
          <button
            disabled={!isComportConnected}
            onClick={() => sendMotorTo(50)}
            className="w-40 mb-3 border border-gray-300 rounded-full py-2 text-black hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:bg-white disabled:text-gray-400 disabled:cursor-default"
          >
            50%
          </button>
          <button
            disabled={!isComportConnected}
            onClick={() => sendMotorTo(75)}
            className="w-40 mb-3 border border-gray-300 rounded-full py-2 text-black hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:bg-white disabled:text-gray-400 disabled:cursor-default"
          >
            75%
          </button>
        </div>
        <div className="flex-auto">
          <div className="flex lg:flex-row flex-col justify-between items-center p-4 gap-8 ">
            <StatCard
              icon={<Icons.motor className="h-6 w-6" />}
              label="Total Motors"
              value={dashboardCount?.motor_count || 0}
              assigned={dashboardCount?.assigned_motor_count}
              unassigned={dashboardCount?.unassigned_motor_count}
              bgColor="bg-yellow-50"
              iconBg="bg-yellow-100"
            />
            <StatCard
              icon={<Icons.keypad className="h-6 w-6" />}
              label="Total Keypad"
              value={dashboardCount?.keypad_count || 0}
              assigned={dashboardCount?.assigned_keypad_count}
              unassigned={dashboardCount?.unassigned_keypad_count}
              bgColor="bg-pink-50"
              iconBg="bg-pink-100"
            />
          </div>
          <div className="flex lg:flex-row flex-col justify-between items-center p-4 gap-8 mt-4">
            <StatCard
              icon={<Icons.floor className="h-6 w-6" />}
              label="Total Floor"
              value={dashboardCount?.floor_count || 0}
              bgColor="bg-purple-50"
              iconBg="bg-purple-100"
            />
            <StatCard
              icon={<Icons.room className="h-6 w-6" />}
              label="Total Room"
              value={dashboardCount?.room_count || 0}
              bgColor="bg-purple-50"
              iconBg="bg-purple-100"
            />
            <StatCard
              icon={<Icons.group className="h-6 w-6" />}
              label="Total Group"
              value={dashboardCount?.group_count || 0}
              bgColor="bg-green-50"
              iconBg="bg-green-100"
            />
          </div>
          <div className="flex lg:flex-row flex-col justify-between items-center p-4 gap-8 mt-4">
            <div
              className="flex items-center bg-gray-100 rounded-2xl shadow p-6 w-full mx-auto cursor-pointer"
              onClick={openLogs}
            >
              <div className="flex-1">
                <div className="flex justify-center items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    Logs
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex items-center bg-gray-100 rounded-2xl shadow p-6 w-full mx-auto cursor-pointer"
              onClick={openUserGuide}
            >
              <div className="flex-1">
                <div className="flex justify-center items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    User Guide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateNewProjectDialog mode="edit" />
      <ConfirmDialog
        open={exportSettingDialogOpen}
        onOpenChange={setExportSettingDialogOpen}
        title="Floor plan exported"
        description="Do you want to export device settings?"
        confirmText="Yes"
        cancelText="No"
        onCancel={onlyExportFloorPlan}
        onConfirm={() => setImportExportDialogOpen(true)}
        variant="destructive"
      />

      {importExportDialogOpen && (
        <ImportExportProjectDialog
          type="export"
          open={importExportDialogOpen}
          onOpenChange={setImportExportDialogOpen}
        />
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  iconBg: string;
  assigned?: number;
  unassigned?: number;
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
  iconBg,
  assigned,
  unassigned,
}: StatCardProps) {
  return (
    <div className="flex items-center rounded-2xl border border-gray-300 p-6 w-full">
      <div className="flex-shrink-0 w-14 h-14 text-white rounded-xl flex items-center justify-center text-lg mr-4 bg-[#1e293b]">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-800">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        {(assigned !== undefined || unassigned !== undefined) && (
          <div className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Assigned : </span>
            <span className="text-gray-400">{assigned || 0}</span>
            <span className="mx-1"> | </span>
            <span className="font-medium text-gray-700">Unassigned: </span>
            <span className="text-gray-400">{unassigned || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Keypad Key Component
interface KeypadKeyProps {
  label: string;
  action: string;
}

function KeypadKey({ label, action }: KeypadKeyProps) {
  return (
    <button className="w-full bg-hoverGrayColor hover:bg-gray-200 transition rounded-lg py-3 px-4 text-left">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{action}</p>
    </button>
  );
}

export default DashboardView;
