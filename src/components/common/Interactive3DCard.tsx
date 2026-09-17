import React, { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  glare?: boolean;
  depth?: number;
  onClick?: () => void;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  glare = true,
  depth = 20,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    setTilt({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div style={{ perspective: `${perspective}px` }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        animate={
          shouldReduceMotion
            ? { rotateX: 0, rotateY: 0, scale: 1 }
            : {
                rotateX: tilt.x,
                rotateY: tilt.y,
                scale: isHovered ? 1.02 : 1,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
          mass: 0.5,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className={`relative transition-shadow duration-300 ${
          isHovered
            ? 'shadow-[0_20px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(249,115,22,0.12)]'
            : 'shadow-lg'
        } ${className}`}
      >
        {/* Dynamic Interactive Specular Lighting Glare */}
        {glare && !shouldReduceMotion && (
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-30"
            style={{
              opacity: isHovered ? 0.35 : 0,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Content container preserving 3D child translations */}
        <div style={{ transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const Interactive3DItem: React.FC<{
  children: React.ReactNode;
  depth?: number;
  className?: string;
}> = ({ children, depth = 25, className = '' }) => {
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
