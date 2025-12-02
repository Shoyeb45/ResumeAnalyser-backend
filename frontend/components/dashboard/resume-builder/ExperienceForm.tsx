// ExperienceForm.tsx
"use client";

import { Plus, Trash2, Sparkles, Briefcase, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { WorkExperience, LoadingStates, AISuggestions, AIDialogState } from '@/types/resume';
import { generateExperienceResponsibilities } from '@/services/aiService';
import AISuggestionBox from './AISuggestionBox';
import AIDialog from './AIDialog';

/**
 * Experience Form Component
 * Manages dynamic list of work experiences with add/remove functionality
 * Provides form fields for experience details including company, job title, dates, and bullet points
 * Includes AI-powered suggestion generation with validation requirements
 */
interface ExperienceFormProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onChange }) => {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
  const [dialogState, setDialogState] = useState<AIDialogState>({
    isOpen: false,
    projectId: null,
    suggestions: []
  });

  /**
   * Add new experience to the list
   * Creates a new experience object with empty fields and appends to existing data
   */
  const addExperience = (): void => {
    const newExperience: WorkExperience = {
      company_name: '',
      job_title: '',
      location: '',
      date: {
        start: '',
        end: ''
      },
      bullet_points: ['']
    };
    onChange([...data, newExperience]);
  };

  /**
   * Update specific field of an experience
   * Updates the experience at the given index with new field value
   * Uses immutable update pattern to maintain React state consistency
   */
  const updateExperience = (index: number, field: keyof WorkExperience, value: string | string[] | { start: string; end: string }): void => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
    
    // Clear validation error when user starts typing
    if (validationErrors[index]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  /**
   * Update experience date fields
   * Updates the specific date field (start or end) for the experience at given index
   */
  const updateDateField = (index: number, dateField: 'start' | 'end', value: string): void => {
    const experience = data[index];
    if (experience) {
      const newDate = { ...experience.date, [dateField]: value };
      updateExperience(index, 'date', newDate);
    }
  };

  /**
   * Remove experience from the list by index
   * Filters out the experience at the specified index and cleans up related state
   */
  const removeExperience = (index: number): void => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
    
    // Clean up AI suggestions and validation errors for removed experience
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[index.toString()];
    setAiSuggestions(newSuggestions);
    
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    setValidationErrors(newErrors);
  };

  /**
   * Add new bullet point to an experience
   * Appends an empty bullet point to the experience's bullet_points array
   */
  const addBulletPoint = (index: number): void => {
    const experience = data[index];
    if (experience) {
      updateExperience(index, 'bullet_points', [...experience.bullet_points, '']);
    }
  };

  /**
   * Update specific bullet point content
   * Updates the bullet point at the given indices with new content
   */
  const updateBulletPoint = (experienceIndex: number, bulletIndex: number, value: string): void => {
    const experience = data[experienceIndex];
    if (experience) {
      const newBulletPoints = [...experience.bullet_points];
      newBulletPoints[bulletIndex] = value;
      updateExperience(experienceIndex, 'bullet_points', newBulletPoints);
    }
  };

  /**
   * Remove bullet point from an experience
   * Removes the bullet point at the specified index if more than one exists
   */
  const removeBulletPoint = (experienceIndex: number, bulletIndex: number): void => {
    const experience = data[experienceIndex];
    if (experience && experience.bullet_points.length > 1) {
      const newBulletPoints = experience.bullet_points.filter((_, i) => i !== bulletIndex);
      updateExperience(experienceIndex, 'bullet_points', newBulletPoints);
    }
  };

  /**
   * Validate experience fields before AI generation
   * Checks if company name and job title are filled
   * Returns validation error message if fields are missing
   */
  const validateExperienceForAI = (experience: WorkExperience): string | null => {
    const missingFields = [];
    
    if (!experience.company_name.trim()) {
      missingFields.push('Company Name');
    }
    
    if (!experience.job_title.trim()) {
      missingFields.push('Job Title');
    }
    
    if (missingFields.length > 0) {
      return `Please fill in the following fields first: ${missingFields.join(', ')}`;
    }
    
    return null;
  };

  /**
   * Generate AI suggestions for experience bullet points
   * Validates required fields before making API call
   * Handles both single and multiple bullet point scenarios
   */
  const generateAISuggestion = async (experienceIndex: number): Promise<void> => {
    const experience = data[experienceIndex];
    if (!experience) return;

    // Validate required fields
    const validationError = validateExperienceForAI(experience);
    if (validationError) {
      setValidationErrors(prev => ({ ...prev, [experienceIndex]: validationError }));
      return;
    }

    // Clear any existing validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[experienceIndex];
      return newErrors;
    });

    setLoadingStates(prev => ({ ...prev, [experienceIndex]: true }));

    try {
      const suggestions = await generateExperienceResponsibilities(experience);

      if (experience.bullet_points.length === 1) {
        // Single bullet point - show inline suggestion
        setAiSuggestions(prev => ({ ...prev, [experienceIndex]: suggestions }));
      } else {
        // Multiple bullet points - show dialog
        setDialogState({
          isOpen: true,
          projectId: experienceIndex,
          suggestions: suggestions
        });
      }
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [experienceIndex]: false }));
    }
  };

  /**
   * Accept AI suggestion and update experience bullet points
   * Replaces current bullet points with AI-generated suggestions
   */
  const acceptAISuggestion = (experienceIndex: number): void => {
    const suggestions = aiSuggestions[experienceIndex];
    if (suggestions) {
      updateExperience(experienceIndex, 'bullet_points', suggestions);
      setAiSuggestions(prev => ({ ...prev, [experienceIndex]: null }));
    }
  };

  /**
   * Decline AI suggestion and clear suggestion state
   * Removes the suggestion without applying changes
   */
  const declineAISuggestion = (experienceIndex: number): void => {
    setAiSuggestions(prev => ({ ...prev, [experienceIndex]: null }));
  };

  /**
   * Regenerate AI suggestion for the same experience
   * Calls the AI generation function again with the same experience data
   */
  const regenerateAISuggestion = async (experienceIndex: number): Promise<void> => {
    await generateAISuggestion(experienceIndex);
  };

  /**
   * Handle dialog accept action
   * Applies AI suggestions from dialog to the experience
   */
  const acceptDialogSuggestions = (): void => {
    if (dialogState.projectId !== null) {
      updateExperience(dialogState.projectId, 'bullet_points', dialogState.suggestions);
      setDialogState({ isOpen: false, projectId: null, suggestions: [] });
    }
  };

  /**
   * Handle dialog close action
   * Closes the dialog without applying changes
   */
  const declineDialogSuggestions = (): void => {
    setDialogState({ isOpen: false, projectId: null, suggestions: [] });
  };

  /**
   * Handle dialog regenerate action
   * Generates new AI suggestions within the dialog context
   */
  const regenerateDialogSuggestions = async (): Promise<void> => {
    if (dialogState.projectId === null) return;

    const experience = data[dialogState.projectId];
    if (!experience) return;

    setLoadingStates(prev => ({ ...prev, [dialogState.projectId!]: true }));

    try {
      const suggestions = await generateExperienceResponsibilities(experience);
      setDialogState(prev => ({ ...prev, suggestions }));
    } catch (error) {
      console.error('Failed to regenerate AI suggestions:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [dialogState.projectId!]: false }));
    }
  };

  return (
    <>
      <div className="space-y-4">
        
        {/* Section header with icon, title, and add button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Briefcase icon for visual identification */}
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Experience</h3>
          </div>
          
          {/* Add experience button with plus icon */}
          <button
            onClick={addExperience}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

        {/* Dynamic list of experience forms */}
        {data.map((experience, experienceIndex) => (
          <div key={experienceIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
            
            {/* Individual experience header with remove button */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Experience {experienceIndex + 1}</h4>
              
              {/* Remove experience button with trash icon */}
              <button
                onClick={() => removeExperience(experienceIndex)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Experience details in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Company Name field - required for AI generation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="Google Inc."
                  value={experience.company_name}
                  onChange={(e) => updateExperience(experienceIndex, 'company_name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Job Title field - required for AI generation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  placeholder="Software Engineer"
                  value={experience.job_title}
                  onChange={(e) => updateExperience(experienceIndex, 'job_title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Location field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  value={experience.location}
                  onChange={(e) => updateExperience(experienceIndex, 'location', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Date fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM YYYY"
                    value={experience.date.start}
                    onChange={(e) => updateDateField(experienceIndex, 'start', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM YYYY"
                    value={experience.date.end}
                    onChange={(e) => updateDateField(experienceIndex, 'end', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bullet Points section with AI generation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Bullet Points
                </label>
                <div className="flex items-center gap-2">
                  
                  {/* AI Generate button with validation */}
                  <button
                    onClick={() => generateAISuggestion(experienceIndex)}
                    disabled={loadingStates[experienceIndex]}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {loadingStates[experienceIndex] ? 'Generating...' : 'AI Generate'}
                  </button>
                  
                  {/* Add bullet point button */}
                  <button
                    onClick={() => addBulletPoint(experienceIndex)}
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    + Add Point
                  </button>
                </div>
              </div>

              {/* Validation error message */}
              {validationErrors[experienceIndex] && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationErrors[experienceIndex]}</span>
                </div>
              )}

              {/* AI Suggestion Box for single bullet point */}
              {aiSuggestions[experienceIndex] && experience.bullet_points.length === 1 && (
                <AISuggestionBox
                  suggestion={aiSuggestions[experienceIndex]![0]}
                  onAccept={() => acceptAISuggestion(experienceIndex)}
                  onDecline={() => declineAISuggestion(experienceIndex)}
                  onRegenerate={() => regenerateAISuggestion(experienceIndex)}
                  className="mb-3"
                />
              )}

              {/* Dynamic bullet point inputs */}
              {experience.bullet_points.map((bulletPoint, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <textarea
                    placeholder="Describe your responsibilities and achievements..."
                    value={bulletPoint}
                    onChange={(e) => updateBulletPoint(experienceIndex, bulletIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors resize-none"
                    rows={bulletPoint.length > 100 ? 3 : 2}
                  />
                  {/* Remove bullet point button - only show if more than one exists */}
                  {experience.bullet_points.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(experienceIndex, bulletIndex)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Dialog for multiple bullet points */}
      <AIDialog
        isOpen={dialogState.isOpen}
        suggestions={dialogState.suggestions}
        isLoading={dialogState.projectId !== null ? loadingStates[dialogState.projectId] || false : false}
        onClose={declineDialogSuggestions}
        onAccept={acceptDialogSuggestions}
        onRegenerate={regenerateDialogSuggestions}
      />
    </>
  );
};

export default ExperienceForm;