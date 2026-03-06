import { AlertCircle, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { SetProButton } from "../sharedComponent/setProButton";
import LoaderComponent from "../sharedComponent/LoaderComponent";

interface UploadFileProps {
    allowed_extension?: string[];
    onFileUpload: (file: File) => void;
    onFileRemove: () => void;
}

export const UploadFile = (
    {
        allowed_extension,

        onFileUpload,
        onFileRemove,
    }: UploadFileProps
) => {
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        setError(null);
        setSelectedFile(null);
        setIsImporting(false);
        setImportProgress(0);
    }, []);

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
            processFiles(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            processFiles(files[0]);
        }
    };

    const processFiles = async (file: File) => {
        if (allowed_extension && !allowed_extension.includes(file.name.split('.').pop() || '')) {
            setError(`Invalid file format. Only ${allowed_extension.join(", ")} files are allowed.`);
            return;
        }
        setError(null);
        setSelectedFile(file);
        setIsImporting(true);
        setImportProgress(0);
    }

    useEffect(() => {
        if (!isImporting || !selectedFile || importProgress === 100) return;

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

    }, [isImporting, selectedFile, importProgress]);

    useEffect(() => {
        if (importProgress === 100 && selectedFile) {
            onFileUpload(selectedFile);
        }
    }, [importProgress]);

    const removeFile = () => {
        setSelectedFile(null);
        setImportProgress(0);
        setIsImporting(false);
        setError(null);
        onFileRemove();
    }

    return (
        <div>
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
                    accept={allowed_extension ? allowed_extension.map(ext => `.${ext}`).join(",") : "*/*"}
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
                            Supported formats: {allowed_extension ? allowed_extension.join(", ") : "All files"}
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
            {selectedFile && (
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
                                        {selectedFile.name}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-xs transition-colors",
                                            isImporting && importProgress > 30
                                                ? "text-white/80"
                                                : "text-gray-500"
                                        )}
                                    >
                                        {(selectedFile.size / 1024).toFixed(2)} KB
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
        </div>
    )
}
