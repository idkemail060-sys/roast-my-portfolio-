import React, { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Flame, 
  CheckCircle2, 
  Code2, 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Terminal,
  Maximize2
} from 'lucide-react';

export const Portfolio3DCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse tilt state
  const [rotation, setRotation] = useState({ x: 5, y: -8 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation between -12 and +12 degrees
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth reset to resting perspective
    setRotation({ x: 5, y: -8 });
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto py-6 sm:py-10 px-2 sm:px-4"
      style={{ perspective: '1400px' }}
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true" 
      />

      {/* 3D Transform Wrapper */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={
          shouldReduceMotion
            ? { rotateX: 0, rotateY: 0 }
            : {
                rotateX: rotation.x,
                rotateY: rotation.y,
                scale: isHovered ? 1.02 : 1.0,
              }
        }
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 180,
          mass: 0.6,
        }}
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
        className="relative rounded-2xl border border-neutral-700/70 bg-neutral-900/80 shadow-[0_30px_70px_rgba(0,0,0,0.8),0_0_20px_rgba(249,115,22,0.12)] backdrop-blur-xl transition-shadow duration-300 p-3 sm:p-5 cursor-default select-none group"
      >
        {/* Top Browser Chrome Window Header (translateZ: 25px) */}
        <div 
          className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-800/80"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50 inline-block shadow-sm" />
            <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-md bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <Globe className="w-3 h-3 text-orange-400" />
              <span>https://dev-portfolio.io</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              LIVE DOM AUDIT
            </span>
          </div>
        </div>

        {/* Mockup Content Body (translateZ: 10px) */}
        <div 
          className="relative pt-4 sm:pt-6 pb-2 sm:pb-4 space-y-4 overflow-hidden"
          style={{ transform: 'translateZ(10px)' }}
        >
          {/* Scanning Laser Beam Effect */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#f97316] z-30 pointer-events-none opacity-80"
              animate={{
                top: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          {/* Portfolio Hero Mockup Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-orange-400 font-semibold uppercase tracking-wider">
                  Full Stack Engineer & UI Architect
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-neutral-100 font-sans tracking-tight">
                Alex Morgan <span className="text-neutral-500 font-normal">/ Software Craftsman</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg line-clamp-2">
                Building distributed systems with TypeScript, Rust, and modern React architectures. Obsessed with sub-100ms latency and micro-interactions.
              </p>
            </div>

            {/* Tech Stack Pills inside Mockup */}
            <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-750 text-[10px] font-mono text-neutral-300">
                React 19 + TypeScript
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-750 text-[10px] font-mono text-neutral-300">
                Tailwind CSS v4
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-750 text-[10px] font-mono text-neutral-300">
                Web Performance
              </span>
            </div>
          </div>

          {/* Miniature Metrics & Project Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 space-y-1">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">DOM Tree Depth</div>
              <div className="text-base font-bold font-mono text-emerald-400 flex items-center justify-between">
                <span>9 Levels</span>
                <span className="text-[10px] text-emerald-500 font-sans font-normal">Optimal</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 space-y-1">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Semantic H1–H6</div>
              <div className="text-base font-bold font-mono text-cyan-400 flex items-center justify-between">
                <span>1 H1 • 5 H2</span>
                <span className="text-[10px] text-cyan-500 font-sans font-normal">Structured</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-850 space-y-1">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Interactive CTA</div>
              <div className="text-base font-bold font-mono text-amber-400 flex items-center justify-between">
                <span>Detected</span>
                <span className="text-[10px] text-amber-500 font-sans font-normal">Contact Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FLOATING 3D DEPTH LAYERS (translateZ elevated elements)      */}
        {/* ============================================================ */}

        {/* Floating Badge 1: Top Right Score Dial (translateZ: 50px) */}
        <motion.div
          className="absolute -top-4 -right-2 sm:-right-6 px-3.5 py-2 rounded-xl bg-neutral-900/95 border border-emerald-500/40 shadow-[0_10px_25px_rgba(16,185,129,0.25)] backdrop-blur-md flex items-center gap-2.5 z-20"
          style={{ transform: 'translateZ(50px)' }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -6, 0],
                }
          }
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
            9.1
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-emerald-300">EXCELLENT</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[10px] font-mono text-neutral-400">Score: 9.1 / 10.0</p>
          </div>
        </motion.div>

        {/* Floating Badge 2: Bottom Left Technical Landmark (translateZ: 60px) */}
        <motion.div
          className="absolute -bottom-5 -left-2 sm:-left-6 px-3.5 py-2 rounded-xl bg-neutral-900/95 border border-cyan-500/40 shadow-[0_10px_25px_rgba(6,182,212,0.2)] backdrop-blur-md flex items-center gap-2 z-20"
          style={{ transform: 'translateZ(60px)' }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, 5, 0],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
        >
          <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold text-cyan-300">
              HTML5 Semantic Landmark
            </div>
            <p className="text-[10px] font-mono text-neutral-400">
              Header, Nav, Main, Footer detected
            </p>
          </div>
        </motion.div>

        {/* Floating Badge 3: Bottom Right Roast Verdict Snippet (translateZ: 70px) */}
        <motion.div
          className="hidden sm:flex absolute -bottom-6 right-8 px-4 py-2.5 rounded-xl bg-neutral-900/95 border border-orange-500/40 shadow-[0_10px_30px_rgba(249,115,22,0.25)] backdrop-blur-md items-center gap-3 z-20 max-w-xs"
          style={{ transform: 'translateZ(70px)' }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.2,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-4 h-4 fill-orange-400/20" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold block">
              Constructive Roast
            </span>
            <p className="text-[11px] font-mono text-neutral-200 line-clamp-1 italic">
              "Great typography, but don't hide your case studies behind vague tabs."
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
