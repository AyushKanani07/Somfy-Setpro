import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('serialPort', {
    getAppVersion: () => {
        let appVersion = ipcRenderer.sendSync("app-version");
        return appVersion;
    },
    getSerialPorts: (callBackFuncation) => {
        ipcRenderer.once("on-get-serial-port", (event, ports) => {
            callBackFuncation(ports);
        });
        ipcRenderer.send("get-serial-ports", "on-get-serial-port");
    },
    connectPort: (portName, callBackFuncation) => {
        ipcRenderer.on("on-connected-port", (event, data) => {
            callBackFuncation(data);
        });
        ipcRenderer.send("connect-port", portName);
    },
    updateBaudRate: (isFirmware) => {
        ipcRenderer.send("change-baudrate", isFirmware);
    },
    getData: (callBackFuncation) => {
        ipcRenderer.on("on-data-receive", (event, data) => {
            callBackFuncation(data);
        });
    },
    errorConnectingPort: (callBackFuncation) => {
        ipcRenderer.on("on-error-receive", (event, data) => {
            ipcRenderer.removeAllListeners("on-connected-port");
            ipcRenderer.removeAllListeners("on-data-receive");
            ipcRenderer.removeAllListeners("on-error-receive");
            callBackFuncation(data);
        });
    },
    sendData: (data) => {
        return ipcRenderer.sendSync("send-data", data);
    },
    disConnectPort: (portName) => {
        ipcRenderer.removeAllListeners("on-connected-port");
        ipcRenderer.removeAllListeners("on-data-receive");
        ipcRenderer.removeAllListeners("on-error-receive");
        return ipcRenderer.sendSync("disconnect-port", portName);
    },
    download: (url) => {
        ipcRenderer.send("download", url);
    },
    copyToClipboard: (data) => {
        ipcRenderer.send("copy-to-clipboard", data);
    },
    getClipboardData: (data) => {
        return ipcRenderer.sendSync("get-clipboard-data");
    },
    openNewWindow: (data) => {
        ipcRenderer.send("open-new-window", data);
    },
    checkForUpdates: () => {
        ipcRenderer.send("check-for-updates");
    },
    openUrl: (url) => {
        ipcRenderer.send("open-url", url);
    },
    exportProjectData: (data, name) => {
        ipcRenderer.send("export-project", data, name);
    },
    onExportSuccess: (callback) => {
        ipcRenderer.on("export-success", (event, result) => {
            callback(result);
        });
    },
    onZoomChange: (number) => {
        ipcRenderer.send("zoom-changed", number);
    }
});