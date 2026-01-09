import { HabitCategory } from './types';

export const APP_TITLE = "900Days";
export const TARGET_DAYS = 900;

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  [HabitCategory.HEALTH]: 'bg-emerald-500 text-white',
  [HabitCategory.FITNESS]: 'bg-orange-500 text-white',
  [HabitCategory.LEARNING]: 'bg-blue-500 text-white',
  [HabitCategory.PRODUCTIVITY]: 'bg-violet-500 text-white',
  [HabitCategory.MINDFULNESS]: 'bg-teal-500 text-white',
  [HabitCategory.CREATIVITY]: 'bg-pink-500 text-white',
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getLastNDays = (n: number): string[] => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
};
