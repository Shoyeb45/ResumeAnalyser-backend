// ProjectsForm.tsx
"use client";

import { Plus, Code, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Project, LoadingStates, AISuggestions, AIDialogState } from '@/types/resume';
import { generateProjectSuggestions } from '@/services/aiService';
import AISuggestionBox from './AISuggestionBox';
import AIDialog from './AIDialog';

/**
 * Projects Form Component
 * Manages dynamic list of projects with add/remove functionality
 * Provides form fields for project details including title, dates, technologies, and bullet points
 * Includes AI-powered suggestion generation with validation requirements
 */
interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ data, onChange }) => {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: number]: string }>({});
  const [dialogState, setDialogState] = useState<AIDialogState>({
    isOpen: false,
    projectId: null,
    suggestions: []
  });

  /**
   * Add new project to the list
   * Creates a new project object with empty fields and appends to existing data
   */
  const addProject = (): void => {
    const newProject: Project = {
      title: '',
      project_link: '',
      date: {
        start: '',
        end: ''
      },
      location: '',
      organization: '',
      bullet_points: [''],
      technologies_used: []
    };
    onChange([...data, newProject]);
  };

  /**
   * Update specific field of a project
   * Updates the project at the given index with new field value
   * Uses immutable update pattern to maintain React state consistency
   */
  const updateProject = (index: number, field: keyof Project, value: string | string[]): void => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
    
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
   * Update project date fields
   * Updates the specific date field (start or end) for the project at given index
   */
  const updateProjectDate = (index: number, dateField: keyof Project['date'], value: string): void => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      date: {
        ...updatedData[index].date,
        [dateField]: value
      }
    };
    onChange(updatedData);
  };

  /**
   * Update technologies used field
   * Converts comma-separated string to array of technologies
   * Handles empty strings and trailing commas appropriately
   */
  const updateTechnologies = (index: number, techString: string): void => {
    const updatedData = [...data];
    
    if (techString.trim() === '') {
      updatedData[index] = {
        ...updatedData[index],
        technologies_used: []
      };
    } else {
      const techArray = techString
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0 || techString.endsWith(','));
      
      updatedData[index] = {
        ...updatedData[index],
        technologies_used: techArray
      };
    }
    
    onChange(updatedData);
    
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
   * Remove project from the list by index
   * Filters out the project at the specified index and cleans up related state
   */
  const removeProject = (index: number): void => {
    onChange(data.filter((_, i) => i !== index));
    
    // Clean up AI suggestions and validation errors for removed project
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[index.toString()];
    setAiSuggestions(newSuggestions);
    
    const newErrors = { ...validationErrors };
    delete newErrors[index];
    setValidationErrors(newErrors);
  };

  /**
   * Add new bullet point to a project
   * Appends an empty bullet point to the project's bullet_points array
   */
  const addBulletPoint = (index: number): void => {
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      bullet_points: [...updatedData[index].bullet_points, '']
    };
    onChange(updatedData);
  };

  /**
   * Update specific bullet point content
   * Updates the bullet point at the given indices with new content
   */
  const updateBulletPoint = (projectIndex: number, bulletIndex: number, value: string): void => {
    const updatedData = [...data];
    const newBulletPoints = [...updatedData[projectIndex].bullet_points];
    newBulletPoints[bulletIndex] = value;
    updatedData[projectIndex] = {
      ...updatedData[projectIndex],
      bullet_points: newBulletPoints
    };
    onChange(updatedData);
  };

  /**
   * Remove bullet point from a project
   * Removes the bullet point at the specified index if more than one exists
   */
  const removeBulletPoint = (projectIndex: number, bulletIndex: number): void => {
    const updatedData = [...data];
    if (updatedData[projectIndex].bullet_points.length > 1) {
      const newBulletPoints = updatedData[projectIndex].bullet_points.filter((_, i) => i !== bulletIndex);
      updatedData[projectIndex] = {
        ...updatedData[projectIndex],
        bullet_points: newBulletPoints
      };
      onChange(updatedData);
    }
  };

  /**
   * Validate project fields before AI generation
   * Checks if project title and technologies are filled
   * Returns validation error message if fields are missing
   */
  const validateProjectForAI = (project: Project): string | null => {
    const missingFields = [];
    
    if (!project.title.trim()) {
      missingFields.push('Project Title');
    }
    
    if (!project.technologies_used.length || project.technologies_used.every(tech => !tech.trim())) {
      missingFields.push('Technologies Used');
    }
    
    if (missingFields.length > 0) {
      return `Please fill in the following fields first: ${missingFields.join(', ')}`;
    }
    
    return null;
  };

  /**
   * Generate AI suggestions for project bullet points
   * Validates required fields before making API call
   * Handles both single and multiple bullet point scenarios
   */
  const generateAISuggestion = async (projectIndex: number): Promise<void> => {
    const project = data[projectIndex];
    if (!project) return;

    // Validate required fields
    const validationError = validateProjectForAI(project);
    if (validationError) {
      setValidationErrors(prev => ({ ...prev, [projectIndex]: validationError }));
      return;
    }

    // Clear any existing validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[projectIndex];
      return newErrors;
    });

    setLoadingStates(prev => ({ ...prev, [projectIndex]: true }));

    try {
      const suggestions = await generateProjectSuggestions(project);

      if (project.bullet_points.length === 1) {
        // Single bullet point - show inline suggestion
        setAiSuggestions(prev => ({ ...prev, [projectIndex]: suggestions }));
      } else {
        // Multiple bullet points - show dialog
        setDialogState({
          isOpen: true,
          projectId: projectIndex,
          suggestions: suggestions
        });
      }
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [projectIndex]: false }));
    }
  };

  /**
   * Accept AI suggestion and update project bullet points
   * Replaces current bullet points with AI-generated suggestions
   */
  const acceptAISuggestion = (projectIndex: number): void => {
    const suggestions = aiSuggestions[projectIndex];
    if (suggestions) {
      updateProject(projectIndex, 'bullet_points', suggestions);
      setAiSuggestions(prev => ({ ...prev, [projectIndex]: null }));
    }
  };

  /**
   * Decline AI suggestion and clear suggestion state
   * Removes the suggestion without applying changes
   */
  const declineAISuggestion = (projectIndex: number): void => {
    setAiSuggestions(prev => ({ ...prev, [projectIndex]: null }));
  };

  /**
   * Regenerate AI suggestion for the same project
   * Calls the AI generation function again with the same project data
   */
  const regenerateAISuggestion = async (projectIndex: number): Promise<void> => {
    await generateAISuggestion(projectIndex);
  };

  /**
   * Handle dialog accept action
   * Applies AI suggestions from dialog to the project
   */
  const handleDialogAccept = (): void => {
    if (dialogState.projectId !== null) {
      const projectIndex = dialogState.projectId;
      updateProject(projectIndex, 'bullet_points', dialogState.suggestions);
      setDialogState({ isOpen: false, projectId: null, suggestions: [] });
    }
  };

  /**
   * Handle dialog regenerate action
   * Generates new AI suggestions within the dialog context
   */
  const handleDialogRegenerate = async (): Promise<void> => {
    if (dialogState.projectId !== null) {
      const projectIndex = dialogState.projectId;
      setLoadingStates(prev => ({ ...prev, [projectIndex]: true }));
      
      try {
        const project = data[projectIndex];
        if (project) {
          const newSuggestions = await generateProjectSuggestions(project);
          setDialogState(prev => ({ ...prev, suggestions: newSuggestions }));
        }
      } catch (error) {
        console.error('Failed to regenerate AI suggestions:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [projectIndex]: false }));
      }
    }
  };

  /**
   * Handle dialog close action
   * Closes the dialog without applying changes
   */
  const handleDialogClose = (): void => {
    setDialogState({ isOpen: false, projectId: null, suggestions: [] });
  };

  return (
    <>
      <div className="space-y-4">
        
        {/* Section header with icon, title, and add button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Code icon for visual identification */}
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Projects</h3>
          </div>
          
          {/* Add project button with plus icon */}
          <button
            onClick={addProject}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {/* Dynamic list of project forms */}
        {data.map((project, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
            
            {/* Individual project header with remove button */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-700">Project {index+1}</h4>
              
              {/* Remove project button with trash icon */}
              <button
                onClick={() => removeProject(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Project Title field - required for AI generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="E-commerce Website"
                value={project.title}
                onChange={(e) => updateProject(index, 'title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
            
            {/* Project date fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  placeholder="MM YYYY"
                  value={project.date.start}
                  onChange={(e) => updateProjectDate(index, 'start', e.target.value)}
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
                  value={project.date.end}
                  onChange={(e) => updateProjectDate(index, 'end', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Technologies Used field - required for AI generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies Used *
              </label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={project.technologies_used.join(', ')}
                onChange={(e) => updateTechnologies(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
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
                    onClick={() => generateAISuggestion(index)}
                    disabled={loadingStates[index]}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {loadingStates[index] ? 'Generating...' : 'AI Generate'}
                  </button>
                  
                  {/* Add bullet point button */}
                  <button
                    onClick={() => addBulletPoint(index)}
                    className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                  >
                    + Add Point
                  </button>
                </div>
              </div>

              {/* Validation error message */}
              {validationErrors[index] && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationErrors[index]}</span>
                </div>
              )}

              {/* AI Suggestion Box for single bullet point */}
              {aiSuggestions[index] && project.bullet_points.length === 1 && (
                <AISuggestionBox
                  suggestion={aiSuggestions[index]![0]}
                  onAccept={() => acceptAISuggestion(index)}
                  onDecline={() => declineAISuggestion(index)}
                  onRegenerate={() => regenerateAISuggestion(index)}
                  className="mb-3"
                />
              )}

              {/* Dynamic bullet point inputs */}
              {project.bullet_points.map((point, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2">
                  <textarea
                    placeholder="Describe your project achievement or responsibility..."
                    value={point}
                    onChange={(e) => updateBulletPoint(index, bulletIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors resize-none"
                    rows={point.length > 100 ? 3 : 2}
                  />
                  {/* Remove bullet point button - only show if more than one exists */}
                  {project.bullet_points.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(index, bulletIndex)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Project Link field - optional URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Link
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/project"
                value={project.project_link}
                onChange={(e) => updateProject(index, 'project_link', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Dialog for multiple bullet points */}
      <AIDialog
        isOpen={dialogState.isOpen}
        suggestions={dialogState.suggestions}
        isLoading={dialogState.projectId !== null ? loadingStates[dialogState.projectId] || false : false}
        onClose={handleDialogClose}
        onAccept={handleDialogAccept}
        onRegenerate={handleDialogRegenerate}
      />
    </>
  );
};

export default ProjectsForm;