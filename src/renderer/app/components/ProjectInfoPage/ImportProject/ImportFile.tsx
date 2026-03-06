import { AlertCircle, Upload, X } from "lucide-react";
import { useState } from "react";
import LoaderComponent from "~/components/sharedComponent/LoaderComponent";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useProject } from "~/hooks";
import { cn } from "~/lib/utils";
import { SetProButton } from "../../sharedComponent/setProButton";
import { useFileValidation } from "./useFileValidation";
import { useImportFile } from "./useImportFile";

interface ImportFileProps {
  onCancel?: () => void;
  onImport?: (file: File) => Promise<void>;
}

export const ImportFile = ({ onCancel, onImport }: ImportFileProps) => {
  const [dragActive, setDragActive] = useState(false);

  const { importProjectLoading } = useProject();
  const {
    importedFile,
    importProgress,
    isImporting,
    error,
    handleFileSelect,
    removeFile,
    setErrorMessage,
  } = useImportFile();

  const { validateAndProcessFiles, ALLOWED_FILE_EXTENSION } =
    useFileValidation(setErrorMessage);

  // #region Drag and Drop Handlers

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  // #region File Input Handler

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = (filesToAdd: File[]) => {
    // Only accept the first file
    const validatedFile = validateAndProcessFiles(filesToAdd);
    if (validatedFile) {
      handleFileSelect(validatedFile);
    }
  };

  // #region Import Handler

  const handleImportClick = async () => {
    if (!importedFile || importProgress !== 100 || !onImport) return;
    try {
      await onImport(importedFile.file);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to import");
    }
  };

  return (
    <>
      {/* Dialog Header */}
      <DialogHeader>
        <DialogTitle>Import Project</DialogTitle>
        <DialogDescription>
          Drag and drop your project file or click to browse
        </DialogDescription>
      </DialogHeader>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors p-8 text-center",
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-fieldBorderColor bg-gray-50 hover:border-gray-400"
        )}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileInput}
          accept=".somfy"
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-900">
              Drop files here or click to browse
            </span>
            <span className="text-xs text-gray-500">
              Supported formats: .somfy
            </span>
          </div>
          <SetProButton
            type="button"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("file-input")?.click();
            }}
            className="mt-2"
          >
            Browse Files
          </SetProButton>
        </label>
      </div>

      {/* File Display with Progress */}
      {importedFile && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected File</p>

          {/* Container with Background Fill */}
          <div className="relative rounded-lg border border-fieldBorderColor overflow-hidden">
            {/* Background Fill - fills from left based on percentage */}
            {isImporting && (
              <div
                className="absolute inset-y-0 left-0 transition-all duration-300"
                style={{
                  width: `${importProgress}%`,
                  backgroundColor:
                    importProgress === 100
                      ? "rgb(245, 158, 11)"
                      : "rgb(245, 158, 11)",
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 space-y-3 p-4">
              {/* File Info */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isImporting && importProgress > 30
                        ? "text-white"
                        : "text-gray-900"
                    )}
                  >
                    {importedFile.file.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs transition-colors",
                      isImporting && importProgress > 30
                        ? "text-white/80"
                        : "text-gray-500"
                    )}
                  >
                    {(importedFile.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                {isImporting && (
                  <div
                    className={cn(
                      "text-lg font-bold transition-colors",
                      importProgress > 95 ? "text-white" : "text-gray-900"
                    )}
                  >
                    {importProgress}%
                  </div>
                )}

                {importProgress !== 100 ? (
                  <LoaderComponent
                    className={cn(
                      importProgress > 95 ? "text-white" : "text-gray-900"
                    )}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeFile()}
                    className="p-1 rounded transition-colors"
                    aria-label="Remove file"
                  >
                    <X
                      className={cn(
                        "h-4 w-4 transition-colors",
                        importProgress > 95 ? "text-white" : "text-gray-900"
                      )}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Action Buttons */}
      <DialogFooter>
        <SetProButton
          buttonType="cancel"
          onClick={onCancel}
          disabled={isImporting}
        >
          Cancel
        </SetProButton>
        <SetProButton
          type="submit"
          onClick={handleImportClick}
          disabled={!importedFile || importProgress !== 100}
          loading={importProjectLoading}
        >
          {!importProjectLoading ? "Import" : "Importing..."}
        </SetProButton>
      </DialogFooter>
    </>
  );
};
