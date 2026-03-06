import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputController } from "~/components/formControllers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useProject } from "~/hooks";
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "~/schemas/createProjectSchema";
import { SetProButton } from "../sharedComponent/setProButton";
import type { CreateProjectPayload } from "~/interfaces/project";

function CreateNewProjectDialog({ mode }: { mode?: "edit" | "create" }) {
  const {
    createProjectDialog,
    selectedProject,
    loading,
    closeCreateProjectDialog,
    createProject,
    updateProject,
  } = useProject();

  const { control, handleSubmit, watch, reset, formState } =
    useForm<CreateProjectFormData>({
      resolver: zodResolver(createProjectSchema),
      defaultValues: {
        name: mode === "edit" && selectedProject ? selectedProject.name : "",
        address:
          mode === "edit" && selectedProject
            ? (selectedProject.address ?? "")
            : "",
      },
    });

  const handleFormSubmit = async (data: CreateProjectFormData) => {
    const payload: CreateProjectPayload = {
      name: data.name,
      address: data.address ?? null,
      building_type_id: 1, // Default building type ID
    };

    if (mode === "edit" && selectedProject) {
      const result = await updateProject({
        projectId: selectedProject.project_id,
        projectData: payload,
      }).unwrap();
      reset({
        name: result.name,
        address: result.address ?? "",
      });
    } else {
      await createProject(payload);
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    closeCreateProjectDialog();
  };

  return (
    <Dialog open={createProjectDialog} onOpenChange={closeCreateProjectDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              Fill in the project details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <InputController
              name="name"
              control={control}
              label="Project Name"
              required
              placeholder="Enter project name"
              className="w-full"
            />

            <InputController
              name="address"
              control={control}
              label="Address"
              placeholder="Enter project address (optional)"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <SetProButton buttonType="cancel" onClick={handleCancel}>
              Cancel
            </SetProButton>
            <SetProButton type="submit" loading={loading}>
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
            </SetProButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewProjectDialog;
