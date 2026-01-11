import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Habit, HabitLogs } from '../types';
import { getCategoryHexColor, formatDate } from '../constants';

interface MiniSunburstLogoProps {
  habits: Habit[];
  logs: HabitLogs;
  size?: number;
  selectedDate?: string;
  categoryColors?: Record<string, string>;
}

export const MiniSunburstLogo: React.FC<MiniSunburstLogoProps> = ({ habits, logs, size = 48, selectedDate, categoryColors }) => {
  const activeHabits = habits.filter(h => !h.archived);
  
  // Use the passed date, or default to today if not provided
  const targetDate = selectedDate || formatDate(new Date());

  // Physics Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  
  // Pulse State
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    // 1. Add Momentum (Physics)
    // Increased from 25 to 100.
    // Math: 100 initial velocity / (1 - 0.95 friction) = ~2000 degrees total rotation (~5.5 revolutions)
    velocityRef.current += 100; 
    
    // Cap max speed higher to allow rapid clicking to stack momentum significantly
    // Previous cap was 100, increased to 400.
    if (velocityRef.current > 400) velocityRef.current = 400;

    // Start the physics loop if it's not running
    if (!animationFrameRef.current) {
        runPhysicsLoop();
    }

    // 2. Trigger Pulse (Expansion/Contraction)
    setIsPulsing(true);
    // Reset pulse after a short delay to allow re-triggering
    setTimeout(() => setIsPulsing(false), 200);
  };

  const runPhysicsLoop = () => {
    // Friction coefficient (0.0 - 1.0). Lower = stops faster.
    const FRICTION = 0.95; 
    const STOP_THRESHOLD = 0.1;

    // Apply friction
    velocityRef.current *= FRICTION;
    
    // Apply velocity to rotation
    rotationRef.current += velocityRef.current;

    // Apply transform to DOM
    if (svgRef.current) {
        // We use a CSS variable or direct style for performance
        svgRef.current.style.transform = `rotate(${rotationRef.current}deg) ${isPulsing ? 'scale(1.15)' : 'scale(1)'}`;
    }

    // Check if we should continue animating
    if (Math.abs(velocityRef.current) > STOP_THRESHOLD) {
        animationFrameRef.current = requestAnimationFrame(runPhysicsLoop);
    } else {
        velocityRef.current = 0;
        animationFrameRef.current = null;
    }
  };

  // If isPulsing changes, we need to update the transform immediately 
  // to ensure the scale effect happens even if rotation is slow
  useEffect(() => {
    if (svgRef.current) {
        svgRef.current.style.transform = `rotate(${rotationRef.current}deg) ${isPulsing ? 'scale(1.15)' : 'scale(1)'}`;
    }
  }, [isPulsing]);
  
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
        color: isCompleted ? getCategoryHexColor(habit.category, categoryColors) : '#E7E5E4', // Color or Stone-200
        opacity: isCompleted ? 1 : 0.5
      };
    });
  }, [activeHabits, logs, targetDate, center, outerRadius, innerRadius, categoryColors]);

  return (
    <div 
        className="relative group cursor-pointer select-none" 
        style={{ width: size, height: size }}
        onClick={handleClick}
    >
       {/* Rotating Container */}
      <svg 
        ref={svgRef}
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="transition-transform duration-150 ease-out origin-center will-change-transform"
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
      <div className={`absolute inset-0 bg-[#b45309]/20 rounded-full transition-transform duration-200 -z-10 blur-sm ${isPulsing ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
    </div>
  );
};