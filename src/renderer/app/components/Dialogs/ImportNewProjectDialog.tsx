import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useProject } from "~/hooks";
import { useImportFile } from "../ProjectInfoPage/ImportProject/useImportFile";
import { ImportFile } from "../ProjectInfoPage/ImportProject/ImportFile";

function ImportNewProjectDialog() {
  const {
    importProjectDialog,
    closeImportProjectDialog,
    openRestoreConfirmDialog,
    importProject,
  } = useProject();

  const { setErrorMessage, resetAll } = useImportFile();

  const handleCancel = () => {
    resetAll();
    closeImportProjectDialog();
  };

  const handleImportFile = async (file: File) => {
    try {
      await importProject(file);
      resetAll();
      closeImportProjectDialog();
      openRestoreConfirmDialog();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to import project"
      );
    }
  };

  const handleCloseDialog = () => {
    closeImportProjectDialog();
    resetAll();
  };

  return (
    <>
      <Dialog open={importProjectDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <div className="grid gap-4">
            <ImportFile onCancel={handleCancel} onImport={handleImportFile} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ImportNewProjectDialog;
