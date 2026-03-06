import React, { useMemo } from "react";
import { cn } from "~/lib/utils";
import iconConfigData from "~/data/icons.json";
import type { IconConfigData } from "~/interfaces/icon";
import { Link } from "react-router";
import TooltipComponent from "../sharedComponent/TooltipComponent";
import { getIconComponent } from "~/utils/iconUtils";

const { iconConfig } = iconConfigData as IconConfigData;

export interface IconPanelProps {
  activeIcon: string;
  onIconClick: (iconId: string) => void;
  onHelpClick?: () => void;
  isMobile?: boolean;
}

export const IconPanel: React.FC<IconPanelProps> = ({
  activeIcon,
  onIconClick,
  onHelpClick,
  isMobile = false,
}) => {
  // Prepare icons once: sorted only
  const icons = useMemo(
    () => [...iconConfig].sort((a, b) => a.order - b.order),
    []
  );

  // Separate icons into top and bottom
  const topIcons = useMemo(
    () => icons.filter((icon) => icon.position === "top"),
    [icons]
  );

  const bottomIcons = useMemo(
    () => icons.filter((icon) => icon.position === "bottom"),
    [icons]
  );

  return (
    <div
      className={cn(
        isMobile
          ? "w-full bg-white flex flex-col py-4"
          : "w-12 h-full bg-iconPanelColor flex flex-col items-center py-2 border-r border-borderColor"
      )}
    >
      {/* Top Icons */}
      <div className={isMobile ? "w-full" : ""}>
        {topIcons.map((icon) => {
          const IconComponent = getIconComponent(icon.iconName);

          return (
            <TooltipComponent
              key={icon.id}
              content={icon.tooltip}
              direction={isMobile ? "top" : "right"}
            >
              <Link
                to={icon.to}
                className={cn(
                  "w-10 h-10 mb-2 rounded-md flex items-center justify-center transition-colors duration-200",
                  activeIcon === icon.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
                aria-label={icon.tooltip}
                aria-current={activeIcon === icon.id ? "page" : undefined}
              >
                {IconComponent && (
                  <>
                    <IconComponent size={isMobile ? 20 : 18} />
                    {isMobile && (
                      <span className="text-sm font-medium">
                        {icon.tooltip}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </TooltipComponent>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className={cn(isMobile ? "w-full mt-auto" : "mt-auto")}>
        {bottomIcons.map((icon) => {
          const IconComponent = getIconComponent(icon.iconName);

          return (
            <TooltipComponent
              key={icon.id}
              content={icon.tooltip}
              direction={isMobile ? "top" : "right"}
            >
              <Link
                to={icon.to}
                className={cn(
                  "w-10 h-10 mb-2 rounded-md flex items-center justify-center transition-colors duration-200",
                  activeIcon === icon.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                )}
                aria-label={icon.tooltip}
                aria-current={activeIcon === icon.id ? "page" : undefined}
              >
                {IconComponent && (
                  <>
                    <IconComponent size={isMobile ? 20 : 18} />
                    {isMobile && (
                      <span className="text-sm font-medium">
                        {icon.tooltip}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </TooltipComponent>
          );
        })}
      </div>
    </div>
  );
};
