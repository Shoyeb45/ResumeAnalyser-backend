"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { SectionAnalysis } from '@/types/resume';

interface SectionCardProps {
    title: string;
    analysis: SectionAnalysis;
    defaultExpanded?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    analysis,
    defaultExpanded = false
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Good': return 'bg-yellow-100 text-yellow-800';
            case 'Needs Improvement': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
            <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(analysis.overall_review)}`}>
                        {analysis.overall_review}
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isExpanded && (
                <div className="px-6 pb-6">
                    <p className="text-gray-600 mb-4">{analysis.description}</p>

                    {analysis.good.length > 0 && (
                        <div className="mb-4">
                            {analysis.good.map((positive, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-2">
                                    <CheckCircle className="text-green-500 mt-0.5" size={16} />
                                    <span className="text-sm text-gray-700">{positive}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {analysis.bad.length > 0 && (
                        <div className="mb-4">
                            {analysis.bad.map((warning, index) => (
                                <div key={index} className="flex items-start space-x-2 mb-2">
                                    <AlertCircle className="text-orange-500 mt-0.5" size={16} />
                                    <span className="text-sm text-gray-700">{warning}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {analysis.improvements.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <h4 className="font-medium text-yellow-800 mb-2">
                                {title === 'Work Experience' ? 'Critical improvements needed:' : 'Suggestions for improvement:'}
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {analysis.improvements.map((suggestion, index) => (
                                    <li key={index} className="text-sm text-yellow-700">{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};