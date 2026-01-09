import React, { useEffect, useRef } from 'react';

export const Celebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Configuration
    const particleCount = 200;
    const colors = ['#b45309', '#d97706', '#FDFCF5', '#44403C', '#fbbf24', '#78350f']; // Bronze, Amber, Ivory, Stone, Gold, Dark Oak

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      shape: 'square' | 'triangle';
      friction: number;

      constructor() {
        this.x = canvas!.width / 2;
        this.y = canvas!.height / 2;
        // Explosion velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 20 + 8; // Slightly more consistent burst
        
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        
        this.size = Math.random() * 12 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
        this.shape = Math.random() > 0.5 ? 'square' : 'triangle';
        this.friction = 0.97; // Less friction for floatier feeling (was 0.96)
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.vy += 0.6; // Slightly reduced gravity (was 0.8)
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.rotation += this.rotationSpeed;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;

        if (this.shape === 'square') {
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          // Draw Triangle
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let animationId: number;
    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particles.forEach(p => {
        p.update();
        p.draw();
        // Simple bounds check to see if we still need to animate
        if (p.y < canvas.height + 100) activeParticles++;
      });

      if (activeParticles > 0) {
          animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Victory Text with Slam Effect */}
      {/* Delayed fade-out start to 4.5s */}
      <div className="relative z-10 text-center animate-fade-out" style={{ animationDelay: '4.5s', animationFillMode: 'forwards' }}>
          <h2 
            className="font-display font-black text-6xl md:text-8xl text-[#b45309] drop-shadow-xl tracking-widest scale-0 animate-[popup_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            style={{ textShadow: '0 4px 0 #78350f', animationDelay: '0.3s' }} 
          >
            VICTORY
          </h2>
          <div className="h-1 w-0 bg-[#292524] mx-auto mt-4 animate-[expandWidth_1s_ease-out_0.8s_forwards]"></div>
          <p className="font-serif text-[#292524] font-bold tracking-[0.3em] uppercase mt-4 opacity-0 animate-[fadeIn_0.8s_ease-out_1.2s_forwards]">
            The Day Is Won
          </p>
      </div>

      <style>{`
        @keyframes popup {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        @keyframes expandWidth {
            from { width: 0; }
            to { width: 150px; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};