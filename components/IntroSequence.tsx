import React, { useEffect, useState } from 'react';

interface IntroSequenceProps {
  onComplete: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [textStep, setTextStep] = useState(0);

  useEffect(() => {
    // Text Reveal Timing - slightly delayed for drama
    setTimeout(() => setTextStep(1), 800); // "Entering..."
    setTimeout(() => setTextStep(2), 2000); // "The Warrior's Path"
    
    // Exit Timing - extended to allow reading and smooth fade
    setTimeout(() => setFading(true), 4000);
    // Wait for the 1000ms fade transition to fully complete + buffer
    setTimeout(() => onComplete(), 5100); 
  }, [onComplete]);

  // Procedural geometry for the wheel
  const outerGlyphs = Array.from({ length: 20 }).map((_, i) => {
    const angle = (i * 360) / 20;
    return (
      <rect
        key={i}
        x="135"
        y="10"
        width="30"
        height="30"
        rx="2"
        transform={`rotate(${angle} 150 150)`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-80"
      />
    );
  });

  const middleRays = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 360) / 12;
    return (
      <path
        key={i}
        d="M150 50 L165 80 L135 80 Z"
        transform={`rotate(${angle} 150 150)`}
        fill="currentColor"
        className="opacity-60"
      />
    );
  });

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFCF5] transition-opacity duration-1000 ease-in-out ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] text-[#44403C]">
        
        {/* Outer Ring - The Calendar (Long Count) */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="148" stroke="#D6D3D1" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="110" stroke="#b45309" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          {outerGlyphs}
        </svg>

        {/* Middle Ring - The Rays (Tzolkin) */}
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse-slower text-[#b45309]" viewBox="0 0 300 300">
             {middleRays}
             <circle cx="150" cy="150" r="80" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>

        {/* Inner Static Core - The Nahual */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-[#292524] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                {/* Abstract Face/Sun */}
                <div className="absolute w-full h-1 bg-[#b45309]/50 top-1/2 -translate-y-1/2"></div>
                <div className="absolute h-full w-1 bg-[#b45309]/50 left-1/2 -translate-x-1/2"></div>
                <div className="w-16 h-16 border-2 border-[#FDFCF5] rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#FDFCF5] rounded-sm rotate-45 animate-pulse"></div>
                </div>
            </div>
        </div>

      </div>

      <div className="mt-12 text-center h-24">
        <p className={`font-serif text-[#b45309] text-sm tracking-[0.3em] uppercase mb-3 transition-all duration-1000 transform ${textStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Entering
        </p>
        <h1 className={`font-display text-3xl md:text-5xl font-black text-[#292524] tracking-widest transition-all duration-1000 ease-out transform ${textStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            NINDO (忍道)
        </h1>
        <div className={`w-16 h-1 bg-[#b45309] mx-auto mt-6 transition-all duration-1000 delay-300 ${textStep >= 2 ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}></div>
      </div>
    </div>
  );
};