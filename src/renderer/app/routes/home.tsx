import { Download, Plus, TriangleAlert } from "lucide-react";
import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { useProject } from "~/hooks";
import RecentProjects from "~/components/ProjectInfoPage/RecentProjects";
import CreateNewProjectDialog from "~/components/Dialogs/CreateNewProjectDialog";
import ImportNewProjectDialog from "~/components/Dialogs/ImportNewProjectDialog";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { ImportExportProjectDialog } from "~/components/Dialogs/ImportExportProjectDialog";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const {
    projects,
    restoreConfirmDialog,
    fetchProjects,
    openCreateProjectDialog,
    openImportProjectDialog,
    closeRestoreConfirmDialog,
  } = useProject();

  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);

  const handleCreateProject = () => {
    // Logic to create a new project
    openCreateProjectDialog();
    console.log("Create New Project clicked");
  };

  const handleImportProject = () => {
    // Logic to import an existing project
    openImportProjectDialog();
    console.log("Import Project clicked");
  };

  const fetchProjectsData = async () => {
    await fetchProjects();
  };

  useEffect(() => {
    if (!projects || projects.length === 0) fetchProjectsData();
  }, [projects]);

  const handleYesClick = () => {
    closeRestoreConfirmDialog();
    setImportExportDialogOpen(true);
  };

  const handleNoClick = () => {
    closeRestoreConfirmDialog();
  };

  return (
    <div className="flex-1 flex flex-col justify-start items-center p-8 lg:p-16 gap-9">
      <div className="flex flex-col justify-center items-center gap-5">
        <img
          src="/svg/somfy.svg"
          alt="Somfy Logo"
          className="w-48 h-12 flex-shrink-0"
        />
        <span className="text-textDarkColor text-2xl font-bold">
          Somfy SDN Configuration Software
        </span>
      </div>

      <div className="flex justify-center items-center gap-6">
        <ProjectActions action="create" onClick={handleCreateProject} />
        <ProjectActions action="import" onClick={handleImportProject} />
      </div>

      <div className="w-full">
        <RecentProjects />
      </div>
      <CreateNewProjectDialog mode="create" />
      <ImportNewProjectDialog />
      {restoreConfirmDialog && (
        <Dialog open={restoreConfirmDialog} onOpenChange={closeRestoreConfirmDialog}>
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-full flex items-start gap-5 mt-3">
                <div className="flex justify-center bg-deleteButtonColor/10 p-2 rounded-full">
                  <TriangleAlert size={20} className=" text-deleteButtonColor" />
                </div>
                <div className="flex flex-col items-start gap-2 text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Project Imported
                  </h2>
                  <p className="text-sm text-gray-600">
                    Do you also want to restore device settings?
                  </p>
                </div>
              </div>

              <DialogFooter className="w-full mt-5">
                <SetProButton
                  buttonType="cancel"
                  onClick={handleNoClick}
                  className="min-w-[80px]"
                >
                  No
                </SetProButton>
                <SetProButton
                  type="submit"
                  onClick={handleYesClick}
                  className="min-w-[80px]"
                >
                  Yes
                </SetProButton>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {
        importExportDialogOpen && (
          <ImportExportProjectDialog
            type="import"
            open={importExportDialogOpen}
            onOpenChange={setImportExportDialogOpen}
          />
        )
      }
    </div>
  );
}

const ProjectActions = ({
  action,
  onClick,
}: {
  action: "create" | "import";
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="w-[122px] h-[118px] flex-shrink-0 rounded-xl border-2 border-borderColor border-dotted flex flex-col justify-center items-center gap-4 hover:cursor-pointer hover:bg-secondaryBackground"
    >
      {action === "create" ? (
        <Plus size={21} className="text-textDarkColor" />
      ) : (
        <Download size={21} className="text-textDarkColor" />
      )}
      <span className="text-textDarkColor text-sm font-medium">
        {action === "create" ? "Create New" : "Import Project"}
      </span>
    </div>
  );
};
