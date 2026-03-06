import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import type { discoverKeypadData } from "~/interfaces/keypad"
import { keypadFormSchema, type KeypadFormValues } from "~/schemas/keypadSchema";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useDevice } from "~/hooks/useDevice";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { keypadService } from "~/services/keypad.Service";
import { toast } from "sonner";
import { useFloor } from "~/hooks/useFloor";
import { useKeypad } from "~/hooks/useKeypad";

type KeypadDialogProps = {
    defaultValues: {
        address: string;
        name: string;
        key_count: "6" | "8";
    };
    title: string;
    mode: "add" | "edit";
    deviceId?: number;
    setDataNull?: (data: null) => void;
}

export const AddKeypadDialog = (
    { defaultValues, title, mode, deviceId, setDataNull }: KeypadDialogProps
) => {
    const {
        keypadFormDialog,
        loading,
        closeKeypadFormDialog,
        fetchUnassignedDevices,
    } = useDevice();
    const { fetchKeypadById } = useKeypad();
    const { fetchFloorsThunk } = useFloor();

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<KeypadFormValues>({
        resolver: zodResolver(keypadFormSchema),
        defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const onSubmit = async (data: KeypadFormValues) => {
        if (mode === "edit") {
            updateKeypad(data);
        }
        else if (mode === "add") {
            addKeypad(data);
        }
    }

    const addKeypad = async (data: KeypadFormValues) => {
        const payload: discoverKeypadData = {
            name: data.name,
            address: data.address,
            key_count: parseInt(data.key_count, 10),
        }
        try {
            const response = await keypadService.addKeypad(payload);
            if (response.success) {
                toast.success("Keypad added successfully.");
                closeKeypadFormDialog();
                setDataNull?.(null);
                fetchUnassignedDevices();
            } else {
                throw new Error(response.message || "Failed to add keypad.");
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to add keypad.");
            return;
        }
    }

    const updateKeypad = async (data: KeypadFormValues) => {
        if (!deviceId) return toast.error("Device ID is missing for edit mode.");
        try {
            const payload = {
                name: data.name,
                key_count: parseInt(data.key_count, 10),
            }
            const response = await keypadService.editKeypad(deviceId, payload);
            if (response.success) {
                toast.success("Keypad updated successfully.");
                closeKeypadFormDialog();
                setDataNull?.(null);
                fetchFloorsThunk();
                fetchKeypadById(deviceId);
            } else {
                throw new Error(response.message || "Failed to update keypad.");
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to update keypad.");
            return;
        }
    }

    return (
        <Dialog open={keypadFormDialog} onOpenChange={closeKeypadFormDialog}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-4 py-4">
                        {/* Name Field */}
                        {mode === "add" && (
                            <div className="grid gap-2">
                                <Label htmlFor="address">
                                    Address <span className="text-red-500">*</span>
                                </Label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Group Address"
                                    {...register("address")}
                                    className="border p-2 w-full disabled:bg-gray-100"
                                    readOnly
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                                )}
                            </div>
                        )}

                        {/* keypad Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <input
                                type="text"
                                placeholder="Keypad Name"
                                {...register("name")}
                                className="border p-2 w-full"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Key Count */}
                        <div className="flex flex-row gap-2">
                            <Label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="6"
                                    {...register("key_count")}
                                />
                                6 Key
                            </Label>
                            <Label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    value="8"
                                    {...register("key_count")}
                                />
                                8 Key
                            </Label>
                            {errors.key_count && (
                                <p className="text-red-500 text-sm">{errors.key_count.message}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => {
                            closeKeypadFormDialog();
                            setDataNull?.(null);
                        }} type="button" variant="outline" disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
