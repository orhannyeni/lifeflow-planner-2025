const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  // Ana Pencere Ayarları
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: __dirname + "/favicon.ico",
    frame: true, // Çerçeve olsun (Kapatma tuşları için)
    webPreferences: {
      nodeIntegration: true, // React içinden Electron komutlarını kullanmak için
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // Uygulamayı Yükle
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => (mainWindow = null));
}

// --- IPC OLAYLARI (React ile İletişim) ---

// 1. Widget Moduna Geçiş
ipcMain.on("set-widget-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(400, 500); // Küçük widget boyutu
    mainWindow.setAlwaysOnTop(true); // Hep üstte kalsın
    // Ekranın sağ altına konumlandır (Opsiyonel, şimdilik ortada kalsın veya son konum)
  }
});

// 2. Normal Moda Dönüş
ipcMain.on("set-normal-mode", () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 800); // Geniş ekran
    mainWindow.setAlwaysOnTop(false); // Üstte kalma zorunluluğunu kaldır
    mainWindow.center(); // Ortala
  }
});

// 3. Windows Başlangıcında Otomatik Çalışma Ayarı
ipcMain.on("toggle-auto-start", (event, shouldStart) => {
  app.setLoginItemSettings({
    openAtLogin: shouldStart,
    path: app.getPath("exe"),
  });
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
