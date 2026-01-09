import React from 'react';
import { Habit, HabitCategory } from '../types';
import { CATEGORY_COLORS, formatDate } from '../constants';
import { Check, Flame, Info } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  logs: string[];
  onToggle: (habitId: string, date: string) => void;
  selectedDate: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, logs, onToggle, selectedDate }) => {
  const isCompleted = logs.includes(selectedDate);
  
  // Calculate Streak
  let streak = 0;
  const today = new Date();
  const checkDate = new Date(today);
  
  // Simple streak logic (looking back from yesterday or today)
  while (true) {
    const dStr = formatDate(checkDate);
    if (logs.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
        // If checking today and it's not done, don't break streak yet unless we checked yesterday
        if (dStr === formatDate(today) && !isCompleted) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        }
        break;
    }
  }

  return (
    <div 
      className={`
        relative group overflow-hidden rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-indigo-500/10
        ${isCompleted ? 'ring-1 ring-emerald-500/30' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${CATEGORY_COLORS[habit.category]}`}>
              {habit.category}
            </span>
            {streak > 2 && (
              <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold animate-pulse">
                <Flame size={12} fill="currentColor" />
                {streak} day streak
              </div>
            )}
          </div>
          <h3 className={`font-semibold text-lg ${isCompleted ? 'text-emerald-400' : 'text-slate-100'}`}>
            {habit.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">{habit.description}</p>
        </div>

        <button
          onClick={() => onToggle(habit.id, selectedDate)}
          className={`
            ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
            ${isCompleted 
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' 
              : 'border-slate-600 bg-slate-900/50 text-slate-600 hover:border-indigo-400 hover:text-indigo-400'
            }
          `}
        >
          <Check size={24} strokeWidth={3} className={`transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-0'}`} />
        </button>
      </div>
    </div>
  );
};
