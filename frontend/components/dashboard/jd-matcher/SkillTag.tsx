"use client";

import { motion } from "framer-motion";

interface SkillTagProps {
    skill: string;
    type: 'matched' | 'missing';
}

export const SkillTag: React.FC<SkillTagProps> = ({ skill, type }) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50";
    const typeClasses = type === 'matched'
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
        <motion.span 
            className={`${baseClasses} ${typeClasses}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
            }}
            whileHover={{ scale: 1.05 }}
        >
            {skill}
        </motion.span>
    );
};