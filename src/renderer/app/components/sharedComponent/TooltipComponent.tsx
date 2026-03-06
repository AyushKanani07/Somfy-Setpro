import { cn } from "~/lib/utils";
import { TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

const TooltipComponent = ({
  children,
  content,
  direction,
  className,
}: {
  children: ReactNode;
  content: ReactNode;
  direction: "top" | "right" | "bottom" | "left";
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={direction}
          className={cn(
            "bg-toolTipColor/80 !text-white text-scalable-10px p-1 rounded ml-1",
            className
          )}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
};

export default TooltipComponent;
