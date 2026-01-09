import React from 'react';
import { Habit, HabitCategory } from '../types';
import { CATEGORY_COLORS, formatDate } from '../constants';
import { Check, Flame } from 'lucide-react';

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
  
  while (true) {
    const dStr = formatDate(checkDate);
    if (logs.includes(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
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
        relative group overflow-hidden rounded-sm border transition-all duration-300
        ${isCompleted 
            ? 'bg-[#F0FDF4] border-[#15803d]/30 shadow-sm' 
            : 'bg-white border-[#E7E5E4] hover:border-[#b45309]/50 hover:shadow-md hover:shadow-[#b45309]/5'
        }
        p-6
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2 py-0.5 text-[9px] uppercase font-display font-bold tracking-widest rounded-sm shadow-sm ${CATEGORY_COLORS[habit.category]}`}>
              {habit.category}
            </span>
            {streak > 2 && (
              <div className="flex items-center gap-1 text-[#c2410c] text-xs font-serif font-bold italic animate-pulse">
                <Flame size={14} fill="currentColor" />
                {streak} days
              </div>
            )}
          </div>
          <h3 className={`font-display font-bold text-xl mb-2 ${isCompleted ? 'text-[#15803d]' : 'text-[#292524]'}`}>
            {habit.title}
          </h3>
          <p className="text-sm text-[#57534E] font-serif leading-relaxed line-clamp-2 italic border-l-2 border-[#E7E5E4] pl-3">
            "{habit.description}"
          </p>
        </div>

        <button
          onClick={() => onToggle(habit.id, selectedDate)}
          className={`
            ml-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 transition-all duration-300
            ${isCompleted 
              ? 'border-[#15803d] bg-[#15803d] text-white shadow-md' 
              : 'border-[#D6D3D1] bg-[#F5F5F4] text-[#D6D3D1] hover:border-[#b45309] hover:text-[#b45309] hover:bg-white'
            }
          `}
        >
          <Check size={28} strokeWidth={3} className={`transition-transform duration-300 ${isCompleted ? 'scale-100' : 'scale-75 opacity-0 group-hover:opacity-50'}`} />
        </button>
      </div>
    </div>
  );
};