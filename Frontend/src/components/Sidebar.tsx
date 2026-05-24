import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, History, MessageSquare, Settings, BookOpen, ChevronDown, Mic, Globe, Bell, Moon, Volume2, Zap, CheckCircle2, TrendingUp, AlertCircle, ExternalLink, Star, Clock, HelpCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewSession: () => void;
}

type SidebarSection = "current" | "history" | "settings" | "resources" | null;
type BooleanSettingId = "microphone" | "audioFeedback" | "notifications" | "darkMode";

interface AppSettings {
  microphone: boolean;
  audioFeedback: boolean;
  notifications: boolean;
  darkMode: boolean;
  language: "id" | "en";
  aiModel: "standard";
}

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  section: SidebarSection;
  badge?: string;
  isActive: boolean;
  onToggle: (section: SidebarSection) => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const defaultSettings: AppSettings = {
  microphone: true,
  audioFeedback: true,
  notifications: true,
  darkMode: false,
  language: "id",
  aiModel: "standard",
};

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

const settingsOptions: Array<{ id: BooleanSettingId; label: string; sub: string; icon: LucideIcon }> = [
  { id: "microphone", label: "Microphone", sub: "Default device", icon: Mic },
  { id: "audioFeedback", label: "Audio Feedback", sub: "AI voice response", icon: Volume2 },
  { id: "notifications", label: "Notifications", sub: "Session reminders", icon: Bell },
  { id: "darkMode", label: "Dark Mode", sub: "Interface theme", icon: Moon },
];

function SectionHeader({ icon: Icon, title, section, badge, isActive, onToggle }: SectionHeaderProps) {
  return (
    <button onClick={() => onToggle(section)} className="group flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40">
      <div className="flex min-w-0 items-center gap-4">
        <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'}`}><Icon size={18} /></div>
        <span className="truncate font-semibold text-slate-200">{title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {badge && <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
        <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isActive ? '-rotate-180' : ''}`} />
      </div>
    </button>
  );
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${checked ? 'bg-blue-600' : 'bg-slate-600'}`}>
      <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export function Sidebar({ isOpen, onClose, onNewSession }: SidebarProps) {
  const [openSection, setOpenSection] = useState<SidebarSection>("current");
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("intervon_settings");
    if (!saved) return defaultSettings;

    try {
      return { ...defaultSettings, ...JSON.parse(saved) };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem("intervon_settings", JSON.stringify(appSettings));
  }, [appSettings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setAppSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: BooleanSettingId) => {
    setAppSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section: SidebarSection) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* 
        MODE PUSH SEJATI: 
        Menggunakan animasi lebar (width) dari 0 ke 320px.
        Ini akan secara fisik mendorong flex container di App.tsx ke sebelah kanan!
      */}
      <motion.div
        initial={false}
        animate={{ width: isOpen ? 320 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed inset-y-0 left-0 z-50 h-full max-w-[86vw] shrink-0 overflow-hidden border-slate-800/60 bg-[#0F141F] shadow-2xl lg:relative lg:inset-auto lg:max-w-none"
        style={{ borderRightWidth: isOpen ? 1 : 0 }}
      >
        {/* INNER CONTAINER: Lebarnya dikunci 320px agar konten di dalamnya tidak ikut "gepeng" saat animasi berjalan */}
        <div className="flex h-full w-[min(320px,86vw)] flex-col lg:w-[320px]">
          
          {/* Header & New Session Button */}
          <div className="p-5 border-b border-slate-800/60 shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">Intervon</h1>
              {/* Tombol X ini opsional, karena sekarang hamburger button selalu terlihat */}
              <button onClick={onClose} className="rounded-lg bg-slate-800 p-1.5 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 lg:hidden" aria-label="Close sidebar">
                <X size={18} />
              </button>
            </div>
            <button onClick={() => { onNewSession(); onClose(); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-950/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20">
              <Plus size={20} /> New Session
            </button>
          </div>

          {/* Scrollable Content (Accordions) */}
          {/* <div className="flex-1 overflow-y-auto custom-scrollbar pb-6"> */}
          <div className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* 1. CURRENT SESSION */}
            <SectionHeader icon={MessageSquare} title="Current Session" section="current" isActive={openSection === "current"} onToggle={toggleSection} />
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
            <SectionHeader icon={History} title="History" section="history" badge="4" isActive={openSection === "history"} onToggle={toggleSection} />
            <AnimatePresence>
              {openSection === "history" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4 space-y-3">
                    {historyData.map((item) => (
                      <div key={item.id} className="bg-[#1A2130] rounded-2xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors cursor-pointer">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0"><h4 className="truncate font-medium text-slate-200">{item.role}</h4><p className="mt-0.5 truncate text-xs text-slate-500">{item.level} · {item.date}</p></div>
                          {item.score === 'excellent' && <span className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 text-xs px-2 py-1 rounded-full shrink-0 flex items-center gap-1"><CheckCircle2 size={12}/> Excellent</span>}
                          {item.score === 'good' && <span className="bg-[#3B66F5]/10 text-[#3B66F5] border border-[#3B66F5]/20 text-xs px-2 py-1 rounded-full shrink-0 flex items-center gap-1"><TrendingUp size={12}/> Good</span>}
                          {item.score === 'needs-work' && <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2 py-1 rounded-full shrink-0 flex items-center gap-1"><AlertCircle size={12}/> Needs Work</span>}
                        </div>
                        <p className="text-slate-500 text-xs">{item.q} Q · {item.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. SETTINGS */}
            <SectionHeader icon={Settings} title="Settings" section="settings" isActive={openSection === "settings"} onToggle={toggleSection} />
            <AnimatePresence>
              {openSection === "settings" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-5 pb-4">
                    <div className="bg-[#1A2130] rounded-2xl border border-slate-700/50 divide-y divide-slate-700/50">
                      {settingsOptions.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between gap-3 p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800 text-slate-400"><setting.icon size={16} /></div>
                            <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{setting.label}</p><p className="truncate text-xs text-slate-500">{setting.sub}</p></div>
                          </div>
                          <ToggleSwitch checked={appSettings[setting.id]} onChange={() => toggleSetting(setting.id)} />
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-slate-800 text-slate-400"><Globe size={16} /></div><p className="text-slate-200 text-sm font-medium">Language</p></div>
                        <select value={appSettings.language} onChange={(e) => updateSetting('language', e.target.value as AppSettings["language"])} className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 outline-none"><option value="id">Bahasa ID</option><option value="en">English</option></select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. RESOURCES */}
            <SectionHeader icon={BookOpen} title="Resources" section="resources" isActive={openSection === "resources"} onToggle={toggleSection} />
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
                              <div className="min-w-0"><h4 className="mb-1 truncate text-sm font-medium text-slate-200">{item.title}</h4><p className="text-xs leading-relaxed text-slate-500">{item.desc}</p></div>
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-200">Anisa Dewi</p>
                <p className="truncate text-xs text-slate-500">Free Plan · 8 sessions left</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
