export interface Habit {
  id: string;
  title: string;
  description: string;
  category: string; // Changed from HabitCategory enum to string to allow dynamic categories
  createdAt: string; // ISO Date string
  archived: boolean;
}

export enum HabitCategory {
  HEALTH = 'Health',
  LEARNING = 'Learning',
  PRODUCTIVITY = 'Productivity',
  MINDFULNESS = 'Mindfulness',
  FITNESS = 'Fitness',
  CREATIVITY = 'Creativity',
}

// Map of habitId -> array of ISO date strings (YYYY-MM-DD)
export interface HabitLogs {
  [habitId: string]: string[];
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  count: number;
  totalActive: number;
  percentage: number;
}