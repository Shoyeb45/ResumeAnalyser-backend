// ExtracurricularForm.tsx
"use client";

import { Plus, Trash2, Users, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Extracurricular, LoadingStates, AISuggestions, AIDialogState } from '@/types/resume';
import { generateExtracurricularResponsibilities } from '@/services/aiService';
import AISuggestionBox from './AISuggestionBox';
import AIDialog from './AIDialog';

/**
 * Extracurricular Activities Form Component
 * Manages dynamic list of extracurricular activities with add/remove functionality
 * Provides form fields for activity details including title, organization, role, dates, and bullet points
 * Includes AI-powered suggestion generation with validation requirements
 */
interface ExtracurricularFormProps {
  data: Extracurricular[];
  onChange: (data: Extracurricular[]) => void;
}

const ExtracurricularForm: React.FC<ExtracurricularFormProps> = ({ data, onChange }) => {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
  const [dialogState, setDialogState] = useState<AIDialogState>({
    isOpen: false,
    projectId: null,
    suggestions: []
  });

  /**
   * Add new extracurricular activity to the list
   * Creates a new activity object with empty fields and appends to existing data
   */
  const addActivity = (): void => {
    const newActivity: Extracurricular = {
      title: '',
      organization_name: '',
      role: '',
      date: {
        start: '',
        end: ''
      },
      bullet_points: [''],
      certificate: '',
      location: ''
    };
    onChange([...data, newActivity]);
  };

  /**
   * Update specific field of an activity
   * Updates the activity at the given index with new field value
   * Uses immutable update pattern to maintain React state consistency
   */
  const updateActivity = (index: number, field: keyof Extracurricular, value: string | string[] | { start: string; end: string }): void => {
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
   * Update activity date fields
   * Updates the specific date field (start or end) for the activity at given index
   */
  const updateDateField = (index: number, dateField: 'start' | 'end', value: string): void => {
    const activity = data[index];
    if (activity) {
      const newDate = { ...activity.date, [dateField]: value };
      updateActivity(index, 'date', newDate);
    }
  };

  /**
   * Remove activity from the list by index
   * Filters out the activity at the specified index and cleans up related state
   */
  const removeActivity = (index: number): void => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
    
    // Clean up AI suggestions and validation errors for removed activity
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[index];
    setAiSuggestions(newSuggestions);
    
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    setValidationErrors(newErrors);
  };

  /**
   * Add new bullet point to an activity
   * Appends an empty bullet point to the activity's bullet_points array
   */
  const addBulletPoint = (index: number): void => {
    const activity = data[index];
    if (activity) {
      updateActivity(index, 'bullet_points', [...activity.bullet_points, '']);
    }
  };

  /**
   * Update specific bullet point content
   * Updates the bullet point at the given indices with new content
   */
  const updateBulletPoint = (activityIndex: number, bulletIndex: number, value: string): void => {
    const activity = data[activityIndex];
    if (activity) {
      const newBulletPoints = [...activity.bullet_points];
      newBulletPoints[bulletIndex] = value;
      updateActivity(activityIndex, 'bullet_points', newBulletPoints);
    }
  };

  /**
   * Remove bullet point from an activity
   * Removes the bullet point at the specified index if more than one exists
   */
  const removeBulletPoint = (activityIndex: number, bulletIndex: number): void => {
    const activity = data[activityIndex];
    if (activity && activity.bullet_points.length > 1) {
      const newBulletPoints = activity.bullet_points.filter((_, i) => i !== bulletIndex);
      updateActivity(activityIndex, 'bullet_points', newBulletPoints);
    }
  };

  /**
   * Validate activity fields before AI generation
   * Checks if activity title, organization name, and role are filled
   * Returns validation error message if fields are missing
   */
  const validateActivityForAI = (activity: Extracurricular): string | null => {
    const missingFields = [];
    
    if (!activity.title.trim()) {
      missingFields.push('Activity Title');
    }
    
    if (!activity.organization_name.trim()) {
      missingFields.push('Organization Name');
    }
    
    if (!activity.role.trim()) {
      missingFields.push('Role/Position');
    }
    
    if (missingFields.length > 0) {
      return `Please fill in the following fields first: ${missingFields.join(', ')}`;
    }
    
    return null;
  };

  /**
   * Generate AI suggestions for activity bullet points
   * Validates required fields before making API call
   * Handles both single and multiple bullet point scenarios
   */
  const generateAISuggestion = async (activityIndex: number): Promise<void> => {
    const activity = data[activityIndex];
    if (!activity) return;

    // Validate required fields
    const validationError = validateActivityForAI(activity);
    if (validationError) {
      setValidationErrors(prev => ({ ...prev, [activityIndex]: validationError }));
      return;
    }

    // Clear any existing validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[activityIndex];
      return newErrors;
    });

    setLoadingStates(prev => ({ ...prev, [activityIndex]: true }));
    
    try {
      const suggestions = await generateExtracurricularResponsibilities(activity);
      
      if (activity.bullet_points.length === 1) {
        // Single bullet point - show inline suggestion
        setAiSuggestions(prev => ({ ...prev, [activityIndex]: suggestions }));
      } else {
        // Multiple bullet points - show dialog
        setDialogState({
          isOpen: true,
          projectId: activityIndex,
          suggestions: suggestions
        });
      }
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [activityIndex]: false }));
    }
  };

  /**
   * Accept AI suggestion and update activity bullet points
   * Replaces current bullet points with AI-generated suggestions
   */
  const acceptAISuggestion = (activityIndex: number): void => {
    const suggestions = aiSuggestions[activityIndex];
    if (suggestions) {
      updateActivity(activityIndex, 'bullet_points', suggestions);
      setAiSuggestions(prev => ({ ...prev, [activityIndex]: null }));
    }
  };

  /**
   * Decline AI suggestion and clear suggestion state
   * Removes the suggestion without applying changes
   */
  const declineAISuggestion = (activityIndex: number): void => {
    setAiSuggestions(prev => ({ ...prev, [activityIndex]: null }));
  };

  /**
   * Accept dialog suggestions and update activity
   * Applies AI suggestions from dialog to the activity
   */
  const acceptDialogSuggestions = (): void => {
    if (dialogState.projectId !== null) {
      updateActivity(dialogState.projectId, 'bullet_points', dialogState.suggestions);
      setDialogState({ isOpen: false, projectId: null, suggestions: [] });
    }
  };

  /**
   * Decline dialog suggestions and close dialog
   * Closes the dialog without applying changes
   */
  const declineDialogSuggestions = (): void => {
    setDialogState({ isOpen: false, projectId: null, suggestions: [] });
  };

  /**
   * Regenerate AI suggestions within dialog context
   * Generates new AI suggestions for the current activity
   */
  const regenerateDialogSuggestions = async (): Promise<void> => {
    if (dialogState.projectId === null) return;
    
    const activity = data[dialogState.projectId];
    if (!activity) return;

    setLoadingStates(prev => ({ ...prev, [dialogState.projectId!]: true }));
    
    try {
      const suggestions = await generateExtracurricularResponsibilities(activity);
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
            {/* Users icon for visual identification */}
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Extracurricular Activities</h3>
          </div>
          
          {/* Add activity button with plus icon */}
          <button
            onClick={addActivity}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>

        {/* Dynamic list of activity forms */}
        {data.map((activity, activityIndex) => (
          <div key={activityIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
            
            {/* Individual activity header with remove button */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Activity {activityIndex + 1}</h4>
              
              {/* Remove activity button with trash icon */}
              <button
                onClick={() => removeActivity(activityIndex)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Activity Title field - required for AI generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Title *
              </label>
              <input
                type="text"
                placeholder="Student Council President"
                value={activity.title}
                onChange={(e) => updateActivity(activityIndex, 'title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Organization Name field - required for AI generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                placeholder="University Student Association"
                value={activity.organization_name}
                onChange={(e) => updateActivity(activityIndex, 'organization_name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Role/Position field - required for AI generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role/Position *
              </label>
              <input
                type="text"
                placeholder="President, Vice President, Member"
                value={activity.role}
                onChange={(e) => updateActivity(activityIndex, 'role', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Activity date fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  placeholder="MM YYYY"
                  value={activity.date.start}
                  onChange={(e) => updateDateField(activityIndex, 'start', e.target.value)}
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
                  value={activity.date.end}
                  onChange={(e) => updateDateField(activityIndex, 'end', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Location and Certificate fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, State/Country"
                  value={activity.location}
                  onChange={(e) => updateActivity(activityIndex, 'location', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate
                </label>
                <input
                  type="text"
                  placeholder="Certificate/Award received"
                  value={activity.certificate}
                  onChange={(e) => updateActivity(activityIndex, 'certificate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
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
                    onClick={() => generateAISuggestion(activityIndex)}
                    disabled={loadingStates[activityIndex]}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {loadingStates[activityIndex] ? 'Generating...' : 'AI Generate'}
                  </button>
                  
                  {/* Add bullet point button */}
                  <button
                    onClick={() => addBulletPoint(activityIndex)}
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    + Add Point
                  </button>
                </div>
              </div>

              {/* Validation error message */}
              {validationErrors[activityIndex] && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationErrors[activityIndex]}</span>
                </div>
              )}

              {/* AI Suggestion Box for single bullet point */}
              {aiSuggestions[activityIndex] && activity.bullet_points.length === 1 && (
                <AISuggestionBox
                  suggestion={aiSuggestions[activityIndex]![0]}
                  onAccept={() => acceptAISuggestion(activityIndex)}
                  onDecline={() => declineAISuggestion(activityIndex)}
                  onRegenerate={() => generateAISuggestion(activityIndex)}
                  className="mb-3"
                />
              )}

              {/* Dynamic bullet point inputs */}
              {activity.bullet_points.map((bulletPoint, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <textarea
                    placeholder="Describe your activity achievement or responsibility..."
                    value={bulletPoint}
                    onChange={(e) => updateBulletPoint(activityIndex, bulletIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors resize-none"
                    rows={bulletPoint.length > 100 ? 3 : 2}
                  />
                  {/* Remove bullet point button - only show if more than one exists */}
                  {activity.bullet_points.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(activityIndex, bulletIndex)}
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
        isLoading={loadingStates[dialogState.projectId || 0]}
        onClose={declineDialogSuggestions}
        onAccept={acceptDialogSuggestions}
        onRegenerate={regenerateDialogSuggestions}
      />
    </>
  );
};

export default ExtracurricularForm;