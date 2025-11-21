import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  CheckSquare,
  StickyNote,
  Power,
  Minimize,
  Maximize,
  Trash2,
  PlusCircle,
  X,
  Minus,
  Layout,
  Settings,
  ArrowLeft,
  Home,
  Bell,
  Droplets,
  Utensils,
  Activity,
  Globe,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  AlignRight,
  AlignLeft,
} from "lucide-react";

const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- GENİŞLETİLMİŞ MOTİVASYON SÖZLERİ ---
const QUOTES_DB = {
  en: [
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never came from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Wake up with determination. Go to bed with satisfaction.",
  ],
  tr: [
    "Kendine inan, yolun yarısındasın.",
    "Sınırların sadece hayal gücündür.",
    "Kendini zorla, çünkü bunu senin için kimse yapmayacak.",
    "Harika şeyler konfor alanından çıkmaz.",
    "Hayal et. İste. Yap.",
    "Başarı seni bulmaz. Sen ona gitmelisin.",
    "Bir şey için ne kadar çok çalışırsan, başardığında o kadar iyi hissedersin.",
    "Daha büyük hayal et.",
    "Yorulduğunda durma. Bittiğinde dur.",
    "Kararlılıkla uyan. Tatminle uyu.",
    "Bugün harika görünüyorsun!",
    "Potansiyelin sandığından çok daha büyük.",
    "Küçük adımlar, büyük zaferlere götürür.",
    "Disiplin, özgürlüğün anahtarıdır.",
    "Sahne senin, bugünü yönet!",
  ],
  // ... Diğer diller için de benzer listeler eklenebilir (Default EN kullanılır)
};

// --- DİL & AYARLAR ---
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", locale: "en-US" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", locale: "tr-TR" },
  { code: "es", name: "Español", flag: "🇪🇸", locale: "es-ES" },
  { code: "fr", name: "Français", flag: "🇫🇷", locale: "fr-FR" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", locale: "de-DE" },
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    btnStart: "Get Started",
    dashboard: "Dashboard",
    settings: "Settings",
    tasks: "Tasks",
    notes: "Notes",
    water: "Hydration",
    meals: "Meal Plan",
    alarms: "Reminders",
    habits: "Habits",
    year: "Year",
    widget: "Widget",
    autoStart: "Auto Start",
    phTask: "Add task...",
    phNote: "Notes...",
    phAlarm: "Label...",
    morning: "Breakfast",
    noon: "Lunch",
    evening: "Dinner",
    reset: "Reset",
    dockLeft: "Dock Left",
    dockRight: "Dock Right",
  },
  tr: {
    welcome: "Hoş Geldin",
    btnStart: "Başla",
    dashboard: "Ana Sayfa",
    settings: "Ayarlar",
    tasks: "Görevler",
    notes: "Notlar",
    water: "Sıvı",
    meals: "Yemek",
    alarms: "Hatırlatıcı",
    habits: "Alışkanlık",
    year: "Yıl",
    widget: "Widget",
    autoStart: "Oto Başlat",
    phTask: "Görev ekle...",
    phNote: "Not al...",
    phAlarm: "Başlık...",
    morning: "Kahvaltı",
    noon: "Öğle",
    evening: "Akşam",
    reset: "Sıfırla",
    dockLeft: "Sola Yasla",
    dockRight: "Sağa Yasla",
  },
};

const getTrans = (lang, key) =>
  TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"][key] || key;
const getMonthName = (idx, lang) =>
  new Date(2025, idx, 1).toLocaleDateString(
    LANGUAGES.find((l) => l.code === lang)?.locale || "en-US",
    { month: "long" }
  );
const getDayName = (idx, lang) =>
  new Date(1970, 0, 5 + idx).toLocaleDateString(
    LANGUAGES.find((l) => l.code === lang)?.locale || "en-US",
    { weekday: "short" }
  );

const LifeFlowApp = () => {
  // State
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("en");
  const [viewMode, setViewMode] = useState("full"); // 'full', 'widget'
  const [widgetSide, setWidgetSide] = useState("right"); // 'left', 'right'
  const [currentView, setCurrentView] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [plannerData, setPlannerData] = useState({});
  const [activeWidgets, setActiveWidgets] = useState([
    "todos",
    "notes",
    "water",
    "meals",
    "alarms",
  ]);
  const [quote, setQuote] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  const alarmIntervalRef = useRef(null);

  // --- INIT ---
  useEffect(() => {
    const savedSetup = localStorage.getItem("lifeflow_setup");
    const savedUser = localStorage.getItem("lifeflow_user");
    const savedLang = localStorage.getItem("lifeflow_lang");
    const savedAuto = localStorage.getItem("lifeflow_autostart") === "true";

    if (savedSetup === "true") {
      setUserName(savedUser || "User");
      setLanguage(savedLang || "en");
      setAutoStart(savedAuto);
      setIsSetup(true);

      // Rastgele Söz Seç
      const quotes = QUOTES_DB[savedLang] || QUOTES_DB["en"];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    const load = (k, s) => {
      const d = localStorage.getItem(k);
      if (d) s(JSON.parse(d));
    };
    load("lifeflow_db", setPlannerData);
    load("lifeflow_widgets", setActiveWidgets);

    if (Notification.permission !== "granted") Notification.requestPermission();

    // Alarm Döngüsünü Başlat
    startAlarmCheck();
    return () => clearInterval(alarmIntervalRef.current);
  }, []);

  // --- ALARM SİSTEMİ (GÜN BAZLI) ---
  const startAlarmCheck = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      const now = new Date();
      // Tarih Anahtarı: YYYY-M-D (Veritabanındaki formatla aynı olmalı)
      // getMonth() 0-11 arası döner, veritabanında da öyle tutuyoruz.
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      // Güncel veriyi çek (State bayat olabilir diye localStorage'dan okuyoruz)
      const db = JSON.parse(localStorage.getItem("lifeflow_db") || "{}");
      const todayData = db[todayKey];

      if (todayData && todayData.alarms) {
        let updated = false;
        todayData.alarms.forEach((alarm) => {
          if (alarm.active && alarm.time === currentTime) {
            // BİLDİRİM GÖNDER
            new Notification("LifeFlow Hatırlatıcı", {
              body: alarm.label || "Zamanı geldi!",
              icon: "/favicon.ico",
              silent: false,
            });

            // SES ÇAL
            const audio = new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
            );
            audio.play().catch((e) => console.error("Ses hatası:", e));

            alarm.active = false; // Tekrar çalmasın
            updated = true;
          }
        });

        if (updated) {
          db[todayKey] = todayData;
          setPlannerData(db); // React state güncelle
          localStorage.setItem("lifeflow_db", JSON.stringify(db)); // DB güncelle
        }
      }
    }, 10000); // 10 saniyede bir kontrol
  };

  // --- VERİ İŞLEMLERİ ---
  const getDayData = (key) => {
    const k =
      key ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return (
      plannerData[k] || {
        todos: [],
        notes: "",
        water: 0,
        meals: {},
        alarms: [],
      }
    );
  };

  const updateDayData = (key, newData) => {
    const k =
      key ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const current = getDayData(k);
    const updated = { ...current, ...newData };
    const newDb = { ...plannerData, [k]: updated };
    setPlannerData(newDb);
    localStorage.setItem("lifeflow_db", JSON.stringify(newDb));
  };

  // --- PENCERE YÖNETİMİ ---
  const handleClose = () => ipcRenderer?.send("app-close");
  const handleMinimize = () => ipcRenderer?.send("app-minimize");

  const handleAutoStart = () => {
    const newState = !autoStart;
    setAutoStart(newState);
    localStorage.setItem("lifeflow_autostart", newState.toString());
    ipcRenderer?.send("toggle-auto-start", newState);
  };

  const activateWidget = (side) => {
    setWidgetSide(side);
    setViewMode("widget");
    ipcRenderer?.send("set-widget-mode", side);
  };

  const deactivateWidget = () => {
    setViewMode("full");
    ipcRenderer?.send("set-normal-mode");
  };

  // Widget Hover Efektleri
  const onWidgetEnter = () => ipcRenderer?.send("widget-hover", true);
  const onWidgetLeave = () => ipcRenderer?.send("widget-hover", false);

  // --- EKRAN 1: KURULUM ---
  if (!isSetup) {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a] text-white font-sans select-none">
        <div className="h-8 flex justify-end items-center px-4 bg-[#1e293b] draggable">
          <div className="flex gap-2 no-drag">
            <button onClick={handleMinimize}>
              <Minus className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
            <button onClick={handleClose}>
              <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-96 p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">LifeFlow</h1>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`aspect-square rounded-lg text-lg transition border ${
                      language === l.code
                        ? "bg-amber-500 border-amber-500"
                        : "bg-slate-800 border-transparent"
                    }`}
                  >
                    {l.flag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                placeholder={getTrans(language, "nameLabel")}
              />
              <button
                onClick={() => {
                  localStorage.setItem("lifeflow_setup", "true");
                  localStorage.setItem("lifeflow_user", userName);
                  localStorage.setItem("lifeflow_lang", language);
                  setIsSetup(true);
                }}
                className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 hover:bg-amber-400"
              >
                {getTrans(language, "btnStart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: HAYALET WIDGET (YENİ TASARIM) ---
  if (viewMode === "widget") {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const data = getDayData(todayKey);

    return (
      <div
        onMouseEnter={onWidgetEnter}
        onMouseLeave={onWidgetLeave}
        className="h-screen flex flex-col bg-slate-900/80 backdrop-blur-xl text-white border-l border-white/10 overflow-hidden font-sans shadow-2xl transition-all duration-300"
      >
        {/* Header */}
        <div className="h-10 bg-black/30 flex justify-between items-center px-3 cursor-move draggable">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0"></div>
            <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
              LifeFlow
            </span>
          </div>
          <button
            onClick={deactivateWidget}
            className="hover:text-amber-400 p-1 no-drag"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
          {/* Hızlı Görevler */}
          <div className="flex-1 bg-black/20 rounded-lg p-2 overflow-y-auto scrollbar-hide">
            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">
              {getTrans(language, "tasks")}
            </p>
            {data.todos
              .filter((t) => !t.completed)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center text-xs bg-white/5 p-2 rounded border-l-2 border-amber-500 mb-1 truncate"
                >
                  {t.text}
                </div>
              ))}
            {data.todos.filter((t) => !t.completed).length === 0 && (
              <p className="text-center text-xs text-slate-600 py-4">🎉</p>
            )}
          </div>

          {/* Bugünün Notu */}
          <textarea
            className="h-24 bg-black/20 rounded-lg p-2 text-xs resize-none outline-none focus:ring-1 focus:ring-amber-500/50 border border-transparent text-slate-300 placeholder-slate-600"
            placeholder={getTrans(language, "phNote")}
            value={data.notes}
            onChange={(e) => updateDayData(todayKey, { notes: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // --- EKRAN 3: DASHBOARD ---
  const todayKey =
    selectedDate ||
    `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
  const data = getDayData(todayKey);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden border border-slate-300">
      {/* Pencere Çubuğu */}
      <div className="h-8 bg-white flex justify-between items-center px-4 border-b border-slate-200 draggable">
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW
          PREMIUM
        </div>
        <div className="flex gap-4 no-drag">
          <button onClick={handleMinimize}>
            <Minus className="w-4 h-4 text-slate-400 hover:text-black" />
          </button>
          <button onClick={handleClose}>
            <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">LifeFlow</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Premium
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="w-full flex items-center gap-3 p-3 rounded-xl font-medium hover:bg-slate-50 text-slate-600"
            >
              <Home className="w-4 h-4" /> {getTrans(language, "dashboard")}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 p-3 rounded-xl font-medium hover:bg-slate-50 text-slate-600"
            >
              <Settings className="w-4 h-4" /> {getTrans(language, "settings")}
            </button>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => activateWidget("left")}
                className="flex items-center justify-center gap-1 p-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] hover:bg-slate-200"
              >
                <AlignLeft className="w-3 h-3" />{" "}
                {getTrans(language, "dockLeft")}
              </button>
              <button
                onClick={() => activateWidget("right")}
                className="flex items-center justify-center gap-1 p-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] hover:bg-slate-200"
              >
                <AlignRight className="w-3 h-3" />{" "}
                {getTrans(language, "dockRight")}
              </button>
            </div>
            <button
              onClick={handleAutoStart}
              className={`w-full flex items-center justify-center gap-2 p-2 text-xs rounded-lg transition ${
                autoStart
                  ? "text-green-600 bg-green-50"
                  : "text-slate-400 hover:text-green-600"
              }`}
            >
              <Power className="w-3 h-3" /> {getTrans(language, "autoStart")}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur border-b border-slate-200">
            <div className="flex items-center gap-4">
              {currentView !== "dashboard" && (
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="p-2 hover:bg-slate-200 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-slate-800">
                {currentView === "dashboard"
                  ? currentYear
                  : `${selectedDate} ${getMonthName(
                      new Date(selectedDate).getMonth(),
                      language
                    )}`}
              </h1>
            </div>
            <p className="text-sm text-slate-500 italic hidden md:block">
              "{quote}"
            </p>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {currentView === "dashboard" && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(
                        `${currentYear}-${i}-${new Date().getDate()}`
                      );
                      setCurrentView("day");
                    }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition text-left"
                  >
                    <h3 className="text-lg font-bold text-slate-700">
                      {getMonthName(i, language)}
                    </h3>
                  </button>
                ))}
              </div>
            )}

            {currentView === "day" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HATIRLATICILAR (TARİHE ÖZEL) */}
                {activeWidgets.includes("alarms") && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                    <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                      <Bell className="w-5 h-5 mr-2 text-red-500" />{" "}
                      {getTrans(language, "alarms")}
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {(data.alarms || []).map((alarm) => (
                        <div
                          key={alarm.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            alarm.active
                              ? "bg-red-50 border-red-100"
                              : "bg-slate-50 opacity-60"
                          }`}
                        >
                          <span className="font-bold">
                            {alarm.time}{" "}
                            <span className="font-normal text-sm">
                              - {alarm.label}
                            </span>
                          </span>
                          <button
                            onClick={() =>
                              updateDayData(todayKey, {
                                alarms: data.alarms.filter(
                                  (a) => a.id !== alarm.id
                                ),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="time"
                        id="aTime"
                        className="bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        id="aLabel"
                        className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                        placeholder={getTrans(language, "phAlarm")}
                      />
                      <button
                        onClick={() => {
                          const t = document.getElementById("aTime").value;
                          const l = document.getElementById("aLabel").value;
                          if (t) {
                            const newAlarms = [
                              ...(data.alarms || []),
                              {
                                id: Date.now(),
                                time: t,
                                label: l,
                                active: true,
                              },
                            ];
                            updateDayData(todayKey, { alarms: newAlarms });
                          }
                        }}
                        className="bg-amber-500 text-white p-2 rounded-xl"
                      >
                        <PlusCircle />
                      </button>
                    </div>
                  </div>
                )}

                {/* DİĞER MODÜLLER (SIVI, YEMEK, NOTLAR) */}
                {activeWidgets.includes("water") && (
                  <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white h-[200px]">
                    <h3 className="font-bold text-lg flex items-center mb-4">
                      <Droplets className="w-5 h-5 mr-2" />{" "}
                      {getTrans(language, "water")}
                    </h3>
                    <div className="grid grid-cols-8 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            updateDayData(todayKey, {
                              water: data.water === num ? num - 1 : num,
                            })
                          }
                          className={`aspect-square rounded-lg flex items-center justify-center transition border ${
                            num <= data.water
                              ? "bg-white text-blue-600"
                              : "border-white/30 hover:bg-white/10"
                          }`}
                        >
                          <Droplets
                            className="w-4 h-4"
                            fill={num <= data.water ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LifeFlowApp;
