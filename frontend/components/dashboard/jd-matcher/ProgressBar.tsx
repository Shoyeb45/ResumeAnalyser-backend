"use client";

import { motion } from 'framer-motion';

interface ProgressBarProps {
    label: string;
    percentage: number;
    color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    label,
    percentage,
}) => {
    const getColorClass = () => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <motion.div 
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="flex justify-between items-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                <motion.span 
                    className="text-sm font-medium text-gray-700"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                >
                    {label}
                </motion.span>
                <motion.span 
                    className="text-sm font-medium text-gray-700"
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    key={percentage} // Re-animate when percentage changes
                >
                    {percentage}%
                </motion.span>
            </motion.div>
            
            <motion.div 
                className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <motion.div
                    className={`h-2.5 rounded-full ${getColorClass()}`}
                    initial={{ width: 0, x: -10 }}
                    animate={{ 
                        width: `${percentage}%`,
                        x: 0
                    }}
                    transition={{ 
                        duration: 1.2,
                        delay: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth fill
                    }}
                    whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                    }}
                />
            </motion.div>
        </motion.div>
    );
};