import React, { useState, useMemo } from 'react';
import { Habit, HabitLogs } from '../types';
import { formatDate, CATEGORY_HEX } from '../constants';
import { SunburstChart, SunburstNode } from './SunburstChart';
import { Trophy } from 'lucide-react';

interface CircularFocusProps {
  habits: Habit[];
  logs: HabitLogs;
}

export const CircularFocus: React.FC<CircularFocusProps> = ({ habits, logs }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id || '');
  const [targetDays, setTargetDays] = useState<number>(30);

  // --- Prepare Data for Sunburst ---
  const sunburstData: SunburstNode = useMemo(() => {
    const root: SunburstNode = { name: 'Root', value: 0, children: [] };
    const totalCompletions = (Object.values(logs) as string[][]).reduce((acc, curr) => acc + curr.length, 0);
    root.value = totalCompletions;

    // Group by Category
    const categoryGroups: Record<string, SunburstNode> = {};

    habits.filter(h => !h.archived).forEach(habit => {
        const completions = logs[habit.id]?.length || 0;
        
        if (!categoryGroups[habit.category]) {
            categoryGroups[habit.category] = {
                name: habit.category,
                value: 0,
                color: CATEGORY_HEX[habit.category],
                children: []
            };
        }

        categoryGroups[habit.category].value += completions;
        categoryGroups[habit.category].children?.push({
            name: habit.title,
            value: completions
        });
    });

    root.children = Object.values(categoryGroups).sort((a, b) => b.value - a.value);
    return root;
  }, [habits, logs]);


  // --- Calculate Streak for Selected Habit ---
  const currentStreak = useMemo(() => {
    if (!selectedHabitId) return 0;
    const habitLogs = logs[selectedHabitId] || [];
    
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);
    const isCompletedToday = habitLogs.includes(formatDate(today));

    // If not completed today, start checking from yesterday
    if (!isCompletedToday) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dStr = formatDate(checkDate);
        if (habitLogs.includes(dStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  }, [selectedHabitId, logs]);

  // --- Circular Progress Geometry ---
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(currentStreak / targetDays, 1);
  const strokeDashoffset = circumference - progress * circumference;

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  return (
    <div className="space-y-8 animate-fade-in">
        
        {/* Top: Sunburst */}
        <div className="w-full">
            <SunburstChart data={sunburstData} />
        </div>

        {/* Bottom: Focus Load */}
        <div className="bg-white border border-[#E7E5E4] rounded-sm p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#292524]"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                
                {/* Controls */}
                <div className="flex-1 w-full space-y-6">
                    <div>
                        <h3 className="font-display font-bold text-2xl text-[#292524] mb-1">Focus Mode</h3>
                        <p className="font-serif text-[#78716c] italic">Select a discipline to visualize your momentum.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-display font-bold uppercase tracking-widest text-[#78716c] mb-2">Discipline</label>
                            <select 
                                value={selectedHabitId} 
                                onChange={(e) => setSelectedHabitId(e.target.value)}
                                className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-sm p-3 text-[#292524] font-serif focus:ring-1 focus:ring-[#b45309] outline-none"
                            >
                                {habits.filter(h => !h.archived).map(h => (
                                    <option key={h.id} value={h.id}>{h.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-display font-bold uppercase tracking-widest text-[#78716c] mb-2">Target Streak</label>
                            <div className="flex gap-2">
                                {[30, 60, 90, 365].map(days => (
                                    <button 
                                        key={days}
                                        onClick={() => setTargetDays(days)}
                                        className={`px-4 py-2 rounded-sm font-display font-bold text-sm border transition-all ${
                                            targetDays === days 
                                            ? 'bg-[#b45309] text-white border-[#b45309]' 
                                            : 'bg-white text-[#78716c] border-[#D6D3D1] hover:border-[#b45309]'
                                        }`}
                                    >
                                        {days}
                                    </button>
                                ))}
                                <input 
                                    type="number" 
                                    value={targetDays} 
                                    onChange={(e) => setTargetDays(Number(e.target.value))}
                                    className="w-20 px-2 border border-[#D6D3D1] rounded-sm text-center font-display font-bold text-[#292524]"
                                />
                            </div>
                        </div>
                    </div>

                    {progress >= 1 && (
                         <div className="p-4 bg-[#F0FDF4] border border-[#15803d]/20 rounded-sm flex items-center gap-3 text-[#15803d]">
                            <Trophy size={24} />
                            <div>
                                <p className="font-display font-bold text-sm">TARGET ACHIEVED</p>
                                <p className="font-serif text-xs italic">You have proven your resolve.</p>
                            </div>
                         </div>
                    )}
                </div>

                {/* Circular Chart */}
                <div className="relative flex items-center justify-center p-4">
                     {/* Background Pattern behind circle */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                     <svg width="300" height="300" className="transform -rotate-90">
                         {/* Track */}
                         <circle 
                            cx="150" cy="150" r={radius} 
                            stroke="#F5F5F4" 
                            strokeWidth="20" 
                            fill="transparent" 
                         />
                         {/* Progress */}
                         <circle 
                            cx="150" cy="150" r={radius} 
                            stroke={selectedHabit ? CATEGORY_HEX[selectedHabit.category] : '#292524'}
                            strokeWidth="20" 
                            fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="butt" // "Butt" looks more classical/architectural than round
                            className="transition-all duration-1000 ease-in-out"
                         />
                     </svg>

                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <span className="font-serif text-[#78716c] text-sm uppercase tracking-widest mb-1">Current Streak</span>
                         <span className="font-display font-black text-6xl text-[#292524] leading-none">
                             {currentStreak}
                         </span>
                         <span className="font-serif text-[#A8A29E] text-xs mt-2 uppercase tracking-wide border-t border-[#E7E5E4] pt-1 w-16">
                            of {targetDays}
                         </span>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};