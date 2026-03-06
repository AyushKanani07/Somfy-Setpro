import { type LucideIcon } from "lucide-react";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import { cn } from "~/lib/utils";

type MotorActionIconProps = {
  Icon: LucideIcon;
  tooltip: string;

  disabled?: boolean;
  isContinuous?: boolean;

  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;

  className?: string;
  iconClassName?: string;
  iconFill?: string;
  iconSize?: number;
};

function MotorActionIcon({
  Icon,
  tooltip,
  disabled = false,
  isContinuous = false,
  onClick,
  onMouseDown,
  onMouseUp,
  className,
  iconClassName,
  iconFill,
  iconSize = 16,
}: MotorActionIconProps) {
  if (disabled) {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-full flex justify-center items-center border-2 border-borderLightColor",
          disabled && "opacity-50",
          className
        )}
      >
        <Icon
          size={iconSize}
          className={iconClassName}
          {...(iconFill ? { fill: iconFill } : {})}
        />
      </div>
    )
  }

  if (isContinuous) {
    return (
      <TooltipComponent content={tooltip} direction="top">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex justify-center items-center border-2 border-borderLightColor cursor-pointer",
            className
          )}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <Icon
            size={iconSize}
            className={iconClassName}
            {...(iconFill ? { fill: iconFill } : {})}
          />
        </div>
      </TooltipComponent>
    )
  }

  return (
    <TooltipComponent content={tooltip} direction="top">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex justify-center items-center border-2 border-borderLightColor cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <Icon
          size={iconSize}
          className={iconClassName}
          {...(iconFill ? { fill: iconFill } : {})}
        />
      </div>
    </TooltipComponent>
  );
}

export default MotorActionIcon;
