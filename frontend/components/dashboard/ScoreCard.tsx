import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CircularProgress } from '../dashboard/jd-matcher/CircularProgress';

const ScoreCard: React.FC<{
    title: string;
    score: number;
    color: string;
    subtitle?: string;
    tooltipText?: string;
    label: string;
}> = ({ title, score, color, subtitle, tooltipText, label }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{title}</h3>
                <div className="relative flex-shrink-0">
                    <Info 
                        className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    />
                    {showTooltip && tooltipText && (
                        <div className="absolute right-0 top-6 z-10 w-48 sm:w-64 p-3 bg-gray-100 text-xs sm:text-sm rounded-lg shadow-lg">
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-100 transform rotate-45"></div>
                            {tooltipText}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-center mb-3 sm:mb-4">
                <CircularProgress label={label} percentage={score} color={color} />
            </div>
            <div className="text-center">
                {subtitle && <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">{subtitle}</p>}
            </div>
        </div>
    );
};

export default ScoreCard;