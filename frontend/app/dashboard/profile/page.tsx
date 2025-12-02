"use client";

import React, { useState, useEffect } from 'react';
import { User, Edit3, LogOut, ExternalLink, Github, Linkedin, Globe, FileText, Trophy, Calendar, Activity, MapPin, Phone, Briefcase, Mail, Save, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

/**
 * Interface representing the user profile data structure
 */
interface UserProfile {
  _id: string;
  email: string;
  name: string;
  isVerified: boolean;
  current_profession: string | null;
  mobile_number: string | null;
  location: string;
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface representing the dashboard statistics data
 */
interface DashboardStats {
  totalResumes: number;
  bestScore: number;
  accountCreated: string;
  lastActivity: string;
}

/**
 * ProfilePage Component
 * 
 * A comprehensive user profile management component that allows users to:
 * - View their profile information and account statistics
 * - Edit their personal details and professional links
 * - Manage their account settings
 * - View dashboard statistics (resumes, scores, activity)
 * 
 * Features:
 * - Profile editing with form validation
 * - Dashboard statistics display
 * - Professional links management
 * - Account verification status
 * - Responsive design with loading states
 * - Error handling and user feedback
 * - Logout confirmation dialog
 * 
 * @returns {React.FC} The ProfilePage component
 */
const ProfilePage: React.FC = () => {
  // Component state management
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode toggle
  const [isLoading, setIsLoading] = useState(false); // Loading state for save operations
  const [isFetching, setIsFetching] = useState(true); // Loading state for initial data fetch
  const [error, setError] = useState<string | null>(null); // Error message state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Current user profile data
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null); // Edited profile data (draft)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false); // Controls logout confirmation dialog
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalResumes: 0,
    bestScore: 0,
    accountCreated: '',
    lastActivity: ''
  }); // Dashboard statistics

  const router = useRouter();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Fetches user profile data and dashboard statistics from the API
   * Updates both userProfile and dashboardStats state
   * Handles loading states and error management
   */
  const fetchUserData = async () => {
    try {
      setIsFetching(true);
      setError(null);

      // API call to fetch user data with credentials
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/user/`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUserProfile(userData);
        setEditedProfile(userData); // Initialize edited profile with current data

        // Format and set dashboard statistics
        setDashboardStats({
          totalResumes: response.data.total_resumes,
          bestScore: response.data.best_score,
          accountCreated: new Date(userData.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          }),
          lastActivity: new Date(userData.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Handles saving the edited profile data to the API
   * Sends PATCH request with form-encoded data
   * Updates the profile state on success and exits edit mode
   */
  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      // API call to update user profile with form-encoded data
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/user/`, {
        "user_details": JSON.stringify(editedProfile)
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.success) {
        setUserProfile(editedProfile); // Update the main profile state
        setIsEditing(false); // Exit edit mode
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input changes in the profile edit form
   * Updates the editedProfile state with new values
   * 
   * @param {keyof UserProfile} field - The profile field to update
   * @param {string} value - The new value for the field
   */
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value || null // Set to null if empty string
      });
    }
  };

  /**
   * Shows the logout confirmation dialog
   */
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  /**
   * Handles user logout functionality
   * Makes API call to logout endpoint and clears session
   */
  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      setShowLogoutDialog(false);
      // Redirect to login page after successful logout
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to log out. Please try again.');
      }
      setShowLogoutDialog(false);
    }
  };

  /**
   * Cancels the logout process and closes the dialog
   */
  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Loading state: Show spinner while fetching initial data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state: Show error message if profile data failed to load
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Failed to load profile</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 py-4 sm:py-8 px-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header Section: Page title and logout button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors w-full sm:w-auto"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Logout Confirmation Dialog */}
        {showLogoutDialog && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <LogOut size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                  <p className="text-sm text-gray-600">Are you sure you want to log out?</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                You will be signed out of your account and redirected to the login page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert: Display error messages to the user */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Statistics: Display key metrics in card format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          {/* Total Resumes Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Resumes</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{dashboardStats.totalResumes}</p>
              </div>
            </div>
          </div>

          {/* Best Score Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Best Score</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{dashboardStats.bestScore}%</p>
              </div>
            </div>
          </div>

          {/* Member Since Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Member Since</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{dashboardStats.accountCreated}</p>
              </div>
            </div>
          </div>

          {/* Last Activity Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Last Updated</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{dashboardStats.lastActivity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section: Main profile management interface */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section Header with Edit Toggle */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Update your personal details and contact information</p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  // Reset edited profile to original data when canceling edit
                  if (isEditing) {
                    setEditedProfile(userProfile);
                    setError(null);
                  }
                }}
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors w-full sm:w-auto"
              >
                {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Profile Picture and Basic Information */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Profile Avatar Placeholder */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-1 border-gray-300 bg-gray-50 self-center sm:self-start">
                <User size={24} className="sm:w-8 sm:h-8" />
              </div>

              <div className="flex-1">
                {isEditing ? (
                  // Edit Mode: Show input fields for name and email
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editedProfile?.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editedProfile?.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode: Display name, email, and verification status
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{userProfile.name}</h3>
                      {/* Verification Status Badge */}
                      {userProfile.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full self-center">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full self-center">
                          Not Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                      <Mail size={16} />
                      {userProfile.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="border-t border-gray-200 pt-6 mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>

              {isEditing ? (
                // Edit Mode: Show input fields for personal details
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Profession</label>
                    <input
                      type="text"
                      value={editedProfile?.current_profession || ''}
                      onChange={(e) => handleInputChange('current_profession', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={editedProfile?.mobile_number || ''}
                      onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your mobile number"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editedProfile?.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              ) : (
                // View Mode: Display personal details with icons
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Profession Display */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Briefcase size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Profession</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {userProfile.current_profession || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  {/* Mobile Number Display */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Mobile</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {userProfile.mobile_number || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  {/* Location Display */}
                  <div className="flex items-center gap-3 lg:col-span-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MapPin size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{userProfile.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Links Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Professional Links</h4>

              {isEditing ? (
                // Edit Mode: Show input fields for professional links
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={editedProfile?.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                    <input
                      type="url"
                      value={editedProfile?.github || ''}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                    <input
                      type="url"
                      value={editedProfile?.portfolio || ''}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  {/* Save and Cancel Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(userProfile); // Reset to original data
                        setError(null);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode: Display professional links as clickable cards
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* LinkedIn Link Card */}
                  {userProfile.linkedin && (
                    <a
                      href={userProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Linkedin size={20} className="text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">LinkedIn</p>
                        <p className="text-xs sm:text-sm text-gray-500">Professional Profile</p>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                  )}

                  {/* GitHub Link Card */}
                  {userProfile.github && (
                    <a
                      href={userProfile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Github size={20} className="text-gray-700" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">GitHub</p>
                        <p className="text-xs sm:text-sm text-gray-500">Code Repository</p>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                  )}

                  {/* Portfolio Link Card */}
                  {userProfile.portfolio && (
                    <a
                      href={userProfile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Globe size={20} className="text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Portfolio</p>
                        <p className="text-xs sm:text-sm text-gray-500">Personal Website</p>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                  )}

                  {/* Empty State: No professional links added */}
                  {!userProfile.linkedin && !userProfile.github && !userProfile.portfolio && (
                    <div className="lg:col-span-3 text-center py-8">
                      <Globe size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No professional links added yet</p>
                      <p className="text-sm text-gray-400">Click &quot;Edit Profile&quot; to add your links</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;