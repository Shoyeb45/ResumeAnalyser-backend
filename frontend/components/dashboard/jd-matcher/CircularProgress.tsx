"use client";
import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  animationDuration?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 170,
  strokeWidth = 16,
  color = '#3B82F6',
  label,
  animationDuration = 1.5
}) => {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const controls = useAnimation();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Motion values for glow effect
  const progress = useMotionValue(0);
  const glowOpacity = useTransform(progress, [0, 100], [0.3, 1]);

  useEffect(() => {
    const animateProgress = async () => {
      // Start rotation animation
      controls.start({
        rotate: 360,
        transition: {
          duration: animationDuration,
          ease: "easeOut",
          repeat: 0
        }
      });

      // Animate progress value for glow effect
      progress.set(percentage);
      
      // Animate counter with custom easing
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const duration = animationDuration * 1000;
        const progressValue = Math.min(elapsed / duration, 1);
        
        // Ease out function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progressValue, 3);
        const currentValue = Math.floor(easeOut * percentage);
        
        setDisplayPercentage(currentValue);
        
        if (progressValue < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };

    animateProgress();
  }, [percentage, animationDuration, controls, progress]);

  return (
    <motion.div 
      className="relative inline-flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Animated container for rotation */}
      <motion.div
        animate={controls}
        className="transform -rotate-90"
      >
        <svg width={size} height={size}>
          {/* Background circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Glow effect circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth / 2}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            className="blur-sm"
            style={{
              opacity: glowOpacity
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
            transition={{ 
              duration: animationDuration, 
              ease: "easeOut",
              delay: 0.2
            }}
          />
          
          {/* Main progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * percentage) / 100 }}
            transition={{ 
              duration: animationDuration, 
              ease: "easeOut",
              delay: 0.2
            }}
          />
        </svg>
      </motion.div>
      
      {/* Center content with advanced animations */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-3xl font-bold text-gray-900"
          initial={{ scale: 0.5, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut",
            delay: 0.3
          }}
          whileHover={{ scale: 1.05 }}
        >
          {displayPercentage}%
        </motion.span>
        
        {label && (
          <motion.span 
            className="text-sm text-gray-600 mt-1 font-medium"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              delay: 0.6
            }}
          >
            {label}
          </motion.span>
        )}
      </div>

      {/* Floating particles effect */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          style={{
            top: `${30 + i * 15}%`,
            left: `${80 + i * 5}%`,
          }}
          animate={{
            y: [-10, -20, -10],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
};