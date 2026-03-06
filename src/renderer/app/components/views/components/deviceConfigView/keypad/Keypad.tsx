import { FileUp, RotateCw, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SetProButton } from "~/components/sharedComponent/setProButton";
import TooltipComponent from "~/components/sharedComponent/TooltipComponent";
import { useComport } from "~/hooks/useComport";
import { useDevice } from "~/hooks/useDevice";
import { useKeypad } from "~/hooks/useKeypad";
import { Dropdown } from 'primereact/dropdown';
import { toast } from "sonner";
import { keypadService } from "~/services/keypad.Service";
import type { ConfigSchema, KeypadActionDetail, MotorByRoomWise, SwitchSettings } from "~/interfaces/keypad";
import { groupViewService } from "~/services/groupViewService";
import type { Group } from "~/interfaces/groupView";
import { cn } from "~/lib/utils";
import { MdDeviceHub } from "react-icons/md";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { keypadConfigLst, predefinedSchemas } from "~/constant/constant";
import { decArray2value, value2decArray } from "~/utils/helperFunctions";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { useFloor } from "~/hooks/useFloor";
import { DialogTitle } from "@radix-ui/react-dialog";

import { InputText } from 'primereact/inputtext';
import { deviceService } from "~/services/deviceService";


interface model {
    press: { command: number | null, value: number, extraValue: number, displayText: string };
    hold: { command: number | null, value: number, extraValue: number, displayText: string };
    release: { command: number | null, value: number, extraValue: number, displayText: string };
    sequence: boolean;
}

interface importExportDialog {
    isOpen: boolean;
    title: string;
    type: "import" | "export";
    buttonText: string;
}

export const Keypad = () => {
    const { isComportConnected, isOfflineEditMode } = useComport();
    const { selectedDeviceId, selectedDeviceType, findDeviceType, setSelectedDeviceId, setSelectedDeviceType, setLoadingDialog } = useDevice();
    const { selectedKeypad, fetchKeypadById } = useKeypad();
    const { fetchFloorsThunk } = useFloor();

    const SIX_DK_IGNORE_ID1 = 4;
    const SIX_DK_IGNORE_ID2 = 5;

    const [selectedAllMotor, setSelectedAllMotor] = useState<string | null>(null);
    const [allMotorList, setAllMotorList] = useState<MotorByRoomWise[]>([]);
    const [targetDeviceList, setTargetDeviceList] = useState<MotorByRoomWise[]>([]);
    const [copyTargetDeviceList, setCopyTargetDeviceList] = useState<MotorByRoomWise[]>([]);
    const [allGroupList, setAllGroupList] = useState<Group[]>([]);
    const [selectedAllGroup, setSelectedAllGroup] = useState<string | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [model, setModel] = useState<model>({
        press: { command: null, value: 0, extraValue: 0, displayText: "" },
        hold: { command: null, value: 0, extraValue: 0, displayText: "" },
        release: { command: null, value: 0, extraValue: 0, displayText: "" },
        sequence: false,
    });
    const [keypadActionDetail, setKeypadActionDetail] = useState<KeypadActionDetail[]>([
        { id: 1, name: "Button-1", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 2, name: "Button-2", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 3, name: "Button-3", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 4, name: "Button-4", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 5, name: "Button-5", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 6, name: "Button-6", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 7, name: "Button-7", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
        { id: 8, name: "Button-8", selected: false, target_address: "", on_press: "", on_press_action: "", on_hold: "", on_hold_action: "", on_release: "", on_release_action: "", sequence: false, target_name: "", target_type: "" },
    ]);
    const [keypadData, setKeypadData] = useState(Array(8).fill([]));
    const [individualSwitchGroup, setIndividualSwitchGroup] = useState(Array(8).fill('000000'));
    const [activeKey, setActiveKey] = useState<KeypadActionDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [resetDefaultDialogOpen, setResetDefaultDialogOpen] = useState(false);

    const [savedConfigSchemaWithPreDefined, setSavedConfigSchemaWithPreDefined] = useState<ConfigSchema[]>([]);
    const [savedConfigSchema, setSavedConfigSchema] = useState<ConfigSchema[]>([]);
    const [importExportDialog, setImportExportDialog] = useState<importExportDialog>({ isOpen: false, title: "", type: "import", buttonText: "" });
    const [configName, setConfigName] = useState("");
    const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

    useEffect(() => {
        getMotorListByRoom();
        getKeypadConfigSchema();
        if (selectedKeypad?.keypadData[0].group_address == null) {
            getSwitchSettins();
        }
    }, []);

    const getSwitchSettins = async () => {
        setLoadingDialog({ isOpen: true, message: "Fetching Switch Settings..." });
        for (let i = 1; i <= 8; i++) {
            if (selectedKeypad?.key_count == 6 && (i == SIX_DK_IGNORE_ID1 || i == SIX_DK_IGNORE_ID2)) continue;
            try {
                await keypadService.getSwitchSetting(selectedDeviceId!, i);
            } catch (error) {
                toast.error((error as Error).message || `Failed to fetch switch settings for key ${i}`);
            }
        }
        await getIndividualSwitchGroup();
        await getFirmwareVersion();
        await fetchKeypadById(selectedDeviceId!);
        setLoadingDialog({ isOpen: false, message: "" });
    }

    const getFirmwareVersion = async () => {
        try {
            await deviceService.getFirmwareVersion(selectedDeviceId!, true);
        } catch (error) {
            toast.error((error as Error).message || "Failed to fetch firmware version");
        }
    }

    const getIndividualSwitchGroup = async () => {
        try {
            await keypadService.getIndividualSwitchGroup(selectedDeviceId!);
        } catch (error) {
            toast.error((error as Error).message || "Failed to fetch individual switch group");
        }
    }

    const getKeypadConfigSchema = async () => {
        try {
            const response = await keypadService.getKeypadConfigSchema();
            setSavedConfigSchema(response.data);

            setSavedConfigSchemaWithPreDefined([...predefinedSchemas, ...response.data]);
        } catch (error) {
            toast.error((error as Error).message || "Failed to fetch keypad configuration");
        }
    }

    useEffect(() => {
        const addr_code = getAddrCode(model.sequence);
        let selectedDeviceAddress = "";
        if (selectedDevice == "Group-All") {
            selectedDeviceAddress = selectedAllGroup ?? "000000";
        } else if (selectedDevice == "Motor-All") {
            selectedDeviceAddress = selectedAllMotor ?? "000000";
        } else if (selectedDevice == "Broadcast") {
            selectedDeviceAddress = "FFFFFF";
        } else {
            if (addr_code == 2 || addr_code == 66) {
                // specified motor
            } else {
                // specified group
                setIndividualSwitchGroup(prev => {
                    const updated = [...prev];
                    updated[activeKey?.id! - 1] = selectedDevice;
                    return updated;
                });
            }
            selectedDeviceAddress = selectedDevice!;
        }
        setKeypadData(prev => {
            const index = activeKey?.id! - 1;
            const updated = [...prev];

            updated[index] = {
                ...updated[index],
                press_target_addr: selectedDeviceAddress,
                hold_target_addr: selectedDeviceAddress,
                release_target_addr: selectedDeviceAddress,
                press_addr_code: addr_code,
                hold_addr_code: addr_code,
                release_addr_code: addr_code,
            };

            // formatActionDetail(updated[index]);

            return updated;
        })
    }, [selectedDevice]);

    useEffect(() => {
        keypadData.forEach((item, index) => {
            formatActionDetail(item);
        });
    }, [keypadData])

    const formatActionDetail = (data: any) => {
        if (data && data.id) {
            let index = data.id - 1;
            let target = getTargetName(data.press_addr_code, data.press_target_addr, index);

            setKeypadActionDetail(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    id: data.id,
                    target_address: data.press_target_addr,
                    on_press: keypadConfigLst.find(item => item.id === data.press_command)?.name || "",
                    on_press_action: getAction(data.press_command, data.press_value, data.press_extra_value),
                    on_hold: keypadConfigLst.find(item => item.id === data.hold_command)?.name || "",
                    on_hold_action: getAction(data.hold_command, data.hold_value, data.hold_extra_value),
                    on_release: keypadConfigLst.find(item => item.id === data.release_command)?.name || "",
                    on_release_action: getAction(data.release_command, data.release_value, data.release_extra_value),
                    sequence: checkSequenceCommand(data.press_addr_code),
                    target_name: target.target_name,
                    target_type: target.target_type,
                };
                return updated;
            })
        }
    }

    const getTargetName = (addr_code: number, target_addr: string, index: number) => {
        let target_name = '';
        let target_type = '';
        switch (addr_code?.toString()) {
            case '0':
            case '64':
                target_name = 'Group-All';
                target_type = 'group';
                break;
            case '128':
            case '192':
                target_name = individualSwitchGroup[index]?.toUpperCase();
                target_type = 'group';
                break;
            case '1':
            case '65':
                target_name = "Motor-All";
                target_type = 'motor';
                break;
            case '2':
            case '66':
                target_name = target_addr ? target_addr.toUpperCase() : '';
                target_type = 'motor';
                break;
            case '3':
                target_name = 'FFFFFF';
                target_type = 'motor';
                break;
            default:
                break;
        }
        return { target_name, target_type };
    }

    const getAddrCode = (checked: boolean) => {
        if (!selectedDevice) return;
        if (checked) {
            if (selectedDevice === "Motor-All") {
                return 65;
            } else if (selectedDevice === "Group-All") {
                return 64;
            } else {
                let address = allGroupList.find(item => item.address === selectedDevice)?.address;
                if (address) {
                    return 192;
                }
                return 66;
            }
        } else {
            if (selectedDevice === "Motor-All") {
                return 1;
            } else if (selectedDevice === "Group-All") {
                return 0;
            } else if (selectedDevice === "Broadcast") {
                return 3;
            } else {
                let address = allGroupList.find(item => item.address === selectedDevice)?.address;
                if (address) {
                    return 128;
                }
                return 2;
            }
        }
    }

    const getAction = (keypad_action: number, value: any, extra_value: any) => {
        let msg = '';
        switch (keypad_action) {
            case 0x4:
            case 0x25:
                msg = 'IP No: ' + value;
                break;
            case 0x8:
            case 0x0C:
            case 0x0D:
                msg = 'Pulse: ' + value;
                break;
            case 0x0A:
            case 0x0B:
                msg = 'Time: ' + value + ' X 10ms';
                break;
            case 0x10:
                msg = value + '%';
                break;
            case 0x20:
            case 0x21:
            case 0x22:
            case 0x24:
                msg = 'Priority: ' + extra_value;
                break;
            case 0x23:
                msg = 'IP No: ' + value + ' Priority: ' + extra_value;
                break;
            case 0x11:
                msg = '';
            case 0x0:
                msg = '';
                break;
            default:
                break;
        }
        return msg;
    }

    const getMotorListByRoom = async () => {
        try {
            const res = await keypadService.getMotorListByRoom();
            setAllMotorList(res.data);

            let dataForTargetDevice: MotorByRoomWise[] = structuredClone(res.data);
            dataForTargetDevice.unshift({
                room_name: 'All',
                device: [{
                    id: 111,
                    name: 'Motor-All',
                    address: 'Motor-All',
                }, {
                    id: 222,
                    name: 'Group-All',
                    address: 'Group-All',
                }, {
                    id: 333,
                    name: 'Broadcast',
                    address: 'Broadcast',
                }]
            });
            setTargetDeviceList(dataForTargetDevice);
            setCopyTargetDeviceList(dataForTargetDevice);

            getGroupList();
        } catch (error) {
            toast.error((error as Error).message || "Failed to fetch motors");
        }
    }

    const getGroupList = async () => {
        try {
            const res = await groupViewService.getGroups();
            setAllGroupList(res.data);

            const groupRoom = {
                room_name: "Group",
                device: res.data.map((element: any) => ({
                    id: element.address,
                    name: `${element.name} (${element.address})`,
                    address: element.address,
                })),
            };

            setTargetDeviceList(prev => [...prev, groupRoom]);
            setCopyTargetDeviceList(prev => [...prev, groupRoom]);

        } catch (error) {
            toast.error((error as Error).message || "Failed to fetch groups");
        }
    }

    useEffect(() => {
        if (!selectedDeviceId || !selectedDeviceType) return;

        fetchKeypadById(selectedDeviceId);

    }, [selectedDeviceId, selectedDeviceType]);

    useEffect(() => {
        if (!selectedKeypad?.keypadData) return;
        setKeypadData(prev =>
            prev.map((item, index) => {
                const dbData = selectedKeypad.keypadData.find(k => k.key_no === index + 1);

                return {
                    ...item,
                    id: dbData?.key_no,
                    press_command: dbData?.press_command ?? null,
                    press_value: manageIPValue(dbData?.press_command ?? null, dbData?.press_value ?? 0, 'received'),
                    press_extra_value: dbData?.press_extra_value ?? 0,
                    press_addr_code: dbData?.addr_code,
                    press_target_addr: dbData?.target_address ?? "",
                    hold_command: dbData?.hold_command ?? null,
                    hold_value: manageIPValue(dbData?.hold_command ?? null, dbData?.hold_value ?? 0, 'received'),
                    hold_extra_value: dbData?.hold_extra_value ?? 0,
                    hold_addr_code: dbData?.addr_code,
                    hold_target_addr: dbData?.target_address ?? "",
                    release_command: dbData?.release_command ?? null,
                    release_value: manageIPValue(dbData?.release_command ?? null, dbData?.release_value ?? 0, 'received'),
                    release_extra_value: dbData?.release_extra_value ?? 0,
                    release_addr_code: dbData?.addr_code,
                    release_target_addr: dbData?.target_address ?? "",
                };
            })
        );

        const switchGroupData = Array(8).fill('000000')
        selectedKeypad.keypadData.forEach((item, index) => {
            if (item.group_address) switchGroupData[item.key_no - 1] = item.group_address;
        });
        setIndividualSwitchGroup(switchGroupData);
    }, [selectedKeypad?.keypadData]);

    useEffect(() => {
        keypadData.forEach((element, index) => {
            if (element.press_addr_code == 0 || element.press_addr_code == 64) {
                const selectedAllGroup = individualSwitchGroup[index] ? individualSwitchGroup[index].toUpperCase() : '000000';
                setSelectedAllGroup(selectedAllGroup);
            } else if (element.press_addr_code == 1 || element.press_addr_code == 67) {
                setSelectedAllMotor(element.press_target_addr);
            }
        });
    }, [individualSwitchGroup]);

    const updateIndividualSwitchGroup = async () => {
        try {
            const switchData: Record<string, string> = {};

            individualSwitchGroup.forEach((group, index) => {
                switchData[`sw${index + 1}_group_addr`] = group;
            });
            const payload = {
                keypad_id: selectedDeviceId!,
                group_addresses: switchData
            }

            await keypadService.setIndividualSwitchGroup(payload.keypad_id, payload.group_addresses);

        } catch (error) {
            toast.error((error as Error).message || "Failed to update individual switch group");
        }
    }

    const manageIPValue = (command: number | null, value: number, type: string) => {
        let ipValue = value;
        switch (command) {
            case 0x4:
                if (type === 'send') ipValue--;
                else ipValue++;
                break;
            default:
                break;
        }
        return ipValue;
    }

    const factoryReset = async () => {
        setLoadingDialog({
            isOpen: true,
            message: "Resetting Keypad..."
        });
        const newKeypadData = Array.from({ length: 8 }, (_, index) => {
            const baseData = {
                id: index + 1,
                press_command: 0x01,
                press_value: 1,
                press_extra_value: 0,
                press_target_addr: '',
                press_addr_code: 1,
                hold_command: 0x02,
                hold_value: 1,
                hold_extra_value: 0,
                hold_target_addr: '',
                hold_addr_code: 1,
                release_command: 0x03,
                release_value: 1,
                release_extra_value: 0,
                release_target_addr: '',
                release_addr_code: 1,
            };

            // formatActionDetail(baseData);
            return baseData;
        });
        setKeypadData(newKeypadData);

        try {
            const response = await keypadService.resetKeypad(selectedDeviceId!);
            if (response.success) {
                await keypadService.deleteUnassignedKeypads(selectedDeviceId!);
                fetchFloorsThunk();
                setSelectedDeviceId(null);
                setSelectedDeviceType(null);
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to reset keypad");
        } finally {
            setLoadingDialog({
                isOpen: false,
                message: ''
            });
        }
    };

    const saveTemplate = () => {
        setImportExportDialog({
            isOpen: true,
            title: "Save Keypad Config",
            type: "export",
            buttonText: "Save"
        })
    };

    const importTemplate = () => {
        setImportExportDialog({
            isOpen: true,
            title: "Import Keypad Config",
            type: "import",
            buttonText: "Import"
        })
    };

    const clearKeypad = () => {
        const newKeypadData = Array.from({ length: 8 }, (_, i) => {
            const baseData = {
                id: i + 1,
                press_command: null,
                press_value: 0,
                press_extra_value: 0,
                press_target_addr: '',
                press_addr_code: '',
                hold_command: null,
                hold_value: 0,
                hold_extra_value: 0,
                hold_target_addr: '',
                hold_addr_code: null,
                release_command: null,
                release_value: 0,
                release_extra_value: 0,
                release_target_addr: '',
                release_addr_code: null,
            };
            // formatActionDetail(baseData);
            return baseData;
        });

        setKeypadData(newKeypadData);
    };

    const selectKey = (id: number) => {
        setModel({
            press: { command: null, value: 0, extraValue: 0, displayText: '' },
            hold: { command: null, value: 0, extraValue: 0, displayText: '' },
            release: { command: null, value: 0, extraValue: 0, displayText: '' },
            sequence: false
        });

        setKeypadActionDetail(prev => {
            return prev.map(element => {
                if (element.id === id) {
                    const updatedElement = { ...element, selected: true };
                    setActiveKey(element);

                    if (keypadData?.length && keypadData[id - 1]) {
                        const keypad_data = keypadData[id - 1];

                        const updatedModel = {
                            press: {
                                command: keypad_data.press_command ?? 0,
                                value: keypad_data.press_command === 0x23
                                    ? keypad_data.press_value
                                    : checkValue(keypad_data.press_command, keypad_data.press_value, keypad_data.press_extra_value),
                                extraValue: keypad_data.press_command === 0x23 || isPriorityCommand(keypad_data.press_command)
                                    ? keypad_data.press_extra_value : 0,
                                displayText: getDisplayText(keypad_data.press_command)
                            },
                            hold: {
                                command: keypad_data.hold_command ?? 0,
                                value: keypad_data.hold_command === 0x23
                                    ? keypad_data.hold_value
                                    : checkValue(keypad_data.hold_command, keypad_data.hold_value, keypad_data.hold_extra_value),
                                extraValue: keypad_data.hold_command === 0x23 || isPriorityCommand(keypad_data.hold_command)
                                    ? keypad_data.hold_extra_value : 0,
                                displayText: getDisplayText(keypad_data.hold_command)
                            },
                            release: {
                                command: keypad_data.release_command ?? 0,
                                value: keypad_data.release_command === 0x23
                                    ? keypad_data.release_value
                                    : checkValue(keypad_data.release_command, keypad_data.release_value, keypad_data.release_extra_value),
                                extraValue:
                                    keypad_data.release_command === 0x23 || isPriorityCommand(keypad_data.release_command)
                                        ? keypad_data.release_extra_value : 0,
                                displayText: getDisplayText(keypad_data.release_command)
                            },
                            sequence: checkSequenceCommand(keypad_data.press_addr_code)
                        };
                        setModel(updatedModel);

                        // Handle selectedDevice logic
                        let device = '';

                        if (
                            keypad_data.press_addr_code !== '' &&
                            (keypad_data.press_addr_code || keypad_data.press_addr_code === 0)
                        ) {
                            const code = keypad_data.press_addr_code;

                            if (code === 0 || code === 64) device = 'Group-All';
                            else if (code === 1 || code === 65) device = 'Motor-All';
                            else if (code === 2 || code === 66) {
                                if (keypad_data.press_target_addr) device = keypad_data.press_target_addr;
                            }
                            else if (code === 128 || code === 192) {
                                const targetGroup = individualSwitchGroup[id - 1] ? individualSwitchGroup[id - 1].toUpperCase() : '000000';
                                device = targetGroup;
                            }
                        }
                        setSelectedDevice(device);

                        // isGroupSelected check
                        if (keypad_data.press_command === 0x11 || keypad_data.hold_command === 0x11 || keypad_data.release_command === 0x11) {

                        }
                    }
                    return updatedElement;
                } else {
                    return { ...element, selected: false };
                }
            })
        });
    };

    const checkSequenceCommand = (addr_code: number) => {
        let sequence = false;
        switch (addr_code) {
            case 192:
            case 65:
            case 64:
            case 66:
                sequence = true;
                break;
            default:
                break;
        }
        return sequence;
    };

    const setSwitchSetting = async () => {
        try {
            setLoading(true);
            setLoadingDialog({ isOpen: true, message: "Processing Switch Settings..." });

            await keypadService.setKeypadType(selectedDeviceId!, 1);

            for (let i = 0; i < 8; i++) {
                if (selectedKeypad?.key_count == 6 && (i == (SIX_DK_IGNORE_ID1 - 1) || i == (SIX_DK_IGNORE_ID2 - 1))) continue;

                let keypad_data = keypadData[i];
                let target_address = '';
                if (keypad_data.press_command == 17) target_address = '000000';
                else target_address = getTargetAddress(keypad_data.id);

                let data_target_address = !target_address || target_address === '000000' ? '000000' : target_address;

                const payload: SwitchSettings = {
                    id: keypad_data.id,
                    press_command: keypad_data.press_command ?? 0,
                    press_value: +manageIPValue(keypad_data.press_command, keypad_data.press_value, 'send'),
                    press_extra_value: +keypad_data.press_extra_value,
                    press_addr_code: keypad_data.press_addr_code ?? 0,
                    press_target_addr: data_target_address,
                    hold_command: keypad_data.hold_command ?? 0,
                    hold_value: +manageIPValue(keypad_data.hold_command, keypad_data.hold_value, 'send'),
                    hold_extra_value: +keypad_data.hold_extra_value,
                    hold_addr_code: keypad_data.hold_addr_code ?? 0,
                    hold_target_addr: data_target_address,
                    release_command: keypad_data.release_command ?? 0,
                    release_value: +manageIPValue(keypad_data.release_command, keypad_data.release_value, 'send'),
                    release_extra_value: +keypad_data.release_extra_value,
                    release_addr_code: keypad_data.release_addr_code ?? 0,
                    release_target_addr: data_target_address,
                }

                try {
                    await keypadService.setKeypadSwitchSettings(selectedDeviceId!, payload);
                } catch (error) {
                    console.log('error: ', error);
                }
            }

            await updateIndividualSwitchGroup();

        } catch (error) {
            toast.error((error as Error).message || "Failed to update switch settings");
            return;
        } finally {
            setLoading(false);
            setLoadingDialog({ isOpen: false, message: "" });
        }
        getSwitchSettins();
    }

    const getTargetAddress = (id: any) => {
        let target_address = '000000';
        if (keypadData[id - 1].press_addr_code == 0 || keypadData[id - 1].press_addr_code == 64) {
            // group all
            setIndividualSwitchGroup(prev => {
                const updated = [...prev];
                updated[id - 1] = selectedAllGroup ?? '000000';
                return updated;
            });
        } else if (keypadData[id - 1].press_addr_code == 1 || keypadData[id - 1].press_addr_code == 65) {
            // motor all
            target_address = selectedAllMotor ?? '000000';
        } else if (keypadData[id - 1].press_addr_code == 2 || keypadData[id - 1].press_addr_code == 66) {
            // specified motor
            target_address = keypadData[id - 1].press_target_addr;
        } else if (keypadData[id - 1].press_addr_code == 128 || keypadData[id - 1].press_addr_code == 192) {
            // specified group
            target_address = '000000';
        } else if (keypadData[id - 1].press_addr_code == 3) {
            // specified group
            target_address = 'FFFFFF';
        }
        return target_address;
    }

    const onSequenceChange = (checked: boolean) => {
        setModel(prev => ({
            ...prev,
            sequence: checked,
        }));
        let index = activeKey?.id! - 1;
        setKeypadActionDetail(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                sequence: checked,
            };
            return updated;
        });
        if (selectedDevice) {
            setKeypadData(prev => {
                const updated = [...prev];
                const addr_code = getAddrCode(checked);
                updated[index] = {
                    ...updated[index],
                    press_addr_code: addr_code,
                    hold_addr_code: addr_code,
                    release_addr_code: addr_code,
                };
                // formatActionDetail(updated[index]);
                return updated;
            });
        }
    }

    const inputChange = (event: any, command: number | null, type: "press" | "hold" | "release") => {
        if (event.target.value === "") {
            setModel(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    value: ""
                }
            }));
            return;
        };
        let inputValue = Number(event.target.value);
        if (inputValue < 0) {
            setModel(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    value: 0
                }
            }));
            return;
        };
        switch (command) {
            case 0x8:
                if (inputValue < 1) inputValue = 1;
                if (inputValue > 65535) inputValue = 65535;
                break;
            case 0x0C:
            case 0x0D:
            case 0x0A:
            case 0x0B:
            case 0x20:
            case 0x21:
            case 0x22:
                if (inputValue > 255) inputValue = 255;
                break;
            case 0x10:
                if (inputValue > 100) inputValue = 100;
                break;
            case 0x4:
            case 0x23:
            case 0x25:
                if (inputValue < 1) inputValue = 1;
                if (inputValue > 16) inputValue = 16;
                break;
            default:
                break;
        }
        const updatedItem = {
            ...model[type],
            value: inputValue,
        };
        setModel(prev => ({
            ...prev,
            [type]: updatedItem,
        }));
        setActionDetail(command!, type, true, structuredClone(updatedItem));
    }

    const extraInputChange = (command: number | null, event: any, type: "press" | "hold" | "release") => {
        if (event.target.value === "") {
            setModel(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    extraValue: ""
                }
            }));
            return;
        };
        let inputValue = Number(event.target.value);
        if (inputValue < 0) {
            setModel(prev => ({
                ...prev,
                [type]: {
                    ...prev[type],
                    extraValue: 0
                }
            }));
            return;
        };
        if (inputValue > 255) inputValue = 255;
        const updatedItem = {
            ...model[type],
            extraValue: inputValue,
        };
        setModel(prev => ({
            ...prev,
            [type]: updatedItem,
        }));
        setActionDetail(command!, type, true, structuredClone(updatedItem));
    }

    const getDisplayText = (command: number, type?: "press" | "hold" | "release") => {
        filterTargetDeviceList();
        let text = "";
        switch (command) {
            case 0x4:
            case 0x23:
            case 0x25:
                text = "IP";
                break;
            case 0x8:
            case 0x0C:
            case 0x0D:
                text = "Count";
                break;
            case 0x0A:
            case 0x0B:
                text = "*ms";
                break;
            case 0x10:
                text = "%";
                break;
            case 0x20:
            case 0x21:
            case 0x22:
            case 0x24:
                text = "Priority";
                break;
            case 0x11:
                text = "";
            default:
                text = "";
                break;
        }
        if (type) {
            const updatedItem = {
                ...model[type],
                displayText: text,
                value: 1,
                command: command,
            };
            setModel(prev => ({
                ...prev,
                [type]: updatedItem,
            }));
            setActionDetail(command, type, false, structuredClone(updatedItem));
        }
        return text;
    }

    const setActionDetail = (command: number, type: "press" | "hold" | "release", action: boolean, model?: any) => {
        if (action) {
            let index = activeKey?.id! - 1;
            setKeypadActionDetail(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    [`on_${type}_action`]: getAction(command, +model?.value, +model?.extraValue),
                };
                return updated;
            });
            if (command !== 0x23) {
                let mainValue = setValue(command, +model?.value, +model?.extraValue);
                setModel(prev => ({
                    ...prev,
                    [type]: {
                        ...prev[type],
                        value: mainValue[0],
                        extraValue: mainValue[1],
                    }
                }));
            }

            setKeypadData(prev => {
                const updated = [...prev];
                const current = updated[index];
                updated[index] = {
                    ...current,
                    [`${type}_value`]: +model?.value,
                    [`${type}_extra_value`]: +model?.extraValue,
                };
                return updated;
            });
        } else {
            // group
            if (command === 0x11) {
                setKeypadActionDetail(prev => {
                    const updated = [...prev];
                    const current = updated[activeKey?.id! - 1];
                    updated[activeKey?.id! - 1] = {
                        ...current,
                        on_press: "Group",
                        on_press_action: "",
                        on_hold: getAction(0x00, 0, 0),
                        on_hold_action: "",
                        on_release: getAction(0x00, 0, 0),
                        on_release_action: "",
                    };
                    return updated;
                });

                setKeypadData(prev => {
                    const updated = [...prev];
                    const current = updated[activeKey?.id! - 1];
                    updated[activeKey?.id! - 1] = {
                        ...current,
                        press_command: command,
                        press_value: 0,
                        press_extra_value: 0,

                        hold_command: 0,
                        hold_value: 0,
                        hold_extra_value: 0,

                        release_command: 0,
                        release_value: 0,
                        release_extra_value: 0,
                    };
                    return updated;
                });
            } else {
                setKeypadActionDetail(prev => {
                    const updated = [...prev];
                    const current = updated[activeKey?.id! - 1];
                    updated[activeKey?.id! - 1] = {
                        ...current,
                        [`on_${type}_action`]: getAction(command, +model?.value, +model?.extraValue),
                        [`on_${type}`]: keypadConfigLst.find(item => item.id === command)?.name || "",
                    };
                    return updated;
                });

                if (command !== 0x23) {
                    let mainValue = setValue(command, +model?.value, +model?.extraValue);
                    setModel(prev => ({
                        ...prev,
                        [type]: {
                            ...prev[type],
                            value: mainValue[0],
                            extraValue: mainValue[1],
                        }
                    }));
                }

                setKeypadData(prev => {
                    const updated = [...prev];
                    const current = updated[activeKey?.id! - 1];
                    updated[activeKey?.id! - 1] = {
                        ...current,
                        [`${type}_command`]: command,
                        [`${type}_value`]: +model?.value,
                        [`${type}_extra_value`]: +model?.extraValue,
                    };
                    return updated;
                });
            }
        }
    }

    const setValue = (command: number, value: number, extraValue: number) => {
        let mainValue = [value, extraValue];
        switch (command) {
            case 0x20:
            case 0x21:
            case 0x22:
            case 0x24:
                mainValue = [0, extraValue];
            default:
                break;
        }
        return mainValue;
    }

    const checkValue = (command: number, value: number, extraValue: number) => {
        let mainValue = value;
        switch (command) {
            case 0x20:
            case 0x21:
            case 0x22:
            case 0x24:
                mainValue = 0;
            default:
                break;
        }
        return mainValue;
    }

    const filterTargetDeviceList = () => {
        if (model.press.command === 0x11) {
            setSelectedDevice(null);
            setModel(prev => ({
                ...prev,
                hold: {
                    ...prev.hold,
                    command: 0,
                    displayText: "",
                },
                release: {
                    ...prev.release,
                    command: 0,
                    displayText: "",
                }
            }));
            setTargetDeviceList(copyTargetDeviceList.filter((item) => item.room_name === "Group"));
        } else {
            setTargetDeviceList(copyTargetDeviceList);
        }
    }

    const isPriorityCommand = (command: number | null) => {
        return command === 0x20 || command === 0x21 || command === 0x22 || command === 0x24;
    }

    const saveSchema = async () => {
        if (!configName) return;

        if (configName.length > 20) {
            toast.error("Config name must be less than 20 characters");
            return;
        }

        const updatedKeypadData = keypadData.map(element => {
            const targetAddress = getTargetAddress(element.id);

            return {
                ...element,
                press_command: element.press_command ?? 0,
                press_target_addr: targetAddress,
                hold_command: element.hold_command ?? 0,
                hold_target_addr: targetAddress,
                release_command: element.release_command ?? 0,
                release_target_addr: targetAddress,
            };
        });

        const payload = {
            name: configName,
            keypad_data: updatedKeypadData,
            individualSwitchGroup: individualSwitchGroup,
        };

        setKeypadData(updatedKeypadData);

        try {
            const response = await keypadService.addKeypadConfigSchema(payload);
            if (response.success) {
                toast.success("Template saved successfully");
                setConfigName("");
                setImportExportDialog({
                    isOpen: false,
                    type: "import",
                    title: "",
                    buttonText: "",
                });
                getKeypadConfigSchema();
            }

        } catch (error) {
            toast.error((error as Error).message || "Failed to save template");
        }
    }

    const importSchema = () => {
        if (!configName) return;

        const selectedSchema = savedConfigSchemaWithPreDefined.find(item => item.name === configName);
        if (!selectedSchema) {
            toast.error("Selected template not found");
            return;
        }

        setIndividualSwitchGroup(selectedSchema.individualSwitchGroup || []);

        setKeypadData(selectedSchema.keypad_data);

        setImportExportDialog({
            isOpen: false,
            type: "import",
            title: "",
            buttonText: "",
        })
    }

    const isActiveKey = (keyId: number) => {
        return keyId !== SIX_DK_IGNORE_ID1 && keyId !== SIX_DK_IGNORE_ID2 || (selectedKeypad?.key_count !== 6);
    }

    return (
        <div className="w-full h-full flex flex-col justify-start items-start gap-2 p-4">
            {/* keypad info and position */}
            <div className="w-full flex flex-col justify-start items-start border-b border-borderColor/20 pb-4">
                <div className="flex justify-start items-start gap-2">
                    {selectedKeypad?.name && (
                        <h1 className="text-base font-bold">{selectedKeypad?.name}</h1>
                    )}
                    <span className="text-textDarkColor font-semibold text-base">
                        ({selectedKeypad?.model_no ? findDeviceType(selectedKeypad.model_no) : '0.0.0.0'})
                    </span>
                    <span className="text-textDarkColor font-semibold text-base">
                        ({selectedKeypad?.address})
                    </span>
                </div>
                <div className="flex w-full justify-between items-center">
                    <div>
                        <span className="text-textDarkColor font-light text-base mr-4">
                            Firmware Version: {selectedKeypad?.firmware_version || '0.0.0.0'}
                        </span>

                        <TooltipComponent content="Refresh Motor Data" direction="top">
                            <button
                                disabled={!isComportConnected || isOfflineEditMode}
                                onClick={getSwitchSettins}
                                className="bg-buttonColor rounded-full cursor-pointer disabled:cursor-default disabled:opacity-50 p-2 transform active:scale-95 transition-all"
                            >
                                <RotateCw size={16} className="text-white" />
                            </button>
                        </TooltipComponent>
                    </div>
                    <div className="flex flex-row gap-4">
                        <SetProButton
                            disabled={!isComportConnected || loading}
                            buttonType="submit"
                            onClick={() => setResetDefaultDialogOpen(true)}
                        >
                            <Save size={18} />
                            Factory Reset
                        </SetProButton>
                        <SetProButton
                            disabled={!isComportConnected || loading}
                            buttonType="submit"
                            onClick={() => saveTemplate()}
                        >
                            <Save size={18} />
                            Save Template
                        </SetProButton>
                        <SetProButton
                            disabled={!isComportConnected || loading}
                            buttonType="submit"
                            onClick={() => importTemplate()}
                        >
                            <FileUp size={18} />
                            Import Template
                        </SetProButton>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="flex gap-4 justify-center relative">
                    <div className="w-1/5 rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3"> Motor All</div>
                        </div>
                        <div className="bg-gray-100">
                            <div className="m-2 font-semibold leading-tight">
                                <Dropdown
                                    value={selectedAllMotor}
                                    onChange={(e) => setSelectedAllMotor(e.value)}
                                    options={allMotorList}
                                    optionLabel="name"
                                    optionValue="address"
                                    optionGroupLabel="room_name"
                                    optionGroupChildren="device"
                                    className="w-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-1/5 rounded-lg shadow-md overflow-hidden flex flex-col">
                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3"> Group All</div>
                        </div>
                        <div className="bg-gray-100">
                            <div className="m-2 font-semibold leading-tight">
                                <Dropdown
                                    value={selectedAllGroup}
                                    onChange={(e) => { setSelectedAllGroup(e.value); }}
                                    options={allGroupList}
                                    filter
                                    optionLabel="name"
                                    optionValue="address"
                                    className="w-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <SetProButton
                        disabled={!isComportConnected || loading}
                        buttonType="submit"
                        loading={loading}
                        onClick={() => clearKeypad()}
                        className="absolute right-0"
                    >
                        <Save size={18} />
                        Clear Keypad
                    </SetProButton>
                </div>
                <div className="grid grid-cols-7 gap-4 w-full mt-6">
                    <div className="col-span-2 flex justify-center">
                        <div className="keypad-button w-full">
                            <div className="flex-col w-full max-w-100 p-2 border-gray-300 border rounded-xl">
                                <div className="text-center font-medium tracking-tight text-gray-500">Keypad Decoflex</div>
                                <div className="flex flex-col px-6 py-4">
                                    <div className="shadow bg-card text-center border-gray-300 border">
                                        {keypadActionDetail.map((item, i) => {
                                            const isSecondLast = i === keypadActionDetail.length - 2;
                                            const isLast = i === keypadActionDetail.length - 1;
                                            if (isLast) return null;
                                            if (isSecondLast) {
                                                return (
                                                    <div className="key-x-2 grid grid-cols-2">
                                                        <div
                                                            key={item.id}
                                                            onClick={() => selectKey(item.id)}
                                                            className={cn("border-r bottom-button cursor-pointer border-gray-300 !h-[118px] w-full",
                                                                activeKey?.id === item.id && "active",
                                                            )}
                                                        >
                                                            <div>
                                                                <button className="w-full py-4">
                                                                    <div className="text-xl"><b>{item.name}</b> </div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div
                                                            key={keypadActionDetail[i + 1]?.id}
                                                            onClick={() => selectKey(keypadActionDetail[i + 1]?.id)}
                                                            className={cn("bottom-button cursor-pointer border-gray-300 !h-[118px] w-full",
                                                                (activeKey?.id === keypadActionDetail[i + 1]?.id) && "active",
                                                            )}
                                                        >
                                                            <div>
                                                                <button className="w-full py-4">
                                                                    <div className="text-xl">
                                                                        <b>{keypadActionDetail[i + 1].name}</b>
                                                                    </div>
                                                                </button>
                                                            </div>

                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => selectKey(item.id)}
                                                    className={cn("key py-2 cursor-pointer border-gray-300",
                                                        activeKey?.id === item.id && "active",
                                                        (([4, 5].includes(item.id) && selectedKeypad?.key_count == 6) && "hide")
                                                    )}
                                                >
                                                    <div>
                                                        <div className="text-xl"><b>{item.name}</b> </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row justify-center items-center">
                                    <img src="public/images/logo_somfy_old.svg" className="w-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-3">
                        <div className="flex flex-col mt-1 gap-1 w-full text-xs action-detail">
                            {keypadActionDetail.map((item) => (
                                <div
                                    onClick={() => selectKey(item.id)}
                                    className={cn("border-t w-full min-h-[59px] max-h-[59px] relative mt-[3px] leading-none overflow-hidden rounded-md bg-white shadow-md",
                                        activeKey?.id === item.id && "active",
                                        (!isActiveKey(item.id) && "opacity-40 pointer-events-none")
                                    )}
                                >
                                    <div className="grid grid-cols-11 items-center cursor-pointer">
                                        <span className="col-span-3">
                                            <div className="flex flex-col w-full rounded-none">
                                                <div className="bg-slate-800 text-white min-h-[28px] max-h-[28px] flex items-center">
                                                    <div className="m-auto font-semibold leading-tight line-clamp-3 text-ellipsis overflow-hidden">
                                                        Button-{item.id}
                                                    </div>
                                                </div>
                                                <div className="min-h-[29px] max-h-[29px] flex justify-center items-center bg-gray-100 text-center text-accent font-semibold">
                                                    {isActiveKey(item.id) && (
                                                        <>
                                                            <span className="align-middle mr-1">
                                                                {item.target_type === "motor" && (
                                                                    <img
                                                                        src="/svg/motor.svg"
                                                                        alt="Motor Icon"
                                                                        className="inline-block mr-2 w-4 h-4"
                                                                    />
                                                                )}
                                                                {item.target_type === "group" && (
                                                                    <MdDeviceHub className="text-gray-500" size={18} />
                                                                )}
                                                            </span>
                                                            <span className="align-middle text-gray-700">
                                                                {item.target_name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </span>
                                        <span className="col-span-8 ml-2 leading-normal">
                                            <div>
                                                <span className="font-bold">{item.sequence ? 'Cmd-1' : 'On Press'} : </span>
                                                <span className="text-gray-400">{(item.on_press && isActiveKey(item.id)) ? item.on_press : 'No Action'}</span>
                                                {(item.on_press_action && isActiveKey(item.id)) && (
                                                    <span className="text-gray-400"> {"("}{item.on_press_action}{")"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold">{item.sequence ? 'Cmd-2' : 'On Hold'} : </span>
                                                <span className="text-gray-400">{(item.on_hold && isActiveKey(item.id)) ? item.on_hold : 'No Action'}</span>
                                                {(item.on_hold_action && isActiveKey(item.id)) && (
                                                    <span className="text-gray-400"> {"("}{item.on_hold_action}{")"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold">{item.sequence ? 'Cmd-3' : 'On Release'} : </span>
                                                <span className="text-gray-400">{(item.on_release && isActiveKey(item.id)) ? item.on_release : 'No Action'}</span>
                                                {(item.on_release_action && isActiveKey(item.id)) && (
                                                    <span className="text-gray-400"> {"("}{item.on_release_action}{")"}</span>
                                                )}
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="w-full flex justify-center items-center mx-auto mt-4">
                            <SetProButton
                                disabled={!isComportConnected || loading}
                                loading={loading}
                                buttonType="submit"
                                onClick={() => setSwitchSetting()}
                            >
                                <Save size={18} />
                                Push Configuration
                            </SetProButton>
                        </div>
                    </div>
                    {activeKey && (
                        <div className="col-span-2 relative mt-[-3.5rem]">
                            <TooltipComponent
                                content={"Close"}
                                direction={"bottom"}
                            >
                                <button
                                    onClick={() => {
                                        setActiveKey(null)
                                    }}
                                    className="absolute right-1 top-1 text-gray-600 z-10 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </TooltipComponent>
                            <div className="w-full flex flex-col text-center p-6 relative overflow-hidden shadow rounded-lg">
                                <div className="text-xl font-bold">{activeKey?.name}</div>
                                <div className="text-xl font-bold">Configuration</div>
                                <div className="mt-2">
                                    <div className="rounded-lg shadow-md overflow-hidden flex flex-col max-w-80">
                                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3"> Device</div>
                                        </div>
                                        <div className="bg-gray-100">
                                            <div className="m-2 font-semibold leading-tight">
                                                <Dropdown
                                                    value={selectedDevice}
                                                    onChange={(e) => {
                                                        setSelectedDevice(e.value);
                                                    }}
                                                    options={targetDeviceList}
                                                    filter
                                                    optionLabel="name"
                                                    optionValue="address"
                                                    optionGroupLabel="room_name"
                                                    optionGroupChildren="device"
                                                    className="w-full rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-row items-center justify-center gap-3">
                                    <span><b>Sequence</b></span>
                                    <Switch checked={model.sequence} onCheckedChange={(checked) => onSequenceChange(checked)} />
                                </div>
                                <div className="mt-4">
                                    <div className="rounded-lg shadow-md overflow-hidden flex flex-col max-w-80">
                                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3">
                                                {model.sequence ? 'Command-1' : 'On Press'}
                                            </div>
                                        </div>
                                        <div className="bg-gray-100">
                                            <div className="m-2 font-semibold leading-tight flex justify-center">
                                                <Select value={model.press.command?.toString()} onValueChange={(value) => {
                                                    // setModel(prev => ({ ...prev, press: { ...prev.press, command: parseInt(value) } }));
                                                    getDisplayText(parseInt(value), "press");
                                                }}
                                                >
                                                    <SelectTrigger className="rounded-full w-10/12 ">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={"0"}>No Action</SelectItem>
                                                        {
                                                            keypadConfigLst.map(cmd => (
                                                                <SelectItem
                                                                    className={cmd.id === 17 && activeKey?.id > 5 ? "hidden" : ""}
                                                                    key={cmd.id}
                                                                    value={cmd.id.toString()}
                                                                >
                                                                    {cmd.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="mb-2 font-semibold leading-tight flex flex-col items-center justify-center">
                                                {(model.press.displayText && !isPriorityCommand(model.press.command)) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.press.value}
                                                            onChange={(e) => inputChange(e, model.press.command, "press")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        press: {
                                                                            ...prev.press,
                                                                            value: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            {model.press.displayText}
                                                        </div>
                                                    </div>
                                                )}
                                                {(isPriorityCommand(model.press.command) || model.press.command == 35) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.press.extraValue}
                                                            onChange={(e) => extraInputChange(model.press.command, e, "press")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        press: {
                                                                            ...prev.press,
                                                                            extraValue: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            Priority
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="rounded-lg shadow-md overflow-hidden flex flex-col max-w-80">
                                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3">
                                                {model.sequence ? 'Command-2' : 'On Hold'}
                                            </div>
                                        </div>
                                        <div className="bg-gray-100">
                                            <div className="m-2 font-semibold leading-tight flex justify-center">
                                                <Select value={model.hold.command?.toString()} onValueChange={(value) => {
                                                    // setModel(prev => ({ ...prev, hold: { ...prev.hold, command: parseInt(value) } }));
                                                    getDisplayText(parseInt(value), "hold");
                                                }}
                                                >
                                                    <SelectTrigger className="rounded-full w-10/12 ">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={"0"}>No Action</SelectItem>
                                                        {
                                                            keypadConfigLst.map(cmd => (
                                                                <SelectItem
                                                                    className={cmd.id === 17 ? "hidden" : ""}
                                                                    key={cmd.id}
                                                                    value={cmd.id.toString()}
                                                                >
                                                                    {cmd.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="mb-2 font-semibold leading-tight flex flex-col items-center justify-center">
                                                {(model.hold.displayText && !isPriorityCommand(model.hold.command)) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.hold.value}
                                                            onChange={(e) => inputChange(e, model.hold.command, "hold")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        hold: {
                                                                            ...prev.hold,
                                                                            value: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            {model.hold.displayText}
                                                        </div>
                                                    </div>
                                                )}
                                                {(isPriorityCommand(model.hold.command) || model.hold.command == 35) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.hold.extraValue}
                                                            onChange={(e) => extraInputChange(model.hold.command, e, "hold")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        hold: {
                                                                            ...prev.hold,
                                                                            extraValue: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            Priority
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="rounded-lg shadow-md overflow-hidden flex flex-col max-w-80">
                                        <div className="bg-slate-800 text-white min-h-[35px] max-h-[35px] flex items-center font-semibold">
                                            <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3">
                                                {model.sequence ? 'Command-3' : 'On Release'}
                                            </div>
                                        </div>
                                        <div className="bg-gray-100">
                                            <div className="m-2 font-semibold leading-tight flex justify-center">
                                                <Select value={model.release.command?.toString()} onValueChange={(value) => {
                                                    // setModel(prev => ({ ...prev, release: { ...prev.release, command: parseInt(value) } }));
                                                    getDisplayText(parseInt(value), "release");
                                                }}
                                                >
                                                    <SelectTrigger className="rounded-full w-10/12 ">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={"0"}>No Action</SelectItem>
                                                        {
                                                            keypadConfigLst.map(cmd => (
                                                                <SelectItem
                                                                    className={cmd.id === 17 ? "hidden" : ""}
                                                                    key={cmd.id}
                                                                    value={cmd.id.toString()}
                                                                >
                                                                    {cmd.name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="mb-2 font-semibold leading-tight flex flex-col items-center justify-center">
                                                {(model.release.displayText && !isPriorityCommand(model.release.command)) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.release.value}
                                                            onChange={(e) => inputChange(e, model.release.command, "release")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        release: {
                                                                            ...prev.release,
                                                                            value: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            {model.release.displayText}
                                                        </div>
                                                    </div>
                                                )}
                                                {(isPriorityCommand(model.release.command) || model.release.command == 35) && (
                                                    <div className="w-9/12 relative flex m-2 items-center justify-between gap-0 bg-white rounded-full shadow-sm border border-gray-200 overflow-hidden">
                                                        <input
                                                            type="number"
                                                            value={model.release.extraValue}
                                                            onChange={(e) => extraInputChange(model.release.command, e, "release")}
                                                            onBlur={(e) => {
                                                                if (e.target.value === "") {
                                                                    setModel(prev => ({
                                                                        ...prev,
                                                                        release: {
                                                                            ...prev.release,
                                                                            extraValue: 0
                                                                        }
                                                                    }))
                                                                }
                                                            }}
                                                            className="w-[50%] px-4 py-2 text-center text-textDarkColor focus:outline-none bg-transparent"
                                                            placeholder="Enter value"
                                                            disabled={!isComportConnected}
                                                        />
                                                        <div
                                                            className={cn("h-full flex items-center justify-center absolute right-0 top-0 w-[50%] bg-slate-800 text-white font-medium",
                                                                (!isComportConnected) && "opacity-50"
                                                            )}
                                                        >
                                                            Priority
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={resetDefaultDialogOpen}
                onOpenChange={() => setResetDefaultDialogOpen(false)}
                title="Reset Keypad to Default?"
                description="This will erase the keypad’s label, Node ID, and all configuration. The keypad will be deleted from this project. This action cannot be undone."
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={factoryReset}
                variant="destructive"
            />

            {importExportDialog.isOpen && (
                <Dialog open={importExportDialog.isOpen} onOpenChange={(isOpen) => setImportExportDialog(prev => ({ ...prev, isOpen }))}>
                    <DialogContent
                        aria-describedby={undefined}
                        showCross={false}
                        onPointerDownOutside={(e) => e.preventDefault()}
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        className="sm:max-w-[400px] bg-white"
                    >
                        <DialogTitle className="font-bold text-xl">
                            {importExportDialog.title}
                        </DialogTitle>

                        <div className="flex flex-col justify-center mt-2 my-4">
                            {importExportDialog.type === "export" && (
                                <div className="flex flex-col px-4">
                                    <div className="flex flex-col">
                                        <span className="mb-2">keypad config name</span>
                                        <InputText
                                            value={configName}
                                            onChange={(e) => setConfigName(e.target.value)}
                                            type="text"
                                            id="config_name"
                                            placeholder="Enter config name"
                                            className="border border-gray-400 max-w-[300px] px-2 h-10"
                                        />
                                    </div>
                                    <div className="text-center mt-2">
                                        OR
                                    </div>
                                </div>
                            )}
                            <div className="mt-2 w-full flex flex-col justify-center px-4">
                                <span className="mb-2 text-sm">Select Keypad Config</span>
                                {importExportDialog.type === "export" ? (
                                    <Dropdown
                                        value={selectedConfig}
                                        onChange={(e) => {
                                            setSelectedConfig(e.value);
                                            setConfigName(e.value);
                                        }}
                                        options={savedConfigSchema}
                                        optionLabel="name"
                                        optionValue="name"
                                        appendTo="self"
                                        className="max-w-[300px] rounded-full border border-gray-400"
                                    />
                                ) : (
                                    <Dropdown
                                        value={selectedConfig}
                                        onChange={(e) => {
                                            setSelectedConfig(e.value);
                                            setConfigName(e.value);
                                        }}
                                        options={savedConfigSchemaWithPreDefined}
                                        optionLabel="name"
                                        optionValue="name"
                                        className="max-w-[300px] rounded-full border border-gray-400"
                                        appendTo="self"
                                    />
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <div className="flex w-full justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setImportExportDialog(prev => ({ ...prev, isOpen: false }))}
                                    className="px-4 py-2 text-sm font-medium text-textGrayColor border border-borderColor bg-secondaryBackground hover:bg-secondaryBackground/80 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <SetProButton
                                    buttonType="submit"
                                    type="submit"
                                    loading={loading}
                                    disabled={loading || (importExportDialog.type === "import" && !configName) || (importExportDialog.type === "export" && !configName)}
                                    onClick={() => {
                                        if (importExportDialog.type === "export") {
                                            saveSchema();
                                        } else {
                                            importSchema();
                                        }
                                    }}
                                >
                                    {importExportDialog.buttonText}
                                </SetProButton>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
            }
        </div >
    )
}
