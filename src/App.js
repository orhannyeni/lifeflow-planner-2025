import React, { useState, useEffect } from "react";
import {
  Calendar,
  Droplets,
  Utensils,
  CheckSquare,
  StickyNote,
  ArrowLeft,
  Bell,
  LogIn,
  Settings,
  Layout,
  Smile,
  Activity,
  Cloud,
  WifiOff,
  Save,
  Trash2,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Power,
} from "lucide-react";

// Electron ile iletişim (Sadece masaüstünde çalışır)
const electron = window.require ? window.require("electron") : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- MOTİVASYON SÖZLERİ (Örnek 15 tane, burayı 100'e tamamlayabilirsin) ---
const MOTIVATIONAL_QUOTES = [
  "Bugün harika görünüyorsun, dünyayı fethetmeye hazırsın!",
  "Küçük adımlar, büyük değişimlerin başlangıcıdır.",
  "Kendine inan, çünkü biz sana inanıyoruz.",
  "Bugün, dünden daha iyi olmak için yeni bir fırsat.",
  "Disiplin, özgürlüğün anahtarıdır.",
  "Başarı bir varış noktası değil, bir yolculuktur.",
  "Odaklan, nefes al ve harekete geç.",
  "Zorluklar seni durdurmak için değil, güçlendirmek içindir.",
  "Senin potansiyelin, hayallerinden bile büyük.",
  "Bugün kendine bir iyilik yap ve gülümse.",
  "Ertelemek, zamanın hırsızıdır. Şimdi başla!",
  "Mükemmel olmak zorunda değilsin, başlamak zorundasın.",
  "Kendi hikayenin kahramanı sensin.",
  "Enerjini seni yükselten şeylere harca.",
  "Unutma: Sen yeterlisin.",
];

// --- ÇEVİRİLER ---
const TRANSLATIONS = {
  tr: {
    welcomeSetup: "LifeFlow'a Hoş Geldin",
    enterName: "Adın nedir?",
    enterCode: "Lisans Anahtarı",
    startJourney: "Yolculuğa Başla",
    invalidCode: "Hatalı Lisans Anahtarı!",
    morning: "Günaydın",
    afternoon: "Tünaydın",
    evening: "İyi Akşamlar",
    widgets: "Modüller",
    backToMonth: "Takvime Dön",
    openWidget: "Küçült (Widget)",
    openFull: "Genişlet",
    autoStart: "Windows ile Başlat",
    save: "Kaydet",
    todoPlaceholder: "Yeni görev ekle...",
    notePlaceholder: "Bugün aklında neler var?",
  },
};

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false); // Kurulum yapıldı mı?
  const [userName, setUserName] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [quote, setQuote] = useState("");
  const [viewMode, setViewMode] = useState("full"); // 'full' veya 'widget'
  const [autoStart, setAutoStart] = useState(false);

  // Veri State'leri
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState("");
  const [water, setWater] = useState(0);
  const [error, setError] = useState("");

  const t = TRANSLATIONS["tr"]; // Şimdilik Türkçe sabit

  // --- BAŞLANGIÇ AYARLARI ---
  useEffect(() => {
    // 1. Kullanıcı daha önce giriş yapmış mı?
    const savedName = localStorage.getItem("lifeflow_username");
    const savedSetup = localStorage.getItem("lifeflow_setup");
    const savedAutoStart =
      localStorage.getItem("lifeflow_autostart") === "true";

    if (savedSetup === "true" && savedName) {
      setUserName(savedName);
      setIsSetup(true);
      pickRandomQuote();
    }

    setAutoStart(savedAutoStart);

    // 2. Verileri Çek
    const savedData = localStorage.getItem("lifeflow_dailydata");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setTodos(parsed.todos || []);
      setNotes(parsed.notes || "");
      setWater(parsed.water || 0);
    }
  }, []);

  // Veri Kaydetme
  useEffect(() => {
    if (isSetup) {
      const data = { todos, notes, water };
      localStorage.setItem("lifeflow_dailydata", JSON.stringify(data));
    }
  }, [todos, notes, water, isSetup]);

  // Rastgele Söz Seçici
  const pickRandomQuote = () => {
    const random =
      MOTIVATIONAL_QUOTES[
        Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ];
    setQuote(random);
  };

  // --- İŞLEVLER ---

  const handleSetup = () => {
    // Lisans Kontrolü (Basit bir kontrol, bunu istediğin şifreyle değiştir)
    if (licenseKey === "LIFE2025") {
      localStorage.setItem("lifeflow_username", userName);
      localStorage.setItem("lifeflow_setup", "true");
      setIsSetup(true);
      pickRandomQuote();
    } else {
      setError(t.invalidCode);
    }
  };

  const toggleWidgetMode = () => {
    if (viewMode === "full") {
      setViewMode("widget");
      if (ipcRenderer) ipcRenderer.send("set-widget-mode");
    } else {
      setViewMode("full");
      if (ipcRenderer) ipcRenderer.send("set-normal-mode");
    }
  };

  const toggleAutoStart = () => {
    const newState = !autoStart;
    setAutoStart(newState);
    localStorage.setItem("lifeflow_autostart", newState.toString());
    if (ipcRenderer) ipcRenderer.send("toggle-auto-start", newState);
  };

  const sendNotification = (title, body) => {
    new Notification(title, { body, icon: "/favicon.ico" });
  };

  const addTodo = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTodo = {
        id: Date.now(),
        text: e.target.value,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      e.target.value = "";
      // Bildirim Gönder (Demo)
      sendNotification("Yeni Görev Eklendi", "Hadi bitirelim: " + newTodo.text);
    }
  };

  // --- EKRANLAR ---

  // 1. KURULUM EKRANI (Sadece ilk kez görünür)
  if (!isSetup) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white font-sans">
        <div className="w-96 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold">{t.welcomeSetup}</h1>
            <p className="text-white/50 text-sm mt-2">
              Kişisel asistanını yapılandır.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase font-bold text-amber-500 ml-1">
                Adın
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 mt-1 focus:border-amber-500 outline-none transition"
                placeholder="Örn: Orhan"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-amber-500 ml-1">
                Lisans Kodu
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 mt-1 focus:border-amber-500 outline-none transition"
                placeholder="Size verilen kodu girin"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSetup}
              disabled={!userName || !licenseKey}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold py-4 rounded-xl mt-4 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.startJourney}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. WIDGET EKRANI (Küçük, Hızlı Notlar)
  if (viewMode === "widget") {
    return (
      <div className="h-screen bg-slate-900 text-white p-4 flex flex-col border-4 border-amber-500/50 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-amber-500">Hızlı Not</h2>
          <button
            onClick={toggleWidgetMode}
            className="p-2 bg-slate-800 rounded-full hover:bg-amber-500 hover:text-black transition"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        <textarea
          className="flex-1 bg-slate-800/50 rounded-xl p-3 resize-none outline-none text-sm border border-slate-700 focus:border-amber-500"
          placeholder="Unutma..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-1">
            Görevler ({todos.filter((t) => !t.completed).length})
          </div>
          <div className="h-24 overflow-y-auto space-y-1">
            {todos
              .filter((t) => !t.completed)
              .map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center text-xs bg-slate-800 p-2 rounded"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  {todo.text}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. ANA DASHBOARD (Tam Ekran)
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 z-20 shadow-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-8">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        {/* Menü İkonları */}
        <div className="flex flex-col gap-4">
          <button className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Layout className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-slate-100 text-slate-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {/* Otomatik Başlat Butonu */}
          <button
            onClick={toggleAutoStart}
            className={`p-3 rounded-xl transition ${
              autoStart
                ? "bg-green-100 text-green-600"
                : "bg-slate-100 text-slate-400"
            }`}
            title={t.autoStart}
          >
            <Power className="w-5 h-5" />
          </button>
          {/* Widget Moduna Geç */}
          <button
            onClick={toggleWidgetMode}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-500 hover:text-black transition shadow-lg"
            title={t.openWidget}
          >
            <Minimize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 px-8 flex items-center justify-between bg-white border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Hoş Geldin,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                {userName}
              </span>{" "}
              👋
            </h1>
            <p className="text-sm text-slate-500 mt-1 italic">"{quote}"</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                BUGÜN
              </p>
              <p className="text-xl font-bold text-slate-800">
                {currentDate.toLocaleDateString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. GÖREVLER KARTI */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold flex items-center text-lg">
                  <CheckSquare className="w-5 h-5 mr-2 text-amber-500" />{" "}
                  Yapılacaklar
                </h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  {todos.filter((t) => t.completed).length} / {todos.length}
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="group flex items-center bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all hover:border-amber-200"
                  >
                    <button
                      onClick={() => {
                        const newTodos = todos.map((t) =>
                          t.id === todo.id
                            ? { ...t, completed: !t.completed }
                            : t
                        );
                        setTodos(newTodos);
                      }}
                      className={`w-6 h-6 rounded-lg border mr-3 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? "bg-amber-500 border-amber-500"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {todo.completed && (
                        <CheckSquare className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() =>
                        setTodos(todos.filter((t) => t.id !== todo.id))
                      }
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 relative">
                <PlusCircle className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder={t.todoPlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 focus:outline-none focus:border-amber-500 transition-all"
                  onKeyDown={addTodo}
                />
              </div>
            </div>

            {/* 2. HIZLI NOTLAR (Widget ile Senkronize) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h3 className="font-bold flex items-center text-lg mb-4">
                <StickyNote className="w-5 h-5 mr-2 text-amber-500" /> Notlar
              </h3>
              <textarea
                className="w-full h-64 bg-slate-50 rounded-xl p-4 border-none resize-none focus:ring-2 focus:ring-amber-100 transition outline-none text-slate-600 leading-relaxed"
                placeholder={t.notePlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* 3. SU TAKİBİ */}
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white">
              <h3 className="font-bold flex items-center text-lg mb-6">
                <Droplets className="w-5 h-5 mr-2" /> Su Takibi
              </h3>
              <div className="flex justify-center items-center mb-6">
                <span className="text-5xl font-bold">{water}</span>
                <span className="text-lg opacity-70 ml-2">/ 8 Bardak</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setWater(num === water ? num - 1 : num)}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                      num <= water
                        ? "bg-white text-blue-600 shadow-lg"
                        : "bg-blue-700/50 hover:bg-blue-700"
                    }`}
                  >
                    <Droplets
                      className="w-4 h-4"
                      fill={num <= water ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LifeFlowApp;
