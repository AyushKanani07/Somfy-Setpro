import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router";
import { useCommunicationLog } from "~/hooks/useCommunicationLog"
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { OfflineCommand } from "~/interfaces/communicationLog";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import { keypadConfigLst, lstNodeType, RAMPS_TYPE, TILT_LIMITS } from "~/constant/constant";
import type { SwitchSettings } from "~/interfaces/keypad";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { toast } from "sonner";
import { communicationLogService } from "~/services/communicationLogService";



export default function OfflineToOnline() {
    const { offlineCommandLst, deleteAllOfflineCommandsThunk } = useCommunicationLog();

    const navigate = useNavigate();
    const hasNavigated = useRef(false);

    const [selectedProducts, setSelectedProducts] = useState<OfflineCommand[]>([]);
    const [deleteAllConfirmDialog, setDeleteAllConfirmDialog] = useState<{ isOpen: boolean, action: string }>({ isOpen: false, action: "" });
    const [loadingDialog, setLoadingDialog] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: "" });

    useEffect(() => {
        if (!hasNavigated.current && !offlineCommandLst.length) {
            hasNavigated.current = true;
            navigate(-1);
        }
    }, []);

    useEffect(() => {
        if (deleteAllConfirmDialog.isOpen) return;
        if (!deleteAllConfirmDialog.action) return;

        if (deleteAllConfirmDialog.action === "discard") {
            deleteAllOfflineCommands();
        }
    }, [deleteAllConfirmDialog]);

    const deleteAllOfflineCommands = async () => {
        deleteAllOfflineCommandsThunk()
        navigate(-1);
    }

    const executeCommands = async () => {
        const commandIds = selectedProducts.map(item => item.id);
        if (commandIds.length === 0) return toast.error("Please select at least one command to execute");
        setLoadingDialog({ isOpen: true, message: "Executing command..." });
        try {
            await communicationLogService.executeOfflineCommand(selectedProducts.map(item => item.id));
        } catch (error) {
            toast.error("Failed to execute offline commands");
        } finally {
            setLoadingDialog({ isOpen: false, message: "" });
            setTimeout(() => {
                navigate(-1);
            }, 10);
        }
    }

    const getNodeType = (rowData: OfflineCommand) => {
        return lstNodeType.find(item => item.node_id === rowData.node_type)?.node_type_name || "Unknown";
    }

    const getFactoryDefault = (data: number) => {
        let str = '';
        switch (data) {
            case 0:
                str = "All settings to factory default"
                break;
            case 1:
                str = "Clear all Group addresses"
                break;
            case 2:
                str = "Clear Node Label "
                break;
            case 17:
                str = "Delete UP/DOWN limits and all IPs"
                break;
            case 18:
                str = "Default rotation direction "
                break;
            case 19:
                str = "Default rolling & tilting speed setting "
                break;
            case 21:
                str = "Delete all IPs"
                break;
            case 23:
                str = "Clear all locks"
                break;
            case 24:
                str = "Default tilting parameters "
                break;
            case 25:
                str = "Default local UI status"
                break;
            case 26:
                str = "Default application mode "
                break;
            case 27:
                str = "Default motor deceleration and acceleration ramps"
                break;
            case 28:
                str = "Default network parameters"
                break;

            default:
                break;
        }
        return str
    }

    const getMotorIP = (data: any) => {
        let str = '';
        switch (data.function_id) {
            case 0:
                str = 'Delete IP(Index: ' + data.ip_index + ')';
                break;
            case 1:
                str = 'Set IP at the current position(Index: ' + data.ip_index + ')';
                break;
            case 2:
                str = `Set IP at the specified position in pulses(Index: ${data.ip_index}), Pulse: ${data.value_position}`;
                break;
            case 3:
                str = `Set IP at the specified position in %(Index: ${data.ip_index}), Percent: ${data.value_position}`;
                break;
            case 4:
                str = `Divide the Full range with the given number of IPs(Value: ${data.value_position})`;
                break;
        }
        return str
    }

    const getAction = (keypad_action: number, value: number, extra_value: number) => {
        let msg = '';
        switch (keypad_action) {
            case 4:
            case 25:
                msg = '(IP No: ' + (value + 1) + ')';
                break;
            case 8:
            case 12:
            case 13:
                msg = '(Pulse: ' + value + ')';
                break;
            case 10:
            case 11:
                msg = '(Time: ' + value + ' X 10ms' + ')';
                break;
            case 16:
                msg = '(' + value + '%' + ')';
                break;
            case 20:
            case 21:
            case 22:
                msg = '(Priority: ' + value + ')';
                break;
            case 23:
                msg = '(IP No: ' + (value + 1) + ' Priority: ' + extra_value + ')';
                break;
            default:
                break;
        }
        return msg
    }

    const getkeypadConfig = (data: SwitchSettings) => {
        let keypad = {
            id: data.id,
            target_addr: data.press_target_addr,
            addr_code: data.press_addr_code,
            press_command: keypadConfigLst.find(item => item.id === data.press_command)?.name || "Unknown",
            hold_command: keypadConfigLst.find(item => item.id === data.hold_command)?.name || "Unknown",
            release_command: keypadConfigLst.find(item => item.id === data.release_command)?.name || "Unknown",
            press_action: getAction(data.press_command, data.press_value, data.press_extra_value),
            hold_action: getAction(data.hold_command, data.hold_value, data.hold_extra_value),
            release_action: getAction(data.release_command, data.release_value, data.release_extra_value),
        }
        let str = `Key: ${keypad.id}`
        str += `, Target: ${keypad.addr_code == 0 || keypad.addr_code == 64 ? 'Group-All' : keypad.addr_code == 1 || keypad.addr_code == 64 ? `Motor-All (${keypad.target_addr})` : keypad.addr_code == 2 || keypad.addr_code == 66 ? keypad.target_addr : 'Specified Group'}`;
        str += `<br> Press: ${keypad.press_command} ${keypad.press_action}`;
        str += `<br> Hold: ${keypad.hold_command} ${keypad.hold_action}`;
        str += `<br> Release: ${keypad.release_command} ${keypad.release_action}`;

        return str;
    }

    const readableDataFormat = (rowData: OfflineCommand) => {
        if (!rowData.data) return "";
        const data = rowData.data;
        let result = "";
        switch (rowData.command) {
            case 'SET_GROUP_ADDR':
                result = `Group Address: ${data?.group_address} (Index: ${data?.group_index})`;
                break;
            case 'SET_NODE_LABEL':
                result = `Label: ${data?.label}`;
                break;
            case 'SET_NETWORK_LOCK':
                result = data.function_id == 0 ? `Unlock(Priority: ${data?.priority})` : `Lock(Priority: ${data?.priority})`;
                break;
            case 'SET_MOTOR_ROLLING_SPEED':
                result = `Up: ${data?.up}, Down: ${data?.down}, Slow: ${data?.slow}`;
                break;
            case 'SET_MOTOR_DIRECTION':
                result = data.direction == 0 ? "Standard Rotation" : "Reversed Rotation";
                break;
            case 'SET_FACTORY_DEFAULT':
                result = getFactoryDefault(data?.function_id);
                break;
            case 'SET_MOTOR_IP':
                result = getMotorIP(data);
                break;
            case 'SET_MOTOR_LIMITS':
                result += data.limit == 0 ? "Set Down " : "Set Up ";
                result += data.function_id == 1 ? `limit at the current position` : `limit at the position ${data.value} pulse`;
                break;
            case 'SET_NETWORK_CONFIG':
                result = data.deaf_mode == 1 ? 'Deaf mode' : 'Normal mode';
                break;
            case 'SET_NETWORK_LOCK':
                result = 'Position' + (data.function_id == 5 ? ' Unlock' : ' Lock') + ` (Priority: ${data.priority})`;
                break;
            case 'SET_SWITCH_SETTINGS':
                result = getkeypadConfig(data as SwitchSettings);
                break;
            case 'SET_INDIVIDUAL_SWITCH_GROUPS':
                const groupAddresses = Object.values(data);
                result = `Group Address : [${groupAddresses.join(', ')}]`;
                break;
            case 'SET_APP_MODE':
                result = "Mode: " + (data.mode == 0 ? 'Roller' : data.mode == 1 ? 'Venetian' : data.mode == 2 ? 'Curtain' : 'Tilt only');
                break;
            case 'SET_MOTOR_SOFT_START_STOP':
                result = `Type: ${data.function_id == 0 ? 'Disable' : 'Enable'}, Ramps: ${RAMPS_TYPE.find(item => item.id === data.ramp)?.name}, Ramp Time: ${data.value}`;
                break;
            case 'SET_MOTOR_TILTING_SPEED':
                break;
            case 'SET_LOCAL_UI':
                result = `LED: ${data.function_id == 0 ? 'ON' : 'OFF'}`;
                break;
            case 'SET_TILT_LIMITS':
                result = `Function: ${TILT_LIMITS.find(item => item.id === data.function_id)?.name}, Value: ${data.value}`;
                break;
            default:
                break;
        }
        return result;
    }


    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-4 justify-end mt-4 mx-10">
                <SetProButton
                    className="bg-red-600 border-red-500 hover:bg-red-600/90 hover:text-white text-white"
                    buttonType="cancel"
                    onClick={() => setDeleteAllConfirmDialog({ isOpen: true, action: "" })}
                >
                    Discard
                </SetProButton>
                <SetProButton
                    buttonType="submit"
                    type="submit"
                    onClick={executeCommands}
                >
                    Execute
                </SetProButton>
            </div>
            <div className="mt-4 mb-10 mx-10 offline-command-table">
                <DataTable
                    showGridlines
                    stripedRows
                    size="small"
                    scrollable scrollHeight="82vh"
                    value={offlineCommandLst}
                    selectionMode={'checkbox'}
                    selection={selectedProducts}
                    onSelectionChange={(e) => setSelectedProducts(e.value)}
                    dataKey="id"
                    tableStyle={{ minWidth: '50rem' }}
                >
                    <Column bodyClassName="center-cell" selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column bodyClassName="center-cell" header="Node Type" body={getNodeType} headerStyle={{ textAlign: 'center' }}></Column>
                    <Column bodyClassName="center-cell" field="source" header="Source"></Column>
                    <Column bodyClassName="center-cell" field="destination" header="Dest"></Column>
                    <Column bodyClassName="center-cell" field="command" header="Command"></Column>
                    <Column header="Data" body={readableDataFormat}></Column>
                </DataTable>
            </div>
            <ConfirmDialog
                open={deleteAllConfirmDialog.isOpen}
                onOpenChange={() => { }}
                onCancel={() => setDeleteAllConfirmDialog({ isOpen: false, action: "" })}
                title="Discard All Offline Commands"
                description={"Are you sure you want to discard all offline commands?"}
                confirmText="Discard"
                cancelText="Cancel"
                onConfirm={() => setDeleteAllConfirmDialog({ ...deleteAllConfirmDialog, isOpen: false, action: "discard" })}
                variant="destructive"
                icon={<Trash2 className="w-6 h-6 text-red-500" />}
            />
            {loadingDialog.isOpen && (
                <Dialog open={loadingDialog.isOpen} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setLoadingDialog({ isOpen: false, message: '' });
                    }
                }}>
                    <DialogContent
                        showCross={false}
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        className="sm:max-w-[375px] bg-white"
                    >
                        <DialogTitle></DialogTitle>
                        <div className="w-full h-[200px] flex flex-col gap-2 justify-center items-center">
                            <div>
                                <ProgressSpinner
                                    className="h-10 w-10 custom-spinner mr-2"
                                    strokeWidth="4" />
                            </div>
                            <span className="text-xl font-bold">{loadingDialog.message}</span>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
