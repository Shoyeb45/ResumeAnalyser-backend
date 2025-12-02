"use client";

import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Education } from '@/types/resume';
import React from 'react';

/**
 * Education Form Component
 * Manages dynamic list of education entries with add/remove functionality
 * Provides form fields for education details including institute, degree, dates, and coursework
 */
const EducationForm: React.FC<{
  data: Education[];
  onChange: (data: Education[]) => void;
}> = ({ data, onChange }) => {
  
  /**
   * Add new education entry to the list
   * Creates a new education object with empty fields and appends to existing data
   */
  const addEducation = () => {
    const newEducation: Education = {
      institute_name: '',
      degree: '',
      specialisation: '',
      date: {
        start: '',
        end: ''
      },
      location: '',
      gpa: '',
      relevant_coursework: []
    };
    onChange([...data, newEducation]);
  };

  /**
   * Remove education entry from the list by index
   * Filters out the education at the specified index and updates the data
   */
  const removeEducation = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  /**
   * Update specific field of an education entry
   * Updates the education at the given index with new field value
   * Uses immutable update pattern to maintain React state consistency
   */
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updatedData = [...data];
    if (field === 'date') {
      // This case shouldn't happen with current implementation
      return;
    } else {
      updatedData[index] = { ...updatedData[index], [field]: value };
    }
    onChange(updatedData);
  };

  /**
   * Update date fields for education entry
   * Handles nested date object updates for start and end dates
   * Maintains immutability while updating nested object properties
   */
  const updateEducationDates = (index: number, dateField: keyof Education['date'], value: string) => {
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

  return (
    <div className="space-y-4">

      {/* Section header with icon, title, and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* GraduationCap icon for visual identification */}
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Education</h3>
        </div>
        
        {/* Add education button with plus icon */}
        <button
          type="button"
          onClick={addEducation}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {/* Dynamic list of education forms */}
      {data.map((edu, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          
          {/* Individual education header with remove button */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Education {index + 1}</h4>
            
            {/* Remove education button with trash icon */}
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Education form fields in responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Institute Name field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institute Name *
              </label>
              <input
                type="text"
                placeholder="Harvard University"
                value={edu.institute_name}
                onChange={(e) => updateEducation(index, 'institute_name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Degree field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree *
              </label>
              <input
                type="text"
                placeholder="Bachelor of Science"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Specialization field - optional field for major/field of study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                placeholder="Computer Science"
                value={edu.specialisation}
                onChange={(e) => updateEducation(index, 'specialisation', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* GPA field - optional academic performance indicator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA
              </label>
              <input
                type="text"
                placeholder="3.8/4.0"
                value={edu.gpa}
                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Start Date field - education commencement date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="text"
                placeholder="MM YYYY"
                value={edu.date.start}
                onChange={(e) => updateEducationDates(index, 'start', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* End Date field - education completion date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="text"
                placeholder="MM YYYY"
                value={edu.date.end}
                onChange={(e) => updateEducationDates(index, 'end', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Location field - full width for institution location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Cambridge, MA"
              value={edu.location}
              onChange={(e) => updateEducation(index, 'location', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationForm;