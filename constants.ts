import { HabitCategory } from './types';

export const APP_TITLE = "900DAYS";
export const TARGET_DAYS = 900;

// Base Palette for default categories
const BASE_COLORS: Record<string, string> = {
  [HabitCategory.HEALTH]: 'bg-[#4d7c0f] text-[#FDFCF5]', 
  [HabitCategory.FITNESS]: 'bg-[#9f1239] text-[#FDFCF5]', 
  [HabitCategory.LEARNING]: 'bg-[#0c4a6e] text-[#FDFCF5]', 
  [HabitCategory.PRODUCTIVITY]: 'bg-[#b45309] text-[#FDFCF5]', 
  [HabitCategory.MINDFULNESS]: 'bg-[#581c87] text-[#FDFCF5]', 
  [HabitCategory.CREATIVITY]: 'bg-[#c2410c] text-[#FDFCF5]', 
};

const BASE_HEX: Record<string, string> = {
  [HabitCategory.HEALTH]: '#4d7c0f',
  [HabitCategory.FITNESS]: '#9f1239',
  [HabitCategory.LEARNING]: '#0c4a6e',
  [HabitCategory.PRODUCTIVITY]: '#b45309',
  [HabitCategory.MINDFULNESS]: '#581c87',
  [HabitCategory.CREATIVITY]: '#c2410c',
};

// Fallback for user-created categories (Stone/Slate theme)
const DEFAULT_COLOR_CLASS = 'bg-[#57534E] text-[#FDFCF5]'; // Stone-600
const DEFAULT_HEX = '#57534E';

export const CATEGORY_COLORS: Record<string, string> = BASE_COLORS;
export const CATEGORY_HEX: Record<string, string> = BASE_HEX;

// Helper to safely get color class (supports dynamic categories)
export const getCategoryColorClass = (category: string): string => {
  return BASE_COLORS[category] || DEFAULT_COLOR_CLASS;
};

// Helper to safely get hex color (supports dynamic categories)
export const getCategoryHexColor = (category: string): string => {
  return BASE_HEX[category] || DEFAULT_HEX;
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