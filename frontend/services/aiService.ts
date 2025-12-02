import { Project, WorkExperience, Extracurricular } from '@/types/resume';
import axios from 'axios';

/**
 * Resume API Service Module
 * 
 * This module provides API functions for generating AI-powered suggestions
 * for different sections of a resume including projects, work experience,
 * and extracurricular activities.
 * 
 * All functions interact with the backend API to generate contextual
 * bullet points and suggestions based on user input data.
 */

/**
 * Generates AI-powered bullet point suggestions for project descriptions
 * 
 * Takes project data and sends it to the backend API to generate
 * professional bullet points that highlight project achievements,
 * technologies used, and impact.
 * 
 * @param {Project} projectData - The project data containing title, technologies, and existing bullet points
 * @param {string} projectData.title - The project title/name
 * @param {string[]} projectData.technologies_used - Array of technologies used in the project
 * @param {string[]} projectData.bullet_points - Existing bullet points (optional)
 * 
 * @returns {Promise<string[]>} Promise that resolves to an array of suggested bullet points
 * 
 * @example
 * const suggestions = await generateProjectSuggestions({
 *   title: "E-commerce Platform",
 *   technologies_used: ["React", "Node.js", "MongoDB"],
 *   bullet_points: ["Built responsive UI"]
 * });
 */
export const generateProjectSuggestions = async (projectData: Project): Promise<string[]> => {
  const suggestions: string[] = [];

  try {
    // Make API call to generate project bullet points
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/project`, {
      project_name: projectData.title,
      tech_stack: projectData.technologies_used.join(", "), // Convert array to comma-separated string
      bullet_points: projectData.bullet_points?.join('@ ') ?? null, // Join existing points with delimiter
      num_points: projectData.bullet_points.length || 0, // Count of existing bullet points
    }, {
      withCredentials: true, // Include cookies for authentication
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Extract bullet points from API response and add to suggestions array
    suggestions.push(...res.data.bullet_points);
    return suggestions;

  } catch (error: any) {
    // Log detailed error information for debugging
    console.error("❌ Error generating project suggestions:", error.response?.data || error.message);
    return []; // Return empty array on error to prevent UI crashes
  }
};

/**
 * Generates AI-powered bullet point suggestions for work experience descriptions
 * 
 * Takes work experience data and sends it to the backend API to generate
 * professional bullet points that highlight responsibilities, achievements,
 * and impact in the role.
 * 
 * @param {WorkExperience} experienceData - The work experience data
 * @param {string} experienceData.company_name - Name of the company/organization
 * @param {string} experienceData.job_title - Job title/position held
 * @param {string} experienceData.location - Work location
 * @param {string[]} experienceData.bullet_points - Existing bullet points (optional)
 * 
 * @returns {Promise<string[]>} Promise that resolves to an array of suggested bullet points
 * 
 * @example
 * const suggestions = await generateExperienceResponsibilities({
 *   company_name: "Tech Corp",
 *   job_title: "Software Engineer",
 *   location: "San Francisco, CA",
 *   bullet_points: ["Developed web applications"]
 * });
 */
export const generateExperienceResponsibilities = async (experienceData: WorkExperience): Promise<string[]> => {

  const suggestions: string[] = [];

  try {
    // Make API call to generate work experience bullet points
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/experience`, {
      organisation_name: experienceData.company_name,
      position: experienceData.job_title,
      location: experienceData.location,
      bullet_points: experienceData.bullet_points?.join('@ ') ?? null, // Join existing points with delimiter
      num_points: experienceData.bullet_points.length || 0, // Count of existing bullet points
    }, {
      withCredentials: true, // Include cookies for authentication
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Extract bullet points from API response and add to suggestions array
    suggestions.push(...res.data.bullet_points);
    return suggestions;

  } catch (error) {
    // Log error for debugging (should be more specific error message)
    console.error("Error generating project suggestions:", error);
    return []; // Return empty array on error to prevent UI crashes
  }
};

/**
 * Generates AI-powered bullet point suggestions for extracurricular activity descriptions
 * 
 * Takes extracurricular activity data and sends it to the backend API to generate
 * professional bullet points that highlight leadership, involvement, achievements,
 * and impact in extracurricular activities.
 * 
 * @param {Extracurricular} activityData - The extracurricular activity data
 * @param {string} activityData.organization_name - Name of the organization
 * @param {string} activityData.role - Role/position held in the activity
 * @param {string} activityData.location - Activity location
 * @param {string[]} activityData.bullet_points - Existing bullet points (optional)
 * 
 * @returns {Promise<string[]>} Promise that resolves to an array of suggested bullet points
 * 
 * @example
 * const suggestions = await generateExtracurricularResponsibilities({
 *   organization_name: "Student Council",
 *   role: "Vice President",
 *   location: "University Campus",
 *   bullet_points: ["Organized events"]
 * });
 */
export const generateExtracurricularResponsibilities = async (activityData: Extracurricular): Promise<string[]> => {
  
  const suggestions: string[] = [];

  try {
    // Make API call to generate extracurricular activity bullet points
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/extracurricular`, {
      organisation_name: activityData.organization_name,
      position: activityData.role,
      location: activityData.location,
      bullet_points: activityData.bullet_points?.join('@ ') ?? null, // Join existing points with delimiter
      num_points: activityData.bullet_points.length || 0, // Count of existing bullet points
    }, {
      withCredentials: true, // Include cookies for authentication
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Extract bullet points from API response and add to suggestions array
    suggestions.push(...res.data.bullet_points);
    return suggestions;

  } catch (error) {
    // Log error for debugging (should be more specific error message)
    console.error("Error generating project suggestions:", error);
    return []; // Return empty array on error to prevent UI crashes
  }
};