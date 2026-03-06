import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputController } from "~/components/formControllers/InputController";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import LoaderComponent from "../sharedComponent/LoaderComponent";

// Schema for update name form
const updateNameSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
});

type UpdateNameFormData = z.infer<typeof updateNameSchema>;

interface UpdateNameFormProps {
  initialName: string;
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
  entityType: "floor" | "room" | "motor";
  onSuccess?: () => void;
}

export function UpdateNameForm({
  initialName,
  onSubmit,
  isLoading = false,
  entityType,
  onSuccess,
}: UpdateNameFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateNameFormData>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: initialName,
    },
  });

  const handleFormSubmit = async (data: UpdateNameFormData) => {
    await onSubmit(data.name);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
      <InputController
        name="name"
        label={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Name`}
        placeholder={`Enter ${entityType} name`}
        control={control}
        errorMessage={errors.name?.message}
      />

      <div className="w-1/2 justify-self-center flex justify-end gap-2">
        <SetProButton type="submit" disabled={isLoading} className="w-full">
          {isLoading && <LoaderComponent />}
          {isLoading ? "Updating..." : "Update"}
        </SetProButton>
      </div>
    </form>
  );
}
