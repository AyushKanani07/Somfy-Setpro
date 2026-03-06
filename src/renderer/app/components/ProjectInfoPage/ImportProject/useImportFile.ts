import { useState, useEffect } from "react";

interface ImportedFile {
  file: File;
  id: string;
}

export const useImportFile = () => {
  const [importedFile, setImportedFile] = useState<ImportedFile | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-run import progress when file is selected
  useEffect(() => {
    if (!isImporting || !importedFile || importProgress === 100) return;

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          return 100;
        }
        // Increment by random amount between 5-15 to simulate realistic progress
        const increment = Math.random() * 10 + 5;
        const newProgress = Math.min(prev + increment, 100);
        return Math.floor(newProgress);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isImporting, importedFile, importProgress]);

  const handleFileSelect = (file: File) => {
    setError(null);
    setImportedFile({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    });
    setIsImporting(true);
    setImportProgress(0);
  };

  const removeFile = () => {
    setImportedFile(null);
    setImportProgress(0);
    setIsImporting(false);
    setError(null);
  };

  const setErrorMessage = (message: string | null) => {
    setError(message);
  };

  const resetAll = () => {
    setImportedFile(null);
    setImportProgress(0);
    setIsImporting(false);
    setError(null);
  };

  return {
    // State
    importedFile,
    importProgress,
    isImporting,
    error,

    // Actions
    handleFileSelect,
    removeFile,
    setErrorMessage,
    resetAll,

    // Setters (if needed for advanced use cases)
    setImportedFile,
    setImportProgress,
    setIsImporting,
  };
};
