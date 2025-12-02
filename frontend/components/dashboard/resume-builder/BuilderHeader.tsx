"use client";

import { Save, Download, RefreshCw } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import ReactToPdf from 'react-to-pdf';
import { useState } from 'react';

const BuilderHeader: React.FC<{
    score: number;
    onSave: () => void;
    onRefresh: () => void;
}> = ({ score, onSave, onRefresh }) => {

    const { resumeRef } = useDashboard();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleDownloadPdf = async () => {
        if (resumeRef?.current) {
            try {
                await ReactToPdf(resumeRef, {
                    filename: 'resume.pdf',
                    page: {
                        margin: 5,
                        format: 'a4',
                    },
                    canvas: {
                        mimeType: 'image/png',
                        qualityRatio: 1,
                    },
                });
            } catch (error) {
                console.error('Error generating PDF:', error);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate save operation
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call the actual save function
            onSave();
        } catch (error) {
            console.error('Error saving resume:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Call the actual refresh function
            await onRefresh();
        } catch (error) {
            console.error('Error refreshing ATS score:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
                {/* Title Section */}
                <div className="flex flex-col">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                        Resume Builder
                    </h1>
                    <span className="text-sm sm:text-base text-gray-700 font-medium">
                        Create and optimize your professional resume
                    </span>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-center">
                    {/* ATS Score Widget */}
                    <div className="border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${isRefreshing ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                aria-label="Refresh ATS Score"
                            >
                                <RefreshCw
                                    size={20}
                                    className={`${isRefreshing ? 'animate-spin' : ''}`}
                                />
                            </button>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500">ATS Score</span>
                                    <div>
                                        <span className="text-xl font-bold text-gray-900">{score}</span>
                                        <span className="text-sm text-gray-500">/100</span>
                                    </div>
                                </div>

                                {/* Score Circle */}
                                <div className="w-10 h-10 flex-shrink-0">
                                    <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="4"
                                            strokeDasharray={`${score}, 100`}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-2 sm:gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            aria-label={isSaving ? 'Saving resume...' : 'Save resume'}
                        >
                            <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
                            <span className="text-sm sm:text-base">{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>

                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-300"
                            aria-label="Download resume as PDF"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Download PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default BuilderHeader;