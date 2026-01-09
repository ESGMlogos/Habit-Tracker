import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
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
  
  // Filter for currently active habits (non-archived) to benchmark history against current goals
  const activeHabitsList = habits.filter(h => !h.archived);

  const data: DayStats[] = last30Days.map(date => {
    let completedCount = 0;
    
    // We calculate "Consistency" based on the habits you have *now*.
    // This allows backfilling to show up on the chart immediately, 
    // and holds past days to the standard of your current discipline list.
    const totalActive = activeHabitsList.length;
    
    activeHabitsList.forEach(h => {
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
  }); 

  // Calculate generic stats
  const totalCompletions = (Object.values(logs) as string[][]).reduce((acc: number, curr) => acc + curr.length, 0);
  const activeHabitsCount = activeHabitsList.length;
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const todayCompletions = activeHabitsList.filter(h => logs[h.id]?.includes(todayStr)).length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Reps" value={totalCompletions} />
        <StatCard label="Disciplines" value={activeHabitsCount} color="text-[#0c4a6e]" />
        <StatCard label="Daily Wins" value={todayCompletions} color="text-[#4d7c0f]" />
        <StatCard 
            label="Consistency" 
            value={`${data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.percentage, 0) / data.length) : 0}%`}
            color="text-[#b45309]"
        />
      </div>

      {/* Main Chart */}
      <div className="h-[350px] bg-white p-6 rounded-sm border border-[#E7E5E4] shadow-sm">
        <h3 className="text-[#44403C] font-display font-bold text-lg mb-6 border-b border-[#E7E5E4] pb-2">30 Day Consistency</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b45309" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#b45309" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
                dataKey="date" 
                stroke="#A8A29E" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                fontFamily="Lora, serif"
                tickMargin={10}
            />
            <YAxis hide={true} domain={[0, 100]} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#FDFCF5', border: '1px solid #E7E5E4', borderRadius: '4px', color: '#292524', fontFamily: 'Lora', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                itemStyle={{ color: '#b45309', fontWeight: 'bold' }}
                formatter={(value: number) => [`${Math.round(value)}%`, 'Consistency']}
            />
            <Area 
                type="linear" 
                dataKey="percentage" 
                stroke="#b45309" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Heatmap Grid */}
      <div className="bg-white p-6 rounded-sm border border-[#E7E5E4] shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-[#E7E5E4] pb-2">
            <h3 className="text-[#44403C] font-display font-bold text-lg">Stoic Mosaic (90 Days)</h3>
            <div className="flex items-center gap-2 text-[10px] text-[#78716c] uppercase tracking-wider font-bold">
                <span>Less</span>
                <div className="w-2 h-2 bg-[#F5F5F4]"></div>
                <div className="w-2 h-2 bg-[#b45309]/30"></div>
                <div className="w-2 h-2 bg-[#b45309]/50"></div>
                <div className="w-2 h-2 bg-[#b45309]/70"></div>
                <div className="w-2 h-2 bg-[#b45309]"></div>
                <span>More</span>
            </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 content-start">
            {getLastNDays(90).map((date) => {
                 let intensity = 'bg-[#F5F5F4]'; // Stone 100
                 let completedCount = 0;
                 
                 // Same logic: compare against current active habits
                 activeHabitsList.forEach(h => {
                   if (logs[h.id]?.includes(date)) completedCount++;
                 });
                 
                 const totalActive = activeHabitsList.length;
                 const pct = totalActive > 0 ? completedCount / totalActive : 0;

                 // Using Olive/Bronze scales
                 if (pct > 0) intensity = 'bg-[#b45309]/30';
                 if (pct > 0.4) intensity = 'bg-[#b45309]/50';
                 if (pct > 0.7) intensity = 'bg-[#b45309]/70';
                 if (pct === 1) intensity = 'bg-[#b45309]';

                 return (
                     <div 
                        key={date} 
                        title={`${date}: ${Math.round(pct*100)}%`}
                        className={`w-3.5 h-3.5 rounded-[1px] ${intensity} transition-all hover:scale-125 hover:z-10`}
                     />
                 )
            })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = 'text-[#292524]' }: { label: string, value: string | number, color?: string }) => (
    <div className="bg-white p-5 rounded-sm border border-[#E7E5E4] shadow-sm flex flex-col items-center text-center hover:border-[#b45309]/30 transition-colors">
        <p className="text-[#78716c] text-[10px] uppercase tracking-widest font-display font-bold mb-1">{label}</p>
        <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
    </div>
);