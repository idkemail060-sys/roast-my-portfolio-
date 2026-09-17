import React, { useState, useEffect, useRef } from 'react';
import { 
  Paintbrush, 
  Zap, 
  Eye, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export type CategoryKey = 'uiUx' | 'performance' | 'accessibility' | 'content';

interface ScoreMetricCardProps {
  categoryKey: CategoryKey;
  label: string;
  score: number;
  weight: number;
  description: string;
  index?: number;
}

export const ScoreMetricCard: React.FC<ScoreMetricCardProps> = ({
  categoryKey,
  label,
  score,
  weight,
  description,
  index = 0,
}) => {
  const safeScore = isNaN(score) ? 7.0 : Math.max(0, Math.min(10, score));
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Animated score counter
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayScore(safeScore);
      return;
    }

    let start = 0;
    const duration = 800; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = safeScore / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= safeScore) {
        setDisplayScore(safeScore);
        clearInterval(timer);
      } else {
        setDisplayScore(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [safeScore, shouldReduceMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = -((y - centerY) / centerY) * 7;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Determine tier and non-color indicators
  let tier: {
    label: string;
    icon: React.ReactNode;
    colorClasses: string;
    bgAccent: string;
    barColor: string;
    borderAccent: string;
    glowColor: string;
  };

  if (safeScore >= 8.5) {
    tier = {
      label: 'EXCELLENT',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-label="Excellent status" />,
      colorClasses: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      bgAccent: 'group-hover:border-emerald-500/50',
      barColor: 'bg-emerald-500',
      borderAccent: 'border-l-emerald-500',
      glowColor: 'group-hover:shadow-[0_15px_30px_rgba(16,185,129,0.15)]',
    };
  } else if (safeScore >= 7.0) {
    tier = {
      label: 'GOOD',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" aria-label="Good status" />,
      colorClasses: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      bgAccent: 'group-hover:border-cyan-500/50',
      barColor: 'bg-cyan-500',
      borderAccent: 'border-l-cyan-500',
      glowColor: 'group-hover:shadow-[0_15px_30px_rgba(6,182,212,0.15)]',
    };
  } else if (safeScore >= 5.0) {
    tier = {
      label: 'NEEDS WORK',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-label="Needs work status" />,
      colorClasses: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      bgAccent: 'group-hover:border-amber-500/50',
      barColor: 'bg-amber-500',
      borderAccent: 'border-l-amber-500',
      glowColor: 'group-hover:shadow-[0_15px_30px_rgba(245,158,11,0.15)]',
    };
  } else {
    tier = {
      label: 'CRITICAL',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-400" aria-label="Critical status" />,
      colorClasses: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      bgAccent: 'group-hover:border-rose-500/50',
      barColor: 'bg-rose-500',
      borderAccent: 'border-l-rose-500',
      glowColor: 'group-hover:shadow-[0_15px_30px_rgba(244,63,94,0.15)]',
    };
  }

  const getCategoryIcon = () => {
    switch (categoryKey) {
      case 'uiUx':
        return <Paintbrush className="w-4 h-4 text-orange-400" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-sky-400" />;
      case 'accessibility':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'content':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  // 10-tick visual gauge segments
  const totalSegments = 10;
  const filledSegments = Math.round(safeScore);

  return (
    <div style={{ perspective: '800px' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 15 }}
        animate={
          shouldReduceMotion
            ? { opacity: 1, y: 0 }
            : {
                opacity: 1,
                y: 0,
                rotateX: tilt.x,
                rotateY: tilt.y,
                scale: isHovered ? 1.02 : 1.0,
              }
        }
        transition={{
          duration: 0.35,
          delay: index * 0.08,
          rotateX: { type: 'spring', stiffness: 220, damping: 20 },
          rotateY: { type: 'spring', stiffness: 220, damping: 20 },
        }}
        tabIndex={0}
        aria-label={`${label} metric: ${safeScore.toFixed(1)} out of 10. ${tier.label}. ${description}`}
        style={{ transformStyle: 'preserve-3d' }}
        className={`group relative rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-md transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900/95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${tier.bgAccent} ${tier.glowColor}`}
      >
        {/* Top Row: Category Title & Weight */}
        <div 
          className="flex items-center justify-between gap-2 mb-3"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-neutral-800 border border-neutral-700/80 shadow-inner">
              {getCategoryIcon()}
            </div>
            <h4 className="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider">
              {label}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
            {weight}% weight
          </span>
        </div>

        {/* Main Score Row with Numeric Fraction and Tier Badge */}
        <div 
          className="flex items-baseline justify-between gap-3 mb-3"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-neutral-100 tracking-tight">
              {displayScore.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-neutral-400">/10.0</span>
          </div>

          {/* Non-color Dependent Tier Badge (has explicit icon + textual label) */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${tier.colorClasses} shadow-sm`}
          >
            {tier.icon}
            <span>{tier.label}</span>
          </div>
        </div>

        {/* 10-Segmented Metric Gauge (accessible tick bars) */}
        <div 
          className="space-y-1 mb-3"
          style={{ transform: 'translateZ(15px)' }}
        >
          <div 
            className="grid grid-cols-10 gap-1 h-2 w-full"
            role="progressbar"
            aria-valuenow={safeScore}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-label={`${label} score: ${safeScore.toFixed(1)} out of 10`}
          >
            {Array.from({ length: totalSegments }).map((_, i) => {
              const isFilled = i < filledSegments;
              return (
                <div
                  key={i}
                  className={`h-full rounded-xs transition-all duration-300 ${
                    isFilled ? tier.barColor : 'bg-neutral-800'
                  }`}
                  title={`Level ${i + 1} of 10`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-neutral-400 px-0.5">
            <span>0 (Low)</span>
            <span>5.0</span>
            <span>10 (Target)</span>
          </div>
        </div>

        {/* Metric Contextual Description */}
        <p 
          className="text-xs text-neutral-400 font-sans leading-relaxed line-clamp-2"
          style={{ transform: 'translateZ(10px)' }}
        >
          {description}
        </p>
      </motion.div>
    </div>
  );
};

