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
} from "lucide-react";

const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- ÇEVİRİLER (12 DİL) ---
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    setupTitle: "Initial Setup",
    nameLabel: "Your Name",
    keyLabel: "License Key",
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
    widget: "Widget Mode",
    autoStart: "Auto Start",
    invalid: "Invalid License Key",
    phTask: "Add new task...",
    phNote: "Write your notes here...",
    phHabit: "Add new habit...",
    morning: "Breakfast",
    noon: "Lunch",
    evening: "Dinner",
  },
  tr: {
    welcome: "Hoş Geldiniz",
    setupTitle: "İlk Kurulum",
    nameLabel: "Adınız",
    keyLabel: "Lisans Anahtarı",
    btnStart: "Başla",
    dashboard: "Ana Sayfa",
    settings: "Ayarlar",
    tasks: "Görevler",
    notes: "Notlar",
    water: "Sıvı Takibi",
    meals: "Yemek Planı",
    alarms: "Hatırlatıcılar",
    habits: "Alışkanlıklar",
    year: "Yıl",
    widget: "Widget Modu",
    autoStart: "Otomatik Başlat",
    invalid: "Geçersiz Lisans Kodu",
    phTask: "Yeni görev ekle...",
    phNote: "Notlarını buraya yaz...",
    phHabit: "Yeni alışkanlık ekle...",
    morning: "Kahvaltı",
    noon: "Öğle",
    evening: "Akşam",
  },
  // Diğer diller için İngilizce fallback (yer tasarrufu için kısaltıldı, gerçekte hepsi eklenebilir)
};

// Yardımcı Fonksiyon: Çeviri Al
const getTrans = (lang, key) => {
  // Seçilen dilde varsa döndür, yoksa İngilizce, o da yoksa key'in kendisi
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS["en"][key] || key;
};

// --- SABİTLER ---
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [language, setLanguage] = useState("en"); // Başlangıç dili İngilizce

  const [viewMode, setViewMode] = useState("full");
  const [currentView, setCurrentView] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const [plannerData, setPlannerData] = useState({});
  const [alarms, setAlarms] = useState([]);
  const [activeWidgets, setActiveWidgets] = useState([
    "todos",
    "notes",
    "water",
    "meals",
    "alarms",
  ]);

  const [error, setError] = useState("");
  const alarmIntervalRef = useRef(null);

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const savedSetup = localStorage.getItem("lifeflow_setup");
    const savedUser = localStorage.getItem("lifeflow_user");
    const savedLang = localStorage.getItem("lifeflow_lang");

    if (savedSetup === "true" && savedUser) {
      setUserName(savedUser);
      if (savedLang) setLanguage(savedLang);
      setIsSetup(true);
    }

    // Verileri Yükle
    const loadData = (key, setter) => {
      const data = localStorage.getItem(key);
      if (data) setter(JSON.parse(data));
    };
    loadData("lifeflow_db", setPlannerData);
    loadData("lifeflow_alarms", setAlarms);
    loadData("lifeflow_widgets", setActiveWidgets);

    // Bildirim İzni
    if (Notification.permission !== "granted") Notification.requestPermission();

    // Alarm Kontrolü
    startAlarmCheck();
    return () => clearInterval(alarmIntervalRef.current);
  }, []);

  // --- ALARM SİSTEMİ ---
  const startAlarmCheck = () => {
    alarmIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const currentAlarms = JSON.parse(
        localStorage.getItem("lifeflow_alarms") || "[]"
      );

      currentAlarms.forEach((alarm) => {
        if (alarm.active && alarm.time === currentTime) {
          new Notification("LifeFlow", {
            body: alarm.label || "Zamanı geldi!",
            icon: "/favicon.ico",
          });
          alarm.active = false; // Tek seferlik çalsın
          updateAlarms(currentAlarms);
        }
      });
    }, 30000);
  };

  const updateAlarms = (newAlarms) => {
    setAlarms(newAlarms);
    localStorage.setItem("lifeflow_alarms", JSON.stringify(newAlarms));
  };

  // --- VERİ YÖNETİMİ ---
  const saveData = (newData) => {
    setPlannerData(newData);
    if (isSetup) localStorage.setItem("lifeflow_db", JSON.stringify(newData));
  };

  const getDayData = (dateKey) => {
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return (
      plannerData[key] || {
        todos: [],
        notes: "",
        water: 0,
        meals: { breakfast: "", lunch: "", dinner: "" },
        habits: [],
      }
    );
  };

  const updateDayData = (dateKey, data) => {
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const existing = getDayData(key);
    const updated = { ...existing, ...data };
    saveData({ ...plannerData, [key]: updated });
  };

  // --- KURULUM ---
  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_user", userName);
      localStorage.setItem("lifeflow_lang", language); // Seçilen dili kaydet
      localStorage.setItem("lifeflow_setup", "true");
      setIsSetup(true);
    } else {
      setError(getTrans(language, "invalid"));
    }
  };

  // --- PENCERE YÖNETİMİ ---
  const handleClose = () => ipcRenderer && ipcRenderer.send("app-close");
  const handleMinimize = () => ipcRenderer && ipcRenderer.send("app-minimize");
  const toggleAutoStart = () =>
    ipcRenderer && ipcRenderer.send("toggle-auto-start", true);

  const toggleWidget = () => {
    if (viewMode === "full") {
      setViewMode("widget");
      ipcRenderer && ipcRenderer.send("set-widget-mode");
    } else {
      setViewMode("full");
      ipcRenderer && ipcRenderer.send("set-normal-mode");
    }
  };

  // --- EKRAN 1: KURULUM (DİL SEÇİMLİ) ---
  if (!isSetup) {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a] text-white font-sans select-none">
        <div
          className="h-8 flex justify-end items-center px-4 bg-[#1e293b]"
          style={{ WebkitAppRegion: "drag" }}
        >
          <div className="flex gap-2" style={{ WebkitAppRegion: "no-drag" }}>
            <button onClick={handleMinimize} className="hover:text-slate-300">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={handleClose} className="hover:text-red-500">
              <X className="w-4 h-4" />
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
              {/* DİL SEÇİCİ */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Language / Dil
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-2 rounded-lg text-center transition ${
                        language === lang.code
                          ? "bg-amber-500 text-black"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                      title={lang.name}
                    >
                      <span className="text-xl">{lang.flag}</span>
                    </button>
                  ))}
                </div>
                <p className="text-right text-[10px] text-amber-500 mt-1">
                  {LANGUAGES.find((l) => l.code === language)?.name}
                </p>
              </div>

              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 transition"
                placeholder={getTrans(language, "nameLabel")}
              />
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500 transition"
                placeholder={getTrans(language, "keyLabel")}
              />

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <button
                onClick={handleSetup}
                disabled={!userName || !licenseKey}
                className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 hover:bg-amber-400 transition disabled:opacity-50"
              >
                {getTrans(language, "btnStart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: WIDGET MODU ---
  if (viewMode === "widget") {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const todayData = getDayData(todayKey);
    return (
      <div className="h-screen flex flex-col bg-[#0f172a]/95 text-white border border-amber-500/30 rounded-xl overflow-hidden font-sans">
        <div
          className="h-8 bg-amber-500/10 flex justify-between items-center px-3 cursor-move"
          style={{ WebkitAppRegion: "drag" }}
        >
          <span className="text-xs font-bold text-amber-500">
            LifeFlow Widget
          </span>
          <div className="flex gap-2" style={{ WebkitAppRegion: "no-drag" }}>
            <button onClick={toggleWidget} className="hover:text-amber-400">
              <Maximize className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-3 overflow-hidden flex flex-col gap-2">
          <div className="flex-1 bg-[#1e293b]/50 rounded-lg p-2 overflow-y-auto scrollbar-hide">
            {todayData.todos
              .filter((t) => !t.completed)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center text-xs bg-[#0f172a] p-2 rounded border-l-2 border-amber-500 mb-1 truncate"
                >
                  {t.text}
                </div>
              ))}
            {todayData.todos.filter((t) => !t.completed).length === 0 && (
              <p className="text-xs text-slate-500 text-center mt-2">🎉</p>
            )}
          </div>
          <textarea
            className="h-20 w-full bg-[#1e293b]/50 rounded-lg p-2 text-xs resize-none outline-none focus:border-amber-500/50 border border-transparent"
            placeholder={getTrans(language, "phNote")}
            value={todayData.notes}
            onChange={(e) => updateDayData(todayKey, { notes: e.target.value })}
          />
        </div>
      </div>
    );
  }

  // --- EKRAN 3: NORMAL MOD ---
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden border border-slate-300">
      {/* AYARLAR MODALI */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {getTrans(language, "settings")}
              </h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {/* Dil Değiştirme (İçeriden) */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-400 block mb-2">
                Language
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      localStorage.setItem("lifeflow_lang", lang.code);
                    }}
                    className={`p-2 rounded-lg text-xl ${
                      language === lang.code
                        ? "bg-amber-100 border border-amber-500"
                        : "bg-slate-50"
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {[
                {
                  id: "todos",
                  label: getTrans(language, "tasks"),
                  icon: CheckSquare,
                },
                {
                  id: "notes",
                  label: getTrans(language, "notes"),
                  icon: StickyNote,
                },
                {
                  id: "alarms",
                  label: getTrans(language, "alarms"),
                  icon: Bell,
                },
                {
                  id: "water",
                  label: getTrans(language, "water"),
                  icon: Droplets,
                },
                {
                  id: "meals",
                  label: getTrans(language, "meals"),
                  icon: Utensils,
                },
                {
                  id: "habits",
                  label: getTrans(language, "habits"),
                  icon: Activity,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    const newWidgets = activeWidgets.includes(item.id)
                      ? activeWidgets.filter((w) => w !== item.id)
                      : [...activeWidgets, item.id];
                    setActiveWidgets(newWidgets);
                    localStorage.setItem(
                      "lifeflow_widgets",
                      JSON.stringify(newWidgets)
                    );
                  }}
                  className={`w-full flex items-center p-3 rounded-xl border transition ${
                    activeWidgets.includes(item.id)
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PENCERE ÇUBUĞU */}
      <div
        className="h-8 bg-white flex justify-between items-center px-4 border-b border-slate-200"
        style={{ WebkitAppRegion: "drag" }}
      >
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW
        </div>
        <div className="flex gap-4" style={{ WebkitAppRegion: "no-drag" }}>
          <button onClick={handleMinimize}>
            <Minus className="w-4 h-4 text-slate-400 hover:text-black" />
          </button>
          <button onClick={handleClose}>
            <X className="w-4 h-4 text-slate-400 hover:text-red-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                currentView === "dashboard"
                  ? "bg-amber-50 text-amber-600"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Home className="w-4 h-4" /> {getTrans(language, "dashboard")}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Settings className="w-4 h-4" /> {getTrans(language, "settings")}
            </button>
            <div className="px-3 py-2 mt-4 border-t border-slate-100 pt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                {getTrans(language, "year")}
              </label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={toggleWidget}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 text-white rounded-xl hover:bg-amber-500 hover:text-black transition shadow-lg"
            >
              <Minimize className="w-4 h-4" /> {getTrans(language, "widget")}
            </button>
            <button
              onClick={toggleAutoStart}
              className="w-full flex items-center justify-center gap-2 p-2 text-xs text-slate-400 hover:text-green-600 transition"
            >
              <Power className="w-3 h-3" /> {getTrans(language, "autoStart")}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur border-b border-slate-200">
            <div className="flex items-center gap-4">
              {currentView !== "dashboard" && (
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="p-2 hover:bg-slate-200 rounded-full transition"
                >
                  <Home className="w-5 h-5 text-slate-600" />
                </button>
              )}
              {currentView === "day" && (
                <button
                  onClick={() => setCurrentView("month")}
                  className="p-2 hover:bg-slate-200 rounded-full transition"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {currentView === "dashboard"
                    ? `${currentYear}`
                    : currentView === "month"
                    ? `${MONTHS_TR[currentMonth]} ${currentYear}`
                    : selectedDate
                    ? `${selectedDate.split("-")[2]} ${
                        MONTHS_TR[parseInt(selectedDate.split("-")[1])]
                      } ${selectedDate.split("-")[0]}`
                    : ""}
                </h1>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                {getTrans(language, "welcome")}
              </p>
              <p className="font-bold text-amber-600">{userName}</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {/* 1. DASHBOARD */}
            {currentView === "dashboard" && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {MONTHS_TR.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMonth(idx);
                      setCurrentView("month");
                    }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition text-left group"
                  >
                    <h3 className="text-lg font-bold text-slate-700 group-hover:text-amber-600">
                      {m}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{currentYear}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 2. TAKVİM */}
            {currentView === "month" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-7 mb-4">
                  {DAYS_TR.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const daysInMonth = new Date(
                      currentYear,
                      currentMonth + 1,
                      0
                    ).getDate();
                    const firstDay = new Date(
                      currentYear,
                      currentMonth,
                      1
                    ).getDay();
                    const start = firstDay === 0 ? 6 : firstDay - 1;
                    const grid = [];
                    for (let i = 0; i < start; i++) grid.push(null);
                    for (let i = 1; i <= daysInMonth; i++) grid.push(i);
                    return grid.map((day, i) => {
                      if (!day) return <div key={i}></div>;
                      const dateKey = `${currentYear}-${currentMonth}-${day}`;
                      const data = plannerData[dateKey];
                      const hasContent =
                        data && (data.todos.length > 0 || data.notes);
                      const isToday =
                        new Date().toDateString() ===
                        new Date(currentYear, currentMonth, day).toDateString();
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedDate(dateKey);
                            setCurrentView("day");
                          }}
                          className={`aspect-square rounded-xl border flex flex-col justify-between p-3 transition hover:shadow-md text-left ${
                            isToday
                              ? "border-amber-500 bg-amber-50"
                              : "border-slate-100 hover:border-amber-300"
                          }`}
                        >
                          <span
                            className={`text-lg font-bold ${
                              isToday ? "text-amber-600" : "text-slate-700"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="flex gap-1">
                            {hasContent && (
                              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 3. GÜN DETAYI */}
            {currentView === "day" &&
              selectedDate &&
              (() => {
                const data = getDayData(selectedDate);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Görevler */}
                    {activeWidgets.includes("todos") && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                        <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                          <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
                          {getTrans(language, "tasks")}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                          {data.todos.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center p-3 bg-slate-50 border rounded-xl"
                            >
                              <button
                                onClick={() =>
                                  updateDayData(selectedDate, {
                                    todos: data.todos.map((x) =>
                                      x.id === t.id
                                        ? { ...x, completed: !x.completed }
                                        : x
                                    ),
                                  })
                                }
                                className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                                  t.completed ? "bg-amber-500" : "bg-white"
                                }`}
                              >
                                {t.completed && (
                                  <CheckSquare className="w-3 h-3 text-white" />
                                )}
                              </button>
                              <span
                                className={`flex-1 ${
                                  t.completed
                                    ? "line-through text-slate-400"
                                    : ""
                                }`}
                              >
                                {t.text}
                              </span>
                              <button
                                onClick={() =>
                                  updateDayData(selectedDate, {
                                    todos: data.todos.filter(
                                      (x) => x.id !== t.id
                                    ),
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 relative">
                          <PlusCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            className="w-full bg-slate-50 border rounded-xl py-3 pl-10 outline-none focus:border-amber-500"
                            placeholder={getTrans(language, "phTask")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.target.value.trim()) {
                                updateDayData(selectedDate, {
                                  todos: [
                                    ...data.todos,
                                    {
                                      id: Date.now(),
                                      text: e.target.value,
                                      completed: false,
                                    },
                                  ],
                                });
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hatırlatıcılar */}
                    {activeWidgets.includes("alarms") && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                        <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                          <Bell className="w-5 h-5 mr-2 text-red-500" />{" "}
                          {getTrans(language, "alarms")}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {alarms.map((alarm) => (
                            <div
                              key={alarm.id}
                              className="flex items-center justify-between p-3 rounded-xl border bg-red-50 border-red-100"
                            >
                              <span className="font-bold text-slate-800">
                                {alarm.time}{" "}
                                <span className="font-normal text-slate-600 text-sm">
                                  - {alarm.label}
                                </span>
                              </span>
                              <button
                                onClick={() =>
                                  updateAlarms(
                                    alarms.filter((a) => a.id !== alarm.id)
                                  )
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
                            placeholder="..."
                          />
                          <button
                            onClick={() => {
                              const t = document.getElementById("aTime").value;
                              const l = document.getElementById("aLabel").value;
                              if (t) {
                                setAlarms([
                                  ...alarms,
                                  {
                                    id: Date.now(),
                                    time: t,
                                    label: l,
                                    active: true,
                                  },
                                ]);
                                localStorage.setItem(
                                  "lifeflow_alarms",
                                  JSON.stringify([
                                    ...alarms,
                                    {
                                      id: Date.now(),
                                      time: t,
                                      label: l,
                                      active: true,
                                    },
                                  ])
                                );
                              }
                            }}
                            className="bg-amber-500 text-white p-2 rounded-xl"
                          >
                            <PlusCircle />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SIVI TAKİBİ (DÜZELTİLDİ) */}
                    {activeWidgets.includes("water") && (
                      <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white">
                        <h3 className="font-bold text-lg flex items-center mb-6">
                          <Droplets className="w-5 h-5 mr-2" />{" "}
                          {getTrans(language, "water")}
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <button
                              key={num}
                              onClick={() =>
                                updateDayData(selectedDate, {
                                  water: data.water === num ? num - 1 : num,
                                })
                              }
                              className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                                num <= data.water
                                  ? "bg-white border-white shadow-lg scale-105"
                                  : "bg-blue-600/30 border-blue-400/30 hover:bg-blue-600/50"
                              }`}
                            >
                              <Droplets
                                className={`w-8 h-8 ${
                                  num <= data.water
                                    ? "text-blue-500 fill-blue-500"
                                    : "text-white opacity-50"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-center mt-4 text-blue-100 font-medium">
                          {data.water * 250} ml / 2000 ml
                        </p>
                      </div>
                    )}

                    {/* YEMEK PLANI */}
                    {activeWidgets.includes("meals") && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                          <Utensils className="w-5 h-5 mr-2 text-green-500" />{" "}
                          {getTrans(language, "meals")}
                        </h3>
                        <div className="space-y-4">
                          {["breakfast", "lunch", "dinner"].map((m) => {
                            const key =
                              m === "breakfast"
                                ? "breakfast"
                                : m === "lunch"
                                ? "lunch"
                                : "dinner";
                            const labelKey =
                              m === "breakfast"
                                ? "morning"
                                : m === "lunch"
                                ? "noon"
                                : "evening";
                            return (
                              <div key={key} className="relative">
                                <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400 uppercase">
                                  {getTrans(language, labelKey)}
                                </span>
                                <input
                                  type="text"
                                  className="w-full bg-slate-50 border rounded-xl pt-7 pb-2 px-3 text-sm outline-none focus:border-amber-500"
                                  value={data.meals[key]}
                                  onChange={(e) =>
                                    updateDayData(selectedDate, {
                                      meals: {
                                        ...data.meals,
                                        [key]: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* NOTLAR */}
                    {activeWidgets.includes("notes") && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[300px] flex flex-col">
                        <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                          <StickyNote className="w-5 h-5 mr-2 text-amber-500" />{" "}
                          {getTrans(language, "notes")}
                        </h3>
                        <textarea
                          className="flex-1 bg-slate-50 rounded-xl p-4 border-none resize-none outline-none focus:ring-2 focus:ring-amber-100"
                          value={data.notes}
                          onChange={(e) =>
                            updateDayData(selectedDate, {
                              notes: e.target.value,
                            })
                          }
                          placeholder={getTrans(language, "phNote")}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LifeFlowApp;
