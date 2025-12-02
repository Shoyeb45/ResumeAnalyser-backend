"use client";

import React, { useState } from 'react';
import { Upload, FileCheck, X } from 'lucide-react';
import AnalysisProgressOverlay from '@/components/dashboard/jd-matcher/AnalysisProgressOverlay';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import axios from 'axios';

interface ResumeFile {
  file: File;
  name: string;
  size: number;
}

interface JobDetails {
  title: string;
  company: string;
  description: string;
}

export function ResumeJDUpload() {
  const [resumeFile, setResumeFile] = useState<ResumeFile | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    title: '',
    company: '',
    description: ''
  });
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const { setOpenDialog, setResumeAnalysisData } = useDashboard();
  const router = useRouter();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setResumeFile({

        file,
        name: file.name,
        size: file.size
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setResumeFile({
        file,
        name: file.name,
        size: file.size
      });
    }
  };

  const handleJobDetailsChange = (field: keyof JobDetails, value: string): void => {
    setJobDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartScanning = async () => {
    if (resumeFile && jobDetails.title && jobDetails.company && jobDetails.description) {

      setIsScanning(true);
      setResumeAnalysisData(null);
      const formData = new FormData();

      formData.append('resume_file', resumeFile.file);
      formData.append('job_description', jobDetails.description);
      formData.append('job_title', jobDetails.title);

      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/analyse`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        setOpenDialog(false);
        setResumeAnalysisData(response.data);
        router.push('/dashboard/jd-matcher/resume-analysis');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error:', error.response?.data || error.message);
        }
      } finally {
        setIsScanning(false);
      }
    }
  };


  const handleCloseDialogBox = (): void => {
    setResumeFile(null);
    setJobDetails({
      title: '',
      company: '',
      description: ''
    });
    setIsScanning(false);
    setOpenDialog(false);
  }

  const isFormValid: boolean = Boolean(
    resumeFile &&
    jobDetails.title.trim() &&
    jobDetails.company.trim() &&
    jobDetails.description.trim()
  );


  return (
    <div className="fixed inset-1 flex justify-center items-center z-50 min-h-screen bg-black/30 backdrop-blur-xs ">
      <div className="w-full max-w-6xl p-10">
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isScanning ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'
          }`}>
          <div className='w-full flex justify-end '
            onClick={handleCloseDialogBox}>
            <X size={32} className=' p-2 m-2 rounded hover:bg-gray-100 transition-colors duration-300' />
          </div>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Section - Resume Upload */}
            <div className="p-6 border-r border-gray-100">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2 flex items-center">
                  Upload Resume
                </h2>
                <p className="text-gray-500 text-sm">
                  PDF or Word document
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${resumeFile
                  ? 'border-green-300 bg-green-50 p-22'
                  : 'border-gray-200 p-25 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="text-center">
                  {resumeFile ? (
                    <div className="space-y-3">
                      <FileCheck className="mx-auto text-green-600" size={48} />
                      <div>
                        <p className="font-medium text-gray-900">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto text-gray-300" size={48} />
                      <div>
                        <p className="text-gray-700 font-medium">
                          Drop your resume here
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Job Details */}
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-medium text-gray-900 mb-2 flex items-center">
                  Job Details
                </h2>
                <p className="text-gray-500 text-sm">
                  Information about the position
                </p>
              </div>

              <div className="space-y-6">
                <div className='w-full flex gap-3'>
                  <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobDetails.title}
                      onChange={(e) => handleJobDetailsChange('title', e.target.value)}
                      placeholder="Senior Software Engineer"
                      className="w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 transition-colors"
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
                      className="w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDetails.description}
                    onChange={(e) => handleJobDetailsChange('description', e.target.value)}
                    placeholder="Paste the job description, requirements, and qualifications..."
                    rows={8}
                    className="w-full text-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-center">
              <button
                onClick={handleStartScanning}
                disabled={!isFormValid || isScanning}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${isFormValid && !isScanning
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FileCheck size={20} />
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>

            {!isFormValid && (
              <p className="text-center text-sm text-gray-400 mt-3">
                Please upload your resume and complete all fields
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Progress Overlay */}
      <AnalysisProgressOverlay isScanning={isScanning} />

    </div>
  );
}