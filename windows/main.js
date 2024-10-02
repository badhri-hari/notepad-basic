const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

function showColorInputDialog() {
  return new Promise((resolve) => {
    const colorDialog = new BrowserWindow({
      width: 400,
      height: 200,
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    colorDialog.loadFile("colorInput.html");

    ipcMain.once("color-input-response", (event, color) => {
      resolve(color);
      colorDialog.close();
    });
  });
}

let mainWindow;

app.on("ready", () => {
  mainWindow = createWindow();

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      buttons: ["Ok"],
      title: "Update Available",
      message: "A new version is available. Downloading now...",
    });
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        buttons: ["Restart"],
        title: "Update Ready",
        message:
          "A new version has been downloaded. Restart the application to apply the updates.",
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });
});

autoUpdater.on("error", (error) => {
  console.error("Error in auto-updater:", error);
});
