const path = require("path");
const os = require("os");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const imageminPngquant = require("imagemin-pngquant");
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
      contextIsolation: false,
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
  opt.dest = path.join(os.homedir(), "Desktop//imageShrink");
  shrinkImage(opt);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    console.log({ imgPath, quality, dest });

    const imagemin = await import("imagemin");
    const imageminMozjpeg = await import("imagemin-mozjpeg");
    const slash = await import("slash");

    const pngQuality = quality / 100;
    const files = await imagemin.default([slash.default(imgPath)], {
      destination: dest,
      plugin: [
        imageminMozjpeg.default({ quality }),
        imageminPngquant.default({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    console.log(files);
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

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
