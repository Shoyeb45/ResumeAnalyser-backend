"use client";

import React, { useState } from 'react';
import { Upload, FileCheck } from 'lucide-react';
import AnalysisProgressOverlay from '@/components/dashboard/jd-matcher/AnalysisProgressOverlay';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import axios from 'axios';

/**
 * Interface for resume file data structure
 */
interface ResumeFile {
    file: File;
    name: string;
    size: number;
}

/**
 * Interface for job details form data
 */
interface JobDetails {
    title: string;
    company: string;
    description: string;
}

/**
 * Resume Scanner Component
 * 
 * A comprehensive resume analysis tool that allows users to:
 * - Upload resume files via drag-and-drop or file picker
 * - Input job details (title, company, description)
 * - Submit for AI-powered resume analysis
 * - Navigate to analysis results
 * 
 * Features:
 * - File validation for PDF and Word documents
 * - Real-time form validation
 * - Progress overlay during analysis
 * - Error handling for API calls
 * - Responsive two-column layout
 * 
 * @returns {JSX.Element} The complete resume scanner interface
 */
export default function ResumeScanner() {
    // State for uploaded resume file
    const [resumeFile, setResumeFile] = useState<ResumeFile | null>(null);
    
    // State for job details form
    const [jobDetails, setJobDetails] = useState<JobDetails>({
        title: '',
        company: '',
        description: ''
    });
    
    // Loading state for analysis process
    const [isScanning, setIsScanning] = useState<boolean>(false);
    
    // Context and router hooks
    const { setResumeAnalysisData } = useDashboard();
    const router = useRouter();

    /**
     * Handles file upload through input element
     * Validates file type and creates ResumeFile object
     * 
     * @param event - File input change event
     */
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        
        // Validate file type - only PDF and Word documents allowed
        if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
            setResumeFile({
                file,
                name: file.name,
                size: file.size
            });
        }
    };

    /**
     * Prevents default drag over behavior to enable drop functionality
     * 
     * @param event - Drag event
     */
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
    };

    /**
     * Handles file drop functionality
     * Validates dropped file and sets resume file state
     * 
     * @param event - Drop event containing file data
     */
    const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        
        // Same validation as file upload
        if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
            setResumeFile({
                file,
                name: file.name,
                size: file.size
            });
        }
    };

    /**
     * Updates job details form fields
     * Uses dynamic field updating to handle all form inputs
     * 
     * @param field - The field to update (title, company, description)
     * @param value - The new value for the field
     */
    const handleJobDetailsChange = (field: keyof JobDetails, value: string): void => {
        setJobDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Initiates the resume analysis process
     * 
     * Steps:
     * 1. Validates form completion
     * 2. Creates FormData for multipart upload
     * 3. Sends POST request to analysis API
     * 4. Stores response data in context
     * 5. Navigates to results page
     * 
     * Error handling includes Axios-specific error checking
     */
    const handleStartScanning = async () => {
        // Validate all required fields are completed
        if (resumeFile && jobDetails.title && jobDetails.company && jobDetails.description) {

            setIsScanning(true);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('resume_file', resumeFile.file);
            formData.append('job_description', jobDetails.description);
            formData.append('job_title', jobDetails.title);

            try {
                // API call to backend analysis service
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/analyse`, formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                // Store analysis results in global context
                setResumeAnalysisData(response.data);
                
                // Navigate to results page
                router.push('/dashboard/jd-matcher/resume-analysis');

            } catch (error) {
                // Handle API errors with proper error checking
                if (axios.isAxiosError(error)) {
                    console.error('Error:', error.response?.data || error.message);
                    // TODO: Add user-facing error notification/toast
                }
            }
            setIsScanning(false);
        }
    };

    /**
     * Computed property to check if form is valid and ready for submission
     * All fields must be completed with non-empty trimmed values
     */
    const isFormValid: boolean = Boolean(
        resumeFile &&
        jobDetails.title.trim() &&
        jobDetails.company.trim() &&
        jobDetails.description.trim()
    );

    return (
        <div className="h-screen w-full bg-gray-50 relative overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                {/* Page Header */}
                <div className='mb-4 sm:mb-6'>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
                        Resume Scanner
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Upload your resume and job details to analyze the match.
                    </p>
                </div>

                {/* Main Content Card - Blurred during analysis */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isScanning ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'
                    }`}>
                    
                    {/* Two Column Layout - Resume Upload & Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        
                        {/* Left Section - Resume Upload */}
                        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100">
                            {/* Upload Section Header */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 flex items-center">
                                    Upload Resume
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    PDF or Word document
                                </p>
                            </div>

                            {/* Drag and Drop Upload Area */}
                            <div
                                className={`flex items-center justify-center h-3/4 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${resumeFile
                                    ? 'border-green-300 bg-green-50 p-6 sm:p-8'
                                    : 'border-gray-200 p-8 sm:p-12 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                {/* Hidden file input triggered by div click */}
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {/* Upload UI - Changes based on file upload state */}
                                <div className="text-center">
                                    {resumeFile ? (
                                        // File uploaded state - show file details
                                        <div className="space-y-3">
                                            <FileCheck className="mx-auto text-green-600" size={40} />
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{resumeFile.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    {(resumeFile.size / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400">Tap to change</p>
                                        </div>
                                    ) : (
                                        // No file uploaded state - show upload prompt
                                        <div className="space-y-3">
                                            <Upload className="mx-auto text-gray-300" size={40} />
                                            <div>
                                                <p className="text-gray-700 font-medium text-sm sm:text-base">
                                                    Drop your resume here
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                    or tap to browse
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Job Details Form */}
                        <div className="p-4 sm:p-6">
                            {/* Job Details Section Header */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 flex items-center">
                                    Job Details
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Information about the position
                                </p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Job Title and Company - Stack on mobile, side by side on desktop */}
                                <div className='w-full flex flex-col sm:flex-row gap-3'>
                                    <div className='w-full'>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={jobDetails.title}
                                            onChange={(e) => handleJobDetailsChange('title', e.target.value)}
                                            placeholder="Senior Software Engineer"
                                            className="w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div className='w-full'>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={jobDetails.company}
                                            onChange={(e) => handleJobDetailsChange('company', e.target.value)}
                                            placeholder="Company name"
                                            className="w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Job Description - Full width textarea */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description
                                    </label>
                                    <textarea
                                        value={jobDetails.description}
                                        onChange={(e) => handleJobDetailsChange('description', e.target.value)}
                                        placeholder="Paste the job description, requirements, and qualifications..."
                                        rows={6}
                                        className="h-56 w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Section */}
                    <div className="px-4 sm:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-center">
                            {/* Start Analysis Button */}
                            <button
                                onClick={handleStartScanning}
                                disabled={!isFormValid || isScanning}
                                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 text-sm sm:text-base ${isFormValid && !isScanning
                                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isScanning ? (
                                    // Loading state with spinner
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    // Ready state with icon
                                    <>
                                        <FileCheck size={20} />
                                        <span>Start Analysis</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Form validation message */}
                        {!isFormValid && (
                            <p className="text-center text-xs sm:text-sm text-gray-400 mt-3">
                                Please upload your resume and complete all fields
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Progress Overlay - Shown during API call */}
            <AnalysisProgressOverlay isScanning={isScanning} />

        </div>
    );
}