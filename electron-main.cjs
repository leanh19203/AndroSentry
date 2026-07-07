const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow = null;
let serverProcess = null;

// Starts our packaged Express server in the background
function startExpressServer() {
  const serverPath = path.join(__dirname, "dist", "server.cjs");
  console.log(`[ELECTRON] Launching Node.js backend from: ${serverPath}`);

  // Set necessary environment variables
  // NODE_ENV=production tells Express to serve compiled static assets from /dist
  serverProcess = spawn("node", [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "3000"
    }
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[EXPRESS OUT]: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[EXPRESS ERR]: ${data.toString().trim()}`);
  });

  serverProcess.on("close", (code) => {
    console.log(`[ELECTRON] Express backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Kali Android Pentest GUI",
    backgroundColor: "#0d1117",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Custom menu bar configuration
  const menuTemplate = [
    {
      label: "Ứng dụng",
      submenu: [
        { label: "Tải lại trang", role: "reload" },
        { label: "Mở rộng màn hình", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Thoát ứng dụng", role: "quit" }
      ]
    },
    {
      label: "Công cụ",
      submenu: [
        { label: "Mở DevTools (F12)", role: "toggleDevTools" }
      ]
    },
    {
      label: "Trợ giúp",
      submenu: [
        {
          label: "Về Kali Android Pentest GUI",
          click() {
            const { dialog } = require("electron");
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Kali Android Pentest Companion",
              message: "Kali Android Pentest Companion v1.2.0",
              detail: "Bộ công cụ tự động hóa, học tập và kiểm thử xâm nhập thiết bị Android chạy trên Windows và Kali Linux.\n\nSử dụng Electron + React + Node.js."
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the Express local server
  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Start Express local server
    startExpressServer();

    // Give the Express backend 1.2 seconds to fully bind to port 3000 before loading
    setTimeout(createWindow, 1200);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// Clean up background server process when app is closed
app.on("window-all-closed", () => {
  if (serverProcess) {
    console.log("[ELECTRON] Terminating background Express server process...");
    serverProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
