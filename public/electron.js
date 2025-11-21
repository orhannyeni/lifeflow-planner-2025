const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 500,
    icon: __dirname + "/favicon.ico",
    frame: false, // <--- KRİTİK: Windows çerçevesini kaldırdık (Premium görünüm için)
    transparent: true, // Arka plan şeffaflığına izin ver (Widget için)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "index.html")}`;

  mainWindow.loadURL(startUrl);

  // mainWindow.webContents.openDevTools(); // Hata ayıklamak istersen aç

  mainWindow.on("closed", () => (mainWindow = null));
}

// --- PENCERE KONTROLLERİ (React'ten gelen emirler) ---

// 1. Uygulamayı Kapat
ipcMain.on("app-close", () => {
  app.quit();
});

// 2. Uygulamayı Alta İndir
ipcMain.on("app-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

// 3. Widget Moduna Geç (Küçük ve Köşede)
ipcMain.on("set-widget-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(380, 500); // Daha kompakt boyut
    mainWindow.setAlwaysOnTop(true); // Hep üstte
    mainWindow.setPosition(50, 50); // Ekranın sol üstüne al (veya kullanıcı taşıyabilir)
  }
});

// 4. Normal Moda Dön (Büyük)
ipcMain.on("set-normal-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 800);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.center();
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
