import * as React from "react";
import { Button, type ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import LoaderComponent from "./LoaderComponent";

interface SetProButtonProps extends Omit<ButtonProps, "variant" | "type"> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  buttonType?: "submit" | "cancel";
  variant?: ButtonProps["variant"]; // Allow manual override
  type?: ButtonProps["type"]; // HTML button type
}

const SetProButton = React.forwardRef<HTMLButtonElement, SetProButtonProps>(
  (
    {
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      children,
      disabled,
      className,
      buttonType,
      variant,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Show loading for any button when loading is true
    const shouldShowLoading = loading;
    const isDisabled = disabled;

    // Determine variant based on buttonType if not explicitly set
    const getVariant = (): ButtonProps["variant"] => {
      if (variant) return variant;

      switch (buttonType) {
        case "submit":
          return "default";
        case "cancel":
          return "outline";
        default:
          return "default";
      }
    };

    const renderIcon = () => {
      if (shouldShowLoading) {
        return <LoaderComponent />;
      }
      return icon;
    };

    const renderContent = () => {
      const text = shouldShowLoading && loadingText ? loadingText : children;
      const iconElement = renderIcon();

      if (!iconElement) {
        return text;
      }

      if (iconPosition === "right") {
        return (
          <>
            {text}
            {iconElement}
          </>
        );
      }

      return (
        <>
          {iconElement}
          {text}
        </>
      );
    };

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        variant={getVariant()}
        type={type}
        className={cn(
          "gap-2 rounded-full px-4 py-2 flex justify-center items-center shadow-none",
          shouldShowLoading && "cursor-not-allowed",
          type === "button" &&
            "bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full",
          (buttonType === "cancel" || type === "reset") &&
            "bg-transparent hover:bg-slate-200 rounded-full text-textDarkColor border border-fieldBorderColor",
          (type === "submit" || buttonType === "submit") &&
            "bg-buttonColor hover:bg-buttonColor/90 text-white",
          className
        )}
        {...props}
      >
        {renderContent()}
      </Button>
    );
  }
);

SetProButton.displayName = "SetProButton";

export { SetProButton, type SetProButtonProps };
