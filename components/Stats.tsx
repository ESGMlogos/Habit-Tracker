import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Habit, HabitLogs, DayStats } from '../types';
import { getLastNDays } from '../constants';

interface StatsProps {
  habits: Habit[];
  logs: HabitLogs;
}

export const Stats: React.FC<StatsProps> = ({ habits, logs }) => {
  
  // Prepare data for the last 30 days
  const last30Days = getLastNDays(30);
  const data: DayStats[] = last30Days.map(date => {
    let completedCount = 0;
    const totalActive = habits.filter(h => !h.archived && h.createdAt <= date).length;
    
    habits.forEach(h => {
      if (logs[h.id]?.includes(date)) {
        completedCount++;
      }
    });

    return {
      date: date.split('-').slice(1).join('/'), // MM/DD format
      count: completedCount,
      totalActive: totalActive,
      percentage: totalActive > 0 ? (completedCount / totalActive) * 100 : 0
    };
  }).reverse();

  // Calculate generic stats
  const totalCompletions = Object.values(logs).reduce((acc, curr) => acc + (curr as string[]).length, 0);
  const activeHabits = habits.filter(h => !h.archived).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletions = habits.filter(h => logs[h.id]?.includes(todayStr)).length;

  return (
    <div className="space-y-6">
      
      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Reps</p>
          <p className="text-2xl font-bold text-white">{totalCompletions}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Active Habits</p>
          <p className="text-2xl font-bold text-indigo-400">{activeHabits}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Today's Wins</p>
          <p className="text-2xl font-bold text-emerald-400">{todayCompletions}</p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-400">
                {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.percentage, 0) / data.length) : 0}%
            </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[300px] bg-slate-800/30 p-4 rounded-xl border border-slate-800">
        <h3 className="text-slate-300 font-medium mb-4">30 Day Consistency</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                hide={true}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#818cf8' }}
            />
            <Area 
                type="monotone" 
                dataKey="percentage" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Heatmap Grid (Visual representation only) */}
      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
        <h3 className="text-slate-300 font-medium mb-4">Heatmap (Last 90 Days)</h3>
        <div className="flex flex-wrap gap-1">
            {getLastNDays(90).reverse().map((date) => {
                 let intensity = 'bg-slate-800';
                 let completedCount = 0;
                 habits.forEach(h => {
                   if (logs[h.id]?.includes(date)) completedCount++;
                 });
                 
                 const totalActive = habits.filter(h => !h.archived && h.createdAt <= date).length;
                 const pct = totalActive > 0 ? completedCount / totalActive : 0;

                 if (pct > 0) intensity = 'bg-emerald-900';
                 if (pct > 0.3) intensity = 'bg-emerald-700';
                 if (pct > 0.6) intensity = 'bg-emerald-500';
                 if (pct === 1) intensity = 'bg-emerald-400';

                 return (
                     <div 
                        key={date} 
                        title={`${date}: ${Math.round(pct*100)}%`}
                        className={`w-3 h-3 rounded-sm ${intensity}`}
                     />
                 )
            })}
        </div>
      </div>
    </div>
  );
};