import React, { useState, useEffect } from "react";
import {
  Calendar,
  Droplets,
  Utensils,
  CheckSquare,
  StickyNote,
  ArrowLeft,
  Star,
  Bell,
  LogIn,
  Share,
  PlusCircle,
  X,
  Menu,
  Settings,
  Globe,
  Layout,
  Smile,
  Activity,
  Cloud,
  WifiOff,
  Save,
  Trash2,
  Home,
  Sun,
  Moon,
} from "lucide-react";

// --- ÇEVİRİLER (11 DİL) ---
const TRANSLATIONS = {
  en: {
    appName: "LifeFlow",
    premiumLabel: "Premium Edition",
    welcome: "Welcome Back",
    settings: "Customize View",
    language: "Language",
    theme: "Appearance",
    yearSelect: "Select Year",
    widgets: "Active Modules",
    login: "Login",
    username: "Username",
    password: "Password",
    status: { online: "Online", offline: "Offline", saving: "Saving..." },
    placeholders: {
      task: "Add new task...",
      habit: "Add new goal...",
      note: "Reflect on your day...",
      meal: "...",
    },
    monthsShort: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    monthsLong: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    modules: {
      todos: "Tasks & Reminders",
      notes: "Journal",
      water: "Hydration",
      meals: "Nutrition",
      mood: "Mood Tracker",
      habits: "Daily Goals",
    },
    themes: { light: "Light Mode", dark: "Dark Mode" },
  },
  tr: {
    appName: "LifeFlow",
    premiumLabel: "Premium Sürüm",
    welcome: "Hoş Geldiniz",
    settings: "Görünümü Özelleştir",
    language: "Dil Seçimi",
    theme: "Görünüm",
    yearSelect: "Yıl Seçimi",
    widgets: "Aktif Modüller",
    login: "Giriş Yap",
    username: "Kullanıcı Adı",
    password: "Şifre",
    status: {
      online: "Çevrimiçi",
      offline: "Çevrimdışı",
      saving: "Kaydediliyor...",
    },
    placeholders: {
      task: "Yeni görev ekle...",
      habit: "Yeni hedef ekle...",
      note: "Günün nasıl geçti?",
      meal: "...",
    },
    monthsShort: [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ],
    monthsLong: [
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
    ],
    daysShort: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    modules: {
      todos: "Yapılacaklar",
      notes: "Notlar",
      water: "Su Takibi",
      meals: "Yemek Planı",
      mood: "Mod Takibi",
      habits: "Günlük Hedefler",
    },
    themes: { light: "Açık Mod", dark: "Koyu Mod" },
  },
  es: {
    appName: "LifeFlow",
    premiumLabel: "Edición Premium",
    welcome: "Bienvenido",
    settings: "Ajustes",
    language: "Idioma",
    theme: "Apariencia",
    yearSelect: "Seleccionar Año",
    widgets: "Módulos",
    login: "Acceso",
    username: "Usuario",
    password: "Password",
    status: {
      online: "En línea",
      offline: "Desconectado",
      saving: "Guardando...",
    },
    placeholders: {
      task: "Nueva tarea...",
      habit: "Nuevo objetivo...",
      note: "Reflexiona...",
      meal: "...",
    },
    monthsShort: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    monthsLong: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    daysShort: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    modules: {
      todos: "Tareas",
      notes: "Notas",
      water: "Agua",
      meals: "Comidas",
      mood: "Ánimo",
      habits: "Objetivos",
    },
    themes: { light: "Modo Claro", dark: "Modo Oscuro" },
  },
  fr: {
    appName: "LifeFlow",
    premiumLabel: "Édition Premium",
    welcome: "Bienvenue",
    settings: "Paramètres",
    language: "Langue",
    theme: "Apparence",
    yearSelect: "Sélectionner l'année",
    widgets: "Modules",
    login: "Connexion",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    status: {
      online: "En ligne",
      offline: "Hors ligne",
      saving: "Enregistrement...",
    },
    placeholders: {
      task: "Nouvelle tâche...",
      habit: "Nouvel objectif...",
      note: "Réflexion...",
      meal: "...",
    },
    monthsShort: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    monthsLong: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    daysShort: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    modules: {
      todos: "Tâches",
      notes: "Notes",
      water: "Eau",
      meals: "Repas",
      mood: "Humeur",
      habits: "Objectifs",
    },
    themes: { light: "Mode Clair", dark: "Mode Sombre" },
  },
  de: {
    appName: "LifeFlow",
    premiumLabel: "Premium Edition",
    welcome: "Willkommen",
    settings: "Einstellungen",
    language: "Sprache",
    theme: "Aussehen",
    yearSelect: "Jahr wählen",
    widgets: "Module",
    login: "Anmelden",
    username: "Benutzername",
    password: "Passwort",
    status: { online: "Online", offline: "Offline", saving: "Speichern..." },
    placeholders: {
      task: "Neue Aufgabe...",
      habit: "Neues Ziel...",
      note: "Notizen...",
      meal: "...",
    },
    monthsShort: [
      "Jan",
      "Feb",
      "Mär",
      "Apr",
      "Mai",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Okt",
      "Nov",
      "Dez",
    ],
    monthsLong: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
    daysShort: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    modules: {
      todos: "Aufgaben",
      notes: "Notizen",
      water: "Wasser",
      meals: "Mahlzeiten",
      mood: "Stimmung",
      habits: "Ziele",
    },
    themes: { light: "Heller Modus", dark: "Dunkler Modus" },
  },
  it: {
    appName: "LifeFlow",
    premiumLabel: "Edizione Premium",
    welcome: "Benvenuto",
    settings: "Impostazioni",
    language: "Lingua",
    theme: "Aspetto",
    yearSelect: "Seleziona Anno",
    widgets: "Moduli",
    login: "Accesso",
    username: "Nome utente",
    password: "Password",
    status: { online: "Online", offline: "Offline", saving: "Salvataggio..." },
    placeholders: {
      task: "Nuovo compito...",
      habit: "Nuovo obiettivo...",
      note: "Riflessioni...",
      meal: "...",
    },
    monthsShort: [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ],
    monthsLong: [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ],
    daysShort: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    modules: {
      todos: "Compiti",
      notes: "Note",
      water: "Acqua",
      meals: "Pasti",
      mood: "Umore",
      habits: "Obiettivi",
    },
    themes: { light: "Modalità Chiara", dark: "Modalità Scura" },
  },
  pt: {
    appName: "LifeFlow",
    premiumLabel: "Edição Premium",
    welcome: "Bem-vindo",
    settings: "Configurações",
    language: "Idioma",
    theme: "Aparência",
    yearSelect: "Selecionar Ano",
    widgets: "Módulos",
    login: "Entrar",
    username: "Usuário",
    password: "Senha",
    status: { online: "Online", offline: "Offline", saving: "Salvando..." },
    placeholders: {
      task: "Nova tarefa...",
      habit: "Novo objetivo...",
      note: "Reflexão...",
      meal: "...",
    },
    monthsShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    monthsLong: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    daysShort: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    modules: {
      todos: "Tarefas",
      notes: "Notas",
      water: "Água",
      meals: "Refeições",
      mood: "Humor",
      habits: "Objetivos",
    },
    themes: { light: "Modo Claro", dark: "Modo Escuro" },
  },
  ru: {
    appName: "LifeFlow",
    premiumLabel: "Премиум",
    welcome: "Добро пожаловать",
    settings: "Настройки",
    language: "Язык",
    theme: "Тема",
    yearSelect: "Выбрать год",
    widgets: "Модули",
    login: "Войти",
    username: "Имя пользователя",
    password: "Пароль",
    status: { online: "Онлайн", offline: "Офлайн", saving: "Сохранение..." },
    placeholders: {
      task: "Новая задача...",
      habit: "Новая цель...",
      note: "Мысли...",
      meal: "...",
    },
    monthsShort: [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ],
    monthsLong: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    daysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    modules: {
      todos: "Задачи",
      notes: "Заметки",
      water: "Вода",
      meals: "Еда",
      mood: "Настроение",
      habits: "Цели",
    },
    themes: { light: "Светлая тема", dark: "Темная тема" },
  },
  ja: {
    appName: "LifeFlow",
    premiumLabel: "プレミアム版",
    welcome: "ようこそ",
    settings: "設定",
    language: "言語",
    theme: "外観",
    yearSelect: "年を選択",
    widgets: "モジュール",
    login: "ログイン",
    username: "ユーザー名",
    password: "パスワード",
    status: {
      online: "オンライン",
      offline: "オフライン",
      saving: "保存中...",
    },
    placeholders: {
      task: "新しいタスク...",
      habit: "新しい目標...",
      note: "メモ...",
      meal: "...",
    },
    monthsShort: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    monthsLong: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    daysShort: ["月", "火", "水", "木", "金", "土", "日"],
    modules: {
      todos: "ToDo",
      notes: "メモ",
      water: "水",
      meals: "食事",
      mood: "気分",
      habits: "目標",
    },
    themes: { light: "ライトモード", dark: "ダークモード" },
  },
  ko: {
    appName: "LifeFlow",
    premiumLabel: "프리미엄 에디션",
    welcome: "환영합니다",
    settings: "설정",
    language: "언어",
    theme: "테마",
    yearSelect: "연도 선택",
    widgets: "모듈",
    login: "로그인",
    username: "사용자 이름",
    password: "비밀번호",
    status: { online: "온라인", offline: "오프라인", saving: "저장 중..." },
    placeholders: {
      task: "새 작업...",
      habit: "새 목표...",
      note: "메모...",
      meal: "...",
    },
    monthsShort: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    monthsLong: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    daysShort: ["월", "화", "수", "목", "금", "토", "일"],
    modules: {
      todos: "할 일",
      notes: "메모",
      water: "물",
      meals: "식사",
      mood: "기분",
      habits: "목표",
    },
    themes: { light: "라이트 모드", dark: "다크 모드" },
  },
  zh: {
    appName: "LifeFlow",
    premiumLabel: "高级版",
    welcome: "欢迎",
    settings: "设置",
    language: "语言",
    theme: "外观",
    yearSelect: "选择年份",
    widgets: "模块",
    login: "登录",
    username: "用户名",
    password: "密码",
    status: { online: "在线", offline: "离线", saving: "保存中..." },
    placeholders: {
      task: "新任务...",
      habit: "新目标...",
      note: "笔记...",
      meal: "...",
    },
    monthsShort: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
    monthsLong: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
    daysShort: ["一", "二", "三", "四", "五", "六", "日"],
    modules: {
      todos: "待办事项",
      notes: "笔记",
      water: "喝水",
      meals: "膳食",
      mood: "心情",
      habits: "目标",
    },
    themes: { light: "亮色模式", dark: "深色模式" },
  },
};

const LifeFlowApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  // Varsayılan dil: İngilizce (en)
  const [preferences, setPreferences] = useState({
    language: "en",
    theme: "dark",
    activeWidgets: ["todos", "notes", "water", "meals", "mood", "habits"],
  });

  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(0);

  const [plannerData, setPlannerData] = useState({});
  const [syncStatus, setSyncStatus] = useState("synced");

  const t = TRANSLATIONS[preferences.language] || TRANSLATIONS["en"];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const isDark = preferences.theme === "dark";

  const getCalendarGrid = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedStartDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const grid = [];
    for (let i = 0; i < adjustedStartDay; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push(i);
    return grid;
  };

  useEffect(() => {
    const savedData = localStorage.getItem("lifeflow_data");
    const savedPrefs = localStorage.getItem("lifeflow_prefs");
    if (savedData) setPlannerData(JSON.parse(savedData));
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
  }, []);

  const saveData = (newData) => {
    setPlannerData(newData);
    setSyncStatus("syncing");
    localStorage.setItem("lifeflow_data", JSON.stringify(newData));
    setTimeout(() => setSyncStatus("synced"), 800);
  };

  const savePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    localStorage.setItem("lifeflow_prefs", JSON.stringify(newPrefs));
  };

  const getDayData = (dateKey) => {
    return (
      plannerData[dateKey] || {
        notes: "",
        water: 0,
        meals: { breakfast: "", lunch: "", dinner: "" },
        todos: [],
        mood: null,
        habits: [],
        hasReminder: false,
      }
    );
  };

  const updateDayData = (dateKey, newData) => {
    const existing = getDayData(dateKey);
    const updated = { ...existing, ...newData };
    updated.hasReminder =
      updated.todos.some((t) => !t.completed) || updated.notes.length > 0;
    saveData({ ...plannerData, [dateKey]: updated });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1c23] p-6 font-sans transition-colors duration-500">
        <div className="w-full max-w-md bg-[#242731] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600"></div>
          <div className="p-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-900/20">
                <Calendar className="w-8 h-8 text-[#1a1c23]" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                {t.appName}
              </h1>
              <p className="text-gray-400 text-xs uppercase tracking-widest mt-2">
                {t.premiumLabel}
              </p>
            </div>
            <div className="space-y-5">
              <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1a1c23] text-white border border-gray-700 rounded-xl px-4 py-3 focus:border-amber-500"
              />
              <input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1c23] text-white border border-gray-700 rounded-xl px-4 py-3 focus:border-amber-500"
              />
              <button
                onClick={() => {
                  if (username && password) {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoggedIn(true);
                      setIsLoading(false);
                    }, 1000);
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-200 to-yellow-500 text-[#1a1c23] font-bold py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center"
              >
                {isLoading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  t.login
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#1a1c23] text-gray-200" : "bg-[#f8fafc] text-slate-800"
      }`}
    >
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl shadow-2xl border p-6 ${
              isDark
                ? "bg-[#242731] border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-bold">{t.settings}</h2>
              <button onClick={() => setShowSettings(false)}>
                <X />
              </button>
            </div>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-bold mb-2">
                  {t.theme}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      savePreferences({ ...preferences, theme: "light" })
                    }
                    className={`flex-1 py-3 border rounded-xl ${
                      !isDark
                        ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                        : ""
                    }`}
                  >
                    <Sun className="inline w-4 h-4 mr-2" />
                    {t.themes.light}
                  </button>
                  <button
                    onClick={() =>
                      savePreferences({ ...preferences, theme: "dark" })
                    }
                    className={`flex-1 py-3 border rounded-xl ${
                      isDark ? "border-amber-500 text-white bg-[#1a1c23]" : ""
                    }`}
                  >
                    <Moon className="inline w-4 h-4 mr-2" />
                    {t.themes.dark}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(TRANSLATIONS).map((l) => (
                    <button
                      key={l}
                      onClick={() =>
                        savePreferences({ ...preferences, language: l })
                      }
                      className={`px-2 py-2 rounded-lg border text-sm ${
                        preferences.language === l
                          ? "bg-amber-500 text-black border-amber-500"
                          : "border-gray-600"
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  {t.widgets}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "todos", label: t.modules.todos, icon: CheckSquare },
                    { id: "notes", label: t.modules.notes, icon: StickyNote },
                    { id: "water", label: t.modules.water, icon: Droplets },
                    { id: "meals", label: t.modules.meals, icon: Utensils },
                    { id: "mood", label: t.modules.mood, icon: Smile },
                    { id: "habits", label: t.modules.habits, icon: Activity },
                  ].map((mod) => {
                    const isActive = preferences.activeWidgets.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          const newWidgets = isActive
                            ? preferences.activeWidgets.filter(
                                (w) => w !== mod.id
                              )
                            : [...preferences.activeWidgets, mod.id];
                          savePreferences({
                            ...preferences,
                            activeWidgets: newWidgets,
                          });
                        }}
                        className={`flex items-center p-2 border rounded-lg text-sm ${
                          isActive
                            ? isDark
                              ? "border-amber-500 text-white"
                              : "border-indigo-500 text-indigo-900"
                            : "opacity-50"
                        }`}
                      >
                        <mod.icon className="w-4 h-4 mr-2" /> {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar (AYLAR BURAYA EKLENDİ) */}
      <div
        className={`hidden md:flex flex-col w-24 border-r items-center py-8 z-20 transition-colors duration-500 ${
          isDark ? "bg-[#242731] border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={() => setCurrentView("dashboard")}
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg ${
            isDark
              ? "bg-gradient-to-br from-amber-200 to-amber-500"
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
          }`}
        >
          <Home className={isDark ? "text-black" : "text-white"} />
        </button>

        {/* Sol Menüde Aylar Listesi */}
        <div className="flex-1 w-full px-2 overflow-y-auto scrollbar-hide space-y-2 my-4">
          {t.monthsShort.map((m, idx) => (
            <button
              key={m}
              onClick={() => {
                setCurrentMonth(idx);
                setCurrentView("month");
              }}
              className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentMonth === idx
                  ? isDark
                    ? "bg-amber-500 text-black"
                    : "bg-indigo-600 text-white"
                  : isDark
                  ? "text-gray-500 hover:bg-gray-800"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl hover:bg-gray-800/10"
          >
            <Settings />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header
          className={`h-20 px-8 flex items-center justify-between border-b backdrop-blur z-10 transition-colors duration-500 ${
            isDark
              ? "bg-[#1a1c23]/80 border-gray-800"
              : "bg-white/80 border-gray-200"
          }`}
        >
          <div className="flex items-center">
            {currentView !== "dashboard" && (
              <button
                onClick={() =>
                  setCurrentView(currentView === "day" ? "month" : "dashboard")
                }
                className="mr-4 p-2 rounded-full hover:bg-gray-500/20"
              >
                <ArrowLeft />
              </button>
            )}
            <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
              {currentView === "dashboard"
                ? t.yearSelect
                : currentView === "month"
                ? `${t.monthsLong[currentMonth]} ${currentYear}`
                : `${selectedDate?.split("-")[2]} ${
                    t.monthsLong[parseInt(selectedDate?.split("-")[1] || 0) - 1]
                  }`}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className={`ml-3 text-sm bg-transparent border-none outline-none cursor-pointer ${
                  isDark ? "text-amber-500" : "text-indigo-600"
                }`}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                savePreferences({
                  ...preferences,
                  theme: isDark ? "light" : "dark",
                })
              }
              className="p-2 hover:bg-gray-500/20 rounded-full"
            >
              {isDark ? (
                <Sun className="text-amber-400" />
              ) : (
                <Moon className="text-indigo-600" />
              )}
            </button>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                isDark ? "bg-gray-700" : "bg-indigo-500"
              }`}
            >
              {username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {currentView === "dashboard" && (
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {t.monthsLong.map((m, idx) => (
                <button
                  key={m}
                  onClick={() => {
                    setCurrentMonth(idx);
                    setCurrentView("month");
                  }}
                  className={`border rounded-2xl p-6 text-left transition-all hover:scale-105 ${
                    isDark
                      ? "bg-[#242731] border-gray-800 hover:border-amber-500"
                      : "bg-white border-gray-100 hover:border-indigo-500"
                  }`}
                >
                  <h3 className="text-xl font-serif font-bold mb-2">{m}</h3>
                  <p className="text-xs opacity-60">{t.totalTasks}</p>
                </button>
              ))}
            </div>
          )}

          {currentView === "month" && (
            <div className="max-w-7xl mx-auto grid grid-cols-7 gap-2">
              {t.daysShort.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-bold py-2 opacity-50"
                >
                  {d}
                </div>
              ))}
              {getCalendarGrid(currentYear, currentMonth).map((day, i) => {
                if (!day) return <div key={i}></div>;
                const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
                const data = plannerData[dateKey];
                const isToday =
                  new Date().toDateString() ===
                  new Date(currentYear, currentMonth, day).toDateString();
                return (
                  <div
                    key={dateKey}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setCurrentView("day");
                    }}
                    className={`aspect-square border rounded-2xl p-2 cursor-pointer flex flex-col justify-between ${
                      isDark
                        ? "bg-[#242731] border-gray-800"
                        : "bg-white border-gray-100"
                    } ${
                      isToday
                        ? isDark
                          ? "border-amber-500"
                          : "border-indigo-500"
                        : ""
                    }`}
                  >
                    <span
                      className={`font-serif text-lg ${
                        isToday
                          ? isDark
                            ? "text-amber-500"
                            : "text-indigo-600"
                          : ""
                      }`}
                    >
                      {day}
                    </span>
                    {data?.hasReminder && (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDark ? "bg-amber-500" : "bg-pink-500"
                        }`}
                      ></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentView === "day" &&
            selectedDate &&
            (() => {
              const data = getDayData(selectedDate);
              const p = preferences;
              const cardBg = isDark
                ? "bg-[#242731] border-gray-800"
                : "bg-white border-gray-100";
              const primaryText = isDark ? "text-gray-400" : "text-slate-500";
              const accentText = isDark ? "text-amber-500" : "text-indigo-600";

              return (
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* SOL KOLON */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* MOOD */}
                    {p.activeWidgets.includes("mood") && (
                      <div
                        className={`${cardBg} border p-6 rounded-3xl shadow-lg`}
                      >
                        <h3
                          className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${primaryText}`}
                        >
                          <Smile className={`w-4 h-4 mr-2 ${accentText}`} />{" "}
                          {t.modules.mood}
                        </h3>
                        <div className="flex justify-between items-center gap-2">
                          {[
                            {
                              id: "happy",
                              icon: Smile,
                              color: "text-green-400",
                            },
                            {
                              id: "neutral",
                              icon: Menu,
                              color: "text-gray-400",
                            },
                            {
                              id: "stressed",
                              icon: Activity,
                              color: "text-red-400",
                            },
                            {
                              id: "energetic",
                              icon: Star,
                              color: "text-yellow-400",
                            },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() =>
                                updateDayData(selectedDate, { mood: m.id })
                              }
                              className={`flex-1 py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                                data.mood === m.id
                                  ? isDark
                                    ? "bg-[#1a1c23] border-amber-500 shadow-inner"
                                    : "bg-indigo-50 border-indigo-500"
                                  : isDark
                                  ? "border-gray-700 hover:bg-gray-800"
                                  : "border-gray-100 hover:bg-gray-50"
                              }`}
                            >
                              <m.icon className={`w-6 h-6 mb-1 ${m.color}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TODO LIST */}
                    {p.activeWidgets.includes("todos") && (
                      <div
                        className={`${cardBg} border p-6 rounded-3xl shadow-lg min-h-[300px]`}
                      >
                        <h3
                          className={`font-bold mb-4 flex items-center ${primaryText}`}
                        >
                          <CheckSquare
                            className={`mr-2 w-5 h-5 ${accentText}`}
                          />{" "}
                          {t.modules.todos}
                        </h3>
                        <div className="space-y-3">
                          {data.todos.map((todo) => (
                            <div
                              key={todo.id}
                              className={`flex items-center p-3 border rounded-xl ${
                                isDark ? "border-gray-700" : "border-gray-200"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  const newTodos = data.todos.map((t) =>
                                    t.id === todo.id
                                      ? { ...t, completed: !t.completed }
                                      : t
                                  );
                                  updateDayData(selectedDate, {
                                    todos: newTodos,
                                  });
                                }}
                                className={`w-6 h-6 rounded border mr-3 flex items-center justify-center ${
                                  todo.completed
                                    ? "bg-amber-500 border-amber-500"
                                    : "border-gray-500"
                                }`}
                              >
                                {todo.completed && (
                                  <CheckSquare className="w-4 h-4 text-black" />
                                )}
                              </button>
                              <span
                                className={`flex-1 ${
                                  todo.completed
                                    ? "line-through opacity-50"
                                    : ""
                                }`}
                              >
                                {todo.text}
                              </span>
                              <button
                                onClick={() => {
                                  const newTodos = data.todos.filter(
                                    (t) => t.id !== todo.id
                                  );
                                  updateDayData(selectedDate, {
                                    todos: newTodos,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4 opacity-50 hover:opacity-100 text-red-500" />
                              </button>
                            </div>
                          ))}
                          <div className="relative">
                            <PlusCircle className="absolute left-3 top-3 w-5 h-5 opacity-50" />
                            <input
                              type="text"
                              placeholder={t.placeholders.task}
                              className="w-full bg-transparent border rounded-xl py-2 pl-10"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  e.target.value.trim()
                                ) {
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
                      </div>
                    )}

                    {/* NOTES */}
                    {p.activeWidgets.includes("notes") && (
                      <div
                        className={`${cardBg} border p-6 rounded-3xl shadow-lg`}
                      >
                        <h3
                          className={`font-bold mb-4 flex items-center ${primaryText}`}
                        >
                          <StickyNote
                            className={`mr-2 w-5 h-5 ${accentText}`}
                          />{" "}
                          {t.modules.notes}
                        </h3>
                        <textarea
                          className={`w-full h-40 bg-transparent border-none outline-none resize-none ${
                            isDark ? "text-gray-300" : "text-slate-700"
                          }`}
                          placeholder={t.placeholders.note}
                          value={data.notes}
                          onChange={(e) =>
                            updateDayData(selectedDate, {
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* SAĞ KOLON */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* SU TAKİBİ */}
                    {p.activeWidgets.includes("water") && (
                      <div
                        className={`border p-6 rounded-3xl ${
                          isDark
                            ? "bg-gradient-to-br from-blue-900/20 to-[#242731] border-blue-900/30"
                            : "bg-gradient-to-br from-blue-50 to-white border-blue-100"
                        }`}
                      >
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center text-blue-400">
                          <Droplets className="w-4 h-4 mr-2" />{" "}
                          {t.modules.water}
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <button
                              key={num}
                              onClick={() =>
                                updateDayData(selectedDate, {
                                  water: data.water === num ? num - 1 : num,
                                })
                              }
                              className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                                num <= data.water
                                  ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                  : isDark
                                  ? "bg-[#1a1c23] text-gray-700 hover:bg-blue-900/20"
                                  : "bg-white text-blue-200 hover:bg-blue-50 border border-blue-100"
                              }`}
                            >
                              <Droplets
                                className="w-5 h-5"
                                fill={
                                  num <= data.water ? "currentColor" : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ALIŞKANLIKLAR */}
                    {p.activeWidgets.includes("habits") && (
                      <div
                        className={`${cardBg} border p-6 rounded-3xl shadow-lg`}
                      >
                        <h3
                          className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${primaryText}`}
                        >
                          <Activity className={`w-4 h-4 mr-2 ${accentText}`} />{" "}
                          {t.modules.habits}
                        </h3>
                        <div className="space-y-2">
                          {data.habits.map((habit) => (
                            <div
                              key={habit.id}
                              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isDark
                                  ? "bg-[#1a1c23] border-gray-800 hover:border-gray-600"
                                  : "bg-gray-50 border-gray-100 hover:border-gray-300"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  const newHabits = data.habits.map((h) =>
                                    h.id === habit.id
                                      ? { ...h, completed: !h.completed }
                                      : h
                                  );
                                  updateDayData(selectedDate, {
                                    habits: newHabits,
                                  });
                                }}
                                className="flex-1 flex items-center text-left"
                              >
                                <span
                                  className={`text-sm flex-1 ${
                                    habit.completed
                                      ? "text-green-500"
                                      : isDark
                                      ? "text-gray-300"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {habit.text}
                                </span>
                                {habit.completed && (
                                  <CheckSquare className="w-4 h-4 text-green-500 ml-2" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  const newHabits = data.habits.filter(
                                    (h) => h.id !== habit.id
                                  );
                                  updateDayData(selectedDate, {
                                    habits: newHabits,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4 opacity-50 hover:opacity-100 text-red-500" />
                              </button>
                            </div>
                          ))}
                          <div className="relative mt-2">
                            <PlusCircle className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder={t.placeholders.habit}
                              className={`w-full bg-transparent border rounded-xl py-2.5 pl-10 text-sm focus:outline-none focus:border-green-500 transition-colors ${
                                isDark
                                  ? "border-gray-800 text-white"
                                  : "border-gray-200 text-slate-700"
                              }`}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  e.target.value.trim()
                                ) {
                                  updateDayData(selectedDate, {
                                    habits: [
                                      ...data.habits,
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
                      </div>
                    )}

                    {/* YEMEK PLANI */}
                    {p.activeWidgets.includes("meals") && (
                      <div
                        className={`${cardBg} border p-6 rounded-3xl shadow-lg`}
                      >
                        <h3
                          className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${primaryText}`}
                        >
                          <Utensils className={`w-4 h-4 mr-2 ${accentText}`} />{" "}
                          {t.modules.meals}
                        </h3>
                        <div className="space-y-4">
                          {["breakfast", "lunch", "dinner"].map((meal) => (
                            <div key={meal} className="relative group">
                              <input
                                type="text"
                                className={`w-full border rounded-xl px-3 py-3 text-sm focus:outline-none transition-all ${
                                  isDark
                                    ? "bg-[#1a1c23] border-gray-700 text-white focus:border-amber-500"
                                    : "bg-gray-50 border-gray-200 text-slate-700 focus:border-indigo-500"
                                }`}
                                placeholder={t.placeholders.meal}
                                value={data.meals[meal] || ""}
                                onChange={(e) =>
                                  updateDayData(selectedDate, {
                                    meals: {
                                      ...data.meals,
                                      [meal]: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </main>
      </div>
    </div>
  );
};

export default LifeFlowApp;
