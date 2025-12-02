"use client";

import { Eye, Trash2, Layers2 } from 'lucide-react';
import { JobMatch } from '@/types/resume';
import { formatDate } from '@/lib/utils';

const JobMatchCard: React.FC<{
    match: JobMatch;
    onViewResults: (match: JobMatch) => void;
    onDelete: (id: string) => void;
}> = ({ match, onViewResults, onDelete }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const matchScore = Math.round(match.job_match_score);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className='w-48 sm:w-70'>
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{match.resume_metadata.resume_name}</h3> 
                        <p className="text-xs sm:text-sm text-gray-500">Analyzed on {formatDate(match.created_at)}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Match Score:</span>
                    <span className={`text-lg sm:text-xl font-bold ${getScoreColor(matchScore)}`}>
                        {matchScore}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full ${getScoreBgColor(matchScore)}`}
                        style={{ width: `${matchScore}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Layers2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm text-gray-600">
                        For: {match.job_title || 'Not specified'}
                    </span>
                </div>
            </div>

            {/* Mobile: Stack buttons vertically, Desktop: Horizontal layout */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => onViewResults(match)}
                    className="flex items-center  justify-center space-x-1 px-3 py-2 sm:py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded w-full"
                >
                    <Eye className="w-4 h-4" />
                    <span>View </span>
                </button>
                <button
                    onClick={() => onDelete(match._id)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 sm:py-1.5 text-sm text-red-600 hover:bg-red-50 rounded w-full"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
};

export default JobMatchCard;