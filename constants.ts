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

// --- DYNAMIC PALETTE ---
export interface ColorOption {
    id: string;
    hex: string;
    twClass: string;
    label: string;
}

export const PRESET_PALETTE: ColorOption[] = [
    { id: 'bronze', hex: '#b45309', twClass: 'bg-[#b45309] text-[#FDFCF5]', label: 'Bronze' },
    { id: 'olive', hex: '#4d7c0f', twClass: 'bg-[#4d7c0f] text-[#FDFCF5]', label: 'Olive' },
    { id: 'crimson', hex: '#9f1239', twClass: 'bg-[#9f1239] text-[#FDFCF5]', label: 'Crimson' },
    { id: 'navy', hex: '#0c4a6e', twClass: 'bg-[#0c4a6e] text-[#FDFCF5]', label: 'Navy' },
    { id: 'royal', hex: '#581c87', twClass: 'bg-[#581c87] text-[#FDFCF5]', label: 'Royal' },
    { id: 'rust', hex: '#c2410c', twClass: 'bg-[#c2410c] text-[#FDFCF5]', label: 'Rust' },
    { id: 'teal', hex: '#0f766e', twClass: 'bg-[#0f766e] text-[#FDFCF5]', label: 'Teal' },
    { id: 'slate', hex: '#475569', twClass: 'bg-[#475569] text-[#FDFCF5]', label: 'Slate' },
    { id: 'gold', hex: '#ca8a04', twClass: 'bg-[#ca8a04] text-[#FDFCF5]', label: 'Gold' },
    { id: 'charcoal', hex: '#292524', twClass: 'bg-[#292524] text-[#FDFCF5]', label: 'Charcoal' },
    { id: 'rose', hex: '#be123c', twClass: 'bg-[#be123c] text-[#FDFCF5]', label: 'Rose' },
    { id: 'indigo', hex: '#4338ca', twClass: 'bg-[#4338ca] text-[#FDFCF5]', label: 'Indigo' },
];

export const getRandomPresetColor = (): ColorOption => {
    return PRESET_PALETTE[Math.floor(Math.random() * PRESET_PALETTE.length)];
};

// Helper to safely get color class (supports dynamic categories)
export const getCategoryColorClass = (category: string, customColors?: Record<string, string>): string => {
  // 1. Check custom override mapping first (User defined)
  if (customColors && customColors[category]) {
      const preset = PRESET_PALETTE.find(p => p.hex === customColors[category]);
      if (preset) return preset.twClass;
      // Fallback if it's a raw hex (though we stick to presets mostly)
      return `bg-[${customColors[category]}] text-[#FDFCF5]`;
  }
  // 2. Check Base defaults
  if (BASE_COLORS[category]) return BASE_COLORS[category];
  
  // 3. Fallback
  return DEFAULT_COLOR_CLASS;
};

// Helper to safely get hex color (supports dynamic categories)
export const getCategoryHexColor = (category: string, customColors?: Record<string, string>): string => {
  if (customColors && customColors[category]) {
      return customColors[category];
  }
  return BASE_HEX[category] || DEFAULT_HEX;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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