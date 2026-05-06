import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, History, MessageSquare, Settings, BookOpen, ChevronDown, Mic, Globe, Bell, Moon, Volume2, Zap, CheckCircle2, TrendingUp, AlertCircle, ExternalLink, Star, Clock, HelpCircle
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
}

type SidebarSection = "current" | "history" | "settings" | "resources" | null;

const historyData = [
  { id: 1, role: "Software Engineer", level: "Junior", date: "Today, 10:23 AM", score: "excellent", q: 5, time: "18 min" },
  { id: 2, role: "Product Manager", level: "Mid", date: "Yesterday, 3:45 PM", score: "good", q: 4, time: "22 min" },
  { id: 3, role: "UX Designer", level: "Senior", date: "May 3, 2026", score: "needs-work", q: 6, time: "30 min" },
  { id: 4, role: "Data Analyst", level: "Junior", date: "May 1, 2026", score: "good", q: 5, time: "20 min" },
];

const resourcesData = [
  { category: "FRAMEWORKS", icon: Zap, items: [{ title: "Panduan Metode STAR", desc: "Struktur jawaban situasi, task, aksi, hasil", badge: "Essential" }, { title: "Teknik CAR Method", desc: "Context, Action, Result untuk jawaban ringkas", badge: "Popular" }] },
  { category: "PERTANYAAN UMUM", icon: HelpCircle, items: [{ title: "Behavioral Questions", desc: "50+ pertanyaan behavioral yang sering ditanya", badge: "50 Q&A" }, { title: "Technical Questions", desc: "Pertanyaan teknikal untuk Software Engineer", badge: "40 Q&A" }, { title: "Leadership Questions", desc: "Pertanyaan kepemimpinan untuk level Senior", badge: "25 Q&A" }] },
  { category: "TIPS & TRICKS", icon: Star, items: [{ title: "Mengatasi Gugup saat Interview", desc: "Teknik pernapasan dan mental preparation", badge: "Wellness" }, { title: "Riset Perusahaan yang Efektif", desc: "Cara riset mendalam sebelum interview", badge: "Strategy" }] }
];

export function Sidebar({ isOpen, onClose, onNewSession }: SidebarProps) {
  const [openSection, setOpenSection] = useState<SidebarSection>("current");
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem("intervon_settings");
    if (saved) return JSON.parse(saved);
    return { microphone: true, audioFeedback: true, notifications: true, darkMode: false, language: "id", aiModel: "standard" };
  });

  useEffect(() => {
    localStorage.setItem("intervon_settings", JSON.stringify(appSettings));
  }, [appSettings]);

  const updateSetting = (key: keyof typeof appSettings, value: string | boolean) => {
    setAppSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section: SidebarSection) => {
    setOpenSection(openSection === section ? null : section);
  };

  const SectionHeader = ({ icon: Icon, title, section, badge }: any) => {
    const isActive = openSection === section;
    return (
      <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors group">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'}`}><Icon size={18} /></div>
          <span className="font-semibold text-slate-200">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {badge && <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
          <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isActive ? '-rotate-180' : ''}`} />
        </div>
      </button>
    );
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}>
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <>
      {/* 
        MODE PUSH SEJATI: 
        Menggunakan animasi lebar (width) dari 0 ke 320px.
        Ini akan secara fisik mendorong flex container di App.tsx ke sebelah kanan!
      */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 320 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="h-full bg-[#0F141F] border-slate-800/60 z-50 shrink-0 overflow-hidden shadow-2xl relative"
        style={{ borderRightWidth: isOpen ? 1 : 0 }}
      >
        {/* INNER CONTAINER: Lebarnya dikunci 320px agar konten di dalamnya tidak ikut "gepeng" saat animasi berjalan */}
        <div className="w-[320px] h-full flex flex-col">
          
          {/* Header & New Session Button */}
          <div className="p-5 border-b border-slate-800/60 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">Intervon</h1>
              {/* Tombol X ini opsional, karena sekarang hamburger button selalu terlihat */}
              <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white md:hidden">
                <X size={18} />
              </button>
            </div>
            <button onClick={() => { onNewSession(); onClose(); }} className="w-full bg-[#3B66F5] hover:bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Plus size={20} /> New Session
            </button>
          </div>

          {/* Scrollable Content (Accordions) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
            
            {/* 1. CURRENT SESSION */}
            <SectionHeader icon={MessageSquare} title="Current Session" section="current" />
            <AnimatePresence>
              {openSection === "current" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4">
                    <div className="bg-[#1A2130] rounded-2xl border border-slate-700/50 p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Status</span><div className="flex items-center gap-1.5 text-[#10B981]"><div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />Active</div></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Role</span><span className="text-slate-200">Software Engineer</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Level</span><span className="text-slate-200">Junior</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Questions</span><span className="text-slate-200">1 / 10</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="text-slate-400">Duration</span><span className="text-slate-200 flex items-center gap-1"><Clock size={14} /> 05:24</span></div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5"><span>Progress</span><span>10%</span></div>
                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-[#3B66F5] w-[10%] rounded-full" /></div>
                      </div>
                      <div className="mt-3 p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center gap-2">
                        <Star size={16} className="text-[#10B981]" /><span className="text-xs font-medium text-[#10B981]">Current Avg Score: Excellent</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. HISTORY */}
            <SectionHeader icon={History} title="History" section="history" badge="4" />
            <AnimatePresence>
              {openSection === "history" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-3">
                    {historyData.map((item) => (
                      <div key={item.id} className="bg-[#1A2130] rounded-2xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div><h4 className="text-slate-200 font-medium">{item.role}</h4><p className="text-slate-500 text-xs mt-0.5">{item.level} · {item.date}</p></div>
                          {item.score === 'excellent' && <span className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Excellent</span>}
                          {item.score === 'good' && <span className="bg-[#3B66F5]/10 text-[#3B66F5] border border-[#3B66F5]/20 text-xs px-2 py-1 rounded-full flex items-center gap-1"><TrendingUp size={12}/> Good</span>}
                          {item.score === 'needs-work' && <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2 py-1 rounded-full flex items-center gap-1"><AlertCircle size={12}/> Needs Work</span>}
                        </div>
                        <p className="text-slate-500 text-xs">{item.q} Q · {item.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. SETTINGS */}
            <SectionHeader icon={Settings} title="Settings" section="settings" />
            <AnimatePresence>
              {openSection === "settings" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4">
                    <div className="bg-[#1A2130] rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
                      {[
                        { id: 'microphone', label: 'Microphone', sub: 'Default device', icon: Mic },
                        { id: 'audioFeedback', label: 'Audio Feedback', sub: 'AI voice response', icon: Volume2 },
                        { id: 'notifications', label: 'Notifications', sub: 'Session reminders', icon: Bell },
                        { id: 'darkMode', label: 'Dark Mode', sub: 'Interface theme', icon: Moon }
                      ].map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800 text-slate-400"><setting.icon size={16} /></div>
                            <div><p className="text-slate-200 text-sm font-medium">{setting.label}</p><p className="text-slate-500 text-xs">{setting.sub}</p></div>
                          </div>
                          <ToggleSwitch checked={appSettings[setting.id as keyof typeof appSettings] as boolean} onChange={() => updateSetting(setting.id as keyof typeof appSettings, !appSettings[setting.id as keyof typeof appSettings])} />
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-slate-800 text-slate-400"><Globe size={16} /></div><p className="text-slate-200 text-sm font-medium">Language</p></div>
                        <select value={appSettings.language} onChange={(e) => updateSetting('language', e.target.value)} className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 outline-none"><option value="id">Bahasa ID</option><option value="en">English</option></select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. RESOURCES */}
            <SectionHeader icon={BookOpen} title="Resources" section="resources" />
            <AnimatePresence>
              {openSection === "resources" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-6">
                    {resourcesData.map((group, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2 mb-3 px-1"><group.icon size={14} className="text-slate-500" /><span className="text-slate-500 text-xs font-bold tracking-wider">{group.category}</span></div>
                        <div className="space-y-3">
                          {group.items.map((item, i) => (
                            <div key={i} className="bg-[#1A2130] rounded-2xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors cursor-pointer flex justify-between gap-4">
                              <div><h4 className="text-slate-200 font-medium text-sm mb-1">{item.title}</h4><p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p></div>
                              <div className="flex flex-col items-end justify-between shrink-0"><span className="bg-[#3B66F5]/20 text-[#3B66F5] text-[10px] font-bold px-2 py-1 rounded-md">{item.badge}</span><ExternalLink size={14} className="text-slate-600" /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Footer Profil */}
          <div className="p-5 border-t border-slate-800/60 bg-[#0F141F] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3B66F5] flex items-center justify-center text-white font-bold shrink-0">A</div>
              <div className="flex-1">
                <p className="text-slate-200 text-sm font-semibold">Anisa Dewi</p>
                <p className="text-slate-500 text-xs">Free Plan · 8 sessions left</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}