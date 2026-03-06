const ALLOWED_FILE_EXTENSION = ".somfy";

export const useFileValidation = (onError?: (error: string) => void) => {
  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith(ALLOWED_FILE_EXTENSION)) {
      const errorMsg = `Invalid file format. Only ${ALLOWED_FILE_EXTENSION} files are allowed.`;
      onError?.(errorMsg);
      return false;
    }
    return true;
  };

  const validateAndProcessFiles = (filesToAdd: File[]): File | null => {
    if (filesToAdd.length > 0) {
      const file = filesToAdd[0];
      if (validateFile(file)) {
        return file;
      }
    }
    return null;
  };

  return {
    validateFile,
    validateAndProcessFiles,
    ALLOWED_FILE_EXTENSION,
  };
};
