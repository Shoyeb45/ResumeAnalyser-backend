"use client";

import { ResumeHeader } from '@/components/dashboard/jd-matcher/ResumeHeader';
import { CircularProgress } from '@/components/dashboard/jd-matcher/CircularProgress';
import { ProgressBar } from '@/components/dashboard/jd-matcher/ProgressBar';
import { SkillTag } from '@/components/dashboard/jd-matcher/SkillTag';
import { SectionCard } from '@/components/dashboard/jd-matcher/SectionCard';
import { ResumeJDUpload } from '@/components/dashboard/ResumeJdUpload';
import { Copy } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

/**
 * JD Matcher Component
 * 
 * A comprehensive resume analysis dashboard that provides:
 * - ATS (Applicant Tracking System) compatibility scoring
 * - Job description matching analysis
 * - AI-generated resume summary
 * - Section-by-section detailed analysis
 * - Skills matching and gap identification
 * 
 * The component displays analysis results in a responsive grid layout with
 * interactive elements for downloading reports and copying content.
 * 
 * @returns {JSX.Element} The complete JD Matcher dashboard interface
 */
export default function JdMatcher() {

  // Extract necessary data and functions from dashboard context
  const { openDialog, setOpenDialog, resumeAnalysisData } = useDashboard();

  /**
   * Handles the download functionality for the analysis report
   * TODO: Implement actual report generation and download logic
   */
  const handleDownload = () => {
    console.log('Downloading report...');
  };

  /**
   * Opens the upload dialog for new resume/JD analysis
   * Sets the dialog state to true to show the upload interface
   */
  const handleUploadNew = () => {
    setOpenDialog(true);
  };

  /**
   * Copies the AI-generated resume summary to the user's clipboard
   * Uses the modern Clipboard API with proper error handling
   */
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(resumeAnalysisData?.resume_analysis?.llm_analysis?.overall_analysis?.resume_summary || '')
      .then(() => {
        console.log('Summary copied to clipboard');
        // TODO: Add user-facing success notification/toast
      })
      .catch(err => {
        console.error('Failed to copy summary: ', err);
        // TODO: Add user-facing error notification
      });
  };

  // Show upload interface if dialog is open
  if (openDialog) {
    return <>
      <ResumeJDUpload />
    </>
  }

  // Main dashboard render - only show if analysis data exists
  return (
    resumeAnalysisData &&
    <div className="h-screen bg-gray-50 overflow-y-scroll">
      {/* Sticky header with resume info and action buttons */}
      <div className='sticky top-0 px-4 sm:px-6 lg:px-8 py-4 shadow-sm bg-white border-b border-gray-100 z-10'>
        <ResumeHeader
          fileName={resumeAnalysisData.resume_metadata.resume_name} 
          onDownload={handleDownload}
          onUploadNew={handleUploadNew}
        />
      </div>
      
      {/* Main content container with responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
          
          {/* ATS Compatibility Score Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">ATS Compatibility Score</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4 sm:mb-6">
              How well your resume passes automated screening
            </p>

            {/* ATS Score Display with circular progress and detailed metrics */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6 sm:mt-12">
              {/* Overall ATS Score */}
              <div className="flex-shrink-0">
                <CircularProgress
                  percentage={resumeAnalysisData.resume_analysis.ats_score.ats_score}
                  color="#3B82F6"
                  label="ATS Score"
                />
              </div>

              {/* Detailed ATS Metrics */}
              <div className="flex-1 w-full">
                <ProgressBar
                  label="Format Compliance"
                  percentage={resumeAnalysisData.resume_analysis.ats_score.format_compliance}
                />
                <ProgressBar
                  label="Keyword Optimization"
                  percentage={resumeAnalysisData.resume_analysis.ats_score.keyword_optimization}
                />
                <ProgressBar
                  label="Readability"
                  percentage={resumeAnalysisData.resume_analysis.ats_score.readability}
                />
              </div>
            </div>
          </div>

          {/* Job Description Match Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Job Description Match</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4 sm:mb-6">
              For: {resumeAnalysisData.resume_analysis.job_title}
            </p>

            {/* Job Match Score and Skills Analysis */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mt-6 sm:mt-12">
              {/* Overall Match Score */}
              <div className="flex justify-center sm:justify-start flex-shrink-0">
                <CircularProgress
                  percentage={resumeAnalysisData.resume_analysis.job_match_score}
                  color="#10B981"
                  label="Match Rate"
                />
              </div>

              {/* Skills Breakdown */}
              <div className="flex-1 space-y-4">
                {/* Matched Skills */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Key Matched Skills</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {resumeAnalysisData.resume_analysis.matched_skills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} type="matched" />
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Missing Skills</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {resumeAnalysisData.resume_analysis.missing_skills.map((skill, index) => (
                      <SkillTag key={index} skill={skill} type="missing" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Resume Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">AI-Generated Resume Summary</h2>
          </div>
          {/* Summary text with proper typography */}
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{resumeAnalysisData.resume_analysis.llm_analysis.overall_analysis.resume_summary}</p>
          
          {/* Copy to clipboard button */}
          <div className="flex justify-end mt-4 cursor-pointer">
            <span className="text-xs sm:text-sm text-gray-500 px-3 py-2 rounded w-fit hover:bg-gray-50 hover:text-blue-500"
              onClick={handleCopyToClipboard}>
              <Copy size={14} className="inline mr-1 sm:mr-2" />
              Copy to clipboard
            </span>
          </div>
        </div>

        {/* Section-by-Section Analysis */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Section-by-Section Analysis</h2>

          {/* Individual section analysis cards with responsive spacing */}
          <div className="space-y-4 sm:space-y-6">
            <SectionCard
              title="Education"
              analysis={resumeAnalysisData.resume_analysis.llm_analysis.section_wise_analysis.education}
            />

            <SectionCard
              title="Work Experience"
              analysis={resumeAnalysisData.resume_analysis.llm_analysis.section_wise_analysis.experience}
            />

            <SectionCard
              title="Projects"
              analysis={resumeAnalysisData.resume_analysis.llm_analysis.section_wise_analysis.projects}
            />

            <SectionCard
              title="Skills"
              analysis={resumeAnalysisData.resume_analysis.llm_analysis.section_wise_analysis.skills}
            />

            <SectionCard
              title="Extracurricular"
              analysis={resumeAnalysisData.resume_analysis.llm_analysis.section_wise_analysis.extracurricular}
            />
          </div>
        </div>
      </div>
    </div>
  );
}