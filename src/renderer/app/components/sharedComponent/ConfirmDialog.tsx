import { AlertTriangle } from "lucide-react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import LoaderComponent from "./LoaderComponent";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  isBackdropCloseDisabled?: boolean;
  showCross?: boolean;
  isManualCloseOnConfirm?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
  isLoading = false,
  loadingText = "Processing...",
  isBackdropCloseDisabled = false,
  showCross = true,
  isManualCloseOnConfirm = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    if (!isManualCloseOnConfirm) {
      onOpenChange(false);
    }
  };

  const defaultIcon =
    variant === "destructive" ? (
      <AlertTriangle className="w-6 h-6 text-red-500" />
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCross={showCross}
        onPointerDownOutside={
          isBackdropCloseDisabled ? (e) => e.preventDefault() : undefined
        }
        onEscapeKeyDown={
          isBackdropCloseDisabled ? (e) => e.preventDefault() : undefined
        }
        className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {icon || defaultIcon}
            <DialogTitle className="text-lg font-semibold text-textGrayColor">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-textLightGrayColor mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-textGrayColor border border-borderColor bg-secondaryBackground hover:bg-secondaryBackground/80 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variant === "destructive"
              ? "text-white bg-deleteButtonColor hover:bg-deleteButtonColor/80"
              : "text-white bg-buttonColor hover:bg-buttonColor/80"
              }`}
          >
            <span className="flex flex-row gap-1">
              {isLoading && <LoaderComponent />}
              {isLoading ? loadingText : confirmText}
            </span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
