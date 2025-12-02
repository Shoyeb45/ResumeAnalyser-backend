"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import ATSOptimization from '@/components/dashboard/ATSOptimization';
import StrengthsAndImprovements from '@/components/dashboard/StrengthsAndImprovements';
import CurrentResume from '@/components/dashboard/CurrentResume';
import ScoreCard from '@/components/dashboard/ScoreCard';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LatestResumeData } from '@/types/resume';


const ResumeDashboard: React.FC = () => {
  const [resumeData, setResumeData] = useState<LatestResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  interface ApiResumeResponse {
    _id: string;
    resume_id: string;
    updated_at: string;
    resume_metadata: {
      resume_name?: string;
    };
    ats_score: {
      ats_score: number;
    };
    job_match_score: number;
    llm_analysis: {
      overall_analysis: {
        overall_strengths: {
          description: string;
          weightage: number;
        }[];
        areas_for_improvement: {
          description: string;
          weightage: number;
        }[];
        ats_optimization_suggestions: {
          description: string;
          weightage: number;
        }[];
        job_fit_assessment: {
          score: number;
          notes: string;
        };
        recommendation_score: number;
        resume_summary: string;
      };
    };
    techinal_skills: string[];
    soft_skills: string[];
    job_title: string;
  }

  // Transform API response to component format
  const transformApiResponse = (data: ApiResumeResponse): LatestResumeData => ({
    id: data._id,
    resumeId: data.resume_id,
    fileName: data.resume_metadata.resume_name || 'Latest Resume',
    lastUpdated: new Date(data.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    analysisStatus: 'completed',
    atsScore: data.ats_score.ats_score,
    matchRate: Math.round(data.job_match_score),
    overallStrengths: data.llm_analysis.overall_analysis.overall_strengths,
    areasForImprovement: data.llm_analysis.overall_analysis.areas_for_improvement,
    atsOptimizationSuggestions: data.llm_analysis.overall_analysis.ats_optimization_suggestions,
    jobFitAssessment: data.llm_analysis.overall_analysis.job_fit_assessment,
    recommendationScore: data.llm_analysis.overall_analysis.recommendation_score,
    resumeSummary: data.llm_analysis.overall_analysis.resume_summary,
    technicalSkills: data.techinal_skills || [],
    softSkills: data.soft_skills || [],
    jobTitle: data.job_title
  });

  // Function to get ATS score subtitle based on score
  const getATSSubtitle = (score: number): string => {
    if (score >= 90) return "Excellent ATS optimization";
    if (score >= 80) return "Very good ATS compatibility";
    if (score >= 70) return "Good ATS-friendly resume";
    if (score >= 60) return "Your resume is moderately ATS-friendly";
    if (score >= 50) return "Fair ATS compatibility - needs improvement";
    if (score >= 40) return "Poor ATS optimization";
    return "Critical ATS issues - immediate attention needed";
  };

  // Function to get JD match subtitle based on score
  const getJDMatchSubtitle = (score: number): string => {
    if (score >= 90) return "Excellent match with job requirements";
    if (score >= 80) return "Very good alignment with the role";
    if (score >= 70) return "Good match for the position";
    if (score >= 60) return "Moderate alignment with job requirements";
    if (score >= 50) return "Room for improvement in role alignment";
    if (score >= 40) return "Poor match with job requirements";
    return "Significant gaps in job requirements match";
  };

  const navigateToJDMatcher = () => {
    router.push('/dashboard/jd-matcher');
  };

  /**
   * Fetches latest resume analysis from API
   * Always fetches fresh data to ensure latest information is displayed
   */
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching latest resume data from API');

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/latest-analysis`, {
          withCredentials: true,
        });

        console.log('Successfully fetched resume data');

        if (response.data.success && response.data.resume_analysis.length !== 0) {
          setHasResume(true);
          const transformedData = transformApiResponse(response.data.resume_analysis);
          setResumeData(transformedData);

          // Skills context is managed by SkillExtraction component
          setUserName(response.data.user_name || 'User');
        } else {
          setHasResume(false);
          setResumeData(null);
          // Skills context is managed by SkillExtraction component
        }
      } catch (err) {
        console.error('Error fetching resume data:', err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            // No resume found
            setHasResume(false);
            setResumeData(null);
          } else {
            setError(`API Error: ${err.response?.data?.message || err.message}`);
          }
        } else {
          setError('An unexpected error occurred while fetching resume data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, []); // Empty dependency array to run only once

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show upload overlay if no resume exists
  if (!hasResume) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center relative px-4">
        {/* Blurred Background Content */}
        <div className="absolute inset-0 bg-gray-50 p-4 sm:p-6 blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {userName} 👋
              </h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base w-full sm:w-auto">
                Upload New Resume
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-40 sm:h-48"></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-40 sm:h-48"></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-40 sm:h-48 sm:col-span-2 lg:col-span-1"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-80 sm:h-96"></div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 h-80 sm:h-96"></div>
            </div>
          </div>
        </div>

        {/* Upload CTA Overlay */}
        <div className="relative z-10 bg-white rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-4 text-center shadow-2xl">
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-600 rounded-full p-3 sm:p-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Welcome to Your Resume Dashboard
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Get started by uploading your resume to unlock powerful AI-driven insights,
              ATS compatibility scores, and personalized career recommendations.
            </p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-700">AI-powered resume analysis</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-700">ATS compatibility scoring</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-700">Personalized career insights</span>
              </div>
            </div>
            <button
              onClick={navigateToJDMatcher}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Upload Your Resume
            </button>
            <p className="text-xs text-gray-500 mt-2 sm:mt-3">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard only when user has a resume
  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
            Welcome back, {userName} 👋
          </h1>
          <button
            onClick={navigateToJDMatcher}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Upload className="h-4 w-4" />
            Upload New Resume
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Top Section - Resume, ATS Score, JD Match */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Current Resume - Full width on mobile, spans 2 columns on tablet */}
            <div className="sm:col-span-2 lg:col-span-1">
              <CurrentResume
                data={resumeData}
                onUpload={navigateToJDMatcher}
              />
            </div>

            {/* Score Cards - Stack vertically on mobile, side by side on tablet+ */}
            <div className="sm:col-span-1">
              <ScoreCard
                title="ATS Compatibility Score"
                score={resumeData?.atsScore || 0}
                color="#3b82f6"
                subtitle={getATSSubtitle(resumeData?.atsScore || 0)}
                label="ATS Score"
                tooltipText="This score indicates how well your resume is optimized for Applicant Tracking Systems (ATS). Higher scores mean better compatibility with automated screening tools."
              />
            </div>

            <div className="sm:col-span-1">
              <ScoreCard
                title="Job Description Match"
                score={resumeData?.matchRate || 0}
                color="#f59e0b"
                label="Match Score"
                subtitle={getJDMatchSubtitle(resumeData?.matchRate || 0)}
                tooltipText="This score indicates how well your resume matches the job description provided. It analyzes skills, experience, and qualifications alignment."
              />
            </div>
          </div>

          {/* Bottom Section - Analysis Components */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="order-2 xl:order-1">
              <StrengthsAndImprovements
                strengths={resumeData?.overallStrengths || []}
                improvements={resumeData?.areasForImprovement || []}
              />
            </div>
            <div className="order-1 xl:order-2">
              <ATSOptimization
                suggestions={resumeData?.atsOptimizationSuggestions || []}
                jobFitAssessment={resumeData?.jobFitAssessment || { score: 0, notes: "Analysis in progress..." }}
                resumeSummary={resumeData?.resumeSummary || "Analysis in progress..."}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDashboard;