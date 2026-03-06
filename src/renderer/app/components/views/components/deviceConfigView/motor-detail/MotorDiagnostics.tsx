import { RotateCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useComport } from "~/hooks/useComport";
import { useMotors } from "~/hooks/useMotors";
import { motorService } from "~/services/motorService";

function InfoCard({ title, count }: { title: string; count: string | number }) {
  return (
    <div className="max-w-80 w-full rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="bg-slate-800 text-white min-h-[51px] max-h-[51px] flex items-center font-semibold">
        <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3">{title}</div>
      </div>
      <div>
        <div className="text-2xl m-2 font-semibold leading-tight">
          {count}
        </div>
      </div>
    </div>
  )
}


function MotorDiagnostics() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const {
    selectedMotor,
    selectedMotorId,
    getMotorMoveCountThunk,
    getMotorRevCountThunk,
    getMotorThermalCountThunk,
    getMotorObstacleCountThunk,
    getMotorPowerCutCountThunk,
    getMotorResetCountThunk,
    getMotorNetworkStatsThunk,
    getMotorNetworkErrorStatsThunk,
  } = useMotors();

  const [isStatsShow, setIsStatsShow] = useState(true);
  const [isErrorsShow, setIsErrorsShow] = useState(true);
  const [resetConfirmDialog, setResetConfirmDialog] = useState(false);

  useEffect(() => {
    if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;

    if (selectedMotor && (!selectedMotor.tbl_motor.network_stats || !selectedMotor.tbl_motor.network_error_stats)) {
      getMotorNetworkStatsThunk(selectedMotorId!);
      getMotorNetworkErrorStatsThunk(selectedMotorId!);
    }
  }, [])

  const refreshMotorData = () => {
    if (!selectedMotorId) return;

    getMotorMoveCountThunk(selectedMotorId, true);
    getMotorRevCountThunk(selectedMotorId, true);
    getMotorThermalCountThunk(selectedMotorId, true);
    getMotorObstacleCountThunk(selectedMotorId, true);
    getMotorPowerCutCountThunk(selectedMotorId, true);
    getMotorResetCountThunk(selectedMotorId, true);
  }

  const refreshNetworkData = () => {
    if (!selectedMotorId || isOfflineEditMode || !isComportConnected) return;
    getMotorNetworkStatsThunk(selectedMotorId);
    getMotorNetworkErrorStatsThunk(selectedMotorId);
  }

  const resetNetworkData = async () => {
    if (!selectedMotorId) return;

    try {
      const res = await motorService.resetNetworkStats(selectedMotorId);
      if (res.success) {
        refreshNetworkData();
        toast.success("Network stats reset successfully");
      }
    } catch (error) {
      toast.error((error as Error).message || "Failed to reset network stats");
    }
  }


  return (
    <div className="grid grid-cols-6 gap-6 w-full relative 
    after:content-[''] 
    after:absolute after:z-[1] after:top-[30px] after:left-[33%] after:bottom-0 after:-translate-x-1/2 after:border-r after:border-gray-300
    ">
      <div className="col-span-2">
        <div className="text-2xl text-center font-extrabold tracking-tight leading-none">
          Motor Data
        </div>
        <div className="text-right mt-4">
          <TooltipComponent content="Refresh" direction="top">
            <button
              disabled={!isComportConnected || isOfflineEditMode}
              onClick={refreshMotorData}
              className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
            >
              <RotateCw size={16} className="text-white" />
            </button>
          </TooltipComponent>
        </div>
        <div className="mt-16 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full align-item-center text-center">
          <InfoCard title="Total Move Count" count={selectedMotor?.tbl_motor.move_count || 0} />
          <InfoCard title="Total Revolution Count" count={selectedMotor?.tbl_motor.revolution_count || 0} />
          <InfoCard title="Thermal Count" count={selectedMotor?.tbl_motor.thermal_count || 0} />
          <InfoCard title="Post Thermal Count" count={selectedMotor?.tbl_motor.post_thermal_count || 0} />
          <InfoCard title="Obstacle Count" count={selectedMotor?.tbl_motor.obstacle_count || 0} />
          <InfoCard title="Post Obstacle Count" count={selectedMotor?.tbl_motor.post_obstacle_count || 0} />
          <InfoCard title="Power Cut Count" count={selectedMotor?.tbl_motor.power_cut_count || 0} />
          <InfoCard title="Reset Count" count={selectedMotor?.tbl_motor.reset_count || 0} />
        </div>
      </div>
      <div className="col-span-4">
        <div className="text-2xl text-center font-extrabold tracking-tight leading-none">
          Network Data
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 w-full items-center">
          <span className="pl-2 flex flex-row gap-4 items-center">
            <div className="flex flex-row gap-2 items-center">
              <Switch checked={isStatsShow} onCheckedChange={setIsStatsShow} />
              <Label>Stats</Label>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Switch checked={isErrorsShow} onCheckedChange={setIsErrorsShow} />
              <Label>Errors</Label>
            </div>
          </span>
          <span className="pr-2 ml-auto flex flex-row gap-2">
            <TooltipComponent content="Refresh" direction="top">
              <button
                disabled={!isComportConnected || isOfflineEditMode}
                onClick={refreshNetworkData}
                className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
              >
                <RotateCw size={16} className="text-white" />
              </button>
            </TooltipComponent>
            <TooltipComponent content="Reset" direction="top">
              <button
                disabled={!isComportConnected}
                onClick={() => setResetConfirmDialog(true)}
                className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </TooltipComponent>
          </span>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 w-full items-center text-center">
          {
            isStatsShow && (
              <>
                <InfoCard title="Max Retry Count" count={selectedMotor?.tbl_motor?.network_stats?.maxRetry || 0} />
                <InfoCard title="Sent Frames" count={selectedMotor?.tbl_motor?.network_stats?.sentFrames || 0} />
                <InfoCard title="Received Frames" count={selectedMotor?.tbl_motor?.network_stats?.receivedFrames || 0} />
                <InfoCard title="Seen Frames" count={selectedMotor?.tbl_motor?.network_stats?.seenFrames || 0} />
                <InfoCard title="Busy Count" count={selectedMotor?.tbl_motor?.network_stats?.busy || 0} />
                <InfoCard title="Max Slot Count" count={selectedMotor?.tbl_motor?.network_stats?.maxSlot || 0} />
                <InfoCard title="Supervision Failures Count" count={selectedMotor?.tbl_motor?.network_stats?.supervisionFailures || 0} />
              </>
            )
          }
          {
            isErrorsShow && (
              <>
                <InfoCard title="Tx Failures Count" count={selectedMotor?.tbl_motor?.network_error_stats?.txFailures || 0} />
                <InfoCard title="Collisions Count" count={selectedMotor?.tbl_motor?.network_error_stats?.collisions || 0} />
                <InfoCard title="Message Length Errors" count={selectedMotor?.tbl_motor?.network_error_stats?.messageLengthError || 0} />
                <InfoCard title="Unknown Message" count={selectedMotor?.tbl_motor?.network_error_stats?.unknownMessage || 0} />
                <InfoCard title="Rx Data Error" count={selectedMotor?.tbl_motor?.network_error_stats?.rxDataError || 0} />
                <InfoCard title="CRC Error" count={selectedMotor?.tbl_motor?.network_error_stats?.crcError || 0} />
                <InfoCard title="Bundle Size Error" count={selectedMotor?.tbl_motor?.network_error_stats?.bundleSizeError || 0} />
                <InfoCard title="Rx FIFO Full" count={selectedMotor?.tbl_motor?.network_error_stats?.rxFifoFull || 0} />
                <InfoCard title="Tx FIFO Full" count={selectedMotor?.tbl_motor?.network_error_stats?.txFifoFull || 0} />
              </>
            )
          }

        </div>
      </div>
      {
        resetConfirmDialog &&
        <ConfirmDialog
          open={resetConfirmDialog}
          onOpenChange={() => setResetConfirmDialog(false)}
          title="Reset Network stats"
          description="Are you sure you want to reset the network stats?"
          confirmText="Confirm"
          cancelText="Cancel"
          onConfirm={resetNetworkData}
          variant="destructive"
        />
      }
    </div>
  )
}

export default MotorDiagnostics;
