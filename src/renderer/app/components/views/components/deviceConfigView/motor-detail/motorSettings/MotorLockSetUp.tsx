import { LockKeyhole, LockKeyholeOpen, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { MotorIP } from "../motorControl/MotorIP";
import MotorGoToPosition from "../motorControl/MotorGoToPosition";
import MotorMoveToEnd from "../motorControl/MotorMoveToEnd";
import { useMotors } from "~/hooks/useMotors";
import { toast } from "sonner";
import { useComport } from "~/hooks/useComport";

function MotorLockSetUp() {
  const { isComportConnected, isOfflineEditMode } = useComport();
  const { selectedMotorId, selectedMotor, getMotorNetworkLockThunk, setMotorNetworkLockThunk } = useMotors();
  const [priority, setPriority] = useState<string>("");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIPIndex, setCurrentIPIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isComportConnected || isOfflineEditMode || !selectedMotorId) return;

    if (selectedMotor?.tbl_motor.network_lock == null) {
      getMotorNetworkLockThunk(selectedMotorId, true);
    }

  }, []);

  useEffect(() => {
    setPriority(
      selectedMotor?.tbl_motor.network_lock
        ? selectedMotor.tbl_motor.network_lock.priority.toString()
        : ""
    );
    setIsLocked(
      selectedMotor?.tbl_motor.network_lock
        ? selectedMotor.tbl_motor.network_lock.isLocked
        : false
    );
  }, [selectedMotor?.tbl_motor.network_lock]);

  const handleRefresh = () => {
    if (!selectedMotorId || isOfflineEditMode) return;
    getMotorNetworkLockThunk(selectedMotorId!, true);
  };

  const handleLockToggle = async () => {
    if (!selectedMotorId || loading) return;
    const priorityValue = Number(priority);
    if (priorityValue < 0 || priorityValue > 255) return toast.error("Priority must be between 0 and 255.");
    setLoading(true);

    const payload = {
      device_id: selectedMotorId!,
      isLocked: !isLocked,
      priority: priorityValue,
    }
    await setMotorNetworkLockThunk(payload);
    if (!isOfflineEditMode) {
      getMotorNetworkLockThunk(selectedMotorId!, true);
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-start gap-8 p-6">
      {/* Header Section */}
      <div className="grid grid-cols-12 gap-2 w-full align-item-center">
        <div className="col-span-2"></div>

        {/* Left: Lock Network Label */}
        <div className="flex items-center col-span-2">
          <h2 className="text-lg font-semibold text-textDarkColor">
            Lock Network
          </h2>
        </div>

        {/* Center: Priority Input */}
        <div className="col-span-3 flex justify-center items-center">
          <div className="flex w-52 items-center gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
            <input
              type="number"
              min={0}
              max={255}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-28 px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
              placeholder="Enter value"
              disabled={!isComportConnected}
            />
            <div
              className={cn("px-6 py-2 bg-themeBlueColor text-white font-medium",
                (!isComportConnected) && "opacity-50"
              )}
            >
              Priority
            </div>
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center justify-center">
          <button
            disabled={loading || !isComportConnected}
            onClick={handleLockToggle}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
              !isComportConnected && "opacity-50",
            )}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {
              isLocked ? <LockKeyhole size={18} /> : <LockKeyholeOpen size={18} />
            }
          </button>
          {isLocked ? "Locked" : "Unlocked"}
        </div>

        {/* Right: Lock and Refresh Icons */}
        <div className="col-span-2 flex items-start gap-3">
          <button
            disabled={!isComportConnected || isOfflineEditMode}
            onClick={handleRefresh}
            className={cn("w-10 h-10 rounded-full bg-white border-2 border-gray-300 text-gray-600 flex items-center justify-center",
              (!isComportConnected || isOfflineEditMode) ? "opacity-50" : "hover:border-gray-400 hover:rotate-180 transition-all duration-300"
            )}
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="col-span-1"></div>
      </div>

      {/* Center: 4x4 Grid of Position Buttons */}
      <div className="w-full flex flex-col 2xl:flex-row justify-center items-center">
        <MotorIP setCurrentIPIndex={setCurrentIPIndex} currentIPIndex={currentIPIndex} />
        <div className="flex flex-row h-fit max-h-[280px] justify-center items-start gap-4">
          <MotorGoToPosition />
          <MotorMoveToEnd type="normal"/>
        </div>
      </div>
    </div >
  );
}

export default MotorLockSetUp;
