import { ChevronDown, ChevronUp } from "lucide-react";
import MotorActionIcon from "../views/components/deviceConfigView/motor-detail/motorControl/MotorActionIcon";
import MotorInputLabelComponent from "../views/components/deviceConfigView/motor-detail/motorControl/MotorInputLabelComponent";

function ControlStepMove({
    disabled = false,
    inputLableText,
    inputValue,
    setInputValue,
    handleUp,
    handleDown,
}: {
    disabled?: boolean;
    inputLableText: string;
    inputValue: string;
    setInputValue: (value: string) => void;
    handleUp: () => void;
    handleDown: () => void;
}) {

    return (
        <div className="h-full w-full flex flex-col justify-center items-center p-4 gap-8 rounded-xl border-2 border-borderLightColor bg-white">
            <MotorActionIcon
                Icon={ChevronUp}
                onClick={handleUp}
                tooltip="Move up"
                disabled={disabled}
            />
            <MotorInputLabelComponent
                value={inputValue}
                placeholder="50"
                labelText={inputLableText}
                onChange={(value) => {
                    setInputValue(value.toString());
                }}
                disabled={disabled}
            />
            <MotorActionIcon
                Icon={ChevronDown}
                onClick={handleDown}
                tooltip="Move down"
                disabled={disabled}
            />
        </div>
    );
}

export default ControlStepMove;
