import { useComport } from "~/hooks/useComport";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "~/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { SetProButton } from "../sharedComponent/setProButton";
import type { ComportItem } from "~/interfaces/comport";
import { toast } from "sonner";
import { projectService } from "~/services/projectService";
import { socket } from "~/services/socketService";
import { SOCKET_COMMAND } from "~/constant/constant";
import { CheckCircle, Clock, RotateCcw, XCircle } from "lucide-react";
import { ProgressSpinner } from 'primereact/progressspinner';
import { useProject } from "~/hooks/useProject";

type statusToSelect = "success" | "failed" | "pending" | "all";
type CommandStatus = 'success' | 'failed' | 'pending' | 'n/a';
interface status {
    ip: CommandStatus;
    group: CommandStatus;
    setting: CommandStatus;
}
interface ExportDeviceContext {
    device_id: number;
    device_type: string;
    name: string;
    address: string;
    model_no: number;
    sub_node_id: number;
    status: status;
}

type ImportExportDialogProp = {
    open: boolean;
    type: "import" | "export";

    onOpenChange: (open: boolean) => void;
};

export const ImportExportProjectDialog: React.FC<ImportExportDialogProp> = ({
    open,
    type,
    onOpenChange,
}) => {
    const { comports, isComportConnected, isOfflineEditMode, connectComportThunk, fetchComportsThunk } = useComport();
    const { selectedProject } = useProject();

    const [selectedComport, setSelectedComport] = useState<ComportItem | null>(null);
    const [devices, setDevices] = useState<ExportDeviceContext[]>([]);
    const [progress, setProgress] = useState<string>(`${type === "export" ? "Exporting..." : "Importing..."}`);
    const [selectedFilter, setSelectedFilter] = useState<statusToSelect>("all");
    const [processStatus, setProcessStatus] = useState<"running" | "paused" | "completed">("running");

    useEffect(() => {
        setSelectedComport(null);
        setDevices([]);
        setSelectedFilter("all");
        setProcessStatus("running");

        if (!comports.length) {
            fetchComportsThunk();
        }
        const allDevicesHandler = (devices: ExportDeviceContext[]) => {
            setDevices(devices);
        }
        const handleDeviceInfo = (device: ExportDeviceContext) => {
            setDevices((prev) => {
                const exists = prev.some(d => d.device_id === device.device_id);
                if (exists) {
                    return prev.map(d =>
                        d.device_id === device.device_id
                            ? { ...d, status: device.status }
                            : d
                    );
                }
                return [...prev, device];
            });
        }
        const handleDeviceProgress = (data: { title: string, isCompleted?: boolean }) => {
            setProgress(data.title);
            if (data.isCompleted) {
                setProcessStatus("completed");
            }
        }

        if (type === "export") {
            socket.on(SOCKET_COMMAND.EXPORT.EXPORT_DEVICES, allDevicesHandler);
            socket.on(SOCKET_COMMAND.EXPORT.EXPORT_DEVICE_INFO, handleDeviceInfo);
            socket.on(SOCKET_COMMAND.EXPORT.EXPORT_PROGRESS, handleDeviceProgress);
        }
        else if (type === "import") {
            socket.on(SOCKET_COMMAND.IMPORT.IMPORT_DEVICES, allDevicesHandler);
            socket.on(SOCKET_COMMAND.IMPORT.IMPORT_DEVICE_INFO, handleDeviceInfo);
            socket.on(SOCKET_COMMAND.IMPORT.IMPORT_PROGRESS, handleDeviceProgress);
        }

        return () => {
            if (type === "export") {
                socket.off(SOCKET_COMMAND.EXPORT.EXPORT_DEVICES, allDevicesHandler);
                socket.off(SOCKET_COMMAND.EXPORT.EXPORT_DEVICE_INFO, handleDeviceInfo);
                socket.off(SOCKET_COMMAND.EXPORT.EXPORT_PROGRESS, handleDeviceProgress);
            }
            else if (type === "import") {
                socket.off(SOCKET_COMMAND.IMPORT.IMPORT_PROGRESS, allDevicesHandler);
                socket.off(SOCKET_COMMAND.IMPORT.IMPORT_DEVICE_INFO, handleDeviceInfo);
                socket.off(SOCKET_COMMAND.IMPORT.IMPORT_DEVICES, handleDeviceProgress);
            }
        }
    }, [])

    useEffect(() => {
        if (isComportConnected) {
            start();
        }
    }, [isComportConnected])

    const onContinue = () => {
        if (selectedComport) {
            connectComportThunk(selectedComport);
        }
    }

    const getOverallStatus = (status: status): CommandStatus => {
        const statuses = [
            status.ip,
            status.group,
            status.setting,
        ];

        if (statuses.some((s) => s === "failed")) return "failed";
        if (statuses.some((s) => s === "pending")) return "pending";
        return "success";
    };

    const stats = useMemo(() => {
        const totalDevices = devices.length;
        let successCount = 0;
        let failureCount = 0;
        let pendingCount = 0;

        devices.forEach((device) => {
            const status = device.status;
            const overallStatus = getOverallStatus(status);

            if (overallStatus === "success") successCount++;
            else if (overallStatus === "failed") failureCount++;
            else if (overallStatus === "pending") pendingCount++;
        });

        return { totalDevices, successCount, failureCount, pendingCount };
    }, [devices]);

    //#region Filter devices based on overall status
    const filteredDevices = useMemo(() => {
        return devices
            .filter((device) => {
                if (selectedFilter === "all") return true;
                const overallStatus = getOverallStatus(device.status);
                return overallStatus === selectedFilter;
            });
    }, [devices, selectedFilter]);

    const start = async () => {
        try {
            if (type === "export") await projectService.exportStart();
            else if (type === "import") await projectService.importStart();
        } catch (error) {
            toast.error((error as Error).message || `Failed to start ${type}`);
        }
    }

    const close = async () => {
        try {
            if (type === "export") await projectService.exportClose();
            else if (type === "import") await projectService.importClose();
        } catch (error) {
            toast.error((error as Error).message || "Failed to close export");
        }
    }

    const pauseExport = async () => {
        try {
            await projectService.exportPause();
            setProcessStatus("paused");
        } catch (error) {
            toast.error((error as Error).message || "Failed to pause export");
        }
    }

    const resumeExport = async () => {
        try {
            await projectService.exportResume();
            setProcessStatus("running");
        } catch (error) {
            toast.error((error as Error).message || "Failed to resume export");
        }
    }

    const retry = async (deviceId: number, step: "ip" | "group" | "setting") => {
        try {
            if (type === "export") {
                await projectService.exportRetry({ device_id: deviceId, step });
            } else if (type === "import") {
                await projectService.importRetry({ device_id: deviceId, step });
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to retry operation");
        }
    }

    const exportProject = async () => {
        try {
            if (!selectedProject) return toast.error("No project selected for export");
            const data = await projectService.exportProject(selectedProject.project_id);
            const url = window.URL.createObjectURL(data);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedProject.project_id}.somfy`;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            close();
            onOpenChange(false);
        } catch (error) {
            toast.error((error as Error).message || "Failed to export project");
        }
    }

    const getStatusColor = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return "text-green-600";
            case "failed":
                return "text-red-600";
            case "pending":
                return "text-yellow-600";
        }
    };

    const getStatusBgColor = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return "bg-green-100";
            case "failed":
                return "bg-red-100";
            case "pending":
                return "bg-yellow-100";
        }
    };

    const getStatusIcon = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return <CheckCircle className="w-5 h-5" />;
            case "failed":
                return <XCircle className="w-5 h-5" />;
            case "pending":
                return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) {
                close();
            }
            onOpenChange(open);
        }}>
            <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="min-w-[700px] h-[89vh] flex flex-col">
                <DialogHeader>
                    <div className="border-b absolute inset-x-0 top-16"></div>
                    <DialogTitle className="text-lg font-semibold">
                        {(!isComportConnected || isOfflineEditMode) && (
                            <span>Select Port</span>
                        )}
                        {(isComportConnected && !isOfflineEditMode) && (
                            <div className="flex w-full justify-between pr-16 absolute top-3 items-center">
                                <span>{progress}</span>
                                <div className="flex flex-row items-center">
                                    {
                                        processStatus === "running" ? (
                                            <>
                                                <ProgressSpinner
                                                    className="h-8 w-8 custom-spinner mr-2"
                                                    strokeWidth="3" />
                                                {
                                                    type === "export" && (
                                                        <SetProButton
                                                            buttonType="submit"
                                                            className={cn("w-fit bg-red-600 hover:bg-red-700",)}
                                                            onClick={pauseExport}
                                                        >
                                                            Stop
                                                        </SetProButton>
                                                    )
                                                }
                                            </>
                                        ) : type === "export" && (
                                            <>
                                                {
                                                    processStatus === "paused" && (
                                                        <SetProButton
                                                            className={cn("w-fit mr-4",)}
                                                            onClick={resumeExport}
                                                        >
                                                            Resume
                                                        </SetProButton>
                                                    )
                                                }
                                                <SetProButton
                                                    type="submit"
                                                    className={cn("w-fit",)}
                                                    onClick={exportProject}
                                                >
                                                    Export
                                                </SetProButton>
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                        )}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-6 mx-4">
                    {(!isComportConnected || isOfflineEditMode) && (
                        <div className="flex flex-col gap-4">
                            {comports.map((com) => (
                                <div
                                    onClick={() => setSelectedComport(com)}
                                    key={com.path}
                                    className={cn("w-full h-10 px-4 py-6 bg-gray-100 shadow-md flex items-center gap-2 border-l-4",
                                        selectedComport?.path === com.path ? "bg-orange-100 border-orange-500 text-orange-700" : "border-gray-500 bg-gray-100 text-gray-700",
                                    )}
                                >
                                    <span className="text-sm font-bold">{com.path}</span>
                                </div>
                            ))}
                            <div className="w-full flex justify-end items-center mt-4">
                                <SetProButton
                                    type="submit"
                                    className={cn("w-fit", !selectedComport && "bg-gray-400 text-gray-900")}
                                    onClick={onContinue}
                                    disabled={!selectedComport}>
                                    Continue
                                </SetProButton>
                            </div>
                        </div>
                    )}

                    {(isComportConnected && !isOfflineEditMode) && (
                        <div className="w-full space-y-4 mt-4">
                            {/* Filter Chips */}
                            <div className="flex flex-wrap gap-2">
                                {(["all", "success", "failed", "pending"] as statusToSelect[]).map(
                                    (filter) => {
                                        let count = 0;
                                        if (filter === "all") count = stats.totalDevices;
                                        else if (filter === "success") count = stats.successCount;
                                        else if (filter === "failed") count = stats.failureCount;
                                        else if (filter === "pending") count = stats.pendingCount;

                                        return (
                                            <button
                                                key={filter}
                                                onClick={() => setSelectedFilter(filter)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedFilter === filter
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    }`}
                                            >
                                                {filter} ({count})
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full">
                                    <thead className="bg-hoverGrayColor border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-textDarkColor">
                                                Device
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-textDarkColor">
                                                Intermediate Position
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-textDarkColor">
                                                Group
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-textDarkColor">
                                                Settings
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-textDarkColor">
                                                Overall Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDevices.length > 0 ? (
                                            filteredDevices.map((device) => {
                                                const overallStatus = getOverallStatus(device.status);
                                                return (
                                                    <tr
                                                        key={device.device_id}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 text-sm font-medium text-textDarkColor">
                                                            {device.address}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex justify-center items-center">
                                                                <StatusCell
                                                                    status={device.status.ip}
                                                                    deviceId={device.device_id}
                                                                    type="ip"
                                                                    retry={retry}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex justify-center items-center">
                                                                <StatusCell
                                                                    status={device.status.group}
                                                                    deviceId={device.device_id}
                                                                    type="group"
                                                                    retry={retry}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex justify-center items-center">
                                                                <StatusCell
                                                                    status={device.status.setting}
                                                                    deviceId={device.device_id}
                                                                    type="setting"
                                                                    retry={retry}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div
                                                                className={`w-auto flex items-center justify-center px-3 gap-2 rounded-full p-1.5 ${getStatusBgColor(overallStatus)} ${getStatusColor(overallStatus)}`}
                                                            >
                                                                <span className={`text-sm font-medium `}>
                                                                    {overallStatus}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-8 text-center text-sm text-gray-500"
                                                >
                                                    No devices found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 mt-4">

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type StatusType = "ip" | "group" | "setting";

interface StatusCellProps {
    status: CommandStatus;
    deviceId: number;
    type: StatusType;
    retry: (deviceId: number, type: StatusType) => void;
}
const StatusCell = ({ status, deviceId, type, retry }: StatusCellProps) => {
    const getStatusColor = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return "text-green-600";
            case "failed":
                return "text-red-600";
            case "pending":
                return "text-yellow-600";
        }
    };

    const getStatusBgColor = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return "bg-green-100";
            case "failed":
                return "bg-red-100";
            case "pending":
                return "bg-yellow-100";
        }
    };

    const getStatusIcon = (status: CommandStatus) => {
        switch (status) {
            case "success":
                return <CheckCircle className="w-5 h-5" />;
            case "failed":
                return <XCircle className="w-5 h-5" />;
            case "pending":
                return <Clock className="w-5 h-5" />;
        }
    };
    return (
        <td className="px-4 py-3 text-center">
            <div
                className={`flex justify-center items-center gap-2 group ${getStatusColor(
                    status
                )}`}
            >
                {status === "failed" ? (
                    <>
                        <span className="group-hover:hidden">
                            {getStatusIcon(status)}
                        </span>

                        <button
                            type="button"
                            className="hidden group-hover:inline-flex transition-opacity text-gray-500"
                            onClick={() => retry(deviceId, type)}
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    getStatusIcon(status)
                )}
            </div>
        </td>
    );
};