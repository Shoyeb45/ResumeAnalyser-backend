"use client";

import { User } from 'lucide-react';
import { PersonalInfo } from '@/types/resume';

/**
 * Personal Information Form Component
 * Manages user's personal details including contact information and social links
 * Handles nested object updates for contact info and social links
 */
const PersonalInfoForm: React.FC<{
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}> = ({ data, onChange }) => {
  
  /**
   * Handle contact information field updates
   * Updates nested contact_info object properties while maintaining immutability
   */
  const handleContactChange = (field: keyof PersonalInfo['contact_info'], value: string) => {
    onChange({
      ...data,
      contact_info: {
        ...data.contact_info,
        [field]: value
      }
    });
  };

  /**
   * Handle social media links field updates
   * Updates nested social_links object within contact_info
   */
  const handleSocialChange = (field: keyof PersonalInfo['contact_info']['social_links'], value: string) => {
    onChange({
      ...data,
      contact_info: {
        ...data.contact_info,
        social_links: {
          ...data.contact_info.social_links,
          [field]: value
        }
      }
    });
  };

  /**
   * Handle direct PersonalInfo field updates
   * Updates top-level properties like name directly
   */
  const handleDirectChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      
      {/* Section header with icon and title */}
      <div className="flex items-center gap-2">
        {/* User icon for visual identification */}
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
      </div>

      {/* Personal information form container */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        
        {/* Basic information section */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Basic Information</h4>
          
          {/* Full Name field - required field */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={data?.name || ''}
              onChange={(e) => handleDirectChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Contact information section */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Email field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="john.doe@email.com"
                value={data?.contact_info?.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Mobile field - required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={data?.contact_info?.mobile || ''}
                onChange={(e) => handleContactChange('mobile', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Location field - optional field for current location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="New York, NY"
                value={data?.contact_info?.location || ''}
                onChange={(e) => handleContactChange('location', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social media and professional links section */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Professional Links</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* LinkedIn Profile field - professional networking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                value={data?.contact_info?.social_links?.linkedin || ''}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* GitHub Profile field - code repository showcase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Profile
              </label>
              <input
                type="url"
                placeholder="https://github.com/johndoe"
                value={data?.contact_info?.social_links?.github || ''}
                onChange={(e) => handleSocialChange('github', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>

            {/* Portfolio Website field - personal website showcase */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio Website
              </label>
              <input
                type="url"
                placeholder="https://johndoe.com"
                value={data?.contact_info?.social_links?.portfolio || ''}
                onChange={(e) => handleSocialChange('portfolio', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;