import electron from 'electron';
import { BrowserWindow } from 'electron';
import type { IpcMainEvent, MessageBoxOptions } from 'electron';

import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('__dirname: ', __dirname);

import { SerialPort, InterByteTimeoutParser } from 'serialport';
import updater from 'electron-updater';
const { autoUpdater } = updater;
import type { UpdateDownloadedEvent, UpdateInfo } from 'electron-updater';
let port: SerialPort | null = null;
const { app, screen, ipcMain, dialog, Menu, shell } = electron;
let win: BrowserWindow | null = null;
let childWindow: BrowserWindow | null = null;
const args = process.argv.slice(1);
const isDev = args.some((val) => val === '--serve');
let mainWindow;
let showNoUpdateMessage: boolean = false;
const showMenu = isDev ? true : false;
let baudRate: 38400 | 4800 = 4800;
import * as fs from 'fs';
import { appServer } from './server.ts';

async function createWindow(): Promise<BrowserWindow> {
  if (!isDev) {
    const server: appServer = new appServer();
    const serverPort = await server.config();
  }
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    title: 'Set pro by Somfy',
    webPreferences: {
      nodeIntegration: true,
      // nativeWindowOpen: false,
      // allowRunningInsecureContent: (serve) ? true : false,
      allowRunningInsecureContent: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'event.js'),
    },
  });
  win.maximize();
  if (isDev) {
    win.webContents.openDevTools();

    //@ts-ignore - Ignore ts error for dynamic import
    // import('electron-reload').then(({ default: electronReload }) => {
    //     electronReload(__dirname, { electron: path.join(__dirname, '/../node_modules/electron') });
    // });

    win.loadURL('http://localhost:4000');
  } else {
    win.loadURL('http://localhost:' + process.env.SOMFY_PORT);

    if (!isDev) {
      // autoUpdater.setFeedURL({
      //     provider: 'github',
      //     repo: 'Somfy-SDN-Config-Tool',
      //     owner: 'NES-Corp',
      //     private: true,
      //     token: '' // github personal access token
      // });
      // autoUpdater.checkForUpdates();
    }
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  if (!showMenu) {
    setMenuItem();
  }

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    createWindow();
    // setTimeout(createWindow, 4000)
    // Handle opening new windows
    ipcMain.on('open-new-window', (event, data) => {
      console.log('open-new-window event received', data);

      // Check if the window is already open
      if (childWindow && !childWindow.isDestroyed()) {
        console.log('Window already open, bringing it to front');
        childWindow.focus();
      } else {
        console.log('Opening a new window');

        childWindow = new BrowserWindow({
          width: data.width,
          height: data.height,
          show: false, // Prevent showing until fully loaded
          webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'event.js'),
          },
        });

        childWindow.loadURL(data.url); // Assuming `data` contains URL or other necessary information

        childWindow.once('ready-to-show', () => {
          childWindow?.show();
          childWindow?.focus(); // Focus the new window when ready
        });

        childWindow.on('closed', () => {
          childWindow = null; // Cleanup when window is closed
        });
      }
    });
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on('activate', async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // await localStorage.setItem('SOMFY_PORT', process.env.SOMFY_PORT);
    // const SOMFY_PORT = 'SOMFY_PORT';
    // const value = process.env.SOMFY_PORT;
    // win.webContents.executeJavaScript(`localStorage.setItem('${SOMFY_PORT}', '${value}');`);
    if (win === null) {
      mainWindow = await createWindow();
    } else {
      win.show();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}

//Get the app version installed
ipcMain.on('app-version', (event: IpcMainEvent) => {
  event.returnValue = {
    version: app.getVersion(),
    port: process.env.SOMFY_PORT,
  };
});

//Get the serial port list
ipcMain.on(
  'get-serial-ports',
  (event: IpcMainEvent, ipcCallBackEvent: string) => {
    SerialPort.list()
      .then((ports) => {
        event.sender.send(ipcCallBackEvent, ports);
      })
      .catch((err) => {
        event.sender.send(ipcCallBackEvent, err);
      });
  },
);

//Connect to port
ipcMain.on('connect-port', (event: IpcMainEvent, portName: string) => {
  baudRate = 4800;
  if (port != null && typeof port.close == 'function') {
    port.close((err) => {
      console.log('closing port ', err ?? portName);
    });
    port = null;
    openPort(event, portName);
  } else {
    openPort(event, portName);
  }
});

ipcMain.on(
  'change-baudrate',
  (event: IpcMainEvent, is_firmware_update: boolean) => {
    console.log('change-baudrate', is_firmware_update);
    baudRate = is_firmware_update ? 38400 : 4800;
    if (port) {
      port.update({ baudRate: baudRate });
      // port.close(err => {
      //     console.log('change-baudrate err: ', err);
      // });
      // const path = port.path;
      // port = null;
      // setTimeout(() => {
      //     openPort(event, path);
      // }, 1000);
    }
  },
);

//DisConnect to port
ipcMain.on('disconnect-port', (event: IpcMainEvent, portName: string) => {
  if (port) {
    port.close((err) => {
      console.log('closed port ', err ?? portName);
      event.returnValue = true;
    });
    port = null;
  }
});

ipcMain.on('send-data', (event: IpcMainEvent, data: string) => {
  if (port) {
    port.write(data);
    event.sender.send('on-data-sent', data);
    event.returnValue = 'Data sent';
  } else {
    event.returnValue = 'Port not connected';
  }
});

ipcMain.on('download', async (event: IpcMainEvent, url) => {
  // download file from url
  win?.loadURL(url);
});

ipcMain.on('open-url', async (event: IpcMainEvent, url) => {
  console.log('url: ', url);
  // open url in default browser
  shell.openExternal(url);
});

ipcMain.on(
  'export-project',
  async (event, data: ArrayBuffer, fileName: string) => {
    try {
      // Remove any leading or trailing quotes from the file name
      if (fileName.startsWith('"') || fileName.startsWith("'")) {
        fileName = fileName.substring(1);
      }
      if (fileName.endsWith('"') || fileName.endsWith("'")) {
        fileName = fileName.substring(0, fileName.length - 1);
      }
      const name = fileName.split('.')[0];
      const extentions = fileName.split('.')[1];
      const result = await dialog.showSaveDialog({
        title: name,
        defaultPath: name,
        filters: [{ name: extentions, extensions: [extentions] }],
        buttonLabel: 'Save',
      });

      if (!result.canceled) {
        // User selected a file, now save the data
        const filePath = result.filePath;

        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(data);

        // Save the data to file
        fs.writeFileSync(filePath, buffer);

        // Notify the user that the project was saved successfully
        dialog.showMessageBox({
          type: 'info',
          title: 'Save Successful',
          message: 'The project has been saved successfully.',
          buttons: ['OK'],
        });
        event.sender.send('export-success', { success: true });
        // Return success
        return { success: true };
      } else {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Save Canceled',
          message: 'The project save has been canceled.',
          buttons: ['OK'],
        });
        // If the user canceled the dialog
        return { success: false };
      }
    } catch (error) {
      console.error('Error in exporting data:', error);

      // Notify the user that the project was not saved successfully
      dialog.showMessageBox({
        type: 'error',
        title: 'Save Failed',
        message: 'Project could not be saved. Please try again.',
        buttons: ['OK'],
      });

      return { success: false };
    }
  },
);

ipcMain.on('zoom-changed', async (event: IpcMainEvent, zoomLevel: number) => {
  try {
    const zoomFactor = zoomLevel / 100;
    if (win && win.webContents) {
      win.webContents.setZoomFactor(zoomFactor);
      console.log(`Zoom level set to: ${zoomFactor}`);
    } else {
      console.error('Main window or webContents not available');
    }
  } catch (error) {
    console.error('Error setting zoom level:', error);
  }
});

// Check for new version updates
ipcMain.on('check-for-updates', (event: IpcMainEvent) => {
  showNoUpdateMessage = true;
  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
  const notes = Array.isArray(info.releaseNotes)
    ? info.releaseNotes
        .map((n) => (typeof n === 'string' ? n : n.note))
        .join('\n')
    : info.releaseNotes || '';
  const message =
    process.platform === 'win32'
      ? notes
      : (info.releaseName ?? `Version ${info.version}`);
  const dialogOpts: MessageBoxOptions = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Somfy Update',
    message: message,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

autoUpdater.on('error', (err: Error) => {
  console.error('There was a problem updating the application');
  console.error(err.message);
  const dialogOpts: MessageBoxOptions = {
    type: 'info',
    buttons: ['Ok'],
    title: 'There was a problem updating the application',
    message: err.message,
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {});
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', () => {
  console.log('Update available.');
  console.log('Downloading update...');
});

autoUpdater.on('update-not-available', (info: UpdateInfo) => {
  console.log('Update not available.');
  if (showNoUpdateMessage) {
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['Ok'],
      title: 'Update Not Available',
      message: 'Somfy configuration tool is update to date',
    };
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      showNoUpdateMessage = false;
    });
  }
});

const openPort = (event: IpcMainEvent, portName: string): SerialPort => {
  port = new SerialPort({
    path: portName,
    baudRate: baudRate, //38400
    stopBits: 1,
    parity: 'odd',
  });

  const parser = new InterByteTimeoutParser({ interval: 15 });
  port.pipe(parser);
  // parser.on('data');
  port.on('data', (data) => {
    event.sender.send('on-data-receive', data);
  });
  port.on('open', () => {
    event.sender.send('on-connected-port', port?.path);
  });
  // Open errors will be emitted as an error event
  port.on('error', function (err) {
    // send error to renderer
    event.sender.send('on-error-receive', err.message);
    if (port != null) {
      port.close((err) => {
        console.log('closed port ', err ?? portName);
      });
      port = null;
    }
    console.log('ERROR Message: ', err.message);
  });
  return port;
};

const setMenuItem = () => {
  const template: any = [];

  /* Creating a menu bar for the application. */
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
