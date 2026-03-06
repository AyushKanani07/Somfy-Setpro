
export interface serialPort {
    getAppVersion: () => any;
    getSerialPorts: (callBackFunction: Function) => any[];
    connectPort: (portName: string, onDataReceive: Function) => void;
    errorConnectingPort: (onDataReceive: Function) => void;
    sendData: <T>(data: T) => void;

    getData: (onDataReceive: Function) => void;
    disConnectPort: (portName: string) => any[];
    updateBaudRate: (is_firmware_update: boolean) => any[];
    download: (url: string) => string;
    copyToClipboard: (data: any) => any;
    getClipboardData: () => void;
    openNewWindow: (data: any) => any;
    checkForUpdates: () => void;

    openUrl: (url: string) => void;
    exportProjectData: (data: ArrayBuffer, fileName: string) => any;
    onExportSuccess: (callback: Function) => void;
    onZoomChange: (number: number) => any;
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    require: NodeRequire;
    serialPort: serialPort;
  }
}
