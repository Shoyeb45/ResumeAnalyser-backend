"use client";

import React, { useState, useCallback } from 'react';
import { User, GraduationCap, Code, Briefcase, Award, Users, X, Edit2, Check } from 'lucide-react';
import PersonalInfoForm from '@/components/dashboard/resume-builder/PersonalInfoForm';
import EducationForm from '@/components/dashboard/resume-builder/EducationForm';
import ProjectsForm from '@/components/dashboard/resume-builder/ProjectsForm';
import ExperienceForm from '@/components/dashboard/resume-builder/ExperienceForm';
import TechnicalSkillsForm from '@/components/dashboard/resume-builder/TechnicalSkillsForm';
import ExtracurricularForm from '@/components/dashboard/resume-builder/ExtracurricularForm';
import CertificationsForm from '@/components/dashboard/resume-builder/CertificationsForm';
import ResumeTemplate from '@/components/dashboard/resume-builder/ResumeTemplate';
import BuilderHeader from '@/components/dashboard/resume-builder/BuilderHeader';
import { PersonalInfo, Education, Project, WorkExperience, Extracurricular, Certification, Skill } from '@/types/resume';
import { useDashboard } from '@/context/DashboardContext';
import axios from 'axios';

/**
 * ResumeBuilder Component
 * 
 * A comprehensive resume building interface that allows users to create and edit their resumes
 * through a multi-section form with live preview functionality.
 * 
 * Features:
 * - Multi-section form navigation (Personal Info, Education, Projects, Experience, Skills, etc.)
 * - Live preview of resume changes
 * - Auto-save functionality
 * - ATS score calculation and refresh
 * - Resume name editing with inline editing capabilities
 * - Responsive design with grid layout
 * 
 * @returns {JSX.Element} The complete resume builder interface
 */
const ResumeBuilder: React.FC = () => {
  const { resumeData, setResumeData } = useDashboard();
  
  // State for managing the currently active form section
  const [activeSection, setActiveSection] = useState<string>('personal');
  
  // State for managing the resume name dialog
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempResumeName, setTempResumeName] = useState('');
  
  // State for inline resume name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  /**
   * Updates the personal information section of the resume
   * @param {PersonalInfo} data - The personal information data to update
   */
  const updatePersonalInfo = useCallback((data: PersonalInfo) => {
    setResumeData(prev => ({ ...prev, personal_info: data }));
  }, [setResumeData]);

  /**
   * Updates the education section of the resume
   * @param {Education[]} data - Array of education entries to update
   */
  const updateEducation = useCallback((data: Education[]) => {
    setResumeData(prev => ({ ...prev, educations: data }));
  }, [setResumeData]);

  /**
   * Updates the projects section of the resume
   * @param {Project[]} data - Array of project entries to update
   */
  const updateProjects = useCallback((data: Project[]) => {
    setResumeData(prev => ({ ...prev, projects: data }));
  }, [setResumeData]);

  /**
   * Updates the work experience section of the resume
   * @param {WorkExperience[]} data - Array of work experience entries to update
   */
  const updateExperience = useCallback((data: WorkExperience[]) => {
    setResumeData(prev => ({ ...prev, work_experiences: data }));
  }, [setResumeData]);

  /**
   * Updates the technical skills section of the resume
   * @param {Skill[]} data - Array of skill entries to update
   */
  const updateTechnicalSkills = useCallback((data: Skill[]) => {
    setResumeData(prev => ({ ...prev, skills: data }));
  }, [setResumeData]);

  /**
   * Updates the extracurricular activities section of the resume
   * @param {Extracurricular[]} data - Array of extracurricular entries to update
   */
  const updateExtracurricular = useCallback((data: Extracurricular[]) => {
    setResumeData(prev => ({ ...prev, extracurriculars: data }));
  }, [setResumeData]);

  /**
   * Updates the certifications section of the resume
   * @param {Certification[]} data - Array of certification entries to update
   */
  const updateCertifications = useCallback((data: Certification[]) => {
    setResumeData(prev => ({ ...prev, certifications: data }));
  }, [setResumeData]);

  /**
   * Refreshes the ATS (Applicant Tracking System) score for the current resume
   * Makes an API call to recalculate the ATS score based on current resume data
   */
  const handleRefresh = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/ats-score`, {
        resume_json: JSON.stringify(resumeData)
      }, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResumeData(prev => ({ ...prev, ats_score: res.data.ats_score.ats_score }));
    } catch (error) {
      console.error("Error refreshing ATS score:", error);
    }
  }

  /**
   * Performs the actual save operation to the backend
   * @param {Object} dataToSave - The resume data to save (defaults to current resumeData)
   */
  const performSave = async (dataToSave = resumeData) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume`, {
        "resume_update_data": JSON.stringify(dataToSave)
      }, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error saving resume:", error.response?.data || error.message);
      }
    }
  }

  /**
   * Handles the save action, checking for resume name before saving
   * If no resume name exists, shows the name dialog
   */
  const handleSave = async () => {
    // Check if resume name is empty
    if (!resumeData?.resume_name || resumeData.resume_name.trim() === '') {
      setShowNameDialog(true);
      return;
    }
    await performSave();
  }

  /**
   * Handles saving the resume name from the dialog
   * Validates the name and updates the resume data before saving
   */
  const handleNameDialogSave = async () => {
    if (tempResumeName.trim() === '') {
      return; // Don't save if name is still empty
    }
    
    // Create updated resume data with the new name
    const updatedResumeData = { ...resumeData, resume_name: tempResumeName.trim() };
    
    // Update resume data state
    setResumeData(updatedResumeData);
    setShowNameDialog(false);
    setTempResumeName('');
    
    // Perform the actual save with updated data
    await performSave(updatedResumeData);
  }

  /**
   * Handles cancelling the resume name dialog
   * Resets the dialog state without saving
   */
  const handleNameDialogCancel = () => {
    setShowNameDialog(false);
    setTempResumeName('');
  }

  /**
   * Initiates inline editing of the resume name
   * Sets up the editing state with the current resume name
   */
  const handleEditNameStart = () => {
    setEditNameValue(resumeData?.resume_name || '');
    setIsEditingName(true);
  }

  /**
   * Saves the inline edited resume name
   * Validates the name and auto-saves the resume
   */
  const handleEditNameSave = async () => {
    if (editNameValue.trim() === '') {
      return; // Don't save if name is empty
    }
    
    // Create updated resume data with the new name
    const updatedResumeData = { ...resumeData, resume_name: editNameValue.trim() };
    
    // Update resume data state
    setResumeData(updatedResumeData);
    console.log("Resume name updated to:", editNameValue.trim());
    setIsEditingName(false);
    setEditNameValue('');
    
    // Auto-save the resume with updated name
    await performSave(updatedResumeData);
  }

  /**
   * Cancels inline editing of the resume name
   * Resets the editing state without saving changes
   */
  const handleEditNameCancel = () => {
    setIsEditingName(false);
    setEditNameValue('');
  }

  // Configuration for the resume sections navigation
  const sections = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <Code className="w-4 h-4" /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'skills', label: 'Technical Skill', icon: <Code className="w-4 h-4" /> },
    { id: 'extracurricular', label: 'Extracurricular', icon: <Users className="w-4 h-4" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
  ];

  /**
   * Renders the appropriate form component based on the active section
   * @returns {JSX.Element | null} The form component for the active section
   */
  const renderActiveSection = () => {
    if (!resumeData) return null;
    switch (activeSection) {
      case 'personal':
        return <PersonalInfoForm data={resumeData.personal_info} onChange={updatePersonalInfo} />;
      case 'education':
        return <EducationForm data={resumeData.educations} onChange={updateEducation} />;
      case 'projects':
        return <ProjectsForm data={resumeData.projects} onChange={updateProjects} />;
      case 'experience':
        return <ExperienceForm data={resumeData.work_experiences} onChange={updateExperience} />;
      case 'skills':
        return <TechnicalSkillsForm data={resumeData.skills} onChange={updateTechnicalSkills} />;
      case 'extracurricular':
        return <ExtracurricularForm data={resumeData.extracurriculars} onChange={updateExtracurricular} />;
      case 'certifications':
        return <CertificationsForm data={resumeData.certifications} onChange={updateCertifications} />;
      default:
        return <PersonalInfoForm data={resumeData.personal_info} onChange={updatePersonalInfo} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 ">
      {/* Header - Contains save button, ATS score, and refresh functionality */}
      <div className="sticky top-0 bg-white shadow-sm border-b border-gray-100">
        <BuilderHeader
          score={resumeData?.ats_score}
          onSave={handleSave}
          onRefresh={handleRefresh}
        />
      </div>

      <div className="w-full h-[calc(100vh-102px)] mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form Section */}
          <div className="space-y-6 h-screen overflow-auto scrollbar-hide">
            {/* Section Navigation - Buttons to switch between different resume sections */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Resume Sections</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {section.icon}
                    <span className="hidden sm:inline">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Form Section - Renders the form for the currently selected section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderActiveSection()}
            </div>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col sm:flex-row items-center sm:gap-4">
                  <h2 className="text-base sm:text-lg font-semibold">Live Preview</h2>
                  {/* Resume name display with inline editing capability */}
                  {resumeData?.resume_name && (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:block text-sm text-gray-500">•</span>
                      {isEditingName ? (
                        // Inline editing mode
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded border-2 border-blue-500 focus:outline-none min-w-[120px]"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditNameSave();
                              } else if (e.key === 'Escape') {
                                handleEditNameCancel();
                              }
                            }}
                            onBlur={handleEditNameCancel}
                          />
                          <button
                            onClick={handleEditNameSave}
                            className="text-green-600 hover:text-green-700 p-1"
                            disabled={editNameValue.trim() === ''}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Display mode with edit button
                        <div className="flex items-center gap-2 group">
                          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {resumeData.resume_name}
                          </span>
                          <button
                            onClick={handleEditNameStart}
                            className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Edit resume name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Auto-updating indicator */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Auto-updating
                </div>
              </div>
              {/* Resume template preview with scrollable container */}
              <div className="border rounded-lg overflow-hidden max-h-[700px] scrollbar-hide overflow-y-scroll">
                <ResumeTemplate />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Name Dialog - Modal for entering resume name when saving */}
      {showNameDialog && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border-gray-200 ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enter Resume Name</h3>
              <button
                onClick={handleNameDialogCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please enter a name for your resume before saving.
            </p>
            <input
              type="text"
              value={tempResumeName}
              onChange={(e) => setTempResumeName(e.target.value)}
              placeholder="Enter resume name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNameDialogSave();
                }
              }}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleNameDialogCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNameDialogSave}
                disabled={tempResumeName.trim() === ''}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;