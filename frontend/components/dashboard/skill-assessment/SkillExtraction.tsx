"use client";

import { useState, useEffect } from 'react';
import { Code, Users, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { AssessmentSkill } from '@/types/resume';
import { useDashboard } from '@/context/DashboardContext';
import SkillTag from './SkillTag';
import AddSkillButton from './AddSkillButton';
import axios from 'axios';

/**
 * Interface defining the props for the SkillExtraction component
 */
interface SkillExtractionProps {
    /** Callback function triggered when skills are modified */
    onSkillsChange?: (skills: AssessmentSkill[]) => void;
    /** Callback function triggered when user proceeds to next step */
    onNext?: () => void;
    /** Loading state for the next button */
    loading?: boolean;
}

/**
 * SkillExtraction Component
 * 
 * A comprehensive component that extracts and displays technical and soft skills from a resume.
 * Allows users to view, add, remove, and modify skills before proceeding to the assessment.
 * 
 * Features:
 * - Automatic skill extraction from resume via API
 * - Skill categorization (technical/soft)
 * - Interactive skill management (add/remove)
 * - Validation for minimum and maximum skill limits
 * - Loading states and error handling
 * - Responsive design with modern UI
 * 
 * @param props - SkillExtractionProps
 * @returns JSX.Element
 */
const SkillExtraction: React.FC<SkillExtractionProps> = ({
    onSkillsChange = () => { },
    onNext = () => { },
    loading = false
}) => {
    // Dashboard context for global skill management
    const { skills: contextSkills, setSkills } = useDashboard();

    // Local state management
    const [skillLoading, setSkillLoading] = useState<boolean>(false);
    const [currentSkills, setCurrentSkills] = useState<AssessmentSkill[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    /**
     * Transforms raw skill arrays into AssessmentSkill objects with proper structure
     * @param technicalSkills - Array of technical skill names
     * @param softSkills - Array of soft skill names
     * @returns Array of AssessmentSkill objects
     */
    const transformSkillsToAssessmentFormat = (
        technicalSkills: string[] = [],
        softSkills: string[] = []
    ): AssessmentSkill[] => {
        const transformedSkills: AssessmentSkill[] = [];

        // Transform technical skills with proper typing and unique IDs
        technicalSkills.forEach((skill: string, index: number) => {
            transformedSkills.push({
                id: `tech-${index + 1}`,
                name: skill.trim(),
                type: 'technical'
            });
        });

        // Transform soft skills with proper typing and unique IDs
        softSkills.forEach((skill: string, index: number) => {
            transformedSkills.push({
                id: `soft-${index + 1}`,
                name: skill.trim(),
                type: 'soft'
            });
        });

        return transformedSkills;
    };

    /**
     * Fetches resume analysis data from the API and processes skills
     */
    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                // Set loading state
                setSkillLoading(true);
                setApiError(null);

                // Make API request to fetch resume analysis
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/latest-analysis`, {
                    withCredentials: true,
                });

                // Extract skills from API response (note: handling typo in API response)
                const technicalSkills = response.data.resume_analysis?.techinal_skills || [];
                const softSkills = response.data.resume_analysis?.softSkills || [];

                // Update global context with fetched skills
                setSkills({
                    technicalSkills,
                    softSkills
                });

                // Transform skills and update local state
                const transformedSkills = transformSkillsToAssessmentFormat(technicalSkills, softSkills);
                setCurrentSkills(transformedSkills);
                onSkillsChange(transformedSkills);

            } catch (err) {
                if (axios.isAxiosError(err)) {
                    // Handle API error specifically
                    setApiError(err.response?.data?.message || 'Failed to fetch resume data');
                }
                setSkills(null);
            } finally {
                // Reset loading state
                setSkillLoading(false);
            }
        };

        fetchResumeData();
    }, []); // Empty dependency array to run only once

    /**
     * Backup effect to handle context skills if API fails or for initial load
     * This ensures skills are displayed even if they come from context
     */
    useEffect(() => {
        if (contextSkills && currentSkills.length === 0 && !skillLoading) {
            const transformedSkills = transformSkillsToAssessmentFormat(
                contextSkills.technicalSkills,
                contextSkills.softSkills
            );
            setCurrentSkills(transformedSkills);
            onSkillsChange(transformedSkills);
        }
    }, [contextSkills, currentSkills.length, skillLoading]);

    /**
     * Adds a new skill to the current skills list
     * Validates maximum skill limits before adding
     * 
     * @param name - The name of the skill to add
     * @param type - The type of skill ('technical' | 'soft')
     */
    const addSkill = (name: string, type: 'technical' | 'soft') => {
        const currentTechnicalSkills = currentSkills.filter(skill => skill.type === 'technical');
        const currentSoftSkills = currentSkills.filter(skill => skill.type === 'soft');

        // Validate maximum skill limits (8 per category)
        if (type === 'technical' && currentTechnicalSkills.length >= 8) {
            return; // Prevent adding more than 8 technical skills
        }
        if (type === 'soft' && currentSoftSkills.length >= 8) {
            return; // Prevent adding more than 8 soft skills
        }

        // Create new skill object with unique ID
        const newSkill: AssessmentSkill = {
            id: `${type}-${Date.now()}`, // Use timestamp for unique ID
            name: name.trim(),
            type
        };

        // Update skills array and notify parent component
        const updatedSkills = [...currentSkills, newSkill];
        setCurrentSkills(updatedSkills);
        onSkillsChange(updatedSkills);
    };

    /**
     * Removes a skill from the current skills list
     * 
     * @param skillId - The unique ID of the skill to remove
     */
    const removeSkill = (skillId: string) => {
        const updatedSkills = currentSkills.filter(skill => skill.id !== skillId);
        setCurrentSkills(updatedSkills);
        onSkillsChange(updatedSkills);
    };

    // Computed values for skill categorization and validation
    const technicalSkills = currentSkills.filter(skill => skill.type === 'technical');
    const softSkills = currentSkills.filter(skill => skill.type === 'soft');

    // Validation flags
    const hasMinimumSkills = technicalSkills.length >= 2 && softSkills.length >= 2;
    const hasMaximumSkills = technicalSkills.length <= 8 && softSkills.length <= 8;
    const hasMaxTechnicalSkills = technicalSkills.length >= 8;
    const hasMaxSoftSkills = softSkills.length >= 8;

    // Show loading state while fetching skills from API
    if (skillLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-6xl mx-auto">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Extracting Skills from Resume
                        </h3>
                        <p className="text-gray-600">
                            Please wait while we analyze your resume and extract relevant skills...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if API call failed
    if (apiError) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-6xl mx-auto">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <AlertCircle className="text-red-500" size={32} />
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Error Loading Skills
                        </h3>
                        <p className="text-red-600 mb-4">{apiError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                        Skills Extracted from Resume
                    </h2>
                </div>

                {/* Technical Skills Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Code className="text-blue-500" size={20} />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">Technical Skills</h3>
                        </div>
                        <span className="text-sm text-gray-500">
                            ({technicalSkills.length} of 8 skills)
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        {/* Render technical skill tags */}
                        {technicalSkills.map(skill => (
                            <SkillTag
                                key={skill.id}
                                skill={skill}
                                onRemove={removeSkill}
                            />
                        ))}
                        {/* Add skill button */}
                        <AddSkillButton
                            type="technical"
                            onAdd={addSkill}
                            disabled={hasMaxTechnicalSkills}
                        />
                    </div>
                </div>

                {/* Soft Skills Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="text-purple-500" size={20} />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900">Soft Skills</h3>
                        </div>
                        <span className="text-sm text-gray-500">
                            ({softSkills.length} of 8 skills)
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                        {/* Render soft skill tags */}
                        {softSkills.map(skill => (
                            <SkillTag
                                key={skill.id}
                                skill={skill}
                                onRemove={removeSkill}
                            />
                        ))}
                        {/* Add skill button */}
                        <AddSkillButton
                            type="soft"
                            onAdd={addSkill}
                            disabled={hasMaxSoftSkills}
                        />
                    </div>
                </div>

                {/* Maximum Skills Warning */}
                {(hasMaxTechnicalSkills || hasMaxSoftSkills) && (
                    <div className="mb-4 sm:mb-6 flex items-start sm:items-center gap-2 px-3 sm:px-4 py-3 bg-orange-50 rounded-lg">
                        <AlertCircle size={20} className="text-orange-600 flex-shrink-0" />
                        <span className="text-orange-800 text-sm">
                            {hasMaxTechnicalSkills && hasMaxSoftSkills
                                ? "You've reached the maximum limit of 8 skills for both categories."
                                : hasMaxTechnicalSkills
                                    ? "You've reached the maximum limit of 8 technical skills."
                                    : "You've reached the maximum limit of 8 soft skills."
                            } Remove a skill to add a new one.
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Action Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                {/* Information Alert */}
                <div className="flex items-start sm:items-center gap-2 px-3 sm:px-4 py-3 bg-blue-50 rounded-lg">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
                    <span className="text-blue-800 text-sm">
                        Verify and edit your skills before proceeding to the assessment
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                    {/* Minimum skills validation message */}
                    {!hasMinimumSkills && (
                        <p className="text-sm text-orange-600 text-center sm:text-right">
                            Add at least 2 technical and 2 soft skills to proceed
                        </p>
                    )}

                    {/* Start Assessment Button */}
                    <button
                        onClick={onNext}
                        disabled={!hasMinimumSkills || !hasMaximumSkills || loading}
                        className={`px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors w-full sm:w-auto ${!hasMinimumSkills || !hasMaximumSkills || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Generating Questions...
                            </>
                        ) : (
                            <>
                                Start Skill Assessment
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SkillExtraction;