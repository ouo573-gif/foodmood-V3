/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Plus, 
  BarChart2, 
  User, 
  X, 
  Check, 
  ChevronRight, 
  Info, 
  Award,
  Zap,
  Coffee,
  Heart,
  Droplets
} from 'lucide-react';
import { MBEI_TYPES, MOOD_OPTIONS, POST_MOOD_OPTIONS, BODY_FEELING_OPTIONS, FORTUNES, Fortune, LEADERBOARD_DATA } from './constants';
import { MealRecord, MBEI_Code, Badge } from './types';
import { generateAIFortune } from './services/geminiService';

// Utils
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const ACTIVE_USER_KEY = 'foodmood_active_user';
const PROFILES_KEY = 'foodmood_profiles';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const loadProfiles = (): Record<string, LoginProfile> => {
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProfiles = (profiles: Record<string, LoginProfile>) => {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

type LoginProfile = {
  email: string;
  nickname: string;
  gender: string;
  age: string;
};

export default function App() {
  const [loginProfile, setLoginProfile] = useState<LoginProfile | null>(null);
  const [activeTab, setActiveTab ] = useState('home');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [latestRecord, setLatestRecord] = useState<MealRecord | null>(null);
  const [records, setRecords] = useState<MealRecord[]>([
    {
      id: '1',
      date: '2024-05-10',
      time: '08:30',
      mealType: '早餐',
      foodEmoji: '☕🥐',
      foodType: 'mixed',
      mood: '有精神',
      bodyFeeling: '心悸',
      context: '趕工',
      mbeiCode: 'MPLR'
    },
    {
      id: '2',
      date: '2024-05-09',
      time: '12:30',
      mealType: '午餐',
      foodEmoji: '🥗🍱',
      foodType: 'natural',
      mood: '平靜',
      bodyFeeling: '清爽',
      context: '獨處',
      mbeiCode: 'PNLR'
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    mealType: '午餐',
    foodType: 'mixed' as 'natural' | 'processed' | 'mixed',
    mood: '平靜',
    bodyFeeling: '清爽',
    bodyFeelingOther: '',
    context: '獨處',
    foodEmoji: ''
  });

  useEffect(() => {
    const profiles = loadProfiles();
    const activeEmail = typeof window !== 'undefined' ? window.localStorage.getItem(ACTIVE_USER_KEY) : null;
    if (!activeEmail) return;
    const profile = profiles[normalizeEmail(activeEmail)];
    if (profile) setLoginProfile(profile);
  }, []);

  const handleLogin = (profile: LoginProfile) => {
    const normalized = normalizeEmail(profile.email);
    const profiles = loadProfiles();
    profiles[normalized] = profile;
    saveProfiles(profiles);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_USER_KEY, normalized);
    }
    setLoginProfile(profile);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVE_USER_KEY);
    }
    setLoginProfile(null);
  };

  const handleRecord = async () => {
    if (!formData.foodEmoji.trim()) {
      return;
    }

    setIsLoading(true);

    // Generate AI Fortune based on inputs
    const aiFortune = await generateAIFortune({
      ...formData,
      foodEmoji: formData.foodEmoji.trim()
    });
    
    // Simulate slight processing delay for feel
    setTimeout(() => {
      const newRecord: MealRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...formData,
        bodyFeeling: formData.bodyFeeling === '其他' && formData.bodyFeelingOther.trim()
          ? `其他：${formData.bodyFeelingOther.trim()}`
          : formData.bodyFeeling,
        mbeiCode: determineMBEI(formData),
        fortune: aiFortune || undefined
      };
      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      setLatestRecord(newRecord);
      setIsLoading(false);
      setIsRecordOpen(false);
      setShowResult(true);

      fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: loginProfile,
          record: newRecord
        })
      }).catch((error) => {
        console.error('Failed to persist record to Google Sheets:', error);
      });
    }, 800);
  };

  const determineMBEI = (data: typeof formData): MBEI_Code => {
    // Simple logic for prototype
    let mbei = '';
    
    // M/P
    if (['焦慮', '煩躁', '空虛'].includes(data.mood) || data.mood === '被安撫') {
      mbei += 'M';
    } else {
      mbei += 'P';
    }

    // N/P
    if (data.foodType === 'natural') mbei += 'N';
    else mbei += 'P';

    // H/L
    if (['胃脹', '昏沉', '心悸', '口渴'].includes(data.bodyFeeling)) mbei += 'H';
    else mbei += 'L';

    // R/V
    if (['趕工', '失眠後', '報告週'].includes(data.context)) mbei += 'V';
    else mbei += 'R';

    return (mbei.length === 4 ? mbei : 'MPLR') as MBEI_Code;
  };

  if (!loginProfile) {
    return <LoginGate onLogin={setLoginProfile} />;
  }

  return (
    <div className="h-screen bg-[#EAE4D9] flex flex-col md:flex-row overflow-hidden relative selection:bg-[#C04A3B] selection:text-white">
      {/* Outer Paper Texture for the whole screen */}
      <div className="paper-texture opacity-[0.05]" />

      {/* Sidebar Navigation - Desktop Only */}
      <aside className="hidden md:flex flex-col w-80 h-screen bg-[#FAF8F5] border-r-8 border-[#2C2623] z-50 shrink-0 relative">
        <div className="paper-texture opacity-[0.03] grayscale pointer-events-none" />
        
        <div className="flex flex-col h-full p-8 overflow-y-auto scrollbar-hide relative z-10">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-serif font-black text-[#2C2623] tracking-tighter">食緒曆</h1>
              <span className="seal text-xs">日常</span>
            </div>
            <p className="text-[#877B73] text-[10px] font-bold tracking-widest uppercase">EAT·MOOD·CALENDAR</p>
          </div>
  
          <div className="flex-1 space-y-2">
            <SidebarButton icon={Home} label="今日日誌" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <SidebarButton icon={Calendar} label="食緒曆卡" active={activeTab === 'almanac'} onClick={() => setActiveTab('almanac')} />
            <SidebarButton icon={BarChart2} label="深度洞察" active={activeTab === 'insight'} onClick={() => setActiveTab('insight')} />
            <SidebarButton icon={User} label="修身個人" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </div>
  
          <div className="pt-8">
            <button 
              onClick={() => setIsRecordOpen(true)}
              className="w-full bg-[#2C2623] text-white py-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 paper-texture opacity-10 pointer-events-none" />
              <Plus size={24} />
              <span className="font-black tracking-[0.2em]">凝練食緒</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container - Responsive Behavior */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden flex justify-between items-center px-6 py-4 bg-[#FAF8F5] border-b-4 border-[#2C2623] z-40">
           <h1 className="text-xl font-serif font-black text-[#2C2623]">食緒曆</h1>
           <button 
             onClick={() => setActiveTab('profile')} 
             className="w-8 h-8 rounded-full bg-[#F4EFE6] border border-[#EAE4D9] flex items-center justify-center"
           >
             <User size={16} className="text-[#877B73]" />
           </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-40 md:pb-24 scrollbar-hide relative z-10 bg-[#FAF8F5] md:bg-transparent">
          <div className="max-w-5xl mx-auto md:p-12 p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <HomeView records={records} />}
              {activeTab === 'almanac' && <AlmanacView records={records} />}
              {activeTab === 'insight' && <InsightView />}
              {activeTab === 'profile' && <ProfileView records={records} loginProfile={loginProfile} />}
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation / Menu - Mobile Only */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-[#2C2623] rounded-full px-8 py-3 flex items-center justify-between z-40 shadow-2xl border border-white/20">
          <TabButton icon={Home} label="今日" active={activeTab === 'home'} onClick={() => setActiveTab('home')} dark />
          <TabButton icon={Calendar} label="曆卡" active={activeTab === 'almanac'} onClick={() => setActiveTab('almanac')} dark />
          
          <div className="relative -top-3">
            <button 
              onClick={() => setIsRecordOpen(true)}
              className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center shadow-xl text-[#2C2623] border-2 border-white active:scale-90 transition-transform"
            >
              <Plus size={24} />
            </button>
          </div>

          <TabButton icon={BarChart2} label="洞察" active={activeTab === 'insight'} onClick={() => setActiveTab('insight')} dark />
          <TabButton icon={User} label="修身" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} dark />
        </nav>

        {/* Modals & Overlays */}
        <AnimatePresence>
          {isRecordOpen && (
            <RecordModal 
              onClose={() => setIsRecordOpen(false)} 
              onSubmit={handleRecord}
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading}
            />
          )}
          {showResult && latestRecord && (
            <ResultModal 
              record={latestRecord} 
              onClose={() => setShowResult(false)}
              totalRecords={records.length}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoginGate({ onLogin }: { onLogin: (profile: LoginProfile) => void }) {
  const [form, setForm] = useState<LoginProfile>({
    email: '',
    nickname: '',
    gender: '',
    age: ''
  });

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email || !form.nickname || !form.gender || !form.age) return;
    onLogin(form);
  };

  return (
    <div className="min-h-screen bg-[#EAE4D9] p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#FAF8F5] rounded-[2.5rem] p-8 md:p-10 shadow-card border border-[#EAE4D9]">
        <h1 className="text-3xl font-serif font-black text-[#2C2623] tracking-tighter mb-2">先登入再開始</h1>
        <p className="text-sm text-[#877B73] font-medium mb-8">不使用 Google，請填寫 Email、暱稱、性別、年齡。</p>
        <form onSubmit={submitLogin} className="space-y-5">
          <input className="w-full rounded-2xl border border-[#EAE4D9] bg-white px-4 py-3 text-[#2C2623] font-medium" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="w-full rounded-2xl border border-[#EAE4D9] bg-white px-4 py-3 text-[#2C2623] font-medium" type="text" placeholder="暱稱" required value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
          <select className="w-full rounded-2xl border border-[#EAE4D9] bg-white px-4 py-3 text-[#2C2623] font-medium" required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="" disabled>請選擇性別</option>
            <option value="不透露">不透露</option>
            <option value="女性">女性</option>
            <option value="男性">男性</option>
            <option value="非二元">非二元</option>
          </select>
          <input className="w-full rounded-2xl border border-[#EAE4D9] bg-white px-4 py-3 text-[#2C2623] font-medium" type="number" min={1} max={120} placeholder="年齡" required value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <button type="submit" className="w-full bg-[#2C2623] text-white py-3 rounded-2xl font-black tracking-[0.2em]">進入食緒曆</button>
        </form>
      </div>
    </div>
  );
}

function HomeView({ records }: { records: MealRecord[] }) {
  const latestType = records[0] ? MBEI_TYPES[records[0].mbeiCode] : MBEI_TYPES['MPLR'];
  const isUnlocked = records.length >= 10;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {/* Header */}
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[#877B73] text-sm md:text-base font-medium">今晚的胃，比你更誠實。</p>
          <div className="flex items-center">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#2C2623] tracking-tighter">今日食緒</h1>
            <div className="seal ml-4 scale-125">日常</div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Almanac Card */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-card border border-[#EAE4D9] space-y-6 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rotate-12 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="#2C2623"><path d="M50 0 L100 50 L50 100 L0 50 Z" /></svg>
            </div>
            <div className="grid grid-cols-2 gap-8 border-b border-[#F4EFE6] pb-8 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#4A6B5D]/10 rounded-full w-fit">
                  <span className="text-[#4A6B5D] text-xs font-black">宜</span>
                  <span className="text-[#2C2623] text-xs font-bold uppercase tracking-widest">溫水修復</span>
                </div>
                <p className="text-base font-bold leading-tight">清爽飲食、慢食、深呼吸</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#C04A3B]/10 rounded-full w-fit">
                  <span className="text-[#C04A3B] text-xs font-black">忌</span>
                  <span className="text-[#2C2623] text-xs font-bold uppercase tracking-widest">空腹咖啡</span>
                </div>
                <p className="text-base font-bold leading-tight">深夜熬夜、過度硬撐</p>
              </div>
            </div>
            <div className="pt-2 relative z-10">
              <h4 className="text-xs font-black text-[#877B73] uppercase tracking-[0.2em] mb-2">今日食緒摘要</h4>
              <p className="text-base text-[#2C2623] leading-relaxed font-serif italic">「微焦慮但可修復，目前的節奏適合暫停三分鐘，聽聽身體的聲音。」</p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* MBEI Type Shortcut */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-card border border-[#EAE4D9] h-full flex items-center relative overflow-hidden transition-all duration-700">
            <div className="paper-texture opacity-[0.02]" />
            {isUnlocked ? (
              <div className="flex gap-6 items-center w-full">
                <div className="w-24 h-24 bg-[#F4EFE6] rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-[#EAE4D9]/50 relative z-10 shrink-0">
                  {latestType.emoji}
                </div>
                <div className="flex-1 space-y-2 relative z-10">
                   <div className="space-y-1">
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-[#877B73] uppercase tracking-[0.3em]">已照見 · 型格</span>
                       <div className="bg-[#F4EFE6] px-3 py-0.5 rounded-full text-[10px] text-[#877B73] font-bold border border-[#EAE4D9]/50">{latestType.creature}</div>
                     </div>
                     <h3 className="font-serif font-black text-2xl text-[#2C2623] tracking-tighter">{latestType.code}｜{latestType.name}</h3>
                   </div>
                   <p className="text-sm text-[#2C2623] leading-relaxed italic border-l-4 border-[#D98A5B] pl-4">「{latestType.insight}」</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center py-6 text-center space-y-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-[#EAE4D9] flex items-center justify-center bg-[#F4EFE6]/30">
                    <span className="text-[#2C2623] font-serif font-black text-lg">{records.length} <span className="opacity-30">/</span> 10</span>
                  </div>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-4 border-[#C04A3B] rounded-full opacity-60" 
                  />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <h3 className="font-serif font-black text-[#2C2623] text-xl tracking-tighter">靈光凝練中...</h3>
                  <p className="text-xs text-[#877B73] leading-relaxed">
                    尚需 {10 - records.length} 次食緒紀錄，<br />
                    即可照見你的 <span className="text-[#C04A3B] font-black">MB EAT I (食緒型格)</span>。
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Quote Card */}
          <section className="bg-[#4A6B5D] text-white rounded-[2.5rem] p-10 h-full flex flex-col justify-center relative overflow-hidden border-8 border-[#FAF8F5]/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-16 -mb-16" />
            <p className="text-2xl md:text-3xl font-serif italic relative z-10 leading-relaxed font-black">
              「今天不是亂吃，只是身體在提醒你慢一點。<br className="hidden md:block" />先照顧胃，再整理情緒。」
            </p>
            <div className="flex items-center gap-4 mt-6 text-xs opacity-60 font-black tracking-[0.4em] uppercase">
              <div className="w-8 h-px bg-white/40" />
              <span>食緒曆 · 朱雀卷第十二</span>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          {/* Community Insight */}
          <section className="space-y-4 h-full flex flex-col">
            <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[#877B73]">
              <Zap size={18} className="text-[#D98A5B]" />
              群體微觀 · 趨勢
            </h3>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-card border border-[#EAE4D9] space-y-6 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-[#C04A3B] bg-[#C04A3B]/10 px-4 py-1.5 rounded-full border border-[#C04A3B]/20">報告週警訊</span>
                <span className="text-xs font-mono font-bold text-[#877B73]">熱度 +40%</span>
              </div>
              <p className="text-base text-[#2C2623] leading-relaxed font-medium">
                本週全體群眾中「空腹咖啡」紀錄異常上升 40%，焦慮標註同步增加。提醒大家補足水分。
              </p>
              <button className="text-xs font-black text-[#877B73] uppercase tracking-widest border-t border-[#F4EFE6] pt-4 flex items-center gap-2 hover:text-[#C04A3B] transition-colors">
                查看完整趨勢 <ChevronRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function AlmanacView({ records }: { records: MealRecord[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif font-black text-[#2C2623] tracking-tighter">食緒曆卡</h2>
          <p className="text-sm text-[#877B73] font-bold uppercase tracking-widest">PERSONAL CALENDAR ARCHIVE</p>
        </div>
        <div className="text-lg font-black text-[#2C2623] font-serif border-b-4 border-[#C04A3B]/40 pb-1">
           2026年 五月
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Calendar Placeholder */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-card border border-[#EAE4D9] relative overflow-hidden group">
            <div className="paper-texture opacity-[0.02] pointer-events-none" />
            <div className="grid grid-cols-7 gap-4 text-center">
              {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                <div key={d} className="text-xs text-[#877B73] font-black py-4 uppercase tracking-widest border-b border-[#F4EFE6]">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const hasRecord = day === 9 || day === 10;
                return (
                  <button key={i} className="group/day relative aspect-square flex items-center justify-center transition-all hover:bg-[#F4EFE6] rounded-2xl">
                    <span className={cn(
                      "text-sm font-bold transition-all", 
                      day === 10 ? "bg-[#2C2623] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform scale-110" : "text-[#2C2623]"
                    )}>
                      {day}
                    </span>
                    {hasRecord && (
                      <div className="absolute bottom-2 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4A6B5D] shadow-sm" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C04A3B] shadow-sm" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:block bg-[#F4EFE6] p-8 rounded-[2rem] border border-[#EAE4D9]/50 italic text-[#877B73] text-sm">
            本月尚有 22 天未凝練。紀錄是為了看見原本看不見的慣性。
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[#877B73]">
              <Calendar size={18} className="text-[#D98A5B]" />
              今日紀錄回顧
            </h3>
            <span className="text-[10px] font-bold text-[#877B73] bg-[#EAE4D9] px-2 py-0.5 rounded-full">TODAY</span>
          </div>
          
          <div className="space-y-4">
            {records.length > 0 ? (
              records.map(record => (
                <div key={record.id} className="bg-white rounded-3xl p-6 shadow-sm border border-[#EAE4D9] flex flex-col gap-4 group hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-[#F4EFE6] rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform shadow-inner border border-[#EAE4D9]/50">
                      {record.foodEmoji || '🥣'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-black text-base text-[#2C2623]">{record.mealType} · {record.time}</h4>
                        <span className="text-[10px] bg-[#2C2623] px-2 py-0.5 rounded text-white font-mono">{record.mbeiCode}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#877B73]">
                        <span className="text-[#4A6B5D]">餐後心情：{record.mood}</span>
                        <span className="text-[#EAE4D9] font-normal">|</span>
                        <span>{record.bodyFeeling}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-[#F4EFE6]">
                    <span className="text-[10px] font-black text-[#4A6B5D] bg-[#4A6B5D]/5 px-3 py-1 rounded-full border border-[#4A6B5D]/10 uppercase tracking-widest">宜：多補水 慢食</span>
                    <span className="text-[10px] font-black text-[#C04A3B] bg-[#C04A3B]/5 px-3 py-1 rounded-full border border-[#C04A3B]/10 uppercase tracking-widest">忌：深夜飲酒</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-[#EAE4D9] text-[#877B73] text-sm font-bold">
                今日尚無食緒紀錄。
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InsightView() {
  const [activeInsightTab, setActiveInsightTab] = useState('personal');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif font-black text-[#2C2623] tracking-tighter">食緒洞察</h2>
          <p className="text-sm text-[#877B73] font-bold uppercase tracking-widest">DIETARY INTROSPECTION & DATA</p>
        </div>
        <div className="flex bg-[#F4EFE6] p-1.5 rounded-2xl border border-[#EAE4D9]/50 shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setActiveInsightTab('personal')}
            className={cn("flex-1 md:w-32 px-4 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest", activeInsightTab === 'personal' ? "bg-white text-[#2C2623] shadow-md" : "text-[#877B73] hover:text-[#2C2623]")}
          >
            個人洞察
          </button>
          <button 
            onClick={() => setActiveInsightTab('group')}
            className={cn("flex-1 md:w-32 px-4 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest", activeInsightTab === 'group' ? "bg-white text-[#2C2623] shadow-md" : "text-[#877B73] hover:text-[#2C2623]")}
          >
            群體共響
          </button>
        </div>
      </header>

      {activeInsightTab === 'personal' ? (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-8 flex flex-col">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-card border border-[#EAE4D9] space-y-8 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="paper-texture opacity-[0.02]" />
              <div className="space-y-2 relative z-10">
                <h4 className="text-xs font-black text-[#877B73] uppercase tracking-[0.3em]">本週最常出現型格</h4>
                <div className="flex items-center gap-4">
                  <div className="text-5xl bg-[#F4EFE6] w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner border border-[#EAE4D9]/50">🦊</div>
                  <div>
                    <span className="text-[10px] font-mono bg-[#2C2623] text-white px-2 py-0.5 rounded mb-1 inline-block">MPLR</span>
                    <h3 className="font-serif font-black text-2xl text-[#2C2623] tracking-tighter">續命九尾型</h3>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <InsightMetric icon={Zap} label="最常觸發情境" value="報告週 / 趕工" />
                <InsightMetric icon={Coffee} label="情緒修復出口" value="高糖甜點 / 拿鐵" />
              </div>

              <div className="relative z-10 pt-4 border-t border-[#F4EFE6]">
                <p className="text-base text-[#2C2623] leading-relaxed italic font-serif">
                  「你的食緒顯示出一種『補償性進食』的傾向。並非真的飢餓，而是大腦在尋求高熱量來抵銷壓力造成的荷爾蒙失衡。」
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-card border border-[#EAE4D9] flex flex-col h-full">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#877B73]">情緒與進食關聯度分析</h4>
                <span className="text-[10px] font-bold text-[#4A6B5D] bg-[#4A6B5D]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">穩定關聯</span>
              </div>
              <div className="flex-1 h-64 flex items-end justify-between px-6 pb-4 border-b border-[#F4EFE6]">
                <Bar height="30%" label="一" />
                <Bar height="60%" label="二" />
                <Bar height="90%" label="三" active />
                <Bar height="40%" label="四" />
                <Bar height="50%" label="五" />
                <Bar height="20%" label="六" />
                <Bar height="15%" label="日" />
              </div>
              <div className="mt-6 p-4 bg-[#F4EFE6]/50 rounded-2xl border border-[#EAE4D9]/50">
                 <p className="text-xs text-[#877B73] font-bold leading-relaxed">
                   💡 指導：週三的進食與情緒波動最高，建議在當日增加 500ml 飲水量，並提早 30 分鐘就寢，觀察情緒是否趨於平穩。
                 </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GroupCard 
            title="報告週咖啡警訊" 
            content="本週全體用戶「空腹咖啡」頻次較上週上升 40%，且多伴隨「心悸」與「趕工」情境。社群總焦慮感上升 12%。" 
            trend="上升"
          />
          <GroupCard 
            title="週一低潮效應" 
            content="週一早晨 10:00 前，高達 65% 的用戶標註了「煩躁」心情，早餐多選擇「精緻加工碳水」，修補週一不適感。" 
            trend="穩定"
          />
          <GroupCard 
            title="深夜孤獨進食" 
            content="深夜 23:00 後的進食紀錄中，80% 的用戶標註了「獨處」，且飯後心情多為「空虛」，加工食品比例高達 75%。" 
            trend="下降"
          />
          <div className="bg-[#2C2623] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-4 border-4 border-white shadow-2xl">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white">
                <Info size={32} />
             </div>
             <h4 className="text-white font-serif font-black text-lg tracking-tighter">加入群體研究</h4>
             <p className="text-white/60 text-xs leading-relaxed">貢獻你的去識別化數據，<br />幫助我們更了解華人社會的食緒變遷。</p>
             <button className="bg-white text-[#2C2623] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mt-2 hover:scale-105 transition-transform">參與計畫</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}


       function ProfileView({ records, loginProfile }: { records: MealRecord[]; loginProfile: LoginProfile }) {
  const latestType = records[0] ? MBEI_TYPES[records[0].mbeiCode] : MBEI_TYPES['MPLR'];
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [rankTab, setRankTab] = useState<'personal' | 'mbei'>('personal');
  const personalRecordCount = records.length;

  const personalLeaderboard = useMemo(() => {
    const seed = LEADERBOARD_DATA.slice(0, 5).map((u, i) => ({
      ...u,
      points: Math.max(3, 18 - i * 3),
      scoreLabel: '紀錄次數'
    }));
    const userRow = {
      rank: 0,
      name: loginProfile.nickname,
      points: personalRecordCount,
      emoji: latestType.emoji,
      isUser: true,
      scoreLabel: '紀錄次數'
    };
    const merged = [...seed, userRow].sort((a, b) => b.points - a.points).map((u, idx) => ({ ...u, rank: idx + 1 }));
    return merged;
  }, [loginProfile.nickname, personalRecordCount, latestType.emoji]);

  const mbeiLeaderboard = useMemo(() => {
    const scoreBase = 96;
    const scoreStep = 3;
    return Object.values(MBEI_TYPES)
      .map((type, idx) => ({
        name: `${type.code}｜${type.name}`,
        points: Math.max(15, scoreBase - idx * scoreStep),
        emoji: type.emoji,
        code: type.code,
        scoreLabel: `${type.code} 群體分`
      }))
      .sort((a, b) => b.points - a.points)
      .map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <header className="bg-white rounded-[3rem] p-10 shadow-card border border-[#EAE4D9] flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="paper-texture opacity-[0.02] pointer-events-none" />
            <div className="w-40 h-40 bg-white rounded-full p-3 border-4 border-[#F4EFE6] shadow-2xl relative group">
               <div className="w-full h-full bg-[#FAF8F5] rounded-full flex items-center justify-center text-6xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                 {latestType.emoji}
               </div>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#C04A3B] text-white text-[10px] px-4 py-1 rounded-full font-black tracking-widest border-4 border-white shadow-lg whitespace-nowrap">
                  九尾修行中
               </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-black text-[#2C2623] tracking-tighter">今日食修者</h2>
              <div className="inline-block px-4 py-1 bg-[#F4EFE6] rounded-full text-xs font-bold text-[#877B73] border border-[#EAE4D9]/50 uppercase tracking-widest">
                {latestType.name}
              </div>
              <p className="text-sm text-[#877B73] font-medium mt-2">
                {loginProfile.nickname} · {loginProfile.gender} · {loginProfile.age} 歲
              </p>
              <p className="text-xs text-[#877B73]">{loginProfile.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full bg-[#2C2623] text-white py-3 rounded-2xl font-black tracking-[0.15em] hover:opacity-90 transition-opacity"
            >
              切換使用者 / 登出
            </button>
            <div className="w-full pt-6 mt-6 border-t border-[#F4EFE6] grid grid-cols-2 gap-4">
              <div className="text-center">
                 <p className="text-[10px] font-black text-[#877B73] uppercase tracking-widest mb-1">累積功德</p>
                 <p className="text-xl font-serif font-black text-[#2C2623]">1,280</p>
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-[#877B73] uppercase tracking-widest mb-1">連續紀錄</p>
                 <p className="text-xl font-serif font-black text-[#2C2623]">12 <span className="text-xs">天</span></p>
              </div>
            </div>
          </header>

          <section className="bg-[#2C2623] text-white rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden shadow-2xl border-4 border-white">
            <div className="paper-texture opacity-[0.1] pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">當前進度</h3>
              <p className="text-xl font-serif font-black tracking-tighter">照見真我尚需 8 步</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full relative overflow-hidden z-10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "20%" }}
                 className="absolute inset-y-0 left-0 bg-[#C04A3B]" 
               />
            </div>
            <button 
              onClick={() => setShowEncyclopedia(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl flex justify-between items-center font-black text-xs uppercase tracking-widest transition-all z-10 relative group"
            >
              <span>16 型山海經圖鑑</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[#877B73]">
                <Award size={20} className="text-[#D98A5B]" />
                成就勳章寶庫
              </h3>
              <span className="text-[10px] font-bold text-[#877B73] underline cursor-pointer">查看所有 24 個</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <BadgeBox label="誠實紀錄者" emoji="✍️" enabled date="2024.05.01" />
              <BadgeBox label="補水修行者" emoji="💧" enabled date="2024.05.03" />
              <BadgeBox label="咖啡續命師" emoji="☕" enabled date="2024.05.08" />
              <BadgeBox label="半夜觀察員" emoji="🌙" date="鎖定中" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                 <Award size={22} className="text-[#C04A3B]" />
                 <h3 className="text-2xl font-serif font-black tracking-tighter text-[#2C2623]">食修功德排行榜</h3>
               </div>
               <span className="text-[10px] font-black text-[#877B73] uppercase tracking-widest opacity-60">更新於 5 分鐘前</span>
            </div>
            <div className="px-2">
              <div className="inline-flex bg-[#F4EFE6] p-1.5 rounded-2xl border border-[#EAE4D9]/50 shadow-inner w-full md:w-auto">
                <button onClick={() => setRankTab('personal')} className={cn("px-4 py-2 rounded-xl text-xs font-black tracking-widest", rankTab === 'personal' ? "bg-white text-[#2C2623] shadow-sm" : "text-[#877B73]")}>個人榜單 RANK</button>
                <button onClick={() => setRankTab('mbei')} className={cn("px-4 py-2 rounded-xl text-xs font-black tracking-widest", rankTab === 'mbei' ? "bg-white text-[#2C2623] shadow-sm" : "text-[#877B73]")}>16型種類榜單 RANK</button>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border-4 border-[#2C2623] overflow-hidden shadow-2xl relative group">
              <div className="paper-texture opacity-[0.02] pointer-events-none" />
              {(rankTab === 'personal' ? personalLeaderboard : mbeiLeaderboard).map((user) => (
                <div 
                  key={user.rank} 
                  className={cn(
                    "flex items-center justify-between p-6 md:p-8 border-b border-[#F4EFE6] last:border-0 transition-colors",
                    user.isUser ? "bg-[#C04A3B]/10 hover:bg-[#C04A3B]/15" : "hover:bg-[#F4EFE6]/30"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <span className={cn(
                      "w-8 text-center font-serif font-black text-lg md:text-xl",
                      user.rank === 1 ? "text-[#D98A5B]" : 
                      user.rank === 2 ? "text-[#877B73]" : 
                      user.rank === 3 ? "text-[#C04A3B]" : "text-[#EAE4D9]"
                    )}>
                      {user.rank}
                    </span>
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl border border-[#EAE4D9]/50 shadow-sm relative group-hover:scale-110 transition-transform">
                      {user.emoji}
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#2C2623] flex items-center gap-2">
                        {user.name} 
                        {rankTab === 'personal' && user.isUser && <span className="text-[10px] bg-[#2C2623] text-white px-3 py-0.5 rounded-full uppercase tracking-tighter font-black">這是你</span>}
                      </p>
                      <p className="text-xs text-[#877B73] font-bold uppercase tracking-widest">
                        {rankTab === 'personal' ? '依暱稱統計 · 紀錄總次數' : `MBEATI ${latestType.code} 群體排名`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-serif font-black text-[#2C2623]">{user.points}</p>
                    <p className="text-[10px] font-black text-[#877B73] uppercase tracking-widest">{user.scoreLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Encyclopedia Modal */}
      <AnimatePresence>
        {showEncyclopedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowEncyclopedia(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-[90vh] bg-[#FAF8F5] md:rounded-[4rem] relative z-10 flex flex-col overflow-hidden border-8 border-[#2C2623] shadow-inner"
            >
              <div className="paper-texture opacity-[0.03] grayscale pointer-events-none" />
              <div className="p-8 md:p-12 flex justify-between items-center border-b border-[#EAE4D9] shrink-0 bg-white/50 backdrop-blur-md relative z-10">
                <div className="space-y-1">
                   <h3 className="text-3xl font-serif font-black text-[#2C2623]">MBEI 山海經圖鑑</h3>
                   <p className="text-[10px] font-black text-[#877B73] uppercase tracking-[0.4em]">ENCYCLOPEDIA OF DIETARY SPIRITS</p>
                </div>
                <button onClick={() => setShowEncyclopedia(false)} className="w-12 h-12 flex items-center justify-center bg-[#2C2623] text-white rounded-full hover:scale-110 active:scale-90 transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 md:p-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 scrollbar-hide">
                {Object.values(MBEI_TYPES).map(type => (
                  <div key={type.code} className="bg-white p-8 rounded-[2.5rem] border-2 border-[#F4EFE6] flex flex-col gap-6 hover:border-[#2C2623]/20 transition-all group shadow-sm hover:shadow-xl">
                    <div className="text-6xl bg-[#FAF8F5] w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner border border-[#EAE4D9]/50 group-hover:scale-110 transition-transform">
                      {type.emoji}
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-[#2C2623] text-white px-2 py-0.5 rounded uppercase">{type.code}</span>
                          <span className="text-[10px] font-black text-[#877B73] uppercase tracking-widest">{type.creature}</span>
                        </div>
                        <h4 className="font-serif font-black text-2xl text-[#2C2623] tracking-tighter">{type.name}</h4>
                      </div>
                      <p className="text-xs font-bold text-[#877B73] leading-relaxed">{type.description}</p>
                      <div className="h-px bg-[#F4EFE6] w-full" />
                      <p className="text-sm font-serif italic leading-relaxed text-[#2C2623] border-l-4 border-[#D98A5B] pl-4 py-1">「{type.insight}」</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Components ---

function SidebarButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group",
        active ? "bg-[#2C2623] text-white shadow-lg" : "text-[#877B73] hover:bg-[#F4EFE6] hover:text-[#2C2623]"
      )}
    >
      <Icon size={22} className={cn("transition-transform group-hover:scale-110", active ? "text-[#C04A3B]" : "")} />
      <span className="font-bold tracking-tight">{label}</span>
      {active && (
        <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 bg-[#C04A3B] rounded-full" />
      )}
    </button>
  );
}

function TabButton({ icon: Icon, label, active, onClick, dark }: { icon: any, label: string, active: boolean, onClick: () => void, dark?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 transition-all">
      <Icon size={20} className={active ? "text-[#C04A3B]" : (dark ? "text-white/60" : "text-[#877B73]")} />
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", active ? "text-[#C04A3B]" : (dark ? "text-white/40" : "text-[#877B73]"))}>{label}</span>
    </button>
  );
}

function InsightMetric({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-[#877B73]">
        <Icon size={12} />
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function Bar({ height, label, active }: { height: string, label: string, active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={cn("w-3 rounded-full transition-all duration-700", active ? "bg-[#C04A3B]" : "bg-[#EAE4D9]")} 
        style={{ height }} 
      />
      <span className="text-[10px] text-[#877B73]">{label}</span>
    </div>
  );
}

function GroupCard({ title, content, trend }: { title: string, content: string, trend: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EAE4D9] space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold">{title}</h4>
        <span className={cn("text-[10px] font-mono", trend === '上升' ? "text-[#C04A3B]" : "text-[#4A6B5D]")}>{trend}</span>
      </div>
      <p className="text-xs text-[#2C2623] leading-relaxed opacity-80">{content}</p>
    </div>
  );
}

function BadgeBox({ label, emoji, enabled, date }: { label: string, emoji: string, enabled?: boolean, date?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-[#EAE4D9] flex flex-col items-center gap-4 shadow-sm group hover:scale-105 transition-all duration-300 relative overflow-hidden">
      <div className={cn(
        "w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner border-2 transition-all",
        enabled ? "bg-[#F4EFE6] border-[#EAE4D9] grayscale-0" : "bg-gray-50 border-gray-100 grayscale opacity-40"
      )}>
        {emoji}
      </div>
      <div className="text-center space-y-1">
        <span className="text-[11px] font-black tracking-tight text-[#2C2623] block">{label}</span>
        {date && <span className="text-[9px] font-bold text-[#877B73] uppercase tracking-widest">{date}</span>}
      </div>
      {enabled && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-[#C04A3B] rounded-full animate-pulse" />
      )}
    </div>
  );
}

function RecordModal({ onClose, onSubmit, formData, setFormData, isLoading }: any) {
  const setField = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center overflow-hidden p-0 md:p-12"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full md:max-w-5xl h-[94vh] md:h-auto md:max-h-[90vh] bg-[#FAF8F5] rounded-t-[3rem] md:rounded-[4rem] relative z-10 flex flex-col shadow-2xl border-t-8 md:border-8 border-[#2C2623] overflow-hidden"
      >
        <div className="paper-texture opacity-[0.03] grayscale pointer-events-none" />
        
        <div className="p-8 md:p-12 flex justify-between items-center border-b border-[#EAE4D9] shrink-0 bg-white/50 backdrop-blur-md relative z-10">
          <div className="space-y-1">
            <h3 className="text-3xl font-serif font-black tracking-tighter text-[#2C2623]">凝練食緒</h3>
            <p className="text-[10px] font-black text-[#877B73] uppercase tracking-[0.3em]">CRAFTING DIETARY SPIRIT</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-[#2C2623] text-white rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12 pb-64 md:pb-52 scrollbar-hide relative z-10">
          <RecordSection title="這一餐吃了什麼？">
            <input
              type="text"
              className="w-full rounded-[1.5rem] border-2 border-[#EAE4D9] bg-white px-6 py-4 text-lg font-semibold text-[#2C2623] placeholder:text-[#B0A7A1] focus:outline-none focus:border-[#2C2623]/30"
              placeholder="例如：牛肉麵、拿鐵、雞肉沙拉"
              value={formData.foodEmoji}
              onChange={(e) => setField('foodEmoji', e.target.value)}
              required
            />
          </RecordSection>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <RecordSection title="餐別 · 週期">
              <PillSelector 
                options={['早餐', '午餐', '晚餐', '宵夜', '點心']} 
                value={formData.mealType} 
                onChange={(v) => setField('mealType', v)} 
              />
            </RecordSection>

            <RecordSection title="食物類型 · 質地">
              <PillSelector 
                options={[
                  { label: '原型食物', value: 'natural' }, 
                  { label: '加工食品', value: 'processed' },
                  { label: '混合/外食', value: 'mixed' }
                ]} 
                value={formData.foodType} 
                onChange={(v) => setField('foodType', v)} 
              />
            </RecordSection>
          </div>

          <div className="space-y-12 py-10 bg-[#F4EFE6]/30 rounded-[3rem] px-8 md:px-12 border border-[#EAE4D9]/50 shadow-inner">
            <RecordSection title="吃完這一餐後，你現在的心情是？">
              <PillSelector
                options={['被安撫', '有精神', '平靜', '滿足', '後悔', '空虛', '焦慮', '煩躁']}
                value={formData.mood}
                onChange={(v) => setField('mood', v)}
              />
            </RecordSection>
          </div>

          <div className="grid md:grid-cols-1 gap-12 lg:gap-20">
            <RecordSection title="身體感受 · 反饋">
              <IconGrid 
                options={[...BODY_FEELING_OPTIONS, { label: '其他', emoji: '✍️' }]} 
                value={formData.bodyFeeling} 
                onChange={(v) => setField('bodyFeeling', v)} 
              />
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-[#877B73]">其他補充（選「其他」時可填寫）</p>
                <textarea
                  className="w-full rounded-2xl border border-[#EAE4D9] bg-white px-4 py-3 text-[#2C2623] font-medium min-h-24 disabled:bg-[#F4EFE6] disabled:text-[#B0A7A1]"
                  placeholder="請描述你的身體感受..."
                  value={formData.bodyFeelingOther}
                  disabled={formData.bodyFeeling !== '其他'}
                  onChange={(e) => setField('bodyFeelingOther', e.target.value)}
                />
              </div>
            </RecordSection>
          </div>
        </div>

        <div className="p-6 md:p-12 bg-white/70 backdrop-blur-xl absolute bottom-0 left-0 right-0 border-t-2 border-[#EAE4D9] z-20 flex justify-center">
          <div className="max-w-md w-full">
            <button 
              onClick={onSubmit}
              disabled={isLoading || !formData.foodEmoji.trim()}
              className="w-full bg-[#2C2623] text-white py-5 md:py-7 rounded-[2rem] font-black text-xl md:text-2xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 paper-texture opacity-[0.2] pointer-events-none" />
              {isLoading ? (
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="text-3xl"
                >
                  ☯
                </motion.div>
              ) : (
                <span className="tracking-[0.4em]">開始凝練</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RecordSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold flex items-center gap-2">
        <span className="w-1.5 h-4 bg-[#C04A3B] rounded-full" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function PillSelector({ options, value, onChange }: { options: any[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const val = typeof opt === 'string' ? opt : opt.value;
        const active = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold border transition-all",
              active ? "bg-[#2C2623] text-white border-[#2C2623]" : "bg-white text-[#877B73] border-[#EAE4D9]"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function IconGrid({ options, value, onChange }: { options: any[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(opt => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.label)}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
            value === opt.label ? "bg-[#2C2623] text-white border-[#2C2623] shadow-md" : "bg-white text-[#877B73] border-[#EAE4D9]"
          )}
        >
          <span className="text-2xl">{opt.emoji}</span>
          <span className="text-[10px] font-bold tracking-tighter line-clamp-1">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function ResultModal({ record, onClose, totalRecords }: { record: MealRecord, onClose: () => void, totalRecords: number }) {
  const type = MBEI_TYPES[record.mbeiCode];
  const isUnlocked = totalRecords >= 10;

  const fortune = useMemo(() => {
    if (record.fortune) return record.fortune;
    
    // Fallback logic
    // 1. Heavy Warning (Food type mixed/processed + Heavy body feeling)
    if ((record.foodType !== 'natural') && (record.bodyFeeling === '心悸' || record.bodyFeeling === '胃脹' || record.bodyFeeling === '想睡')) {
       return FORTUNES[4]; // f5: 燥火上升
    }
    // 2. Processed Food Warning
    if (record.foodType === 'processed') {
      return FORTUNES[0]; // f1: 業障初現
    }
    // 3. Emotional Eating Warning
    if (record.mood === '被安撫') {
      return FORTUNES[2]; // f3: 情執深重
    }
    // 4. Emotional Emptiness Warning
    if (record.mood === '空虛') {
      return FORTUNES[6]; // f7: 陰霾未散
    }
    // 5. Perfect Balance Blessing
    if (record.foodType === 'natural' && record.mood === '平靜' && record.bodyFeeling === '清爽') {
      return FORTUNES[1]; // f2: 法脈圓通
    }
    // 6. Good Rhythm Blessing
    if (record.context === '獨處' || record.context === '聚餐') {
       if (record.bodyFeeling === '清爽' || record.bodyFeeling === '飽足') return FORTUNES[5]; // f6: 氣形合一
       return FORTUNES[3]; // f4: 天時有序
    }
    // 7. Complexity/Stress Warning
    if (['趕工', '報告週', '失眠後'].includes(record.context)) {
      return FORTUNES[7]; // f8: 繁瑣過境
    }
    
    return FORTUNES[3]; // Default to f4: 天時有序
  }, [record]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      {!isUnlocked ? (
        <FortuneSlip fortune={fortune} onClose={onClose} />
      ) : (
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="w-full max-w-lg md:max-w-xl bg-white rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col border-2 border-[#EAE4D9]"
        >
          <div className="paper-texture opacity-[0.05]" />
          
          {/* Card Header Illustration */}
          <div className="bg-[#FAF8F5] pt-16 pb-8 flex flex-col items-center gap-6 relative shrink-0">
            <div className="absolute top-8 left-8 flex flex-col items-start gap-1">
               <span className="text-xs font-mono opacity-50">{record.date}</span>
               <div className="seal text-sm">今日食緒</div>
            </div>
            <div className="absolute top-8 right-8">
               <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md border border-[#EAE4D9] hover:bg-[#FAF8F5] transition-colors">
                 <X size={18} />
               </button>
            </div>
            <div className="w-40 h-40 md:w-48 md:h-48 bg-white rounded-full flex items-center justify-center text-7xl md:text-8xl shadow-2xl border-4 border-[#FAF8F5]">
              {type.emoji}
            </div>
            <div className="text-center space-y-2 px-6">
              <p className="text-xs font-black text-[#877B73] uppercase tracking-[0.4em]">{record.mbeiCode}</p>
              <h3 className="text-3xl md:text-4xl font-serif font-black text-[#2C2623] tracking-tighter">{type.name}</h3>
              <span className="bg-[#F4EFE6] px-3 py-1 rounded-full text-xs text-[#877B73] font-bold border border-[#EAE4D9]/50">{type.creature}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex-1 p-10 pt-4 space-y-8 relative z-10 overflow-y-auto scrollbar-hide">
            <div className="space-y-6">
               <div className="flex items-center gap-4 justify-center text-xs font-black text-[#877B73]/60 uppercase tracking-widest">
                  <span className="text-[#4A6B5D]">餐後心情：{record.mood}</span>
                  <ChevronRight size={12} />
                  <span className="text-[#C04A3B]">{record.bodyFeeling}</span>
               </div>

               <div className="bg-[#F4EFE6] p-8 rounded-[2rem] border border-[#EAE4D9] space-y-6 shadow-inner">
                  <div className="flex gap-8">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-3 bg-[#4A6B5D] rounded-full" />
                        <span className="text-[11px] font-black text-[#4A6B5D] uppercase tracking-[0.2em]">宜行</span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed text-[#2C2623]">補水、慢食、靜心、深呼吸</p>
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-3 bg-[#C04A3B] rounded-full" />
                         <span className="text-[11px] font-black text-[#C04A3B] uppercase tracking-[0.2em]">忌諱</span>
                       </div>
                       <p className="text-sm font-bold leading-relaxed text-[#2C2623]">過量糖分、空腹咖啡、久坐不動</p>
                    </div>
                  </div>
                  <div className="h-px bg-[#EAE4D9] w-full opacity-50" />
                  <p className="text-base md:text-lg font-serif italic leading-relaxed text-[#2C2623] border-l-4 border-[#D98A5B] pl-6 py-1">
                    「{type.insight}」
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-[#EAE4D9] shadow-sm">
                  <Award size={20} className="text-[#D98A5B]" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#877B73]">成就解鎖：誠實記錄者</span>
               </div>
               <button 
                 onClick={onClose}
                 className="w-full py-6 text-[#2C2623] font-black text-xs tracking-[0.4em] uppercase hover:opacity-100 opacity-60 transition-opacity"
               >
                 收納食緒曆卡
               </button>
            </div>
          </div>
          
          <div className="h-3 w-full bg-[#C04A3B] shrink-0" />
        </motion.div>
      )}
    </motion.div>
  );
}

function FortuneSlip({ fortune, onClose }: { fortune: Fortune, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ scale: 0.9, y: 50, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 50, opacity: 0 }}
      className="w-full max-w-[320px] md:max-w-[400px] max-h-[88vh] bg-[#9e2a2b] shadow-2xl relative flex flex-col p-px overflow-hidden rounded-sm"
    >
      {/* Texture */}
      <div className="absolute inset-0 paper-texture opacity-30 mix-blend-overlay pointer-events-none" />
      
      {/* Inner Border */}
      <div className="border border-white/20 m-3 md:m-4 p-4 md:p-6 flex flex-col items-center space-y-6 md:space-y-8 relative z-10 min-h-[460px] md:min-h-[500px] overflow-y-auto">
        {/* Top Header */}
        <div className="w-full h-px bg-white/30" />
        
        {/* Title - Vertical-ish but readable */}
        <h3 className="text-white font-serif text-2xl md:text-3xl font-black [writing-mode:vertical-rl] tracking-[0.25em] md:tracking-[0.4em] mb-2 md:mb-4 break-all max-h-[38vh] overflow-hidden">
          {fortune.title}
        </h3>
        
        <div className="w-full h-px bg-white/30" />

        {/* Verse - Vertical and elegant */}
        <div className="flex gap-2 md:gap-4 justify-center items-stretch flex-1 min-h-[180px] md:min-h-[220px] overflow-hidden">
          {fortune.verse.map((line, idx) => (
            <div key={idx} className="[writing-mode:vertical-rl] text-white/90 font-serif text-base md:text-lg tracking-[0.15em] md:tracking-[0.3em] leading-loose break-all max-h-[32vh] overflow-hidden">
              {line}
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-white/30" />

        {/* Advice/Result */}
        <div className="space-y-2 text-center w-full max-h-[20vh] overflow-y-auto px-1">
          {fortune.advice.map((adv, idx) => (
            <p key={idx} className="text-[11px] md:text-xs text-white/80 font-serif last:opacity-60 break-words leading-relaxed">{adv}</p>
          ))}
        </div>

        <div className="w-full h-px bg-white/30" />

        <button 
          onClick={onClose}
          className="text-white/60 font-serif text-sm tracking-widest hover:text-white transition-colors pt-2"
        >
          點擊收起
        </button>
      </div>
    </motion.div>
  );
}
