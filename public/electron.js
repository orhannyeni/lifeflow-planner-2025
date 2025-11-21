const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
let widgetPosition = "none"; // 'left' | 'right' | 'none'

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 50, // Widget kapandığında çok küçülmesine izin ver
    minHeight: 50,
    icon: __dirname + "/favicon.ico",
    frame: false, // Çerçevesiz (Özel tasarım için)
    transparent: true, // Şeffaf arka plan (Widget için)
    alwaysOnTop: false,
    skipTaskbar: false,
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
  mainWindow.setMenuBarVisibility(false);
  // mainWindow.webContents.openDevTools(); // Hata ayıklamak için açılabilir

  mainWindow.on("closed", () => (mainWindow = null));
}

// --- GÜÇLENDİRİLMİŞ PENCERE KONTROLLERİ ---

ipcMain.on("app-close", () => app.quit());
ipcMain.on("app-minimize", () => mainWindow && mainWindow.minimize());

// 1. NORMAL MOD (Ana Ekran)
ipcMain.on("set-normal-mode", () => {
  if (!mainWindow) return;
  widgetPosition = "none";
  mainWindow.setAlwaysOnTop(false);
  mainWindow.setSize(1200, 800);
  mainWindow.center();
  mainWindow.setOpacity(1.0);
  mainWindow.setSkipTaskbar(false); // Görev çubuğunda göster
});

// 2. WIDGET MODU (Hayalet Mod Başlatma)
ipcMain.on("set-widget-mode", (event, side) => {
  if (!mainWindow) return;

  widgetPosition = side || "right"; // Varsayılan sağ
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow.setAlwaysOnTop(true, "screen-saver"); // En üstte kalsın
  mainWindow.setSkipTaskbar(true); // Görev çubuğunda yer kaplamasın (daha temiz görünüm)

  // Başlangıçta açık widget boyutu
  const w = 320;
  const h = 500;
  const y = Math.floor((height - h) / 2);
  const x = widgetPosition === "right" ? width - w : 0;

  mainWindow.setSize(w, h);
  mainWindow.setPosition(x, y);
});

// 3. HOVER EFEKTLERİ (React'ten Tetiklenir - Fare Gelince/Gidince)
ipcMain.on("widget-hover", (event, isHovering) => {
  if (!mainWindow || widgetPosition === "none") return;

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const expandedW = 320; // Açık genişlik
  const collapsedW = 60; // Kapalı (sadece ikon) genişliği
  const h = 500;
  const y = Math.floor((height - h) / 2);

  if (isHovering) {
    // GENİŞLE (Mouse Üstünde)
    const x = widgetPosition === "right" ? width - expandedW : 0;
    mainWindow.setSize(expandedW, h);
    mainWindow.setPosition(x, y);
    mainWindow.setOpacity(1.0); // Tam görünür
  } else {
    // DARAL / GİZLEN (Mouse Gitti)
    const x = widgetPosition === "right" ? width - collapsedW : 0;
    mainWindow.setSize(collapsedW, h);
    mainWindow.setPosition(x, y);
    mainWindow.setOpacity(0.8); // Hafif saydam (Rahatsız etmesin)
  }
});

// 4. OTOMATİK BAŞLATMA
ipcMain.on("toggle-auto-start", (event, shouldStart) => {
  app.setLoginItemSettings({
    openAtLogin: shouldStart,
    path: app.getPath("exe"),
    args: [
      "--process-start-args",
      `"--hidden"`, // İstenirse gizli başlatılabilir
    ],
  });
});

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
