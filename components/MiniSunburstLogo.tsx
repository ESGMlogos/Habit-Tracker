import React, { useMemo } from 'react';
import { Habit, HabitLogs } from '../types';
import { getCategoryHexColor, formatDate } from '../constants';

interface MiniSunburstLogoProps {
  habits: Habit[];
  logs: HabitLogs;
  size?: number;
  selectedDate?: string;
}

export const MiniSunburstLogo: React.FC<MiniSunburstLogoProps> = ({ habits, logs, size = 48, selectedDate }) => {
  const activeHabits = habits.filter(h => !h.archived);
  
  // Use the passed date, or default to today if not provided
  const targetDate = selectedDate || formatDate(new Date());
  
  // Geometry
  const center = size / 2;
  const strokeWidth = size * 0.05;
  const outerRadius = (size / 2) - strokeWidth;
  const innerRadius = outerRadius * 0.4;

  // Helper to calculate arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Generate Slices
  const slices = useMemo(() => {
    const total = activeHabits.length;
    if (total === 0) return []; // Handle empty state separately

    const anglePerSlice = 360 / total;
    const gap = total > 1 ? 2 : 0; // Degree gap between slices

    return activeHabits.map((habit, index) => {
      // Check completion against the specific target date
      const isCompleted = logs[habit.id]?.includes(targetDate);
      
      const startAngle = index * anglePerSlice + (gap / 2);
      const endAngle = (index + 1) * anglePerSlice - (gap / 2);
      
      // Calculate shape
      const outerArc = describeArc(center, center, outerRadius, startAngle, endAngle);
      const innerArc = describeArc(center, center, innerRadius, endAngle, startAngle); // Reverse for closed path
      
      // Construct closed path (donut slice)
      // We manually construct the lines connecting outer and inner arcs
      const startOuter = polarToCartesian(center, center, outerRadius, endAngle);
      const endOuter = polarToCartesian(center, center, outerRadius, startAngle);
      const startInner = polarToCartesian(center, center, innerRadius, startAngle);
      const endInner = polarToCartesian(center, center, innerRadius, endAngle);

      const path = [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, (endAngle - startAngle > 180 ? 1 : 0), 0, endOuter.x, endOuter.y,
        "L", startInner.x, startInner.y,
        "A", innerRadius, innerRadius, 0, (endAngle - startAngle > 180 ? 1 : 0), 1, endInner.x, endInner.y,
        "Z"
      ].join(" ");

      return {
        id: habit.id,
        title: habit.title,
        path,
        color: isCompleted ? getCategoryHexColor(habit.category) : '#E7E5E4', // Color or Stone-200
        opacity: isCompleted ? 1 : 0.5
      };
    });
  }, [activeHabits, logs, targetDate, center, outerRadius, innerRadius]);

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
       {/* Rotating Container on Hover */}
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="transition-transform duration-700 ease-in-out group-hover:rotate-180"
      >
        {/* Empty State / Decorative Background */}
        {slices.length === 0 && (
            <circle cx={center} cy={center} r={outerRadius} stroke="#E7E5E4" strokeWidth="2" fill="none" strokeDasharray="4 2" />
        )}

        {/* Dynamic Habit Slices */}
        {slices.map((slice) => (
          <path
            key={slice.id}
            d={slice.path}
            fill={slice.color}
            fillOpacity={slice.opacity}
            className="transition-all duration-300 hover:opacity-100"
          >
            <title>{slice.title}</title>
          </path>
        ))}

        {/* Center Sun Core */}
        <circle 
            cx={center} 
            cy={center} 
            r={innerRadius * 0.7} 
            fill="#b45309" 
            className="group-hover:fill-[#c2410c] transition-colors duration-300"
        />
      </svg>
      
      {/* Absolute positioning pulse effect behind */}
      <div className="absolute inset-0 bg-[#b45309]/20 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500 -z-10 blur-sm"></div>
    </div>
  );
};