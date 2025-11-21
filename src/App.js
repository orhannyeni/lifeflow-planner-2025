import React, { useState, useEffect } from "react";
import {
  Calendar,
  Droplets,
  Utensils,
  CheckSquare,
  StickyNote,
  Settings,
  Layout,
  Power,
  Minimize,
  Maximize,
  Trash2,
  PlusCircle,
} from "lucide-react";

// Electron bağlantısı (Sadece masaüstünde çalışır)
const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// Motivasyon Sözleri
const QUOTES = [
  "Bugün harika görünüyorsun!",
  "Küçük adımlar, büyük sonuçlar doğurur.",
  "Kendine inan, yapabilirsin.",
  "Bugün dünden daha iyi bir gün olacak.",
  "Enerjini seni mutlu eden şeylere harca.",
];

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [viewMode, setViewMode] = useState("full"); // 'full' veya 'widget'
  const [quote, setQuote] = useState("");
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState("");
  const [water, setWater] = useState(0);
  const [error, setError] = useState("");

  // Başlangıçta Verileri Yükle
  useEffect(() => {
    const savedName = localStorage.getItem("lifeflow_username");
    const savedSetup = localStorage.getItem("lifeflow_setup");

    if (savedSetup === "true" && savedName) {
      setUserName(savedName);
      setIsSetup(true);
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }

    const savedData = localStorage.getItem("lifeflow_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTodos(parsed.todos || []);
      setNotes(parsed.notes || "");
      setWater(parsed.water || 0);
    }
  }, []);

  // Verileri Kaydet
  useEffect(() => {
    if (isSetup) {
      localStorage.setItem(
        "lifeflow_data",
        JSON.stringify({ todos, notes, water })
      );
    }
  }, [todos, notes, water, isSetup]);

  // --- İŞLEVLER ---

  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_username", userName);
      localStorage.setItem("lifeflow_setup", "true");
      setIsSetup(true);
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    } else {
      setError("Hatalı Lisans Kodu!");
    }
  };

  const toggleWidget = () => {
    if (viewMode === "full") {
      setViewMode("widget");
      if (ipcRenderer) ipcRenderer.send("set-widget-mode");
    } else {
      setViewMode("full");
      if (ipcRenderer) ipcRenderer.send("set-normal-mode");
    }
  };

  const addTodo = (e) => {
    if (e.key === "Enter" && e.target.value) {
      setTodos([
        ...todos,
        { id: Date.now(), text: e.target.value, completed: false },
      ]);
      e.target.value = "";
    }
  };

  // --- 1. KURULUM EKRANI ---
  if (!isSetup) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="w-96 p-8 bg-slate-800 rounded-3xl shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold">LifeFlow Kurulum</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-amber-500">ADINIZ</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 mt-1 outline-none focus:border-amber-500"
                placeholder="Adınız"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-amber-500">
                LİSANS KODU
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 mt-1 outline-none focus:border-amber-500"
                placeholder="Kodunuz"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              onClick={handleSetup}
              className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl mt-4 hover:bg-amber-400 transition"
            >
              BAŞLA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. WIDGET MODU (Küçük Ekran) ---
  if (viewMode === "widget") {
    return (
      <div className="h-screen bg-slate-900 text-white p-4 flex flex-col border-4 border-amber-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-amber-500">Hızlı Notlar</h2>
          <button
            onClick={toggleWidget}
            className="p-2 bg-slate-800 rounded-full hover:bg-amber-500 hover:text-black"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        <textarea
          className="flex-1 bg-slate-800 rounded-xl p-3 resize-none outline-none text-sm"
          placeholder="Not al..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-4 h-32 overflow-y-auto">
          {todos
            .filter((t) => !t.completed)
            .map((t) => (
              <div
                key={t.id}
                className="flex items-center text-xs bg-slate-800 p-2 rounded mb-1 border-l-2 border-amber-500"
              >
                {t.text}
              </div>
            ))}
        </div>
      </div>
    );
  }

  // --- 3. NORMAL MOD (Ana Ekran) ---
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-8">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() =>
              ipcRenderer && ipcRenderer.send("toggle-auto-start", true)
            }
            className="p-3 hover:bg-green-100 text-slate-400 hover:text-green-600 rounded-xl"
            title="Başlangıçta Çalıştır"
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={toggleWidget}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-500 hover:text-black shadow-lg"
          >
            <Minimize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* İçerik */}
      <div className="flex-1 flex flex-col">
        <header className="h-24 px-8 flex items-center justify-between bg-white border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold">
              Hoş Geldin, <span className="text-amber-600">{userName}</span> 👋
            </h1>
            <p className="text-sm text-slate-500 italic">"{quote}"</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Görevler */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
              Yapılacaklar
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todos.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center p-3 bg-slate-50 rounded-xl border"
                >
                  <button
                    onClick={() =>
                      setTodos(
                        todos.map((i) =>
                          i.id === t.id ? { ...i, completed: !i.completed } : i
                        )
                      )
                    }
                    className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                      t.completed ? "bg-amber-500 border-amber-500" : ""
                    }`}
                  >
                    {t.completed && (
                      <CheckSquare className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      t.completed ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {t.text}
                  </span>
                  <button
                    onClick={() => setTodos(todos.filter((i) => i.id !== t.id))}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 relative">
              <PlusCircle className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                className="w-full bg-slate-50 border rounded-xl py-2 pl-10 outline-none focus:border-amber-500"
                placeholder="Görev ekle..."
                onKeyDown={addTodo}
              />
            </div>
          </div>

          {/* Notlar */}
          <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col">
            <h3 className="font-bold mb-4 flex items-center">
              <StickyNote className="w-5 h-5 mr-2 text-amber-500" /> Notlar
            </h3>
            <textarea
              className="flex-1 bg-slate-50 rounded-xl p-4 border-none resize-none outline-none"
              placeholder="Notların..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LifeFlowApp;
