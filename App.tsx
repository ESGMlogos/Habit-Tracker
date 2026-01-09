import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Calendar, BrainCircuit, Menu } from 'lucide-react';
import { Habit, HabitLogs } from './types';
import { APP_TITLE, TARGET_DAYS, formatDate } from './constants';
import { HabitCard } from './components/HabitCard';
import { Stats } from './components/Stats';
import { AICoach } from './components/AICoach';
import { HabitModal } from './components/HabitModal';

// --- Local Storage Helpers ---
const STORAGE_KEYS = {
  HABITS: '900days_habits',
  LOGS: '900days_logs',
  START_DATE: '900days_start'
};

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogs>({});
  const [view, setView] = useState<'tracker' | 'dashboard' | 'coach'>('tracker');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  
  // Date Navigation (Tracker View)
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  // --- Initialization ---
  useEffect(() => {
    const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const storedStart = localStorage.getItem(STORAGE_KEYS.START_DATE);

    if (storedHabits) setHabits(JSON.parse(storedHabits));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    
    if (storedStart) {
      setStartDate(storedStart);
    } else {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.START_DATE, now);
      setStartDate(now);
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  // --- Actions ---
  const toggleHabit = (habitId: string, date: string) => {
    setLogs(prev => {
      const habitLogs = prev[habitId] || [];
      const newHabitLogs = habitLogs.includes(date)
        ? habitLogs.filter(d => d !== date)
        : [...habitLogs, date];
      
      return { ...prev, [habitId]: newHabitLogs };
    });
  };

  const addHabit = (habit: Habit) => {
    setHabits(prev => [...prev, habit]);
  };
  
  const addMultipleHabits = (newHabits: Habit[]) => {
      setHabits(prev => [...prev, ...newHabits]);
  };

  // --- Derived State for Header ---
  const daysSinceStart = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const progress = Math.min((daysSinceStart / TARGET_DAYS) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center md:items-stretch py-6 shrink-0 z-40">
        <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                9
            </div>
            <span className="text-xl font-bold tracking-tight hidden lg:block">{APP_TITLE}</span>
        </div>

        <div className="flex-1 flex md:flex-col gap-2 px-3 w-full justify-around md:justify-start">
          <NavButton 
            active={view === 'tracker'} 
            onClick={() => setView('tracker')} 
            icon={<Calendar size={20} />} 
            label="Tracker" 
          />
          <NavButton 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={view === 'coach'} 
            onClick={() => setView('coach')} 
            icon={<BrainCircuit size={20} />} 
            label="AI Coach" 
          />
        </div>

        <div className="p-6 hidden lg:block">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs font-bold uppercase mb-2">Challenge Progress</p>
                <div className="flex justify-between items-end mb-1">
                    <span className="text-2xl font-bold text-white">{daysSinceStart}</span>
                    <span className="text-sm text-slate-500">/ {TARGET_DAYS} days</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-emerald-500 h-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        <header className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-30 px-6 py-4 flex justify-between items-center border-b border-slate-800/50">
           <div>
               <h1 className="text-2xl font-bold capitalize">{view}</h1>
               <p className="text-slate-400 text-sm">
                   {view === 'tracker' ? formatDate(new Date(selectedDate)) : 'Overview'}
               </p>
           </div>
           
           {view === 'tracker' && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
             >
                <Plus size={18} />
                <span className="hidden sm:inline">New Habit</span>
             </button>
           )}
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
            
            {/* VIEW: TRACKER */}
            {view === 'tracker' && (
                <div className="space-y-6">
                    {/* Date Navigation (Simple Previous/Next for prototype) */}
                    <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-slate-800 w-fit">
                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(formatDate(d));
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            ← Prev
                        </button>
                        <span className="font-mono font-semibold text-emerald-400 min-w-[100px] text-center">
                            {selectedDate === formatDate(new Date()) ? 'Today' : selectedDate}
                        </span>
                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(formatDate(d));
                            }}
                            disabled={selectedDate === formatDate(new Date())}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            Next →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {habits.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                <p className="text-slate-500 mb-4">No habits defined yet.</p>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-emerald-400 hover:underline"
                                >
                                    Create your first habit
                                </button>
                            </div>
                        ) : (
                            habits.filter(h => !h.archived).map(habit => (
                                <HabitCard 
                                    key={habit.id} 
                                    habit={habit} 
                                    logs={logs[habit.id] || []} 
                                    onToggle={toggleHabit}
                                    selectedDate={selectedDate}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: DASHBOARD */}
            {view === 'dashboard' && (
                <Stats habits={habits} logs={logs} />
            )}

            {/* VIEW: AI COACH */}
            {view === 'coach' && (
                <div className="h-[calc(100vh-140px)]">
                    <AICoach habits={habits} logs={logs} onAddHabits={addMultipleHabits} />
                </div>
            )}

        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <HabitModal onClose={() => setIsModalOpen(false)} onSave={addHabit} />
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-3 p-3 rounded-xl transition-all w-full lg:w-auto
            ${active 
                ? 'bg-slate-800 text-white shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }
        `}
    >
        {icon}
        <span className="hidden lg:block font-medium">{label}</span>
    </button>
);

export default App;
