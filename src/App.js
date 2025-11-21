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
  Moon,
  Sun,
  RefreshCw,
  AlignLeft,
  AlignRight,
  Star,
  Heart,
  Plane,
  AlertCircle,
  HelpCircle,
  PartyPopper,
  DollarSign,
  Trophy,
} from "lucide-react";

const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- DİL VE MOTİVASYON VERİTABANI ---
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", locale: "en-US" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", locale: "tr-TR" },
  { code: "es", name: "Español", flag: "🇪🇸", locale: "es-ES" },
  { code: "fr", name: "Français", flag: "🇫🇷", locale: "fr-FR" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", locale: "de-DE" },
  { code: "it", name: "Italiano", flag: "🇮🇹", locale: "it-IT" },
  { code: "pt", name: "Português", flag: "🇵🇹", locale: "pt-PT" },
  { code: "ru", name: "Русский", flag: "🇷🇺", locale: "ru-RU" },
  { code: "ja", name: "日本語", flag: "🇯🇵", locale: "ja-JP" },
  { code: "ko", name: "한국어", flag: "🇰🇷", locale: "ko-KR" },
  { code: "zh", name: "中文", flag: "🇨🇳", locale: "zh-CN" },
  { code: "ar", name: "العربية", flag: "🇸🇦", locale: "ar-SA" },
];

// Motivasyon Sözleri (Her dil için ayrı)
const QUOTES_DB = {
  en: [
    "Believe you can.",
    "Dream big.",
    "Stay focused.",
    "Make it happen.",
    "You are enough.",
    "Keep going.",
  ],
  tr: [
    "Kendine inan.",
    "Büyük hayal et.",
    "Odaklan.",
    "Harekete geç.",
    "Sen yeterlisin.",
    "Devam et.",
    "Bugün harika görünüyorsun!",
    "Potansiyelin sandığından büyük.",
  ],
  es: [
    "Cree en ti.",
    "Sueña en grande.",
    "Mantente enfocado.",
    "Haz que suceda.",
    "Eres suficiente.",
    "Sigue adelante.",
  ],
  // Diğer diller için varsayılan EN kullanılır
};

const TRANSLATIONS = {
  en: {
    welcome: "Welcome",
    setupTitle: "Initial Setup",
    nameLabel: "Your Name",
    keyLabel: "License Key",
    btnStart: "Get Started",
    dashboard: "Dashboard",
    settings: "Settings",
    languageLabel: "Language",
    widgets: "Modules",
    tasks: "Tasks",
    notes: "Notes",
    water: "Hydration",
    meals: "Meal Plan",
    alarms: "Reminders",
    habits: "Habits",
    year: "Year",
    widget: "Widget",
    autoStart: "Auto Start",
    invalid: "Invalid Key",
    phTask: "Add task...",
    phNote: "Notes...",
    phHabit: "New habit...",
    phAlarm: "Label...",
    morning: "Breakfast",
    noon: "Lunch",
    evening: "Dinner",
    reset: "Reset App",
    stickers: "Day Sticker",
  },
  tr: {
    welcome: "Hoş Geldiniz",
    setupTitle: "Kurulum",
    nameLabel: "Adınız",
    keyLabel: "Lisans Anahtarı",
    btnStart: "Başla",
    dashboard: "Ana Sayfa",
    settings: "Ayarlar",
    languageLabel: "Dil",
    widgets: "Modüller",
    tasks: "Görevler",
    notes: "Notlar",
    water: "Sıvı Takibi",
    meals: "Yemek Planı",
    alarms: "Hatırlatıcı",
    habits: "Alışkanlık",
    year: "Yıl",
    widget: "Widget Modu",
    autoStart: "Oto Başlat",
    invalid: "Geçersiz Kod",
    phTask: "Görev ekle...",
    phNote: "Not al...",
    phHabit: "Alışkanlık ekle...",
    phAlarm: "Başlık...",
    morning: "Kahvaltı",
    noon: "Öğle",
    evening: "Akşam",
    reset: "Sıfırla",
    stickers: "Günün İkonu",
  },
};

const STICKERS = [
  { id: "star", icon: Star, color: "text-yellow-400" },
  { id: "heart", icon: Heart, color: "text-red-500" },
  { id: "plane", icon: Plane, color: "text-blue-400" },
  { id: "alert", icon: AlertCircle, color: "text-orange-500" },
  { id: "party", icon: PartyPopper, color: "text-purple-500" },
  { id: "money", icon: DollarSign, color: "text-green-500" },
  { id: "win", icon: Trophy, color: "text-amber-500" },
];

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
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark"); // 'light' | 'dark'

  const [viewMode, setViewMode] = useState("full");
  const [currentView, setCurrentView] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [autoStart, setAutoStart] = useState(false);

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

  const [quote, setQuote] = useState("");
  const [error, setError] = useState("");
  const alarmIntervalRef = useRef(null);

  const isDark = theme === "dark";

  // --- INIT ---
  useEffect(() => {
    const savedSetup = localStorage.getItem("lifeflow_setup");
    const savedUser = localStorage.getItem("lifeflow_user");
    const savedLang = localStorage.getItem("lifeflow_lang");
    const savedTheme = localStorage.getItem("lifeflow_theme");
    const savedAuto = localStorage.getItem("lifeflow_autostart") === "true";

    if (savedSetup === "true" && savedUser) {
      setUserName(savedUser);
      if (savedLang) {
        setLanguage(savedLang);
        updateQuote(savedLang);
      }
      if (savedTheme) setTheme(savedTheme);
      setIsSetup(true);
    }
    setAutoStart(savedAuto);

    const loadData = (k, s) => {
      const d = localStorage.getItem(k);
      if (d) {
        try {
          s(JSON.parse(d));
        } catch (e) {}
      }
    };
    loadData("lifeflow_db", setPlannerData);
    loadData("lifeflow_alarms", setAlarms);
    loadData("lifeflow_widgets", setActiveWidgets);

    if (Notification.permission !== "granted") Notification.requestPermission();
    startAlarmCheck();
    return () => clearInterval(alarmIntervalRef.current);
  }, []);

  const updateQuote = (lang) => {
    const list = QUOTES_DB[lang] || QUOTES_DB["en"];
    setQuote(list[Math.floor(Math.random() * list.length)]);
  };

  // --- ALARM ---
  const startAlarmCheck = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const db = JSON.parse(localStorage.getItem("lifeflow_db") || "{}");
      const todayData = db[todayKey];

      if (todayData && todayData.alarms) {
        let updated = false;
        todayData.alarms.forEach((alarm) => {
          if (alarm.active && alarm.time === currentTime) {
            new Notification("LifeFlow", {
              body: alarm.label || "Alarm!",
              icon: "/favicon.ico",
            });
            const audio = new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
            );
            audio.play().catch(() => {});
            alarm.active = false;
            updated = true;
          }
        });
        if (updated) {
          db[todayKey] = todayData;
          setPlannerData(db);
          localStorage.setItem("lifeflow_db", JSON.stringify(db));
        }
      }
    }, 5000);
  };

  // --- VERİ ---
  const getDayData = (dateKey) => {
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return (
      plannerData[key] || {
        todos: [],
        notes: "",
        water: 0,
        meals: {},
        alarms: [],
        habits: [],
        sticker: null,
      }
    );
  };

  const updateDayData = (dateKey, data) => {
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const current = getDayData(key);
    const updated = { ...current, ...data };
    const newDb = { ...plannerData, [key]: updated };
    setPlannerData(newDb);
    if (isSetup) localStorage.setItem("lifeflow_db", JSON.stringify(newDb));
  };

  // --- PENCERE ---
  const handleClose = () => ipcRenderer?.send("app-close");
  const handleMinimize = () => ipcRenderer?.send("app-minimize");
  const toggleAutoStart = () => {
    const n = !autoStart;
    setAutoStart(n);
    localStorage.setItem("lifeflow_autostart", n.toString());
    ipcRenderer?.send("toggle-auto-start", n);
  };
  const toggleTheme = () => {
    const n = theme === "dark" ? "light" : "dark";
    setTheme(n);
    localStorage.setItem("lifeflow_theme", n);
  };
  const activateWidget = (side) => {
    setViewMode("widget");
    ipcRenderer?.send("set-widget-mode", side);
  };
  const deactivateWidget = () => {
    setViewMode("full");
    ipcRenderer?.send("set-normal-mode");
  };
  const onWidgetEnter = () => ipcRenderer?.send("widget-hover", true);
  const onWidgetLeave = () => ipcRenderer?.send("widget-hover", false);

  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_user", userName);
      localStorage.setItem("lifeflow_lang", language);
      localStorage.setItem("lifeflow_setup", "true");
      updateQuote(language);
      setIsSetup(true);
    } else {
      setError(getTrans(language, "invalid"));
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset app?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

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
              <h1 className="text-xl font-bold text-white">LifeFlow</h1>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Language
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`text-xl p-1 rounded border ${
                        language === l.code
                          ? "bg-amber-500 border-amber-500"
                          : "border-transparent hover:bg-slate-700"
                      }`}
                    >
                      {l.flag}
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
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                placeholder={getTrans(language, "nameLabel")}
              />
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500"
                placeholder={getTrans(language, "keyLabel")}
              />
              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
              <button
                onClick={handleSetup}
                disabled={!userName || !licenseKey}
                className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 hover:bg-amber-400 disabled:opacity-50"
              >
                {getTrans(language, "btnStart")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: WIDGET ---
  if (viewMode === "widget") {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const data = getDayData(todayKey);
    return (
      <div
        onMouseEnter={onWidgetEnter}
        onMouseLeave={onWidgetLeave}
        className="h-screen flex flex-col bg-slate-900/80 backdrop-blur-xl text-white border-l border-white/10 overflow-hidden font-sans shadow-2xl"
      >
        <div className="h-10 bg-black/30 flex justify-between items-center px-3 cursor-move draggable">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-300">LifeFlow</span>
          </div>
          <button
            onClick={deactivateWidget}
            className="hover:text-amber-400 p-1 no-drag"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
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
          </div>
          <textarea
            className="h-24 bg-black/20 rounded-lg p-2 text-xs resize-none outline-none focus:ring-1 focus:ring-amber-500/50 border border-transparent text-slate-300"
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
  const safeWidgets = Array.isArray(activeWidgets) ? activeWidgets : [];

  return (
    <div
      className={`flex flex-col h-screen font-sans overflow-hidden border transition-colors duration-300 ${
        isDark
          ? "bg-[#0f172a] text-gray-200 border-slate-800"
          : "bg-[#f8fafc] text-slate-800 border-slate-300"
      }`}
    >
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div
            className={`w-96 rounded-2xl shadow-2xl p-6 animate-fadeIn border ${
              isDark
                ? "bg-[#1e293b] border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">
                {getTrans(language, "settings")}
              </h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5 opacity-50 hover:opacity-100" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold opacity-50 block mb-2 uppercase">
                  {getTrans(language, "languageLabel")}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        localStorage.setItem("lifeflow_lang", l.code);
                        updateQuote(l.code);
                      }}
                      className={`aspect-square flex items-center justify-center rounded-lg text-lg border ${
                        language === l.code
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "border-transparent hover:bg-white/10"
                      }`}
                    >
                      {l.flag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold opacity-50 block mb-2 uppercase">
                  {getTrans(language, "widgets")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "todos", label: "Tasks", icon: CheckSquare },
                    { id: "notes", label: "Notes", icon: StickyNote },
                    { id: "alarms", label: "Alarms", icon: Bell },
                    { id: "water", label: "Water", icon: Droplets },
                    { id: "meals", label: "Meals", icon: Utensils },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const nw = safeWidgets.includes(item.id)
                          ? safeWidgets.filter((w) => w !== item.id)
                          : [...safeWidgets, item.id];
                        setActiveWidgets(nw);
                        localStorage.setItem(
                          "lifeflow_widgets",
                          JSON.stringify(nw)
                        );
                      }}
                      className={`flex items-center p-2 rounded-lg border text-xs font-medium transition ${
                        safeWidgets.includes(item.id)
                          ? "border-amber-500 bg-amber-500/10 text-amber-500"
                          : "border-transparent opacity-50"
                      }`}
                    >
                      <item.icon className="w-3 h-3 mr-2" />{" "}
                      {getTrans(language, item.id)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/20"
              >
                <RefreshCw className="w-3 h-3" /> {getTrans(language, "reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`h-8 flex justify-between items-center px-4 border-b draggable ${
          isDark ? "bg-[#1e293b] border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="text-xs font-bold opacity-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW
          PREMIUM
        </div>
        <div className="flex gap-4 no-drag">
          <button onClick={handleMinimize}>
            <Minus className="w-4 h-4 opacity-50 hover:opacity-100" />
          </button>
          <button onClick={handleClose}>
            <X className="w-4 h-4 opacity-50 hover:text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-64 border-r flex flex-col py-6 px-4 z-10 ${
            isDark
              ? "bg-[#0f172a] border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold">LifeFlow</h2>
              <p className="text-[10px] opacity-50 font-bold uppercase tracking-wider">
                Premium
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                currentView === "dashboard"
                  ? "bg-amber-500/10 text-amber-500"
                  : "hover:bg-white/5 opacity-70"
              }`}
            >
              <Home className="w-4 h-4" /> {getTrans(language, "dashboard")}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center gap-3 p-3 rounded-xl font-medium hover:bg-white/5 opacity-70 transition"
            >
              <Settings className="w-4 h-4" /> {getTrans(language, "settings")}
            </button>
            <div className="px-3 py-2 mt-4 border-t border-white/10 pt-4">
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className={`w-full mt-1 border rounded-lg p-2 text-sm outline-none focus:border-amber-500 cursor-pointer ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-200 text-black"
                }`}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => activateWidget("left")}
                className="flex items-center justify-center gap-1 p-2 bg-white/5 rounded-lg text-[10px] hover:bg-white/10"
              >
                <AlignLeft className="w-3 h-3" />{" "}
                {getTrans(language, "dockLeft")}
              </button>
              <button
                onClick={() => activateWidget("right")}
                className="flex items-center justify-center gap-1 p-2 bg-white/5 rounded-lg text-[10px] hover:bg-white/10"
              >
                <AlignRight className="w-3 h-3" />{" "}
                {getTrans(language, "dockRight")}
              </button>
            </div>
            <button
              onClick={toggleAutoStart}
              className={`w-full flex items-center justify-center gap-2 p-2 text-xs rounded-lg transition ${
                autoStart
                  ? "text-green-500 bg-green-500/10"
                  : "opacity-50 hover:text-green-500"
              }`}
            >
              <Power className="w-3 h-3" /> {getTrans(language, "autoStart")}
            </button>
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            isDark ? "bg-[#020617]" : "bg-[#f8fafc]"
          }`}
        >
          <header
            className={`h-20 px-8 flex items-center justify-between border-b backdrop-blur ${
              isDark
                ? "bg-[#0f172a]/50 border-slate-800"
                : "bg-white/50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-4">
              {currentView !== "dashboard" && (
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 opacity-70" />
                </button>
              )}
              {currentView === "day" && (
                <button
                  onClick={() => setCurrentView("month")}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 opacity-70" />
                </button>
              )}
              <h1 className="text-2xl font-bold">
                {currentView === "dashboard"
                  ? currentYear
                  : currentView === "month"
                  ? `${getMonthName(currentMonth, language)} ${currentYear}`
                  : selectedDate
                  ? `${selectedDate.split("-")[2]} ${getMonthName(
                      parseInt(selectedDate.split("-")[1]),
                      language
                    )}`
                  : ""}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </button>
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold uppercase opacity-50 tracking-wider">
                  {getTrans(language, "welcome")}
                </p>
                <p className="font-bold text-amber-500">{userName}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {/* 1. DASHBOARD */}
            {currentView === "dashboard" && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentMonth(i);
                      setCurrentView("month");
                    }}
                    className={`p-6 rounded-2xl border hover:border-amber-500 hover:shadow-lg transition text-left group ${
                      isDark
                        ? "bg-[#1e293b] border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <h3 className="text-lg font-bold opacity-80 group-hover:text-amber-500">
                      {getMonthName(i, language)}
                    </h3>
                  </button>
                ))}
              </div>
            )}

            {/* 2. TAKVİM */}
            {currentView === "month" && (
              <div
                className={`rounded-3xl border p-6 shadow-sm ${
                  isDark
                    ? "bg-[#1e293b] border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="grid grid-cols-7 mb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-bold opacity-50 uppercase tracking-widest"
                    >
                      {getDayName(i, language)}
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
                      const dt = plannerData[dateKey];
                      const hasContent =
                        dt &&
                        (dt.todos.length > 0 ||
                          dt.notes ||
                          dt.alarms?.length > 0);
                      const sticker = dt?.sticker;
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
                          className={`aspect-square rounded-xl border flex flex-col justify-between p-3 transition hover:shadow-md text-left relative overflow-hidden ${
                            isToday
                              ? "border-amber-500 bg-amber-500/10"
                              : isDark
                              ? "border-slate-700 hover:border-amber-500/50"
                              : "border-slate-200 hover:border-amber-300"
                          }`}
                        >
                          <span
                            className={`text-lg font-bold ${
                              isToday ? "text-amber-500" : "opacity-80"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="flex gap-1 items-center">
                            {hasContent && (
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                            )}
                            {sticker &&
                              (() => {
                                const S = STICKERS.find(
                                  (s) => s.id === sticker
                                );
                                return S ? (
                                  <S.icon className={`w-3 h-3 ${S.color}`} />
                                ) : null;
                              })()}
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
                    {/* STICKER SEÇİCİ (YENİ) */}
                    <div
                      className={`lg:col-span-2 p-4 rounded-2xl border flex items-center justify-between ${
                        isDark
                          ? "bg-[#1e293b] border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <span className="text-xs font-bold opacity-50 uppercase">
                        {getTrans(language, "stickers")}
                      </span>
                      <div className="flex gap-2">
                        {STICKERS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() =>
                              updateDayData(selectedDate, {
                                sticker: data.sticker === s.id ? null : s.id,
                              })
                            }
                            className={`p-2 rounded-lg transition ${
                              data.sticker === s.id
                                ? "bg-white/10 ring-2 ring-amber-500"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GÖREVLER */}
                    {safeWidgets.includes("todos") && (
                      <div
                        className={`p-6 rounded-3xl border shadow-sm h-[400px] flex flex-col ${
                          isDark
                            ? "bg-[#1e293b] border-slate-700"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <h3 className="font-bold text-lg flex items-center mb-4 opacity-80">
                          <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
                          {getTrans(language, "tasks")}
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                          {data.todos.map((t) => (
                            <div
                              key={t.id}
                              className={`flex items-center p-3 border rounded-xl ${
                                isDark
                                  ? "bg-slate-800 border-slate-700"
                                  : "bg-slate-50 border-slate-200"
                              }`}
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
                                  t.completed
                                    ? "bg-amber-500 border-amber-500"
                                    : "border-gray-500"
                                }`}
                              >
                                {t.completed && (
                                  <CheckSquare className="w-3 h-3 text-black" />
                                )}
                              </button>
                              <span
                                className={`flex-1 ${
                                  t.completed ? "line-through opacity-50" : ""
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
                                <Trash2 className="w-4 h-4 opacity-50 hover:opacity-100 hover:text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 relative">
                          <PlusCircle className="absolute left-3 top-3.5 w-5 h-5 opacity-50" />
                          <input
                            type="text"
                            className={`w-full border rounded-xl py-3 pl-10 outline-none focus:border-amber-500 bg-transparent ${
                              isDark ? "border-slate-600" : "border-slate-200"
                            }`}
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

                    {/* SIVI TAKİBİ (DÜZELTİLDİ) */}
                    {safeWidgets.includes("water") && (
                      <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white h-[200px]">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold text-lg flex items-center">
                            <Droplets className="w-5 h-5 mr-2" />{" "}
                            {getTrans(language, "water")}
                          </h3>
                          <span className="text-2xl font-bold">
                            {data.water * 250}ml
                          </span>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <button
                              key={num}
                              onClick={() =>
                                updateDayData(selectedDate, {
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
                                fill={
                                  num <= data.water ? "currentColor" : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NOTLAR */}
                    {safeWidgets.includes("notes") && (
                      <div
                        className={`p-6 rounded-3xl border shadow-sm h-[300px] flex flex-col ${
                          isDark
                            ? "bg-[#1e293b] border-slate-700"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <h3 className="font-bold text-lg flex items-center mb-4 opacity-80">
                          <StickyNote className="w-5 h-5 mr-2 text-amber-500" />{" "}
                          {getTrans(language, "notes")}
                        </h3>
                        <textarea
                          className="flex-1 bg-transparent border rounded-xl p-4 resize-none outline-none focus:border-amber-500"
                          style={{
                            borderColor: isDark ? "#334155" : "#e2e8f0",
                          }}
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
