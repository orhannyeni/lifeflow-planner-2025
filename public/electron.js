const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400, // Widget modu için küçülmeye izin ver
    minHeight: 500,
    icon: __dirname + "/favicon.ico",
    frame: true, // Çerçeve olsun (Kapatma tuşları için)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  // Düzeltilmiş Dosya Yolu (Beyaz ekranı önleyen ayar)
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "index.html")}`;

  mainWindow.loadURL(startUrl);

  // Menü çubuğunu gizle (Tam uygulama hissi)
  mainWindow.setMenuBarVisibility(false);

  // Hata panelini kapattık (Ürün bittiği için)
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => (mainWindow = null));
}

// --- ÖZEL KOMUTLAR (Widget ve Otomatik Başlatma) ---

// 1. Widget Moduna Geç (Küçül ve Hep Üstte Kal)
ipcMain.on("set-widget-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(400, 600);
    mainWindow.setAlwaysOnTop(true);
  }
});

// 2. Normal Moda Dön (Büyü)
ipcMain.on("set-normal-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 800);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.center();
  }
});

// 3. Windows ile Başlat
ipcMain.on("toggle-auto-start", (event, shouldStart) => {
  app.setLoginItemSettings({
    openAtLogin: shouldStart,
    path: app.getPath("exe"),
  });
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
