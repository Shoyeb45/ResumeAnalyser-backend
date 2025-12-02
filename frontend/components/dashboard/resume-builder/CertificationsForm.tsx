"use client";

import { Award, Plus, Trash2 } from 'lucide-react';
import { Certification } from '@/types/resume';

/**
 * Certifications Form Component
 * Manages dynamic list of certifications with add/remove functionality
 * Provides form fields for certification details including name, organization, dates, and description
 */
const CertificationsForm: React.FC<{
  data: Certification[];
  onChange: (data: Certification[]) => void;
}> = ({ data, onChange }) => {
  
  /**
   * Add new certification to the list
   * Creates a new certification object with empty fields and appends to existing data
   */
  const addCertification = () => {
    const newCertification: Certification = {
      certification_name: '',
      issuing_organisation: '',
      date_issued: '',
      expiry_date: '',
      description: ''
    };
    onChange([...data, newCertification]);
  };

  /**
   * Remove certification from the list by index
   * Filters out the certification at the specified index and updates the data
   */
  const removeCertification = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  /**
   * Update specific field of a certification
   * Updates the certification at the given index with new field value
   * Uses immutable update pattern to maintain React state consistency
   */
  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updatedData = data.map((cert, i) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    onChange(updatedData);
  };

  return (
    <div className="space-y-4">

      {/* Section header with icon, title, and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Award icon for visual identification */}
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Certifications</h3>
        </div>
        
        {/* Add certification button with plus icon */}
        <button
          type="button"
          onClick={addCertification}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
      
      {/* Dynamic list of certification forms */}
      {data.map((cert, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
          
          {/* Individual certification header with remove button */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800">Certification {index + 1}</h4>
            
            {/* Remove certification button with trash icon */}
            <button
              type="button"
              onClick={() => removeCertification(index)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Certification form fields in responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Certificate Name field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Name *
              </label>
              <input
                type="text"
                placeholder="AWS Solutions Architect"
                value={cert.certification_name}
                onChange={(e) => updateCertification(index, 'certification_name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Issuing Organization field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Organization *
              </label>
              <input
                type="text"
                placeholder="Amazon Web Services"
                value={cert.issuing_organisation}
                onChange={(e) => updateCertification(index, 'issuing_organisation', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Date Issued field - optional date picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Issued
              </label>
              <input
                type="date"
                value={cert.date_issued}
                onChange={(e) => updateCertification(index, 'date_issued', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Expiry Date field - optional date picker for certification validity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={cert.expiry_date}
                onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description field - full width textarea for detailed information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Brief description of the certification and its relevance..."
              value={cert.description}
              onChange={(e) => updateCertification(index, 'description', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificationsForm;