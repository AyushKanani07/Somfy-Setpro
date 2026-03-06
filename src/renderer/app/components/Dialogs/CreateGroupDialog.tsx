import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, type GroupFormValues } from "~/schemas/groupSchema";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useGroupView } from "~/hooks/useGroupView";
import { Switch } from "../ui/switch";
import { useEffect } from "react";
import { useProject } from "~/hooks";

function CreateGroupDialog() {
  const {
    groups,
    openCreateNewGroupDialog,
    closeCreateGroupDialog,
    createGroupThunk,
    loading,
  } = useGroupView();

  const {
    lastGroupAddress,
    fetchLastGroupAddress,
    updateLastGroupAddress,
  } = useProject();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<GroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      auto: true,
      name: "Group-",
      address: undefined,
    },
    mode: "onChange"
  });

  const autoGenerate = watch("auto");

  useEffect(() => {
    if (autoGenerate) {
      setValue("address", "");
    }
  }, [autoGenerate, setValue]);

  useEffect(() => {
    if (!openCreateNewGroupDialog) {
      reset();
    }
  }, [openCreateNewGroupDialog, reset]);

  const onSubmit = async (data: GroupFormValues) => {
    if (!lastGroupAddress) await fetchLastGroupAddress();
    let nextAddress: string;
    if (data.auto) {
      const result = generateNextAddress(lastGroupAddress || "1.1.1");
      data.address = result.hexString;
      nextAddress = result.nextAddress;
    }
    const payload = {
      name: data.name,
      address: data.address!
    };
    try {
      const res: any = await createGroupThunk(payload).unwrap();
      updateLastGroupAddress({ address: nextAddress! });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const generateNextAddress = (data: string): { hexString: string; nextAddress: string } => {
    let hexString = '';
    let data_array = data.split('.');
    let res_arr = Array(3).fill(0);
    if (+data_array[2] == 255) {
      if (+data_array[1] == 255) {
        res_arr[0] = +data_array[0] + 1;
        res_arr[1] = 1;
        res_arr[2] = 1;
      } else {
        res_arr[0] = +data_array[0];
        res_arr[1] = +data_array[1] + 1;
        res_arr[2] = 1;
      }
    } else {
      res_arr[0] = +data_array[0];
      res_arr[1] = +data_array[1];
      res_arr[2] = +data_array[2] + 1;
    }
    const nextAddress = res_arr.join('.');
    for (let i = 0; i < res_arr.length; i++) {
      let temp = res_arr[i].toString(16).toUpperCase();
      hexString += temp.length == 1 ? '0' + temp : temp;
    }
    // check hexString in masterGroup
    let isExist = groups.find(group => group.address === hexString);
    if (isExist) {
      return generateNextAddress(nextAddress);
    } else {
      return { hexString, nextAddress };
    }
  }

  return (
    <Dialog open={openCreateNewGroupDialog} onOpenChange={closeCreateGroupDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
          <div className="grid gap-4 py-4">
            {/* Auto Toggle */}
            <div className="flex items-center justify-between">
              <Label>Auto generate Group ID</Label>
              <Controller
                name="auto"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            {/* Group Address */}
            {!autoGenerate && (
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
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address.message}</p>
                )}
              </div>
            )}

            {/* Group Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <input
                type="text"
                placeholder="Group Name"
                {...register("name")}
                className="border p-2 w-full"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeCreateGroupDialog} type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroupDialog;
