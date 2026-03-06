import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { cn } from "~/lib/utils";
import MotorActionIcon from "../views/components/deviceConfigView/motor-detail/motorControl/MotorActionIcon";

function ControlMoveToEnd({
    className,
    disabled = false,
    buttonLable = "Stop",
    handleMoveToTop,
    handleMoveToBottom,
    handleStop,
}: {
    disabled?: boolean;
    className?: string;
    buttonLable: string;

    handleMoveToTop: () => void;
    handleMoveToBottom: () => void;
    handleStop: () => void;
}) {

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-4 gap-8 rounded-xl border-2 border-borderLightColor bg-white">
            <MotorActionIcon
                Icon={ArrowUpToLine}
                onClick={handleMoveToTop}
                tooltip="Move to top"
                disabled={disabled}
            />
            <button
                disabled={disabled}
                onClick={handleStop}
                className="relative w-24 bg-buttonGrayColor rounded-full px-4 py-2 disabled:opacity-50"
            >
                {buttonLable}
            </button>
            <MotorActionIcon
                Icon={ArrowDownToLine}
                onClick={handleMoveToBottom}
                tooltip="Move to bottom"
                disabled={disabled}
            />
        </div>
    );
}

export default ControlMoveToEnd;
