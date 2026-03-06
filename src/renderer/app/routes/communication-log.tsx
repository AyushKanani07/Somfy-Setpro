import {
  ChevronsDown,
  ChevronsUp,
  Copy,
  Delete,
  Download,
  Send,
  SendHorizontal,
  SlidersVertical,
  Trash,
} from "lucide-react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useEffect, useState, useCallback, useRef } from "react";
import { TableVirtuoso, type TableVirtuosoHandle } from "react-virtuoso";
import { toast } from "sonner";
import { Icons } from "~/components/icons/Icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AllCommandsLst,
  lstNodeType,
  SOCKET_COMMAND,
} from "~/constant/constant";
import { cn } from "~/lib/utils";
import { communicationLogService } from "~/services/communicationLogService";
import { Switch } from "~/components/ui/switch";
import { ReportService } from "~/services/reportService";
import ConfirmDialog from "~/components/sharedComponent/ConfirmDialog";
import { socket } from "~/services/socketService";
import { set } from "zod";

type Log = {
  communication_log_id: number;
  time: string;
  source_node_type: string;
  destination_node_type: string;
  source: string;
  destination: string;
  command: string;
  data: string;
  frame: string;
  type: string;
  ack: boolean;
};

type model = {
  destination_node_type: number;
  source_node_type: number;
  addressing_mode: number;
  source: string;
  destination: string;
  ack: boolean;
  command: number | string;
  sub_node_type?: number;
};

type DataModel = {
  value: number;
  extra_value_1: number;
  extra_value_2: number;
  extra_value_3: string;
  extra_value_4: number;
  extra_value_5: number;
  extra_value_6: number;
  extra_value_7: number;
  extra_value_8: number;
  extra_value_9: number;
  extra_value_10: number;
  extra_value_11: number;
};

const addressingModeOptions = [
  { value: 1, label: "Point to point" },
  { value: 2, label: "Group" },
  { value: 3, label: "Broadcast" },
];
const DirectionOptions = [
  { label: "Down Direction", value: 0 },
  { label: "Up Direction", value: 1 },
];
const SpeedOptions = [
  { label: "UP Speed", value: 0 },
  { label: "Down Speed", value: 1 },
  { label: "Slow Speed", value: 2 },
];
const MoveToFunctionOptions = [
  { label: "Down Limit", value: 0 },
  { label: "Up Limit", value: 1 },
  { label: "IP", value: 2 },
  { label: "Position (in pulses)", value: 3 },
  { label: "Position (in %)", value: 4 },
  { label: "Position (in pulses) + angle (in pulses)", value: 8 },
  { label: "current position + angle (in pulses)", value: 14 },
  { label: "current position + angle (in %)", value: 15 },
  { label: "current position + angle (in degree)", value: 16 },
];
const IpOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
  { label: "16", value: 16 },
];
const MoveOfFunctionOptions = [
  { label: "Next IP DOWN", value: 0 },
  { label: "Next IP UP", value: 1 },
  { label: "Jog DOWN (in pulses)", value: 2 },
  { label: "Jog UP (in pulses)", value: 3 },
  { label: "Jog DOWN (in milliseconds)", value: 4 },
  { label: "Jog UP (in milliseconds)", value: 5 },
  { label: "Jog DOWN (in percent)", value: 6 },
  { label: "Jog UP (in percent)", value: 7 },
  { label: "Tilt DOWN (in degrees)", value: 8 },
  { label: "Tilt UP (in degrees)", value: 9 },
  { label: "Tilt DOWN (in pulses)", value: 10 },
  { label: "Tilt UP (in pulses)", value: 11 },
  { label: "Tilt DOWN (in percent)", value: 12 },
  { label: "Tilt UP (in percent)", value: 13 },
];
const AppModeOptions = [
  { label: "Roller", value: 0 },
  { label: "Interior Venetian Blind", value: 1 },
  { label: "Curtain", value: 2 },
  { label: "Tilt Only", value: 3 },
];
const MotorLimitOptions = [
  { label: "Delete", value: 0 },
  { label: "Set limit at the current position", value: 1 },
  { label: "Set limit at the specified position (in pulses)", value: 2 },
  { label: "Adjust using Jog (in ms)", value: 4 },
  { label: "Adjust using Jog (in pulses)", value: 5 },
];
const IpFunctionOptions = [
  { label: "Delete IP", value: 0 },
  { label: "Set IP at the current position", value: 1 },
  { label: "Set IP at the specified position (in pulses)", value: 2 },
  { label: "Set IP at the specified position (in %)", value: 3 },
  { label: "Divide the Full range with the given number of IPs", value: 4 },
  { label: "Set IP at current position & angle", value: 5 },
  {
    label: "Set IP at specified position (in pulses) & angle (in pulses)",
    value: 6,
  },
  {
    label: "Set IP at specified position (in pulses) & angle (in %)",
    value: 7,
  },
  {
    label: "Set IP at specified position (in pulses) & angle (in degrees)",
    value: 8,
  },
  {
    label: "Set IP at specified position (in %) & angle (in pulses)",
    value: 9,
  },
  { label: "Set IP at specified position (in %) & angle (in %)", value: 10 },
  {
    label: "Set IP at specified position (in %) & angle (in degrees)",
    value: 11,
  },
  { label: "Set IP at specified angle (in pulses)", value: 12 },
  { label: "Set IP at specified angle (in %)", value: 13 },
  { label: "Set IP at specified angle (in degrees)", value: 14 },
  { label: "Set IP at specified position (in pulses) & keep angle", value: 15 },
  { label: "Set IP at specified position (in %) & keep angle", value: 16 },
];
const localControlOptions = [
  { label: "All Local controls and feedbacks", value: 0 },
  { label: "DCT input (e.g. Up/Down/Stop keypad)", value: 1 },
  { label: "Local stimuli", value: 2 },
  { label: "Local Radio access", value: 3 },
  { label: "Touch Motion", value: 4 },
  { label: "LEDs", value: 5 },
];
const tiltFunctionOptions = [
  { label: "Delete all tilt values", value: 0 },
  { label: "Set Tilt limit at current position", value: 1 },
  {
    label: "Set Tilt limit at specified position from DEL in pulses",
    value: 2,
  },
  { label: "Set Tilt flat position at current position", value: 3 },
  { label: "Jog UP (in pulses)", value: 4 },
  { label: "Jog UP (in ms)", value: 5 },
  { label: "Set Tilt range in pulses", value: 6 },
  { label: "Set Upward backlash (in pulses)", value: 7 },
  { label: "Set Downward backlash (in pulses)", value: 8 },
  { label: "Set Upward backlash (in ms)", value: 9 },
  { label: "Set Downward backlash (in ms)", value: 10 },
  { label: "Set Min angle (in degrees)", value: 11 },
  { label: "Set Max angle (in degrees)", value: 12 },
  { label: "SET_START_TILTING", value: 16 },
  { label: "CANCEL_ADJUSTMENT", value: 17 },
];
const rampOptions = [
  { label: "Both, Soft Start and Soft Stop in up & down direction", value: 0 },
  { label: "Soft Start only in up & down direction", value: 1 },
  { label: "Soft Stop only in up & down direction", value: 2 },
  { label: "Both, Soft Start and Soft Stop in up direction", value: 3 },
  { label: "Soft Start only in up direction", value: 4 },
  { label: "Soft Stop only in up direction", value: 5 },
  { label: "Both, Soft Start and Soft Stop in down direction", value: 6 },
  { label: "Soft Start only in down direction", value: 7 },
  { label: "Soft Stop only in down direction", value: 8 },
];
const factoryFunctionOptions = [
  { label: "All settings to factory default", value: 0 },
  { label: "Clear all Group addresses", value: 1 },
  { label: "Clear Node Label", value: 2 },
  { label: "Delete UP/DOWN limits and all IPs", value: 17 },
  { label: "Default rotation direction", value: 18 },
  { label: "Default rolling & tilting speed setting", value: 19 },
  { label: "Delete all IPs", value: 21 },
  { label: "Clear all locks", value: 23 },
  { label: "Default tilting parameters", value: 24 },
  { label: "Default local UI status", value: 25 },
  { label: "Default application mode", value: 26 },
  { label: "Default motor deceleration and acceleration ramps", value: 27 },
  { label: "Default network parameters", value: 28 },
];
const groupIndexOptions = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
];
const buttonIdOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
];
const channelNoOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
];
const channelOptions = Array.from({ length: 16 }, (_, index) => ({
  label: index.toString(),
  value: index,
}));
const modeOptions = [
  { label: "Roller", value: 0 },
  { label: "Venetian", value: 1 },
  { label: "Curtain", value: 2 },
  { label: "Tilt Only", value: 3 },
];

export default function CommunicationLog() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(1);
  const [firstItemIndex, setFirstItemIndex] = useState(30);

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const firstLoadDone = useRef(false);
  const userScrolled = useRef(false);
  const virtuosoRef = useRef<TableVirtuosoHandle>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [model, setModel] = useState<model>({
    destination_node_type: 0,
    source_node_type: 0,
    addressing_mode: 1,
    source: "010000",
    destination: "FFFFFF",
    ack: false,
    command: "CTRL_STOP",
  });
  const [dataModel, setDataModel] = useState<DataModel>({
    value: 0,
    extra_value_1: 0,
    extra_value_2: 0,
    extra_value_3: "",
    extra_value_4: 0,
    extra_value_5: 0,
    extra_value_6: 0,
    extra_value_7: 0,
    extra_value_8: 0,
    extra_value_9: 0,
    extra_value_10: 0,
    extra_value_11: 0,
  });

  const [activeType, setActiveType] = useState<"rx" | "tx" | "">("");
  const [count, setCount] = useState<{ sent: number; received: number }>({
    sent: 0,
    received: 0,
  });
  const [isFrameDecoding, setIsFrameDecoding] = useState<boolean>(false);
  const [editFrame, setEditFrame] = useState<boolean>(false);
  const [frame, setFrame] = useState<string>("FD7309FFFFFEFF80DFFE07D1");

  const fetchLogs = useCallback(
    async (pageNumber: number, options?: { scrollToBottom?: boolean }) => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);

      try {
        const response = await communicationLogService.getCommunicationLogs(
          pageNumber,
          30,
          activeType,
        );

        const logsData: Log[] = response.data ?? [];

        if (!logsData.length) {
          setHasMore(false);
          return;
        }

        const ordered = [...logsData].reverse();

        if (pageNumber === 1) {
          setLogs(ordered);

          if (options?.scrollToBottom) {
            requestAnimationFrame(() => {
              const lastIndex = ordered.length;
              if (lastIndex >= 0) {
                virtuosoRef.current?.scrollToIndex({
                  index: lastIndex,
                  align: "start",
                  behavior: "auto",
                });
              }
            });
          }
        } else {
          setLogs((prev) => [...ordered, ...prev]);

          requestAnimationFrame(() => {
            virtuosoRef.current?.scrollToIndex({
              index: 30,
              align: "start",
              behavior: "auto",
            });
          });
        }
      } catch (error) {
        toast.error("Failed to fetch communication logs");
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, isLoading, activeType],
  );

  useEffect(() => {
    const init = async () => {
      await fetchLogs(1, { scrollToBottom: true });
      firstLoadDone.current = true;
    };

    init();
    getCommunicationLogsCount();

    const onCommunicationLogHandler = (data: any) => {
      setLogs((prev) => [...prev, data]);
      if (data.type === "sent") {
        setCount((prev) => ({ ...prev, sent: prev.sent + 1 }));
      } else if (data.type === "received") {
        setCount((prev) => ({ ...prev, received: prev.received + 1 }));
      }
    };

    const onSendCommandFrameHandler = (data: any) => {
      if (data.isError) {
        toast.error(data.message || "Failed to send command frame");
      }
    };

    const decodeCommandFrameHandler = (response: any) => {
      console.log("response: ", response);
      if (!response.isError) {
        const data = response.data;
        console.log("data: ", data);
        setModel((prev) => ({
          ...prev,
          destination_node_type: data.destination_node_type,
          source_node_type: data.source_node_type,
          source: data.source,
          destination: data.destination,
          ack: data.ack,
          command: data.command,
        }));
        if (data.data) generateAndSetData(data, data.data, true);
      } else {
        toast.error(response.message || "Failed to decode command frame");
      }
    };

    const encodeCommandFrameHandler = (data: any) => {
      console.log("data: ", data);
      if (!data.isError) {
        const frame = data.data;
        setFrame(frame);
      }
    };

    socket.on(
      SOCKET_COMMAND.COMMUNICATION_LOG.COMMUNICATION_LOG,
      onCommunicationLogHandler,
    );
    socket.on(
      SOCKET_COMMAND.COMMUNICATION_LOG.ON_SEND_COMMAND_FRAME,
      onSendCommandFrameHandler,
    );
    socket.on(
      SOCKET_COMMAND.COMMUNICATION_LOG.ON_DECODE_COMMAND_FRAME,
      decodeCommandFrameHandler,
    );
    socket.on(
      SOCKET_COMMAND.COMMUNICATION_LOG.ON_ENCODE_COMMAND_FRAME,
      encodeCommandFrameHandler,
    );

    return () => {
      socket.off(
        SOCKET_COMMAND.COMMUNICATION_LOG.COMMUNICATION_LOG,
        onCommunicationLogHandler,
      );
      socket.off(
        SOCKET_COMMAND.COMMUNICATION_LOG.ON_SEND_COMMAND_FRAME,
        onSendCommandFrameHandler,
      );
      socket.off(
        SOCKET_COMMAND.COMMUNICATION_LOG.ON_DECODE_COMMAND_FRAME,
        decodeCommandFrameHandler,
      );
      socket.off(
        SOCKET_COMMAND.COMMUNICATION_LOG.ON_ENCODE_COMMAND_FRAME,
        encodeCommandFrameHandler,
      );
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchLogs(1, { scrollToBottom: true });
  }, [activeType]);

  useEffect(() => {
    if (!frame) return;
    console.log("frame changed", frame);
    socket.emit(SOCKET_COMMAND.COMMUNICATION_LOG.DECODE_COMMAND_FRAME, {
      frame,
    });
  }, [frame]);

  const generateFrame = (modelData: model, data?: DataModel) => {
    if (
      !modelData.command ||
    //   !modelData.destination_node_type ||
      !modelData.source ||
      !modelData.destination
    )
      return;
    try {
      const payload = {
        command_name: modelData.command,
        is_ack: modelData.ack,
        dest_node_type: modelData.destination_node_type,
        sub_node_type: modelData.sub_node_type,
        source_add: modelData.source,
        destination_add: modelData.destination,
        data: data ? generateAndSetData(modelData, data) : {},
      };
      console.log("payload: ", payload);
      socket.emit(
        SOCKET_COMMAND.COMMUNICATION_LOG.ENCODE_COMMAND_FRAME,
        payload,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Missing") {
      }
    }
  };

  const changeAddressingMode = (modelData: model) => {
    setModel((prev) => ({ ...prev, source: "000001" }));
    if (modelData.addressing_mode == 1) {
      setModel((prev) => ({ ...prev, destination: "" }));
    } else if (modelData.addressing_mode == 2) {
      setModel((prev) => ({ ...prev, destination: "000000" }));
    } else if (modelData.addressing_mode == 3) {
      setModel((prev) => ({ ...prev, destination: "FFFFFF" }));
    }
  };

  const generateAndSetData = (
    modelData: model,
    data: DataModel | any,
    isSet: boolean = false,
  ): Record<string, any> => {
    switch (modelData.command) {
      case "CTRL_MOVE":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.direction || 0,
            extra_value_1: data.duration || 0,
            extra_value_2: data.speed || 0,
          }));
          return {};
        }
        if (!data.value || !data.extra_value_2) throw new Error("Missing");
        return {
          direction: data.value,
          duration: data.extra_value_1,
          speed: data.extra_value_2,
        };
      case "CTRL_MOVETO":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.value_position || 0,
            extra_value_2: data.value_tilt || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          value_position: data.extra_value_1,
          value_tilt: data.extra_value_2,
        };
      case "CTRL_MOVEOF":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.value || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          value: data.extra_value_1,
          reserved: 0,
        };
      case "CTRL_NETWORK_LOCK":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.lock_type || 0,
            extra_value_1: data.priority || 0,
          }));
          return {};
        }
        return {
          lock_type: data.value,
          priority: data.extra_value_1,
        };
      case "SET_APP_MODE":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.mode || 0 }));
          return {};
        }
        return {
          mode: data.value,
        };
      case "SET_MOTOR_LIMITS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.limit || 0,
            extra_value_2: data.value || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          limit: data.extra_value_1,
          value: data.extra_value_2,
        };
      case "SET_MOTOR_DIRECTION":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.direction || 0 }));
          return {};
        }
        return {
          direction: data.value,
        };
      case "SET_MOTOR_ROLLING_SPEED":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.up || 0,
            extra_value_1: data.down || 0,
            extra_value_2: data.slow || 0,
          }));
          return {};
        }
        return {
          up: data.value,
          down: data.extra_value_1,
          slow: data.extra_value_2,
        };
      case "SET_MOTOR_TILTING_SPEED":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.tilting_speed || 0 }));
          return {};
        }
        return {
          tilting_speed: data.value,
        };
      case "SET_MOTOR_IP":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.ip_index || 0,
            extra_value_2: data.value_position || 0,
            extra_value_4: data.value_tilting || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          ip_index: data.extra_value_1,
          value_position: data.extra_value_2,
          ...(data.extra_value_4 && { value_tilting: data.extra_value_4 }),
        };
      case "SET_NETWORK_LOCK":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.priority || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          priority: data.extra_value_1,
        };
      case "SET_LOCAL_UI":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.ui_index || 0,
            extra_value_2: data.priority || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          ui_index: data.extra_value_1,
          priority: data.extra_value_2,
        };
      case "SET_TILT_LIMITS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.value || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          value: data.extra_value_1,
        };
      case "SET_SOFT_START_STOP":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.function_id || 0,
            extra_value_1: data.ramp || 0,
            extra_value_2: data.value || 0,
          }));
          return {};
        }
        return {
          function_id: data.value,
          ramp: data.extra_value_1,
          value: data.extra_value_2,
        };
      case "GET_MOTOR_IP":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.ip_index || 0 }));
          return {};
        }
        return {
          ip_index: data.value,
        };
      case "GET_LOCAL_UI":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.ui_index || 0 }));
          return {};
        }
        return {
          ui_index: data.value,
        };
      case "SET_FACTORY_DEFAULT":
      case "GET_FACTORY_DEFAULT":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.function_id || 0 }));
          return {};
        }
        return {
          function_id: data.value,
        };
      case "SET_NODE_DISCOVERY":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.discovery_mode || 0,
          }));
          return {};
        }
        return {
          discovery_mode: data.value,
        };
      case "GET_GROUP_ADDR":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.group_index || 0 }));
          return {};
        }
        return {
          group_index: data.value,
        };
      case "SET_GROUP_ADDR":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.group_index || 0,
            extra_value_3: data.group_address || "",
          }));
          return {};
        }
        return {
          group_index: data.value,
          group_address: data.extra_value_3,
        };
      case "SET_NODE_LABEL":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_3: data.label || "",
          }));
          return {};
        }
        return {
          label: data.extra_value_3 || "",
        };
      case "SET_NETWORK_CONFIG":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.brodcast_mode || 0,
            extra_value_1: data.brodcast_random_value || 0,
            extra_value_2: data.supervision_active || 0,
            extra_value_4: data.supervision_timeperiod || 0,
            extra_value_6: data.deaf_mode || 0,
            extra_value_5: data.upload_requested || 0,
          }));
          return {};
        }
        return {
          brodcast_mode: data.value,
          brodcast_random_value: data.extra_value_1,
          supervision_active: data.extra_value_2,
          supervision_timeperiod: data.extra_value_4,
          deaf_mode: data.extra_value_6,
          upload_requested: data.extra_value_5,
        };
      case "GET_SWITCH_SETTINGS":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.button_id || 0 }));
          return {};
        }
        return {
          button_id: data.value,
        };
      case "SET_SWITCH_ADDRESS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_3: data.address || "",
          }));
          return {};
        }
        return {
          address: data.extra_value_3 || "",
        };
      case "SET_KEYPAD_TYPE":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.keypad_type || 0 }));
          return {};
        }
        return {
          keypad_type: data.value,
        };
      case "CONTROL_CHANNEL":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.index || 0,
            extra_value_1: data.status || 0,
          }));
          return {};
        }
        return {
          index: data.value,
          status: data.extra_value_1,
        };
      case "SET_SUN_AUTO":
        if (isSet) {
          if (model.destination_node_type === 5) {
            setDataModel((prev) => ({ ...prev, value: data.sun_auto || 0 }));
          } else {
            setDataModel((prev) => ({ ...prev, value: data.value || 0 }));
          }
        }
        if (model.destination_node_type === 5) {
          return {
            sun_auto: data.value,
          };
        } else {
          return {};
        }
      case "POST_MOTOR_POSITION":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.position_pulse || 0,
            extra_value_1: data.position_percentage || 0,
            extra_value_2: data.tilting_percentage || 0,
            extra_value_4: data.ip || 0,
            extra_value_5: data.tilting_degree || 0,
            extra_value_6: data.tilting_pulse || 0,
          }));
          return {};
        }
        return {
          position_pulse: data.value || 0,
          position_percentage: data.extra_value_1 || 0,
          tilting_percentage: data.extra_value_2 || 0,
          ip: data.extra_value_4 || 0,
          reserved: 0,
          tilting_degree: data.extra_value_5 || 0,
          tilting_pulse: data.extra_value_6 || 0,
        };
      case "POST_MOTOR_STATUS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.status || 0,
            extra_value_2: data.direction || 0,
            extra_value_4: data.source || 0,
            extra_value_5: data.cause || 0,
          }));
        }
        return {
          status: data.extra_value_1 || 0,
          direction: data.extra_value_2 || 0,
          source: data.extra_value_4 || 0,
          cause: data.extra_value_5 || 0,
        };
      case "POST_MOTOR_LIMITS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.up_limit || 0,
            extra_value_2: data.down_limit || 0,
          }));
        }
        return {
          up_limit: data.extra_value_1 || 0,
          down_limit: data.extra_value_2 || 0,
        };
      case "POST_MOTOR_DIRECTION":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.direction || 0 }));
          return {};
        }
        return {
          direction: data.value,
        };
      case "POST_MOTOR_ROLLING_SPEED":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.up_speed || 0,
            extra_value_2: data.down_speed || 0,
            extra_value_4: data.slow_speed || 0,
          }));
          return {};
        }
        return {
          up_speed: data.extra_value_1,
          down_speed: data.extra_value_2,
          slow_speed: data.extra_value_4,
        };
      case "POST_MOTOR_TILTING_SPEED":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.tilting_speed || 0 }));
          return {};
        }
        return {
          tilting_speed: data.value,
        };
      case "POST_MOTOR_IP":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.index || 0,
            extra_value_1: data.pulse || 0,
            extra_value_2: data.percentage || 0,
            extra_value_4: data.angle_pulse || 0,
            extra_value_5: data.angle_percentage || 0,
            extra_value_6: data.angle_degree || 0,
          }));
          return {};
        }
        return {
          index: data.value,
          pulse: data.extra_value_1,
          percentage: data.extra_value_2,
          angle_pulse: data.extra_value_4,
          angle_percentage: data.extra_value_5,
          angle_degree: data.extra_value_6,
        };
      case "POST_NETWORK_LOCK":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.status || 0,
            extra_value_1: data.priority || 0,
            extra_value_2: data.saved || 0,
            extra_value_3: data.source_address || "",
          }));
          return {};
        }
        return {
          status: data.value,
          source_address: data.extra_value_3,
          priority: data.extra_value_1,
          ...(data.extra_value_2 && { saved: data.extra_value_2 }),
        };
      case "POST_LOCAL_UI":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.status || 0,
            extra_value_1: data.priority || 0,
            extra_value_3: data.source_addr || "",
          }));
          return {};
        }
        return {
          status: data.value,
          source_addr: data.extra_value_3,
          priority: data.extra_value_1,
        };
      case "POST_TILT_LIMITS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.tilt_range || 0,
            extra_value_2: data.upward_backlash_pulses || 0,
            extra_value_4: data.downward_backlash_pulses || 0,
            extra_value_5: data.upward_backlash_ms || 0,
            extra_value_6: data.downward_backlash_ms || 0,
            extra_value_7: data.min_angle_degrees || 0,
            extra_value_8: data.max_angle_degrees || 0,
          }));
          return {};
        }
        return {
          tilt_range: data.extra_value_1,
          upward_backlash_pulses: data.extra_value_2,
          downward_backlash_pulses: data.extra_value_4,
          upward_backlash_ms: data.extra_value_5,
          downward_backlash_ms: data.extra_value_6,
          min_angle_degrees: data.extra_value_7,
          max_angle_degrees: data.extra_value_8,
        };
      case "POST_FACTORY_DEFAULT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.status || 0,
            extra_value_1: data.function_id || 0,
          }));
          return {};
        }
        return {
          function_id: data.extra_value_1,
          status: data.value,
        };
      case "POST_GROUP_ADDR":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.group_index || 0,
            extra_value_3: data.group_address || "",
          }));
          return {};
        }
        return {
          group_index: data.extra_value_1,
          group_address: data.extra_value_3,
        };
      case "POST_NODE_LABEL":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_3: data.label || "",
          }));
          return {};
        }
        return {
          label: data.extra_value_3 || "",
        };
      case "POST_NODE_SERIAL_NUMBER":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_3: data.serial_number || "",
          }));
          return {};
        }
        return {
          serial_number: data.extra_value_3 || "",
        };
      case "POST_NETWORK_ERROR_STAT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.tx_failures || 0,
            extra_value_2: data.collisions || 0,
            extra_value_4: data.rx_data_error || 0,
            extra_value_5: data.unknown_message || 0,
            extra_value_6: data.message_length_error || 0,
            extra_value_7: data.rx_fifo_full || 0,
            extra_value_8: data.tx_fifo_full || 0,
            extra_value_9: data.crc_error || 0,
            extra_value_10: data.bundle_size_error || 0,
          }));
          return {};
        }
        return {
          txFailures: data.extra_value_1,
          collisions: data.extra_value_2,
          rxDataError: data.extra_value_4,
          unknownMessage: data.extra_value_5,
          messageLengthError: data.extra_value_6,
          rxFifoFull: data.extra_value_7,
          txFifoFull: data.extra_value_8,
          crcError: data.extra_value_9,
          bundleSizeError: data.extra_value_10,
        };
      case "POST_NETWORK_STAT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.max_retry || 0,
            extra_value_2: data.sent_frames || 0,
            extra_value_4: data.received_frames || 0,
            extra_value_5: data.seen_frames || 0,
            extra_value_6: data.busy || 0,
            extra_value_7: data.max_slot || 0,
            extra_value_8: data.supervision_failures || 0,
          }));
          return {};
        }
        return {
          maxRetry: data.extra_value_1,
          sentFrames: data.extra_value_2,
          receivedFrames: data.extra_value_4,
          seenFrames: data.extra_value_5,
          busy: data.extra_value_6,
          maxSlot: data.extra_value_7,
          supervisionFailures: data.extra_value_8,
        };
      case "POST_NODE_STACK_VERSION":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.stack_reference || 0,
            extra_value_2: data.stack_index_letter || 0,
            extra_value_4: data.stack_index_number || 0,
            extra_value_5: data.stack_standard || 0,
          }));
          return {};
        }
        return {
          stack_reference: data.extra_value_1,
          stack_index_letter: data.extra_value_2,
          stack_index_number: data.extra_value_4,
          stack_standard: data.extra_value_5,
        };
      case "POST_NODE_APP_VERSION":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.app_reference || 0,
            extra_value_2: data.app_index_letter || 0,
            extra_value_4: data.app_index_number || 0,
            extra_value_5: data.app_profile || 0,
          }));
          return {};
        }
        return {
          app_reference: data.extra_value_1,
          app_index_letter: data.extra_value_2,
          app_index_number: data.extra_value_4,
          app_profile: data.extra_value_5,
        };
      case "POST_MOTOR_SOFT_START_STOP":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            extra_value_1: data.start_status_up || 0,
            extra_value_2: data.start_value_up || 0,
            extra_value_4: data.stop_status_up || 0,
            extra_value_5: data.stop_value_up || 0,
            extra_value_6: data.start_status_down || 0,
            extra_value_7: data.start_value_down || 0,
            extra_value_8: data.stop_status_down || 0,
            extra_value_9: data.stop_value_down || 0,
          }));
          return {};
        }
        return {
          start_status_up: data.extra_value_1,
          start_value_up: data.extra_value_2,
          stop_status_up: data.extra_value_4,
          stop_value_up: data.extra_value_5,
          start_status_down: data.extra_value_6,
          start_value_down: data.extra_value_7,
          stop_status_down: data.extra_value_8,
          stop_value_down: data.extra_value_9,
        };
      case "SET_CHANNEL":
      case "SET_OPEN_PROG":
      case "SET_IP":
      case "GET_CHANNEL_MODE":
      case "SET_RTS_ADDRESS_CHANGE":
      case "GET_RTS_ADDRESS":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.channel || 0 }));
          return {};
        }
        return {
          channel: data.value,
        };
      case "POST_RTS_ADDRESS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.channel || 0,
            extra_value_3: data.rts_address || "",
          }));
          return {};
        }
        return {
          channel: data.value,
          rts_address: data.extra_value_3,
        };
      case "POST_CHANNEL_MODE":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.channel_number || 0,
            extra_value_1: data.frequency_mode || 0,
            extra_value_2: data.application_mode || 0,
            extra_value_4: data.feature_set_mode || 0,
          }));
          return {};
        }
        return {
          channel_number: data.value,
          frequency_mode: data.extra_value_1,
          application_mode: data.extra_value_2,
          feature_set_mode: data.extra_value_4,
        };
      case "POST_TILT_FRAMECOUNT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.channel_number || 0,
            extra_value_1: data.tilt_frame_us || 0,
            extra_value_2: data.tilt_frame_ce || 0,
          }));
          return {};
        }
        return {
          channel_number: data.value,
          tilt_frame_us: data.extra_value_1,
          tilt_frame_ce: data.extra_value_2,
        };
      case "POST_APP_MODE":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.mode || 0 }));
          return {};
        }
        return {
          mode: data.value,
        };
      case "DIAG_POST_TOTAL_MOVE_COUNT":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.move_count || 0 }));
          return {};
        }
        return {
          move_count: dataModel.value,
        };
      case "DIAG_POST_TOTAL_REV_COUNT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.revolution_count || 0,
          }));
          return {};
        }
        return {
          revolution_count: dataModel.value,
        };
      case "DIAG_POST_THERMAL_COUNT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.thermal_count || 0,
            extra_value_1: data.post_thermal_count || 0,
          }));
          return {};
        }
        return {
          thermal_count: dataModel.value,
          post_thermal_count: dataModel.extra_value_1,
        };
      case "DIAG_POST_OBSTACLE_COUNT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.obstacle_count || 0,
            extra_value_1: data.post_obstacle_count || 0,
          }));
          return {};
        }
        return {
          obstacle_count: dataModel.value,
          post_obstacle_count: dataModel.extra_value_1,
        };
      case "DIAG_POST_POWER_COUNT":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.power_cut_count || 0,
          }));
          return {};
        }
        return {
          power_cut_count: dataModel.value,
        };
      case "DIAG_POST_RESET_COUNT":
        if (isSet) {
          setDataModel((prev) => ({ ...prev, value: data.reset_count || 0 }));
          return {};
        }
        return {
          reset_count: dataModel.value,
        };
      case "POST_CHANNEL_STATUS":
        if (isSet) {
          setDataModel((prev) => ({
            ...prev,
            value: data.index || 0,
            extra_value_1: data.config || 0,
          }));
          return {};
        }
        return {
          index: data.value,
          config: data.extra_value_1,
        };
      default:
        return {};
    }
  };

  const getCommunicationLogsCount = async () => {
    try {
      const response = await communicationLogService.getCommunicationLogCount();
      setCount(response.data);
    } catch (error) {
      toast.error("Failed to fetch communication logs count");
    }
  };

  const loadMore = useCallback(() => {
    if (!firstLoadDone.current) return;
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  }, [page, hasMore, isLoading]);

  const startFrameDecoding = () => {
    if (isFrameDecoding) {
      setIsFrameDecoding(false);
      setEditFrame(false);
      return;
    }

    setIsFrameDecoding(true);
    setEditFrame(true);

    if (openItems.length === 0) {
      setOpenItems(["item-1"]);
    }
  };

  const exportCommunicationLog = async () => {
    try {
      const data = await ReportService.getCommunicationLogReport();

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Communication_Log.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Failed to export communication log");
    }
  };

  const deleteAllLog = async () => {
    try {
      await communicationLogService.deleteCommunicationLog();
      setLogs([]);
      setCount({ sent: 0, received: 0 });
      setPage(1);
      setHasMore(false);
    } catch (error) {
      toast.error("Failed to delete communication logs");
    }
  };

  const copyFrame = async (frame: string) => {
    await navigator.clipboard.writeText(frame);
    toast.info("Copied to clipboard");
  };

  const sendFrame = async (frame: string) => {
    socket.emit(SOCKET_COMMAND.COMMUNICATION_LOG.SEND_COMMAND_FRAME, { frame });
  };

  return (
    <div className="p-4 flex flex-col h-[100vh]">
      <div className="">
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={[]}
          value={openItems}
          onValueChange={setOpenItems}
        >
          <AccordionItem
            value="item-1"
            className="w-full !border-none !border-0 before:!border-none after:!border-none"
          >
            <AccordionTrigger className="p-0 hidden"></AccordionTrigger>
            <AccordionContent className="">
              <div className="flex flex-col relative">
                <div className="grid md:grid-cols-6 sm:grid-cols-3 gap-4 p-2">
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Destination Node Type
                    </p>
                    <Dropdown
                      value={model.destination_node_type}
                      onChange={(e) => {
                        const updatedModel = {
                          ...model,
                          destination_node_type: e.value,
                        };
                        setModel(updatedModel);
                        generateFrame(updatedModel);
                      }}
                      options={lstNodeType}
                      optionLabel="node_type_name"
                      optionValue="node_id"
                      className="w-full rounded-md border border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Source Node Type
                    </p>
                    <Dropdown
                      value={model.source_node_type}
                      onChange={(e) => {
                        const updatedModel = {
                          ...model,
                          source_node_type: e.value,
                        };
                        setModel(updatedModel);
                        generateFrame(updatedModel);
                      }}
                      options={lstNodeType}
                      optionLabel="node_type_name"
                      optionValue="node_id"
                      className="w-full rounded-md border border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Addressing Mode
                    </p>
                    <Dropdown
                      value={model.addressing_mode}
                      onChange={(e) => {
                        const updatedModel = {
                          ...model,
                          addressing_mode: e.value,
                        };
                        setModel(updatedModel);
                        changeAddressingMode(updatedModel);
                      }}
                      options={addressingModeOptions}
                      optionLabel="label"
                      optionValue="value"
                      className="w-full rounded-md border border-gray-300"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Source Address
                    </p>
                    <InputText
                      className="border border-gray-300 w-full h-11 px-2"
                      value={model.source}
                      onChange={(e) => {
                        const updatedModel = {
                          ...model,
                          source: e.target.value,
                        };
                        setModel(updatedModel);
                        generateFrame(updatedModel);
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Destination Address
                    </p>
                    <InputText
                      className="border border-gray-300 w-full h-11 px-2"
                      value={model.destination}
                      disabled={model.addressing_mode != 1}
                      onChange={(e) => {
                        const updatedModel = {
                          ...model,
                          destination: e.target.value,
                        };
                        setModel(updatedModel);
                        generateFrame(updatedModel);
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">
                      Acknowledge Request
                    </p>
                    <div className="flex flex-col h-12 justify-center items-center">
                      <Switch
                        className="data-[state=unchecked]:bg-gray-400"
                        checked={model.ack}
                        onCheckedChange={(checked) => {
                          const updatedModel = { ...model, ack: checked };
                          setModel(updatedModel);
                          generateFrame(updatedModel);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid md:grid-cols-5 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500 font-semibold mb-1">Command</p>
                    <Dropdown
                      filter
                      value={model.command}
                      onChange={(e) => {
                        const updatedModel = { ...model, command: e.value };
                        setModel(updatedModel);
                        generateFrame(updatedModel);
                      }}
                      options={AllCommandsLst}
                      className="w-full rounded-md border border-gray-300"
                    />
                  </div>
                  {model.command === "CTRL_MOVE" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Direction
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={DirectionOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Duration
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1?.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Speed
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_2}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={SpeedOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "CTRL_MOVETO" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={MoveToFunctionOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      {dataModel.value === 2 && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">IP</p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_1}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={IpOptions}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                      {[3, 6, 8, 9, 10].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Position (in pulses)
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            max={65535}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                      {[4, 7, 11, 12, 13].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Position (in %)
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            max={100}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                      {[9, 12, 15].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Angle (in %)
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            max={100}
                            min={0}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                      {[8, 11, 14].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Angle (in pulses)
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            max={65535}
                            min={0}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                      {[10, 13, 16].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Angle (in degree)
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            max={360}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {model.command === "CTRL_MOVEOF" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={MoveOfFunctionOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      {![0, 1].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Value
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {model.command === "CTRL_NETWORK_LOCK" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            {
                              label: "Stop + Lock at current position",
                              value: 0,
                            },
                            { label: "Unlock", value: 5 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Priority
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_APP_MODE" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Function
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={AppModeOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_MOTOR_LIMITS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={MotorLimitOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Limit
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "DOWN limit", value: 0 },
                            { label: "UP limit", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      {![0, 1].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Value
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {model.command === "SET_MOTOR_DIRECTION" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Limit
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Standard rotation", value: 0 },
                            { label: "Reversed rotation", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_MOTOR_ROLLING_SPEED" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Up Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          min={6}
                          max={28}
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Down Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          min={6}
                          max={28}
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Slow Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          min={6}
                          max={28}
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_MOTOR_TILTING_SPEED" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tilting Speed
                        </p>
                        <InputText
                          max={255}
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_MOTOR_IP" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={IpFunctionOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">IP</p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={IpOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      {[2, 3, 6, 7, 8, 9, 10, 11, 15, 16].includes(
                        dataModel.value,
                      ) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Position {"("}in{" "}
                            {[3, 9, 10, 11, 16].includes(dataModel.value)
                              ? "%"
                              : "pulses"}{" "}
                            {")"}
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                      {[6, 7, 8, 9, 10, 11, 12, 13, 14].includes(
                        dataModel.value,
                      ) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Angle {"("}in{" "}
                            {[6, 9, 12].includes(dataModel.value)
                              ? "pulses"
                              : [7, 10, 13].includes(dataModel.value)
                                ? "%"
                                : "degree"}{" "}
                            {")"}
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_4.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_4: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {model.command === "GET_MOTOR_IP" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">IP</p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={IpOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_NETWORK_LOCK" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Unlock", value: 0 },
                            { label: "Lock", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Priority
                        </p>
                        <InputText
                          max={255}
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_LOCAL_UI" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Enable / Unlock", value: 0 },
                            { label: "Disable / Lock", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          UI Index
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={localControlOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Priority
                        </p>
                        <InputText
                          max={255}
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "GET_LOCAL_UI" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        UI Index
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={localControlOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_TILT_LIMITS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={tiltFunctionOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      {[0, 1, 3, 16, 17].includes(dataModel.value) && (
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Value
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {model.command === "SET_SOFT_START_STOP" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Disable", value: 0 },
                            { label: "Enable", value: 1 },
                            { label: "Adjust ramps", value: 2 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Ramps
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={rampOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Ramp Value
                        </p>
                        <InputText
                          max={255}
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {(model.command === "SET_FACTORY_DEFAULT" ||
                    model.command === "GET_FACTORY_DEFAULT") && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Function
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={factoryFunctionOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_NODE_DISCOVERY" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Discovery Mode
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={[
                          { label: "End of discovering", value: 0 },
                          { label: "Start Node Discovery", value: 1 },
                        ]}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "GET_GROUP_ADDR" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Group Index
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={groupIndexOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_GROUP_ADDR" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Group Index
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={groupIndexOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Group Address
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_3}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_3: e.target.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_NODE_LABEL" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Node Label
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.extra_value_3}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            extra_value_3: e.target.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "SET_NETWORK_CONFIG" && (
                    <>
                      <div className="flex flex-row gap-1">
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Broadcast Mode
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.value}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                value: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "Fix mode", value: 0 },
                              { label: "Random mode", value: 1 },
                              {
                                label:
                                  "Ignored – The parameter is not affected",
                                value: 255,
                              },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Value
                          </p>
                          <InputText
                            max={255}
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row gap-1">
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Supervision Active
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_2}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "Inactive", value: 0 },
                              { label: "Active", value: 1 },
                              {
                                label:
                                  "Ignored – The parameter is not affected",
                                value: 255,
                              },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Value
                          </p>
                          <InputText
                            max={255}
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_4.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_4: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row gap-1">
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Deaf Mode
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_6}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_6: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "Normal mode", value: 0 },
                              { label: "Deaf mode", value: 1 },
                              {
                                label:
                                  "Ignored – The parameter is not affected",
                                value: 255,
                              },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Upload Requested
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_5}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_5: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              {
                                label: "Stay in application program",
                                value: 0,
                              },
                              { label: "Jump to bootloader program", value: 1 },
                              {
                                label:
                                  "Ignored – The parameter is not affected",
                                value: 255,
                              },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {model.command === "GET_SWITCH_SETTINGS" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Button Id
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={buttonIdOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "SET_SWITCH_ADDRESS" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Address
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.extra_value_3.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            extra_value_3: e.target.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "SET_KEYPAD_TYPE" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Keypad Type
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={[
                          { label: "ILT2 Animeo IP", value: 0 },
                          { label: "SDN RS485", value: 1 },
                          { label: "Animeo Default", value: 2 },
                        ]}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "CONTROL_CHANNEL" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Channel No
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={channelNoOptions}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Delete", value: 0 },
                            { label: "Configure", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "SET_SUN_AUTO" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        {model.destination_node_type === 5
                          ? "Sun Auto Mode"
                          : "Switch Group"}
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={
                          model.destination_node_type === 5
                            ? [
                                { label: "Disable Sun Auto", value: 0 },
                                { label: "Enable Sun Auto", value: 1 },
                              ]
                            : [
                                { label: "Group 0", value: 0 },
                                { label: "Group 1", value: 1 },
                                { label: "Group 2", value: 2 },
                                { label: "Group 3", value: 3 },
                              ]
                        }
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "POST_MOTOR_POSITION" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Position(Pulse)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Position(%)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tilting(%)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">IP</p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tilting(Degree)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tilting(Pulses)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_MOTOR_STATUS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Status
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_1}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Stopped", value: 0 },
                            { label: "Running", value: 1 },
                            { label: "Blocked", value: 2 },
                            { label: "Locked", value: 3 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Direction
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_2}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Going DOWN", value: 0 },
                            { label: "Going UP", value: 1 },
                            { label: "Unknown", value: 255 },
                            { label: "Locked", value: 3 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Source
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_4}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Internal", value: 0 },
                            { label: "Network message", value: 1 },
                            { label: "Local UI", value: 2 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Cause
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_5}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Target reached", value: 0 },
                            { label: "Explicit command", value: 1 },
                            { label: "Wink", value: 2 },
                            { label: "Obstacle detection", value: 32 },
                            { label: "Over-current protection", value: 33 },
                            { label: "Thermal protection", value: 34 },
                            { label: "Run time exceeded", value: 49 },
                            { label: "Timeout exceeded", value: 50 },
                            { label: "Reset / PowerUp", value: 255 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_MOTOR_LIMITS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Up Limit
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Down Limit
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_MOTOR_DIRECTION" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Direction
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={[
                          { label: "Standard rotation", value: 0 },
                          { label: "Reversed rotation", value: 1 },
                        ]}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "POST_MOTOR_ROLLING_SPEED" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Up Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Down Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Slow Speed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_MOTOR_TILTING_SPEED" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Tilting Speed
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.value.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: Number(e.target.value),
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "POST_MOTOR_IP" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          IP Index
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Position In Pulse
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Position In Percentage
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Angle In Pulse
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Angle In Percentage
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Angle In Degree
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_NETWORK_LOCK" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Status
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Unlock", value: 0 },
                            { label: "Locked", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Source Address
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_3}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_3: e.target.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Priority
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Status
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.extra_value_2}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            {
                              label: "Lock will not be restored on power cycle",
                              value: 0,
                            },
                            {
                              label: "Lock will be restored on power cycle",
                              value: 1,
                            },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_LOCAL_UI" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Status
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            { label: "Unlocked", value: 0 },
                            { label: "Locked", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Soure Address
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_3}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_3: e.target.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Priority
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_TILT_LIMITS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tilt range
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Upward backlash (in pulses)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Downward backlash (in pulses)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Upward backlash (in ms)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Downward backlash (in ms)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Min angle (in degrees)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_7.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_7: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Max angle (in degrees)
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_8.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_8: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_FACTORY_DEFAULT" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Function
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Status
                        </p>
                        <Dropdown
                          filter
                          value={dataModel.value}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: e.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                          options={[
                            {
                              label: "Different from default values",
                              value: 0,
                            },
                            { label: "Default values", value: 1 },
                          ]}
                          optionLabel="label"
                          optionValue="value"
                          className="w-full rounded-md border border-gray-300"
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_GROUP_ADDR" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Group Index
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Group Address
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_3}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_3: e.target.value,
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_NODE_LABEL" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">Label</p>
                      <InputText
                        max={255}
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.extra_value_3}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            extra_value_3: e.target.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "POST_NODE_SERIAL_NUMBER" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Serial Number
                      </p>
                      <InputText
                        max={255}
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.extra_value_3}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            extra_value_3: e.target.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "POST_NETWORK_ERROR_STAT" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tx Failed
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tx collision
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx DataError
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Unknown Message
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Length MsgError
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Fifo Full
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_7.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_7: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tx Fifo Full
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_8.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_8: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Crc Error
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_9.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_9: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Bundle Size Error
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_10.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_10: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_NETWORK_STAT" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Max Retry Count
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tx Total Frame Sent
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Total Frame Received
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Total Frame Node Received
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Rx Busy
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Tx Max Slot
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_7.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_7: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Supervision Failure
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_8.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_8: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_NODE_STACK_VERSION" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stack Reference
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stack Index Letter
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stack Index Number
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stack Standard
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_NODE_APP_VERSION" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          App Reference
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          App Index Letter
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          App Index Number
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          App Profile
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "POST_MOTOR_SOFT_START_STOP" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Start Status in Up Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Start Value in Up Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_2.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_2: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stop Status in Up Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_4.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_4: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stop Value in Up Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_5.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_5: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Start Status in Down Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_6.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_6: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Start Value in Down Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_7.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_7: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stop Status in Down Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_8.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_8: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Stop Value in Down Direction
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_9.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_9: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {(model.command === "SET_RTS_ADDRESS_CHANGE" ||
                    model.command === "SET_OPEN_PROG" ||
                    model.command === "SET_CHANNEL" ||
                    model.command === "GET_CHANNEL_MODE" ||
                    model.command === "GET_RTS_ADDRESS" ||
                    model.command === "POST_RTS_ADDRESS" ||
                    model.command === "SET_IP") && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Channel No
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={channelOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "POST_RTS_ADDRESS" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        RTS Address
                      </p>
                      <InputText
                        max={255}
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.extra_value_3}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            extra_value_3: e.target.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "POST_CHANNEL_MODE" &&
                    model.source_node_type === 5 && (
                      <>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Channel No
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.value}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                value: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={channelOptions}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            US/CE mode
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_1}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "CE", value: 0 },
                              { label: "US", value: 1 },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Rolling/Tilting Mode
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_2}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "Rolling", value: 0 },
                              { label: "Tilting", value: 1 },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Modulis Mode
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.extra_value_4}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_4: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={[
                              { label: "Normal", value: 0 },
                              { label: "Modulis", value: 1 },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                      </>
                    )}
                  {model.command === "POST_TILT_FRAMECOUNT" &&
                    model.source_node_type === 5 && (
                      <>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Channel No
                          </p>
                          <Dropdown
                            filter
                            value={dataModel.value}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                value: e.value,
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                            options={channelOptions}
                            optionLabel="label"
                            optionValue="value"
                            className="w-full rounded-md border border-gray-300"
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Frames US
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_1.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_1: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-gray-500 font-semibold mb-1">
                            Frames CE
                          </p>
                          <InputText
                            className="border border-gray-300 w-full h-11 px-2"
                            value={dataModel.extra_value_2.toString()}
                            onChange={(e) => {
                              const updatedDataModel = {
                                ...dataModel,
                                extra_value_2: Number(e.target.value),
                              };
                              setDataModel(updatedDataModel);
                              generateFrame(model, updatedDataModel);
                            }}
                          />
                        </div>
                      </>
                    )}
                  {model.command === "POST_APP_MODE" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Channel No
                      </p>
                      <Dropdown
                        filter
                        value={dataModel.value}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: e.value,
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                        options={modeOptions}
                        optionLabel="label"
                        optionValue="value"
                        className="w-full rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  {model.command === "DIAG_POST_TOTAL_MOVE_COUNT" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Total Move Count
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.value.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: Number(e.target.value),
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "DIAG_POST_TOTAL_REV_COUNT" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Total Revolution Count
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.value.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: Number(e.target.value),
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "DIAG_POST_THERMAL_COUNT" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Thermal Count
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Post Thermal Count
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "DIAG_POST_OBSTACLE_COUNT" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Obstacle Count
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Post Obstacle Count
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                  {model.command === "DIAG_POST_POWER_COUNT" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Power Count
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.value.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: Number(e.target.value),
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "DIAG_POST_RESET_COUNT" && (
                    <div>
                      <p className="text-gray-500 font-semibold mb-1">
                        Reset Count
                      </p>
                      <InputText
                        className="border border-gray-300 w-full h-11 px-2"
                        value={dataModel.value.toString()}
                        onChange={(e) => {
                          const updatedDataModel = {
                            ...dataModel,
                            value: Number(e.target.value),
                          };
                          setDataModel(updatedDataModel);
                          generateFrame(model, updatedDataModel);
                        }}
                      />
                    </div>
                  )}
                  {model.command === "POST_CHANNEL_STATUS" && (
                    <>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Index
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.value.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              value: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold mb-1">
                          Config
                        </p>
                        <InputText
                          className="border border-gray-300 w-full h-11 px-2"
                          value={dataModel.extra_value_1.toString()}
                          onChange={(e) => {
                            const updatedDataModel = {
                              ...dataModel,
                              extra_value_1: Number(e.target.value),
                            };
                            setDataModel(updatedDataModel);
                            generateFrame(model, updatedDataModel);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-4 w-full flex items-center gap-4 min-h-[40px]">
                  {!isFrameDecoding && (
                    <div className="col-md-2 flex flex-row gap-2 items-center">
                      <p className="text-gray-500 font-semibold mb-1">
                        Edit Frame
                      </p>
                      <Switch
                        className="data-[state=unchecked]:bg-gray-400"
                        checked={editFrame}
                        onCheckedChange={(checked) => setEditFrame(checked)}
                      />
                    </div>
                  )}
                  {!editFrame && (
                    <button className="flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100">
                      <span className="ml-2 text-gray-500 font-bold">
                        {frame}
                      </span>
                    </button>
                  )}
                  {editFrame && (
                    <InputText
                      className="border border-gray-300 h-11 px-2 w-2/6"
                      value={frame}
                      onChange={(e) => setFrame(e.target.value)}
                    />
                  )}
                  <button
                    onClick={() => sendFrame(frame)}
                    className={cn(
                      "flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100",
                    )}
                  >
                    <Send size={18} />
                    <span className="ml-2 text-gray-500 font-bold">Send</span>
                  </button>
                  {!editFrame && (
                    <button
                      className={cn(
                        "flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100",
                      )}
                    >
                      <Copy onClick={() => copyFrame(frame)} size={18} />
                      <span className="ml-2 text-gray-500 font-bold">Copy</span>
                    </button>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div>
        <div className="items-center mt-4">
          <div className="flex justify-between w-full md:flex-row flex-col gap-2">
            <div className="flex flex-row flex-wrap gap-4 ">
              <button
                onClick={() =>
                  setOpenItems((prev) =>
                    prev.includes("item-1") ? [] : ["item-1"],
                  )
                }
                className="flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                {openItems.includes("item-1") ? (
                  <ChevronsUp size={18} />
                ) : (
                  <ChevronsDown size={18} />
                )}
                <span className="ml-2 text-gray-500 font-bold">
                  Frame Builder
                </span>
              </button>
              <button
                onClick={startFrameDecoding}
                className={cn(
                  "flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100",
                  isFrameDecoding ? "bg-[#92d0508c] hover:bg-[#92d0508c]" : "",
                )}
              >
                <SlidersVertical size={18} />
                <span className="ml-2 text-gray-500 font-bold">
                  Frame Decoder
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <button
                  onClick={() => {
                    setActiveType((prev) => (prev == "tx" ? "" : "tx"));
                  }}
                  className={cn(
                    "flex flex-row gap-1 items-center px-4 py-1 rounded-full border border-gray-300",
                    activeType == "tx" ? "bg-[#92d0508c]" : "",
                  )}
                >
                  <Icons.tx width={40} height={30} />
                  <span className="ml-2 text-gray-500 font-bold">
                    {count.sent}
                  </span>
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    setActiveType((prev) => (prev == "rx" ? "" : "rx"));
                  }}
                  className={cn(
                    "flex flex-row gap-1 items-center px-4 py-1 rounded-full border border-gray-300",
                    activeType == "rx" ? "bg-[#f4b18361]" : "",
                  )}
                >
                  <Icons.rx width={40} height={30} />
                  <span className="ml-2 text-gray-500 font-bold">
                    {count.received}
                  </span>
                </button>
              </div>
              <div>
                <button
                  onClick={exportCommunicationLog}
                  className={cn(
                    "flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100",
                  )}
                >
                  <Download className="text-gray-500" size={18} />
                  <span className="ml-2 text-gray-500 font-bold">Download</span>
                </button>
              </div>
              <div>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className={cn(
                    "flex flex-row gap-1 items-center px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100",
                  )}
                >
                  <Trash className="text-red-600" size={18} />
                  <span className="ml-2 text-gray-500 font-bold">
                    Clear All
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="log-table mt-4 h-full" style={{ minHeight: "60vh" }}>
        <TableVirtuoso
          ref={virtuosoRef}
          data={logs}
          firstItemIndex={firstItemIndex}
          followOutput="auto"
          startReached={loadMore}
          atTopStateChange={(atTop) => {
            if (!firstLoadDone.current) return;

            if (atTop) {
              loadMore();
            } else {
              userScrolled.current = true;
            }
          }}
          components={{
            TableRow: ({ item: log, ...props }) => (
              <tr
                {...props}
                className={log.type === "sent" ? "sent" : "received"}
              />
            ),
          }}
          fixedHeaderContent={() => (
            <tr>
              <th>No.</th>
              <th>Time</th>
              <th>Source Node type</th>
              <th>Dest Node type</th>
              <th>Source</th>
              <th>Dest</th>
              <th>Command</th>
              <th>Data</th>
              <th>Action</th>
            </tr>
          )}
          itemContent={(index, log) => (
            <>
              <td>{log.communication_log_id}</td>
              <td>{log.time}</td>
              <td>{log.source_node_type}</td>
              <td>{log.destination_node_type}</td>
              <td>{log.source}</td>
              <td>{log.destination}</td>
              <td>{log.command}</td>
              <td>{log.data}</td>
              <td>
                <div className="flex flex-row gap-2 items-center justify-center">
                  <Copy
                    onClick={() => copyFrame(log.frame)}
                    className="cursor-pointer"
                    size={18}
                  />
                  <SendHorizontal
                    onClick={() => sendFrame(log.frame)}
                    className="cursor-pointer"
                    size={18}
                  />
                </div>
              </td>
            </>
          )}
        />
      </div>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirm Action"
        description="Are you sure you want to confirm this action?"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={deleteAllLog}
        variant="destructive"
      />
    </div>
  );
}
