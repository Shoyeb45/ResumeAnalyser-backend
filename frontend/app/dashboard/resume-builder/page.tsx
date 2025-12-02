"use client";

import { useState } from "react";
import { Upload, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import Loader from "@/components/dashboard/Loader";
import axios from "axios";

/**
 * ResumeStarter Component
 * 
 * A landing page component that provides users with two options to begin creating their resume:
 * 1. Import an existing resume file (PDF, DOC, DOCX) for AI-powered optimization
 * 2. Create a new resume from scratch using guided setup
 * 
 * Features:
 * - File upload functionality with support for multiple formats
 * - AI-powered resume extraction and parsing
 * - Navigation to resume builder with pre-populated or empty data
 * - Loading states during file processing
 * - Responsive design with hover effects
 * 
 * @returns {JSX.Element} The resume starter interface with import/create options
 */
export default function ResumeStarter() {

  const { setResumeData } = useDashboard();

  const router = useRouter();
  
  // State to manage loading state during file upload and processing
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the import existing resume functionality
   * Creates a file input element, processes the uploaded file through AI extraction,
   * and navigates to the resume builder with the extracted data
   */
  const handleImportClick = async () => {
    // Create a hidden file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx"; // Supported file formats

    // Handle file selection and processing
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true); // Show loading state

      try {
        // Prepare form data for file upload
        const formData = new FormData();
        formData.append("resume_file", file);

        // Send file to backend for AI processing and extraction
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Extract the parsed resume data from response
        const resumeExtracts = res.data.resume_details;

        // Set the extracted data in global state
        setResumeData(resumeExtracts);
        
        // Navigate to resume builder with populated data
        router.push("/dashboard/resume-builder/edit");
      } catch (error) {
        console.error("Error importing resume:", error);
        // TODO: Add user-friendly error handling/notification
      } finally {
        setIsLoading(false); // Hide loading state
      }
    };

    // Trigger file selection dialog
    input.click();
  };

  /**
   * Handles the create new resume functionality
   * Initializes empty resume data structure and navigates to the resume builder
   */
  const handleCreateClick = () => {
    // Initialize empty resume data structure with all required fields
    setResumeData({
      _id: '',
      resume_name: '',
      is_primary: false,
      personal_info: {
        name: '',
        contact_info: {
          email: '',
          mobile: '',
          location: '',
          social_links: {
            linkedin: '',
            github: '',
            portfolio: ''
          },
        },
        professional_summary: ''
      },
      educations: [],
      work_experiences: [],
      projects: [],
      skills: [],
      achievements: [],
      certifications: [],
      languages: [],
      publications: [],
      extracurriculars: [],
      ats_score: 0
    });
    
    // Navigate to resume builder with empty data
    router.push("/dashboard/resume-builder/edit");
  };

  // Show loading overlay while processing uploaded file
  if (isLoading)
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <Loader message="Processing your resume..." size="lg" />
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full flex flex-col justify-center items-center">
        {/* Header Section - Main title and description */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            How do you want to start?
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4 sm:px-0">
            Choose an option to begin building your resume tailored for the job you want.
          </p>
        </div>

        {/* Options Grid - Two main action cards */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
          {/* Import Existing Resume Option */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={handleImportClick}>
            <div className="flex flex-col items-center text-center">
              {/* Icon container with hover effect */}
              <div className="w-12 h-12 sm:w-13 sm:h-13 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Import existing resume
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Upload your current resume and we&apos;ll help you optimise them using AI.
              </p>
            </div>
          </div>

          {/* Create New Resume Option */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={handleCreateClick}>
            <div className="flex flex-col items-center text-center">
              {/* Icon container with hover effect */}
              <div className="w-12 h-12 sm:w-13 sm:h-13 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-purple-200 transition-colors">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Create from scratch
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Build your resume step-by-step with our guided setup process.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section - Additional guidance text */}
        <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
          <p className="text-xs sm:text-sm text-gray-500">
            Not sure which option to choose? You can always change your approach later.
          </p>
        </div>
      </div>
    </div>
  );
}