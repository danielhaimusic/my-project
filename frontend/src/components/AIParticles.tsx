
import React from 'react';
import { motion } from 'framer-motion';

const AIParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    initialX: Math.random() * window.innerWidth,
    initialY: Math.random() * window.innerHeight,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            x: particle.initialX,
            y: particle.initialY,
            opacity: 0,
          }}
          animate={{
            x: [
              particle.initialX,
              particle.initialX + (Math.random() - 0.5) * 400,
              particle.initialX + (Math.random() - 0.5) * 800,
            ],
            y: [
              particle.initialY,
              particle.initialY + (Math.random() - 0.5) * 400,
              particle.initialY + (Math.random() - 0.5) * 800,
            ],
            opacity: [0, 0.6, 0.3, 0],
            scale: [0.5, 1, 1.5, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Neural network lines */}
      <svg className="absolute inset-0 w-full h-full">
        {Array.from({ length: 8 }, (_, i) => {
          const x1 = (i * window.innerWidth) / 8;
          const y1 = Math.random() * window.innerHeight;
          const x2 = ((i + 1) * window.innerWidth) / 8;
          const y2 = Math.random() * window.innerHeight;
          
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary/10"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AIParticles;
