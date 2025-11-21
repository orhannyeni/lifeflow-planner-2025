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
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
} from "lucide-react";

// Electron Bağlantısı (Hata vermemesi için kontrol ekli)
const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- SABİTLER VE ÇEVİRİLER ---
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const MONTHS = [
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
const DAYS_SHORT = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

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

  // Görünüm State'leri
  const [viewMode, setViewMode] = useState("full"); // 'full' | 'widget'
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' | 'month' | 'day'

  // Tarih State'leri
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null); // "2025-1-15" formatında

  // Veri State'leri
  const [plannerData, setPlannerData] = useState({}); // Tüm veritabanı { "2025-1-15": {todos:[], notes:""} }
  const [quote, setQuote] = useState("");
  const [error, setError] = useState("");

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const savedName = localStorage.getItem("lifeflow_user");
    const savedSetup = localStorage.getItem("lifeflow_setup");

    if (savedSetup === "true" && savedName) {
      setUserName(savedName);
      setIsSetup(true);
      setQuote(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    }

    const savedData = localStorage.getItem("lifeflow_db");
    if (savedData) {
      setPlannerData(JSON.parse(savedData));
    }
  }, []);

  // --- VERİ YÖNETİMİ ---
  const saveData = (newData) => {
    setPlannerData(newData);
    if (isSetup) {
      localStorage.setItem("lifeflow_db", JSON.stringify(newData));
    }
  };

  // Seçili günün verisini getir (Yoksa boş şablon oluştur)
  const getDayData = (dateKey) => {
    // Eğer dateKey yoksa (örneğin Widget modunda bugün) bugünü baz al
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return plannerData[key] || { todos: [], notes: "" };
  };

  const updateDayData = (dateKey, data) => {
    const key =
      dateKey ||
      `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const existing = getDayData(key);
    const updated = { ...existing, ...data };
    saveData({ ...plannerData, [key]: updated });
  };

  // --- TAKVİM MANTIĞI ---
  const getCalendarGrid = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Pazar(0) -> 6, Pzt(1) -> 0 düzenlemesi (Pazartesi başlangıçlı takvim için)
    const adjustedStartDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const grid = [];
    for (let i = 0; i < adjustedStartDay; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push(i);
    return grid;
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

  // --- KURULUM ---
  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_user", userName);
      localStorage.setItem("lifeflow_setup", "true");
      setIsSetup(true);
      setQuote(MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)]);
    } else {
      setError("Invalid License Key");
    }
  };

  const addTodo = (e, dateKey) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const currentData = getDayData(dateKey);
      const newTodos = [
        ...currentData.todos,
        { id: Date.now(), text: e.target.value, completed: false },
      ];
      updateDayData(dateKey, { todos: newTodos });
      e.target.value = "";
    }
  };

  // --- 1. KURULUM EKRANI (İngilizce Başlar) ---
  if (!isSetup) {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a] text-white selection:bg-amber-500 selection:text-black">
        <div
          className="h-8 flex justify-end items-center px-4 bg-[#1e293b] border-b border-slate-700"
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
        <div className="flex-1 flex items-center justify-center">
          <div className="w-96 p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-amber-500 rounded-xl mx-auto flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-black" />
              </div>
              <h1 className="text-xl font-bold">Welcome to LifeFlow</h1>
              <p className="text-xs text-slate-400 uppercase mt-1">
                Initial Setup
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                placeholder="Enter your name"
              />
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
                placeholder="License Key"
              />
              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
              <button
                onClick={handleSetup}
                disabled={!userName || !licenseKey}
                className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 disabled:opacity-50"
              >
                Initialize System
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. WIDGET MODU (Kompakt) ---
  if (viewMode === "widget") {
    // Widget modu her zaman "Bugün"ün verisini gösterir
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const todayData = getDayData(todayKey);

    return (
      <div className="h-screen flex flex-col bg-[#0f172a]/95 text-white border border-amber-500/30 rounded-xl overflow-hidden">
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
            {todayData.todos.filter((t) => !t.completed).length === 0 && (
              <p className="text-xs text-slate-500 text-center mt-2">
                Görev yok.
              </p>
            )}
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
          </div>
          <div className="h-20">
            <textarea
              className="w-full h-full bg-[#1e293b]/50 rounded-lg p-2 text-xs resize-none outline-none focus:border-amber-500/50 border border-transparent"
              placeholder="Hızlı not..."
              value={todayData.notes}
              onChange={(e) =>
                updateDayData(todayKey, { notes: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // --- 3. NORMAL MOD (Ana Ekran) ---
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden border border-slate-300">
      {/* PENCERE ÇUBUĞU */}
      <div
        className="h-8 bg-white flex justify-between items-center px-4 border-b border-slate-200"
        style={{ WebkitAppRegion: "drag" }}
      >
        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW
          PREMIUM
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
              <Layout className="w-4 h-4" /> Yıllık Genel Bakış
            </button>
            {/* Hızlı Yıl Seçici */}
            <div className="px-3 py-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Aktif Yıl
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
              <Minimize className="w-4 h-4" /> Widget Modu
            </button>
            <button
              onClick={toggleAutoStart}
              className="w-full flex items-center justify-center gap-2 p-2 text-xs text-slate-400 hover:text-green-600 transition"
            >
              <Power className="w-3 h-3" /> Başlangıçta Çalıştır
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur border-b border-slate-200">
            <div className="flex items-center gap-4">
              {currentView !== "dashboard" && (
                <button
                  onClick={() =>
                    setCurrentView(
                      currentView === "day" ? "month" : "dashboard"
                    )
                  }
                  className="p-2 hover:bg-slate-200 rounded-full transition"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {currentView === "dashboard"
                    ? `${currentYear} Paneli`
                    : currentView === "month"
                    ? `${MONTHS[currentMonth]} ${currentYear}`
                    : selectedDate
                    ? `${selectedDate.split("-")[2]} ${
                        MONTHS[parseInt(selectedDate.split("-")[1])]
                      } ${selectedDate.split("-")[0]}`
                    : ""}
                </h1>
                {currentView === "dashboard" && (
                  <p className="text-sm text-slate-500 italic">"{quote}"</p>
                )}
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Hoş Geldin
              </p>
              <p className="font-bold text-amber-600">{userName}</p>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {/* 1. DASHBOARD (Yıllık Görünüm) */}
            {currentView === "dashboard" && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {MONTHS.map((m, idx) => (
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

            {/* 2. AY GÖRÜNÜMÜ (Takvim Izgarası) */}
            {currentView === "month" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-7 mb-4">
                  {DAYS_SHORT.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {getCalendarGrid(currentYear, currentMonth).map((day, i) => {
                    if (day === null) return <div key={i}></div>;
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
                        className={`aspect-square rounded-xl border flex flex-col justify-between p-3 transition hover:shadow-md text-left
                                  ${
                                    isToday
                                      ? "border-amber-500 bg-amber-50"
                                      : "border-slate-100 hover:border-amber-300"
                                  }
                               `}
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
                  })}
                </div>
              </div>
            )}

            {/* 3. GÜN DETAYI (Görevler ve Notlar) */}
            {currentView === "day" &&
              selectedDate &&
              (() => {
                const data = getDayData(selectedDate);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Görevler */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center text-slate-700">
                          <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
                          Görevler
                        </h3>
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">
                          {data.todos.filter((t) => t.completed).length}/
                          {data.todos.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {data.todos.length === 0 && (
                          <p className="text-center text-slate-400 mt-10 text-sm">
                            Bugün için plan yok.
                          </p>
                        )}
                        {data.todos.map((t) => (
                          <div
                            key={t.id}
                            className="group flex items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-amber-300 transition"
                          >
                            <button
                              onClick={() => {
                                const newTodos = data.todos.map((x) =>
                                  x.id === t.id
                                    ? { ...x, completed: !x.completed }
                                    : x
                                );
                                updateDayData(selectedDate, {
                                  todos: newTodos,
                                });
                              }}
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
                              onClick={() => {
                                const newTodos = data.todos.filter(
                                  (x) => x.id !== t.id
                                );
                                updateDayData(selectedDate, {
                                  todos: newTodos,
                                });
                              }}
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
                          placeholder="Yeni görev..."
                          onKeyDown={(e) => addTodo(e, selectedDate)}
                        />
                      </div>
                    </div>

                    {/* Notlar */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[500px] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-600"></div>
                      <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4">
                        <StickyNote className="w-5 h-5 mr-2 text-amber-500" />{" "}
                        Günlük Notlar
                      </h3>
                      <textarea
                        className="flex-1 bg-slate-50 rounded-xl p-4 text-slate-600 leading-relaxed resize-none outline-none focus:ring-2 focus:ring-amber-100 transition border-none"
                        placeholder="Buraya not al..."
                        value={data.notes}
                        onChange={(e) =>
                          updateDayData(selectedDate, { notes: e.target.value })
                        }
                      />
                    </div>
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
