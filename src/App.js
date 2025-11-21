import React, { useState, useEffect } from "react";
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
  User,
  RefreshCw,
} from "lucide-react";

// Electron Bağlantısı
const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- ÇOKLU DİL & AYARLAR ---
const STRINGS = {
  en: {
    welcome: "Welcome to LifeFlow",
    setupTitle: "Initial Setup",
    nameLabel: "What should we call you?",
    keyLabel: "License Key",
    btnStart: "Initialize System",
    invalid: "Invalid License Key",
    reset: "Factory Reset",
    placeholderName: "Enter your name...",
    placeholderKey: "Enter license key...",
  },
  tr: {
    welcome: "Tekrar Hoş Geldin,",
    dashboard: "Kontrol Paneli",
    tasks: "Görevler",
    notes: "Notlar",
    calendar: "Takvim",
    widgetMode: "Widget Modu",
    placeholderTodo: "Yeni bir görev ekle...",
    placeholderNote: "Notlarını buraya al...",
    emptyTasks: "Bugün için görev yok. Harika!",
    reset: "Uygulamayı Sıfırla",
  },
};

// Motivasyon Sözleri (Türkçe - Kurulumdan Sonra)
const MOTIVATION = [
  "Bugün harika görünüyorsun!",
  "Potansiyelin sandığından çok daha büyük.",
  "Küçük adımlar, büyük zaferlere götürür.",
  "Disiplin, özgürlüğün anahtarıdır.",
  "Sahne senin, bugünü yönet!",
];

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [viewMode, setViewMode] = useState("full"); // 'full' | 'widget'
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState("");
  const [quote, setQuote] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState("");

  // Dili duruma göre seç (Kurulumda EN, Sonra TR)
  const lang = isSetup ? STRINGS.tr : STRINGS.en;

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const savedName = localStorage.getItem("lifeflow_user");
    const savedSetup = localStorage.getItem("lifeflow_setup");

    if (savedSetup === "true" && savedName) {
      setUserName(savedName);
      setIsSetup(true);
      setQuote(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    }

    const savedData = localStorage.getItem("lifeflow_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTodos(parsed.todos || []);
      setNotes(parsed.notes || "");
    }
  }, []);

  // Veri Kaydetme
  useEffect(() => {
    if (isSetup) {
      localStorage.setItem("lifeflow_data", JSON.stringify({ todos, notes }));
    }
  }, [todos, notes, isSetup]);

  // --- PENCERE YÖNETİMİ ---
  const handleClose = () => ipcRenderer && ipcRenderer.send("app-close");
  const handleMinimize = () => ipcRenderer && ipcRenderer.send("app-minimize");

  const toggleWidget = () => {
    if (viewMode === "full") {
      setViewMode("widget");
      ipcRenderer && ipcRenderer.send("set-widget-mode");
    } else {
      setViewMode("full");
      ipcRenderer && ipcRenderer.send("set-normal-mode");
    }
  };

  // --- KURULUM VE SIFIRLAMA ---
  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_user", userName);
      localStorage.setItem("lifeflow_setup", "true");
      setIsSetup(true);
      setQuote(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    } else {
      setError(lang.invalid);
    }
  };

  const handleReset = () => {
    if (window.confirm("Tüm veriler silinecek. Emin misin?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const addTodo = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: e.target.value, completed: false },
      ]);
      e.target.value = "";
    }
  };

  // --- 1. KURULUM EKRANI (ENGLISH) ---
  if (!isSetup) {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a] text-white selection:bg-amber-500 selection:text-black">
        {/* Özel Başlık Çubuğu (Sürüklenebilir) */}
        <div
          className="h-10 flex justify-end items-center px-4 bg-[#1e293b] border-b border-slate-700"
          style={{ WebkitAppRegion: "drag" }}
        >
          <div className="flex gap-2" style={{ WebkitAppRegion: "no-drag" }}>
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <Minus className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-red-500 rounded group"
            >
              <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-96 p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-wide">
                {lang.welcome}
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                {lang.setupTitle}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  {lang.nameLabel}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 mt-1 text-sm focus:border-amber-500 outline-none transition"
                  placeholder={lang.placeholderName}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  {lang.keyLabel}
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 mt-1 text-sm focus:border-amber-500 outline-none transition"
                  placeholder={lang.placeholderKey}
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs text-center bg-red-900/20 py-1 rounded">
                  {error}
                </p>
              )}
              <button
                onClick={handleSetup}
                disabled={!userName || !licenseKey}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg mt-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang.btnStart}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. WIDGET MODU (KOMPAKT & ŞIK) ---
  if (viewMode === "widget") {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a]/90 backdrop-blur-xl text-white border border-amber-500/30 rounded-xl overflow-hidden">
        {/* Widget Header */}
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

        {/* Widget Content */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
          {/* Quick Todo */}
          <div className="flex-1 bg-[#1e293b]/50 rounded-lg p-2 overflow-hidden flex flex-col">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
              Aktif Görevler
            </p>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
              {todos.filter((t) => !t.completed).length === 0 && (
                <p className="text-xs text-slate-600 italic text-center mt-4">
                  Her şey tamam!
                </p>
              )}
              {todos
                .filter((t) => !t.completed)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center text-xs bg-[#0f172a] p-2 rounded border-l-2 border-amber-500"
                  >
                    <span className="truncate">{t.text}</span>
                  </div>
                ))}
            </div>
          </div>
          {/* Quick Note */}
          <div className="h-24">
            <textarea
              className="w-full h-full bg-[#1e293b]/50 rounded-lg p-2 text-xs resize-none outline-none border border-transparent focus:border-amber-500/50 transition"
              placeholder="Hızlı not..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- 3. NORMAL MOD (DASHBOARD) ---
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden border border-slate-300">
      {/* ÖZEL PENCERE ÇUBUĞU (Windows stili ama bizim tasarımımız) */}
      <div
        className="h-8 bg-white flex justify-between items-center px-4 border-b border-slate-200"
        style={{ WebkitAppRegion: "drag" }}
      >
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW
          PREMIUM
        </div>
        <div className="flex gap-4" style={{ WebkitAppRegion: "no-drag" }}>
          <button
            onClick={handleMinimize}
            className="text-slate-400 hover:text-slate-800"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
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
            <button className="w-full flex items-center gap-3 p-3 bg-slate-50 text-amber-600 rounded-xl font-medium transition">
              <Layout className="w-4 h-4" /> {lang.dashboard}
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl font-medium transition">
              <CheckSquare className="w-4 h-4" /> {lang.tasks}
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl font-medium transition">
              <StickyNote className="w-4 h-4" /> {lang.notes}
            </button>
          </div>

          {/* Mini Takvim (Sadece Görsel) */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
              {lang.calendar}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-600">
              {["P", "S", "Ç", "P", "C", "C", "P"].map((d) => (
                <span key={d} className="font-bold text-slate-300">
                  {d}
                </span>
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className={`p-1 rounded ${
                    i + 1 === currentDate.getDate()
                      ? "bg-amber-500 text-white shadow"
                      : ""
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={toggleWidget}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 text-white rounded-xl hover:bg-amber-500 hover:text-black transition shadow-lg mb-2"
            >
              <Minimize className="w-4 h-4" /> {lang.widgetMode}
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 p-2 text-xs text-slate-400 hover:text-red-500 transition"
            >
              <RefreshCw className="w-3 h-3" /> {lang.reset}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {lang.welcome}{" "}
                <span className="text-amber-600">{userName}</span> 👋
              </h1>
              <p className="text-sm text-slate-500 italic mt-1">"{quote}"</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-800">
                {currentDate.getHours()}:
                {currentDate.getMinutes().toString().padStart(2, "0")}
              </p>
              <p className="text-xs text-slate-400 font-bold uppercase">
                {currentDate.toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Görevler */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center text-slate-700">
                  <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
                  Bugünün Görevleri
                </h3>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">
                  {todos.filter((t) => !t.completed).length} Bekleyen
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[300px]">
                {todos.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    {lang.emptyTasks}
                  </div>
                )}
                {todos.map((t) => (
                  <div
                    key={t.id}
                    className="group flex items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-300 transition"
                  >
                    <button
                      onClick={() =>
                        setTodos(
                          todos.map((i) =>
                            i.id === t.id
                              ? { ...i, completed: !i.completed }
                              : i
                          )
                        )
                      }
                      className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition ${
                        t.completed
                          ? "bg-amber-500 border-amber-500"
                          : "bg-white border-slate-300"
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
                          : "text-slate-700"
                      }`}
                    >
                      {t.text}
                    </span>
                    <button
                      onClick={() =>
                        setTodos(todos.filter((i) => i.id !== t.id))
                      }
                    >
                      <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 relative">
                <PlusCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 outline-none focus:border-amber-500 transition"
                  placeholder={lang.placeholderTodo}
                  onKeyDown={addTodo}
                />
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-600"></div>
              <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                <StickyNote className="w-5 h-5 mr-2 text-amber-500" /> Günlük
                Notlar
              </h3>
              <textarea
                className="flex-1 bg-slate-50 rounded-xl p-4 text-slate-600 leading-relaxed resize-none outline-none focus:ring-2 focus:ring-amber-100 transition border-none"
                placeholder={lang.placeholderNote}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LifeFlowApp;
