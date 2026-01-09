import { HabitCategory } from './types';

export const APP_TITLE = "900DAYS";
export const TARGET_DAYS = 900;

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  // Classical Palette (Tailwind Classes)
  [HabitCategory.HEALTH]: 'bg-[#4d7c0f] text-[#FDFCF5]', // Olive Green (Laurel)
  [HabitCategory.FITNESS]: 'bg-[#9f1239] text-[#FDFCF5]', // Spartan Red
  [HabitCategory.LEARNING]: 'bg-[#0c4a6e] text-[#FDFCF5]', // Aegean Blue
  [HabitCategory.PRODUCTIVITY]: 'bg-[#b45309] text-[#FDFCF5]', // Bronze/Ochre
  [HabitCategory.MINDFULNESS]: 'bg-[#581c87] text-[#FDFCF5]', // Tyrian Purple
  [HabitCategory.CREATIVITY]: 'bg-[#c2410c] text-[#FDFCF5]', // Terracotta
};

export const CATEGORY_HEX: Record<HabitCategory, string> = {
  // Classical Palette (Hex for SVGs)
  [HabitCategory.HEALTH]: '#4d7c0f',
  [HabitCategory.FITNESS]: '#9f1239',
  [HabitCategory.LEARNING]: '#0c4a6e',
  [HabitCategory.PRODUCTIVITY]: '#b45309',
  [HabitCategory.MINDFULNESS]: '#581c87',
  [HabitCategory.CREATIVITY]: '#c2410c',
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