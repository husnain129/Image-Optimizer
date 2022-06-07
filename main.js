// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

console.log("object");
// SET ENV
process.env.NODE_ENV = "development";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: "Image Optimizator",
    width: 500,
    height: 600,
    icon: "./assets/icons/256.png",
    resizable: isDev,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile("./app/index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

const menu = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
      },
    ],
  },
];

// if (isMac) {
//   menu.unshift({ role: "appMenu" });
// }

ipcMain.on("image:minimize", (e, opt) => {
  console.log(opt);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!isMac) {
    createWindow();
  }
});
