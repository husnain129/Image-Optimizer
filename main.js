const path = require("path");
const os = require("os");
const { app, BrowserWindow, ipcMain, shell } = require("electron");
const compress_images = require("compress-images");
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
  console.log({ opt });
  opt.dest = path.join(os.homedir(), "Desktop//imageShrink//");
  shrinkImage(opt);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const slash = await import("slash");
    compress_images(
      slash.default(imgPath),
      dest,
      { compress_force: false, statistic: true, autoupdate: true },
      false,
      { jpg: { engine: "mozjpeg", command: ["-quality", quality] } },
      { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
      { svg: { engine: "svgo", command: "--multipass" } },
      {
        gif: {
          engine: "gifsicle",
          command: ["--colors", "64", "--use-col=web"],
        },
      },
      function (error, completed, statistic) {
        console.log("-------------");
        console.log(error);
        console.log(completed);
        console.log(statistic);
        console.log("-------------");
      }
    );

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
