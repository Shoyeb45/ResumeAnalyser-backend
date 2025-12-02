"use client";

import { Download, Upload } from 'lucide-react';

interface ResumeHeaderProps {
    fileName: string;
    onDownload: () => void;
    onUploadNew: () => void;
}

export const ResumeHeader: React.FC<ResumeHeaderProps> = ({
    fileName,
    onDownload,
    onUploadNew
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 z-1">
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                    Resume Analysis
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-sm sm:text-base text-gray-700 font-medium truncate">
                        {fileName}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded w-fit">
                        Analyzed
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-3">
                    <button
                        onClick={onDownload}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Download resume"
                    >
                        <Download size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={onUploadNew}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 sm:gap-2 cursor-pointer text-sm sm:text-base"
                    >
                        <Upload size={16} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Upload New Resume</span>
                        <span className="sm:hidden">Upload</span>
                    </button>
                </div>
            </div>
        </div>
    );
};