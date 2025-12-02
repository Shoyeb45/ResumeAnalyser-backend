"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Search, FileText, Layers2 } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { ResumeData, JobMatch, Resume, ResumeAnalysis } from '@/types/resume';
import JobMatchCard from '@/components/dashboard/resume-manager/JobMatchCard';
import ResumeCard from '@/components/dashboard/resume-manager/ResumeCard';
import DeleteConfirmationDialog from '@/components/dashboard/resume-manager/DeleteConfirmationDialog';
import EmptyState from '@/components/dashboard/resume-manager/EmptyState';
import { sortByDate } from '@/lib/utils';
import Shimmer from '@/components/dashboard/resume-manager/Shimmer';

/**
 * API service object containing all resume-related HTTP operations
 * Handles communication with the backend API for resume and job match operations
 */
const api = {
  /**
   * Fetches all resumes from the backend API
   * @returns Promise<Resume[]> Array of resume objects
   * @throws {Error} When API request fails
   */
  getResumes: async (): Promise<Resume[]> => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/`, {
      withCredentials: true
    });
    return response.data.resume;
  },

  /**
   * Fetches all job matches/resume analysis from the backend API
   * @returns Promise<JobMatch[]> Array of job match analysis objects
   * @throws {Error} When API request fails
   */
  getJobMatches: async (): Promise<JobMatch[]> => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/resume-analysis`, {
      withCredentials: true
    });
    return response.data.resume_analysis;
  },

  /**
   * Deletes a specific resume by ID
   * @param id - The unique identifier of the resume to delete
   * @returns Promise<void>
   * @throws {Error} When delete operation fails
   */
  deleteResume: async (id: string): Promise<void> => {
    await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/${id}`, {
      withCredentials: true
    });
  },

  /**
   * Deletes a specific job match analysis by ID
   * @param id - The unique identifier of the job match to delete
   * @returns Promise<void>
   * @throws {Error} When delete operation fails
   */
  deleteJobMatch: async (id: string): Promise<void> => {
    await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/resume-analysis/${id}`, {
      withCredentials: true
    });
  },
};

/**
 * ResumeManager Component
 * 
 * A comprehensive dashboard component for managing resumes and job match analyses.
 * Provides functionality to view, edit, delete, and search through resumes and job matches.
 * 
 * Features:
 * - Tabbed interface for different views (All, Resume Builder, Job Matches)
 * - Search functionality across all items
 * - Delete confirmation dialogs
 * - Loading states and error handling
 * - Integration with resume builder and job matcher
 * - Full mobile responsiveness
 * 
 * @component
 * @returns {JSX.Element} The rendered ResumeManager component
 */
const ResumeManager: React.FC = () => {
  const router = useRouter();
  
  // Tab state management - controls which view is currently active
  const [activeTab, setActiveTab] = useState<'all' | 'builder' | 'matches'>('all');
  
  // Data state management
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  
  // UI state management
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard context for sharing data between components
  const { setResumeData, setResumeAnalysisData } = useDashboard();

  /**
   * Delete confirmation modal state
   * Manages the state for the delete confirmation dialog
   */
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'resume' | 'jobMatch';
    id: string;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    type: 'resume',
    id: '',
    name: '',
    isDeleting: false
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads all resume and job match data from the API
   * Handles loading states and error management
   * Sorts data by date after successful fetch
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both resumes and job matches concurrently
      const [resumesData, matchesData] = await Promise.all([
        api.getResumes(),
        api.getJobMatches()
      ]);

      // Sort data by date and update state
      setResumes(sortByDate(resumesData));
      setJobMatches(sortByDate(matchesData));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates the resume deletion process
   * Opens confirmation dialog with resume details
   * @param id - The ID of the resume to delete
   */
  const handleDeleteResume = async (id: string) => {
    const resume = resumes.find(r => r._id === id);
    if (!resume) return;

    setDeleteConfirmation({
      isOpen: true,
      type: 'resume',
      id,
      name: resume.resume_name,
      isDeleting: false
    });
  };

  /**
   * Initiates the job match deletion process
   * Opens confirmation dialog with job match details
   * @param id - The ID of the job match to delete
   */
  const handleDeleteJobMatch = async (id: string) => {
    const match = jobMatches.find(m => m._id === id);
    if (!match) return;

    setDeleteConfirmation({
      isOpen: true,
      type: 'jobMatch',
      id,
      name: match.resume_metadata.resume_name,
      isDeleting: false
    });
  };

  /**
   * Confirms and executes the deletion operation
   * Handles both resume and job match deletions
   * Updates local state after successful deletion
   */
  const confirmDelete = async () => {
    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

    try {
      if (deleteConfirmation.type === 'resume') {
        await api.deleteResume(deleteConfirmation.id);
        // Remove deleted resume from local state
        setResumes(prev => prev.filter(resume => resume._id !== deleteConfirmation.id));
      } else {
        await api.deleteJobMatch(deleteConfirmation.id);
        // Remove deleted job match from local state
        setJobMatches(prev => prev.filter(match => match._id !== deleteConfirmation.id));
      }

      // Reset confirmation dialog state
      setDeleteConfirmation({
        isOpen: false,
        type: 'resume',
        id: '',
        name: '',
        isDeleting: false
      });
    } catch (error) {
      console.error('Error deleting:', error);
      setError(`Failed to delete ${deleteConfirmation.type}. Please try again.`);
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  /**
   * Closes the delete confirmation dialog
   * Prevents closing if deletion is in progress
   */
  const closeDeleteConfirmation = () => {
    if (deleteConfirmation.isDeleting) return;

    setDeleteConfirmation({
      isOpen: false,
      type: 'resume',
      id: '',
      name: '',
      isDeleting: false
    });
  };

  /**
   * Handles resume editing by navigating to the resume builder
   * Transforms resume data to the expected format and sets it in context
   * @param resume - The resume object to edit
   */
  const handleEditResume = (resume: Resume) => {
    // Transform resume data to match ResumeData interface
    const resumeData: ResumeData = {
      _id: resume._id,
      resume_name: resume.resume_name,
      is_primary: resume.is_primary,
      personal_info: resume.personal_info,
      educations: resume.educations,
      work_experiences: resume.work_experiences,
      projects: resume.projects,
      skills: resume.skills,
      achievements: resume.achievements,
      certifications: resume.certifications,
      languages: resume.languages,
      publications: resume.publications,
      extracurriculars: resume.extracurriculars,
      ats_score: resume.ats_score,
    };

    // Set resume data in context and navigate to edit page
    setResumeData(resumeData);
    router.push('/dashboard/resume-builder/edit');
  };

  /**
   * Handles job match viewing by navigating to the analysis page
   * Transforms job match data to the expected ResumeAnalysis format
   * @param match - The job match object to view
   */
  const handleViewJobMatch = (match: JobMatch) => {
    // Transform job match data to ResumeAnalysis format
    const analysisData: ResumeAnalysis = {
      success: true,
      message: 'Analysis retrieved successfully',
      resume_metadata: {
        resume_name: match.resume_metadata.resume_name,
        is_primary: false,
      },
      resume_analysis: {
        ats_score: match.ats_score,
        job_match_score: match.job_match_score,
        skill_match_percent: match.skill_match_percent,
        // Flatten skill groups into single arrays
        technical_skills: match.technical_skills.flatMap(group => group.skills),
        soft_skills: match.soft_skills.flatMap(group => group.skills),
        matched_skills: match.matched_skills,
        missing_skills: match.missing_skills,
        nlp_analysis: {
          word_count: 0,
          entities: [],
          keywords: [],
          role_match_score: match.job_match_score,
          role_matched: null,
        },
        llm_analysis: match.llm_analysis,
        job_title: match.job_title || 'Not specified',
      },
    };

    // Set analysis data in context and navigate to analysis page
    setResumeAnalysisData(analysisData);
    router.push('/dashboard/jd-matcher/resume-analysis');
  };

  // Filter resumes based on search term
  const filteredResumes = resumes.filter(resume =>
    resume.resume_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter job matches based on search term
  const filteredJobMatches = jobMatches.filter(match =>
    match.resume_metadata.resume_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Renders the main content based on current state and active tab
   * Handles loading states, errors, and different tab views
   * @returns {JSX.Element} The rendered content
   */
  const renderContent = () => {
    // Show loading shimmer while data is being fetched
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <Shimmer />
            </div>
          ))}
        </div>
      );
    }

    // Show error state with retry option
    if (error) {
      return (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Layers2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Render content based on active tab
    if (activeTab === 'all') {
      // Show empty state if no data exists
      if (resumes.length === 0 && jobMatches.length === 0) {
        return <EmptyState />;
      }

      return (
        <div className="space-y-6">
          {/* Resume Builder Section - Only show if resumes exist */}
          {resumes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>Resume Builder Uploads</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredResumes.map(resume => (
                  <ResumeCard
                    key={resume._id}
                    resume={resume}
                    onEdit={handleEditResume}
                    onDownload={(id) => console.log('Download', id)} // TODO: Implement download functionality
                    onDelete={handleDeleteResume}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Job Matches Section - Only show if job matches exist */}
          {jobMatches.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>Resume + JD Matching Analysis</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredJobMatches.map(match => (
                  <JobMatchCard
                    key={match._id}
                    match={match}
                    onViewResults={handleViewJobMatch}
                    onDelete={handleDeleteJobMatch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Builder tab - Show only resumes
    if (activeTab === 'builder') {
      if (resumes.length === 0) {
        return <EmptyState />;
      }

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>Resume Builder Uploads</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredResumes.map(resume => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  onEdit={handleEditResume}
                  onDownload={(id) => console.log('Download', id)} // TODO: Implement download functionality
                  onDelete={handleDeleteResume}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Matches tab - Show only job matches
    if (activeTab === 'matches') {
      if (jobMatches.length === 0) {
        return (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No job matches yet</h3>
            <p className="text-sm sm:text-base text-gray-600">Upload resumes and job descriptions to start matching.</p>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span>Resume + JD Matching Analysis</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobMatches.map(match => (
                <JobMatchCard
                  key={match._id}
                  match={match}
                  onViewResults={handleViewJobMatch}
                  onDelete={handleDeleteJobMatch}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Resume Manager</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage all your uploaded resumes and job descriptions in one place</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs and Search */}
        <div className="flex flex-col lg:flex-row lg:justify-between mb-6 space-y-4 lg:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full lg:w-fit overflow-x-auto">
            {[
              { id: 'all', label: 'All Files', count: resumes.length + jobMatches.length },
              { id: 'builder', label: 'Resume Builder', count: resumes.length },
              { id: 'matches', label: 'Job Matches', count: jobMatches.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'builder' | 'matches')}
                className={`px-3 sm:px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="hidden sm:inline">{tab.label} ({tab.count})</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]} ({tab.count})</span>
              </button>
            ))}
          </div>
          
          {/* Search Input */}
          <div className="flex items-center space-x-4">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 outline-none w-full text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pb-4">
          {renderContent()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={confirmDelete}
        title={deleteConfirmation.type === 'resume' ? 'Delete Resume' : 'Delete Job Match'}
        message={
          deleteConfirmation.type === 'resume'
            ? `Are you sure you want to delete this resume? This action cannot be undone.`
            : `Are you sure you want to delete this job match analysis? This action cannot be undone.`
        }
        itemName={deleteConfirmation.name}
        isDeleting={deleteConfirmation.isDeleting}
      />
    </div>
  );
};

export default ResumeManager;