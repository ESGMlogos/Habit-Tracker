import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Calendar, Target, Menu, Column } from 'lucide-react';
import { Habit, HabitLogs } from './types';
import { APP_TITLE, TARGET_DAYS, formatDate } from './constants';
import { HabitCard } from './components/HabitCard';
import { Stats } from './components/Stats';
import { HabitModal } from './components/HabitModal';
import { CircularFocus } from './components/CircularFocus';

// --- Local Storage Helpers ---
const STORAGE_KEYS = {
  HABITS: '900days_habits',
  LOGS: '900days_logs',
  START_DATE: '900days_start'
};

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogs>({});
  const [view, setView] = useState<'tracker' | 'dashboard' | 'focus'>('tracker');
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

  // --- Derived State for Header ---
  const daysSinceStart = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const progress = Math.min((daysSinceStart / TARGET_DAYS) * 100, 100);

  const getPageTitle = () => {
      switch(view) {
          case 'tracker': return 'Daily Practice';
          case 'dashboard': return 'Analytics';
          case 'focus': return 'Momentum';
          default: return '';
      }
  };

  const getPageSubtitle = () => {
      switch(view) {
          case 'tracker': return formatDate(new Date(selectedDate));
          case 'dashboard': return 'Know Thyself';
          case 'focus': return 'The Obstacle Is The Way';
          default: return '';
      }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-stone-800 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Navigation - Designed like a stone column */}
      <nav className="w-full md:w-24 lg:w-72 bg-[#F5F5F0] border-r border-[#E7E5E4] flex flex-col items-center md:items-stretch py-8 shrink-0 z-40 shadow-[inset_-1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="px-6 mb-10 flex flex-col items-center lg:items-start">
             {/* Classical Title */}
            <span className="text-3xl font-display font-black tracking-widest text-[#44403C] hidden lg:block border-b-2 border-[#b45309] pb-2">
                {APP_TITLE}
            </span>
            <span className="text-2xl font-display font-black tracking-tighter text-[#44403C] lg:hidden md:hidden">
                IX
            </span>
            <span className="hidden lg:block text-xs uppercase tracking-[0.2em] text-[#78716c] mt-1 font-sans">
                Academia
            </span>
        </div>

        <div className="flex-1 flex md:flex-col gap-4 px-4 w-full justify-around md:justify-start">
          <NavButton 
            active={view === 'tracker'} 
            onClick={() => setView('tracker')} 
            icon={<Calendar size={20} />} 
            label="Journal" 
          />
          <NavButton 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="Symposium" 
          />
          <NavButton 
            active={view === 'focus'} 
            onClick={() => setView('focus')} 
            icon={<Target size={20} />} 
            label="Focus" 
          />
        </div>

        <div className="p-6 hidden lg:block mt-auto">
            <div className="bg-[#E7E5E4]/50 rounded-sm p-5 border border-[#D6D3D1]">
                <p className="text-[#57534E] text-[10px] font-bold uppercase tracking-widest mb-3 font-display">Arete Progress</p>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-display font-bold text-[#292524]">{daysSinceStart}</span>
                    <span className="text-xs text-[#78716c] font-serif italic">/ {TARGET_DAYS} days</span>
                </div>
                <div className="w-full bg-[#D6D3D1] h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-[#b45309] h-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        <header className="sticky top-0 bg-[#FDFCF5]/90 backdrop-blur-sm z-30 px-8 py-6 flex justify-between items-center border-b border-[#E7E5E4]">
           <div>
               <h1 className="text-3xl font-display font-bold text-[#292524] capitalize">
                   {getPageTitle()}
               </h1>
               <p className="text-[#78716c] text-sm font-serif italic mt-1">
                   {getPageSubtitle()}
               </p>
           </div>
           
           {view === 'tracker' && (
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#292524] hover:bg-[#44403C] text-[#FDFCF5] px-5 py-2.5 rounded-sm font-display font-medium text-sm tracking-wide flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
             >
                <Plus size={16} />
                <span className="hidden sm:inline uppercase">Add Habit</span>
             </button>
           )}
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto pb-24">
            
            {/* VIEW: TRACKER */}
            {view === 'tracker' && (
                <div className="space-y-8">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-6 bg-white p-3 rounded-sm border border-[#E7E5E4] w-fit shadow-sm">
                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(formatDate(d));
                            }}
                            className="p-2 hover:bg-[#F5F5F4] rounded-sm transition-colors text-[#78716c] hover:text-[#292524]"
                        >
                            ← Prev
                        </button>
                        <span className="font-display font-bold text-[#b45309] min-w-[120px] text-center text-lg">
                            {selectedDate === formatDate(new Date()) ? 'Today' : selectedDate}
                        </span>
                        <button 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(formatDate(d));
                            }}
                            disabled={selectedDate === formatDate(new Date())}
                            className="p-2 hover:bg-[#F5F5F4] rounded-sm transition-colors text-[#78716c] hover:text-[#292524] disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            Next →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {habits.length === 0 ? (
                            <div className="col-span-full py-24 text-center border-2 border-dashed border-[#D6D3D1] rounded-sm bg-[#F5F5F4]/30">
                                <p className="text-[#78716c] font-serif text-lg mb-4 italic">"We are what we repeatedly do."</p>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-[#b45309] font-display font-bold hover:underline uppercase tracking-wide"
                                >
                                    Begin your journey
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

            {/* VIEW: FOCUS */}
            {view === 'focus' && (
                <CircularFocus habits={habits} logs={logs} />
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
            flex items-center justify-center lg:justify-start gap-4 p-4 rounded-sm transition-all w-full
            ${active 
                ? 'bg-[#E7E5E4] text-[#292524] shadow-sm font-semibold border-l-4 border-[#b45309]' 
                : 'text-[#78716c] hover:text-[#292524] hover:bg-[#E7E5E4]/50'
            }
        `}
    >
        <span className={active ? "text-[#b45309]" : ""}>{icon}</span>
        <span className="hidden lg:block font-display tracking-wide uppercase text-sm">{label}</span>
    </button>
);

export default App;