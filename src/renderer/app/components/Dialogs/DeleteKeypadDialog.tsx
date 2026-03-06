import { useKeypad } from "~/hooks/useKeypad";
import ConfirmDialog from "../sharedComponent/ConfirmDialog";
import { Trash2 } from "lucide-react";



export const DeleteKeypadDialog = () => {
    const {
        deleteKeypadDialog,
        keypadToDelete,
        closeDeleteKeypadDialog,
        deleteKeypad
    } = useKeypad();

    const handleConfirm = () => {
        if (keypadToDelete) {
            deleteKeypad(keypadToDelete);
        }
    };

    if (!keypadToDelete) return null;

    const description = `Are you sure you want to confirm this action?`;

    return (
        <ConfirmDialog
            open={deleteKeypadDialog}
            onOpenChange={closeDeleteKeypadDialog}
            title="Confirm"
            description={description}
            confirmText="Confirm"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            variant="destructive"
            icon={<Trash2 className="w-6 h-6 text-red-500" />}
        />
    );
}
