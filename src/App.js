import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, CheckSquare, StickyNote, Power, Minimize, Maximize, 
  Trash2, PlusCircle, X, Minus, Layout, Settings, ArrowLeft, 
  Home, Bell, Droplets, Utensils, Activity, Globe, Moon, Sun,
  RefreshCw, AlignLeft, AlignRight
} from 'lucide-react';

const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// --- DİL YAPILANDIRMASI ---
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' }
];

const TRANSLATIONS = {
  en: {
    welcome: "Welcome", setupTitle: "Initial Setup", nameLabel: "Your Name", keyLabel: "License Key",
    btnStart: "Get Started", dashboard: "Dashboard", settings: "Settings", languageLabel: "Language",
    widgets: "Active Modules", tasks: "Tasks", notes: "Notes", water: "Hydration", meals: "Meal Plan",
    alarms: "Reminders", habits: "Habits", year: "Year", widget: "Widget Mode", autoStart: "Auto Start",
    invalid: "Invalid License Key", phTask: "Add new task...", phNote: "Write your notes here...",
    phHabit: "Add new habit...", phAlarm: "Alarm Label...", morning: "Breakfast", noon: "Lunch",
    evening: "Dinner", reset: "Reset App", dockLeft: "Dock Left", dockRight: "Dock Right"
  },
  tr: {
    welcome: "Hoş Geldiniz", setupTitle: "İlk Kurulum", nameLabel: "Adınız", keyLabel: "Lisans Anahtarı",
    btnStart: "Başla", dashboard: "Ana Sayfa", settings: "Ayarlar", languageLabel: "Dil Seçimi",
    widgets: "Aktif Modüller", tasks: "Görevler", notes: "Notlar", water: "Sıvı Takibi", meals: "Yemek Planı",
    alarms: "Hatırlatıcılar", habits: "Alışkanlıklar", year: "Yıl", widget: "Widget Modu", autoStart: "Otomatik Başlat",
    invalid: "Geçersiz Lisans Kodu", phTask: "Yeni görev ekle...", phNote: "Notlarını buraya yaz...",
    phHabit: "Yeni alışkanlık ekle...", phAlarm: "Hatırlatma notu...", morning: "Kahvaltı", noon: "Öğle",
    evening: "Akşam", reset: "Uygulamayı Sıfırla", dockLeft: "Sola Yasla", dockRight: "Sağa Yasla"
  }
};

const getTrans = (lang, key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

// --- TARİH YARDIMCILARI (DÜZELTİLDİ) ---
const getMonthName = (monthIndex, langCode) => {
  const locale = LANGUAGES.find(l => l.code === langCode)?.locale || 'en-US';
  // 2025 yılında herhangi bir ayın 1. gününü alıp ay ismini çeker
  return new Date(2025, monthIndex, 1).toLocaleDateString(locale, { month: 'long' });
};

const getDayName = (dayIndex, langCode) => { 
  const locale = LANGUAGES.find(l => l.code === langCode)?.locale || 'en-US';
  return new Date(1970, 0, 5 + dayIndex).toLocaleDateString(locale, { weekday: 'short' });
};

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

const LifeFlowApp = () => {
  // --- STATE ---
  const [isSetup, setIsSetup] = useState(false);
  const [userName, setUserName] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [language, setLanguage] = useState('en');
  
  const [viewMode, setViewMode] = useState('full'); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [plannerData, setPlannerData] = useState({}); 
  const [activeWidgets, setActiveWidgets] = useState(['todos', 'notes', 'water', 'meals', 'alarms']);
  const [error, setError] = useState('');
  const alarmIntervalRef = useRef(null);

  // --- BAŞLANGIÇ ---
  useEffect(() => {
    const savedSetup = localStorage.getItem('lifeflow_setup');
    const savedUser = localStorage.getItem('lifeflow_user');
    const savedLang = localStorage.getItem('lifeflow_lang');
    const savedAuto = localStorage.getItem('lifeflow_autostart') === 'true';

    if (savedSetup === 'true' && savedUser) {
      setUserName(savedUser);
      if (savedLang) setLanguage(savedLang);
      setIsSetup(true);
    }
    setAutoStart(savedAuto);

    const loadData = (key, setter) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (key === 'lifeflow_widgets' && !Array.isArray(parsed)) return;
          setter(parsed);
        } catch (e) { console.error(e); }
      }
    };

    loadData('lifeflow_db', setPlannerData);
    loadData('lifeflow_widgets', setActiveWidgets);

    if (Notification.permission !== "granted") Notification.requestPermission();

    startAlarmCheck();
    return () => clearInterval(alarmIntervalRef.current);
  }, []);

  // --- ALARM SİSTEMİ (DÜZELTİLDİ - GÜNE ÖZEL) ---
  const startAlarmCheck = () => {
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    
    alarmIntervalRef.current = setInterval(() => {
      const now = new Date();
      // Bugünün anahtarını oluştur (Örn: 2025-0-22) - Ay 0'dan başlar
      const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Veritabanını taze çek (State bayat olabilir)
      const db = JSON.parse(localStorage.getItem('lifeflow_db') || '{}');
      const todayData = db[todayKey];

      // Eğer bugüne ait veri varsa ve içinde alarm varsa
      if (todayData && todayData.alarms) {
        let updated = false;
        todayData.alarms.forEach(alarm => {
          // Alarm aktifse VE saati geldiyse
          if (alarm.active && alarm.time === currentTime) {
            // BİLDİRİM
            new Notification("LifeFlow", { 
              body: alarm.label || "Zamanı geldi!", 
              icon: '/favicon.ico'
            });
            
            // SES (Otomatik oynatma izinlerine takılabilir ama dener)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {}); 

            alarm.active = false; // Tekrar çalmasın
            updated = true;
          }
        });

        if (updated) {
          // Güncellenen alarm durumunu kaydet (Susturmak için)
          db[todayKey] = todayData;
          setPlannerData(db);
          localStorage.setItem('lifeflow_db', JSON.stringify(db));
        }
      }
    }, 5000); // 5 saniyede bir kontrol
  };

  // --- VERİ YÖNETİMİ ---
  const getDayData = (dateKey) => {
    // dateKey yoksa bugünü kullan
    const key = dateKey || `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    return plannerData[key] || { todos: [], notes: "", water: 0, meals: {}, alarms: [], habits: [] };
  };

  const updateDayData = (dateKey, data) => {
    const key = dateKey || `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const current = getDayData(key);
    const updated = { ...current, ...data };
    const newDb = { ...plannerData, [key]: updated };
    setPlannerData(newDb);
    // Anında kaydet
    if (isSetup) localStorage.setItem('lifeflow_db', JSON.stringify(newDb));
  };

  // --- PENCERE YÖNETİMİ ---
  const handleClose = () => ipcRenderer?.send('app-close');
  const handleMinimize = () => ipcRenderer?.send('app-minimize');
  
  const handleAutoStart = () => {
    const newState = !autoStart;
    setAutoStart(newState);
    localStorage.setItem('lifeflow_autostart', newState.toString());
    ipcRenderer?.send('toggle-auto-start', newState);
  };
  
  const handleSetup = () => {
    if (licenseKey === "LIFE2025") {
      localStorage.setItem('lifeflow_user', userName);
      localStorage.setItem('lifeflow_lang', language); 
      localStorage.setItem('lifeflow_setup', 'true');
      setIsSetup(true);
    } else {
      setError(getTrans(language, 'invalid'));
    }
  };

  const handleReset = () => {
    if(window.confirm("Reset app? / Uygulama sıfırlansın mı?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const activateWidget = (side) => {
    setViewMode('widget');
    ipcRenderer?.send('set-widget-mode', side);
  };

  const deactivateWidget = () => {
    setViewMode('full');
    ipcRenderer?.send('set-normal-mode');
  };

  const onWidgetEnter = () => ipcRenderer?.send('widget-hover', true);
  const onWidgetLeave = () => ipcRenderer?.send('widget-hover', false);

  const safeActiveWidgets = Array.isArray(activeWidgets) ? activeWidgets : [];

  // --- EKRAN 1: KURULUM ---
  if (!isSetup) {
    return (
      <div className="h-screen flex flex-col bg-[#0f172a] text-white font-sans select-none">
        <div className="h-8 flex justify-end items-center px-4 bg-[#1e293b] draggable"><div className="flex gap-2 no-drag"><button onClick={handleMinimize}><Minus className="w-4 h-4 text-slate-400 hover:text-white"/></button><button onClick={handleClose}><X className="w-4 h-4 text-slate-400 hover:text-red-500"/></button></div></div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-96 p-8 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700">
            <div className="text-center mb-6"><h1 className="text-xl font-bold text-white">LifeFlow</h1></div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {LANGUAGES.map(l => (<button key={l.code} onClick={() => setLanguage(l.code)} className={`aspect-square rounded-lg text-lg border ${language === l.code ? 'bg-amber-500 border-amber-500' : 'bg-slate-800 border-transparent'}`}>{l.flag}</button>))}
              </div>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500" placeholder={getTrans(language, 'nameLabel')} />
              <input type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-3 py-3 text-sm outline-none focus:border-amber-500" placeholder={getTrans(language, 'keyLabel')} />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button onClick={handleSetup} className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg mt-2 hover:bg-amber-400">{getTrans(language, 'btnStart')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: WIDGET ---
  if (viewMode === 'widget') {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
    const data = getDayData(todayKey);
    return (
      <div onMouseEnter={onWidgetEnter} onMouseLeave={onWidgetLeave} className="h-screen flex flex-col bg-slate-900/80 backdrop-blur-xl text-white border-l border-white/10 overflow-hidden font-sans shadow-2xl">
        <div className="h-10 bg-black/30 flex justify-between items-center px-3 cursor-move draggable">
           <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div><span className="text-xs font-bold text-slate-300">LifeFlow</span></div>
           <button onClick={deactivateWidget} className="hover:text-amber-400 p-1 no-drag"><Maximize className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
           <div className="flex-1 bg-black/20 rounded-lg p-2 overflow-y-auto scrollbar-hide">
              <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{getTrans(language, 'tasks')}</p>
              {data.todos.filter(t=>!t.completed).map(t => (<div key={t.id} className="flex items-center text-xs bg-white/5 p-2 rounded border-l-2 border-amber-500 mb-1 truncate">{t.text}</div>))}
           </div>
           <textarea className="h-24 bg-black/20 rounded-lg p-2 text-xs resize-none outline-none focus:ring-1 focus:ring-amber-500/50 border border-transparent text-slate-300" placeholder={getTrans(language, 'phNote')} value={data.notes} onChange={(e) => updateDayData(todayKey, { notes: e.target.value })} />
        </div>
      </div>
    );
  }

  // --- EKRAN 3: DASHBOARD ---
  const todayKey = selectedDate || `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
  const data = getDayData(todayKey);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden border border-slate-300">
      {/* SETTINGS */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 animate-fadeIn border border-slate-200">
            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">{getTrans(language, 'settings')}</h3><button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-slate-400"/></button></div>
            <div className="space-y-6">
              <div>
                 <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">{getTrans(language, 'languageLabel')}</label>
                 <div className="grid grid-cols-6 gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLanguage(l.code); localStorage.setItem('lifeflow_lang', l.code); }} className={`aspect-square flex items-center justify-center rounded-lg text-lg transition border ${language === l.code ? 'bg-amber-50 border-amber-500' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>{l.flag}</button>
                    ))}
                 </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 uppercase">{getTrans(language, 'widgets')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{id: 'todos', label: getTrans(language, 'tasks'), icon: CheckSquare}, {id: 'notes', label: getTrans(language, 'notes'), icon: StickyNote}, {id: 'alarms', label: getTrans(language, 'alarms'), icon: Bell}, {id: 'water', label: getTrans(language, 'water'), icon: Droplets}, {id: 'meals', label: getTrans(language, 'meals'), icon: Utensils}].map(item => (
                    <button key={item.id} onClick={() => { const nw = safeActiveWidgets.includes(item.id) ? safeActiveWidgets.filter(w => w !== item.id) : [...safeActiveWidgets, item.id]; setActiveWidgets(nw); localStorage.setItem('lifeflow_widgets', JSON.stringify(nw)); }} className={`flex items-center p-2 rounded-lg border text-xs font-medium transition ${safeActiveWidgets.includes(item.id) ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-400'}`}><item.icon className="w-3 h-3 mr-2"/> {item.label}</button>
                  ))}
              </div>
              <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100"><RefreshCw className="w-3 h-3"/> {getTrans(language, 'reset')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="h-8 bg-white flex justify-between items-center px-4 border-b border-slate-200 draggable">
         <div className="text-xs font-bold text-slate-400 flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> LIFEFLOW PREMIUM</div>
         <div className="flex gap-4 no-drag"><button onClick={handleMinimize}><Minus className="w-4 h-4 text-slate-400 hover:text-black"/></button><button onClick={handleClose}><X className="w-4 h-4 text-slate-400 hover:text-red-600"/></button></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-10">
          <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20"><Calendar className="w-5 h-5 text-white" /></div><div><h2 className="font-bold text-slate-800">LifeFlow</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium</p></div></div>
          <div className="space-y-1">
             <button onClick={() => setCurrentView('dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl font-medium hover:bg-slate-50 text-slate-600"><Home className="w-4 h-4"/> {getTrans(language, 'dashboard')}</button>
             <button onClick={() => setShowSettings(!showSettings)} className="w-full flex items-center gap-3 p-3 rounded-xl font-medium hover:bg-slate-50 text-slate-600"><Settings className="w-4 h-4"/> {getTrans(language, 'settings')}</button>
             <div className="px-3 py-2 mt-4 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{getTrans(language, 'year')}</label>
                <select value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-500 cursor-pointer">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
             </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
             <div className="grid grid-cols-2 gap-2">
               <button onClick={() => activateWidget('left')} className="flex items-center justify-center gap-1 p-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] hover:bg-slate-200"><AlignLeft className="w-3 h-3"/> {getTrans(language, 'dockLeft')}</button>
               <button onClick={() => activateWidget('right')} className="flex items-center justify-center gap-1 p-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] hover:bg-slate-200"><AlignRight className="w-3 h-3"/> {getTrans(language, 'dockRight')}</button>
             </div>
             <button onClick={handleAutoStart} className={`w-full flex items-center justify-center gap-2 p-2 text-xs rounded-lg transition ${autoStart ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-green-600'}`}><Power className="w-3 h-3"/> {getTrans(language, 'autoStart')}</button>
          </div>
        </div>

        <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden">
           <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur border-b border-slate-200">
              <div className="flex items-center gap-4">
                 {currentView !== 'dashboard' && <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>}
                 {currentView === 'day' && <button onClick={() => setCurrentView('month')} className="p-2 hover:bg-slate-200 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>}
                 <h1 className="text-2xl font-bold text-slate-800">
                    {currentView === 'dashboard' ? currentYear : 
                     currentView === 'month' ? `${getMonthName(currentMonth, language)} ${currentYear}` :
                     // DÜZELTİLEN KISIM: Tarih başlığı formatı
                     selectedDate ? (() => {
                        const parts = selectedDate.split('-');
                        return `${parts[2]} ${getMonthName(parseInt(parts[1]), language)} ${parts[0]}`;
                     })() : ''}
                 </h1>
              </div>
              <div className="text-right hidden md:block"><p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{getTrans(language, 'welcome')}</p><p className="font-bold text-amber-600">{userName}</p></div>
           </header>

           <main className="flex-1 overflow-y-auto p-8">
              {currentView === 'dashboard' && (
                 <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({length:12}).map((_,i) => (
                       <button key={i} onClick={() => { setSelectedDate(`${currentYear}-${i}-${new Date().getDate()}`); setCurrentView('day'); }} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition text-left">
                          <h3 className="text-lg font-bold text-slate-700">{getMonthName(i, language)}</h3>
                       </button>
                    ))}
                 </div>
              )}

              {currentView === 'month' && (
                 <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid grid-cols-7 mb-4">{Array.from({length: 7}).map((_, i) => <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{getDayName(i, language)}</div>)}</div>
                    <div className="grid grid-cols-7 gap-2">
                       {(() => {
                          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                          const firstDay = new Date(currentYear, currentMonth, 1).getDay(); 
                          const start = firstDay === 0 ? 6 : firstDay - 1; 
                          const grid = [];
                          for(let i=0; i<start; i++) grid.push(null);
                          for(let i=1; i<=daysInMonth; i++) grid.push(i);
                          return grid.map((day, i) => {
                             if(!day) return <div key={i}></div>;
                             const dateKey = `${currentYear}-${currentMonth}-${day}`;
                             const dt = plannerData[dateKey];
                             const hasContent = dt && (dt.todos.length > 0 || dt.notes || dt.alarms?.length > 0);
                             const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
                             return (
                                <button key={i} onClick={() => { setSelectedDate(dateKey); setCurrentView('day'); }} className={`aspect-square rounded-xl border flex flex-col justify-between p-3 transition hover:shadow-md text-left ${isToday ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-amber-300'}`}>
                                   <span className={`text-lg font-bold ${isToday ? 'text-amber-600' : 'text-slate-700'}`}>{day}</span>
                                   <div className="flex gap-1">{hasContent && <div className="w-2 h-2 bg-amber-400 rounded-full"></div>}</div>
                                </button>
                             )
                          });
                       })()}
                    </div>
                 </div>
              )}

              {currentView === 'day' && selectedDate && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {safeActiveWidgets.includes('todos') && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                         <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4"><CheckSquare className="w-5 h-5 mr-2 text-amber-500"/> {getTrans(language, 'tasks')}</h3>
                         <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {data.todos.map(t => (
                               <div key={t.id} className="flex items-center p-3 bg-slate-50 border rounded-xl"><button onClick={() => updateDayData(selectedDate, { todos: data.todos.map(x => x.id === t.id ? {...x, completed: !x.completed} : x) })} className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${t.completed ? 'bg-amber-500' : 'bg-white'}`}>{t.completed && <CheckSquare className="w-3 h-3 text-white"/>}</button><span className={`flex-1 ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.text}</span><button onClick={() => updateDayData(selectedDate, { todos: data.todos.filter(x => x.id !== t.id) })}><Trash2 className="w-4 h-4 text-red-400"/></button></div>
                            ))}
                         </div>
                         <div className="mt-4 relative"><PlusCircle className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"/><input type="text" className="w-full bg-slate-50 border rounded-xl py-3 pl-10 outline-none focus:border-amber-500" placeholder={getTrans(language, 'phTask')} onKeyDown={(e) => { if(e.key==='Enter' && e.target.value.trim()){ updateDayData(selectedDate, { todos: [...data.todos, {id:Date.now(), text:e.target.value, completed:false}] }); e.target.value=''; } }}/></div>
                      </div>
                    )}
                    {safeActiveWidgets.includes('alarms') && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                         <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4"><Bell className="w-5 h-5 mr-2 text-red-500"/> {getTrans(language, 'alarms')}</h3>
                         <div className="flex-1 overflow-y-auto space-y-2">
                            {(data.alarms || []).map(alarm => (
                               <div key={alarm.id} className={`flex items-center justify-between p-3 rounded-xl border ${alarm.active ? 'bg-red-50 border-red-100' : 'bg-slate-50 opacity-60'}`}>
                                  <span className="font-bold">{alarm.time} <span className="font-normal text-sm">- {alarm.label}</span></span>
                                  <button onClick={() => updateDayData(todayKey, { alarms: data.alarms.filter(a => a.id !== alarm.id) })}><Trash2 className="w-4 h-4 text-red-400"/></button>
                               </div>
                            ))}
                         </div>
                         <div className="mt-4 flex gap-2">
                            <input type="time" id="aTime" className="bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-amber-500" />
                            <input type="text" id="aLabel" className="flex-1 bg-slate-50 border rounded-xl px-3 py-2 outline-none focus:border-amber-500" placeholder={getTrans(language, 'phAlarm')} />
                            <button onClick={() => { const t=document.getElementById('aTime').value; const l=document.getElementById('aLabel').value; if(t) { const newAlarms = [...(data.alarms||[]), {id:Date.now(), time:t, label:l, active:true}]; updateDayData(todayKey, { alarms: newAlarms }); } }} className="bg-amber-500 text-white p-2 rounded-xl"><PlusCircle/></button>
                         </div>
                      </div>
                    )}
                    {safeActiveWidgets.includes('water') && (
                      <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white h-[200px]">
                         <h3 className="font-bold text-lg flex items-center mb-4"><Droplets className="w-5 h-5 mr-2"/> {getTrans(language, 'water')}</h3>
                         <div className="grid grid-cols-8 gap-2">{[1,2,3,4,5,6,7,8].map(num => (<button key={num} onClick={() => updateDayData(todayKey, { water: data.water === num ? num-1 : num })} className={`aspect-square rounded-lg flex items-center justify-center transition border ${num <= data.water ? 'bg-white text-blue-600' : 'border-white/30 hover:bg-white/10'}`}><Droplets className="w-4 h-4" fill={num <= data.water ? "currentColor" : "none"}/></button>))}</div>
                      </div>
                    )}
                    {safeActiveWidgets.includes('notes') && (
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[300px] flex flex-col">
                         <h3 className="font-bold text-lg flex items-center text-slate-700 mb-4"><StickyNote className="w-5 h-5 mr-2 text-amber-500"/> {getTrans(language, 'notes')}</h3>
                         <textarea className="flex-1 bg-slate-50 rounded-xl p-4 border-none resize-none outline-none focus:ring-2 focus:ring-amber-100 transition border-none" value={data.notes} onChange={(e) => updateDayData(selectedDate, { notes: e.target.value })} placeholder={getTrans(language, 'phNote')}/>
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