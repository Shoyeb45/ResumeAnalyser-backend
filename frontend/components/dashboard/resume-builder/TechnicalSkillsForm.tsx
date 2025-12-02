"use client";

import React, { useState } from 'react';
import { Code, Plus, X, Trash2 } from 'lucide-react';

/**
 * Technical Skills Form Component
 * Manages dynamic skill groups with add/remove functionality
 * Provides real-time input handling and skill group organization
 */

// Define the Skill interface since we don't have access to the types file
interface Skill {
    skill_group: string;
    skills: string[];
}

const TechnicalSkillsForm: React.FC<{
    data: Skill[];
    onChange: (data: Skill[]) => void;
}> = ({ data, onChange }) => {

    /**
     * Get all existing skill groups from data
     * Returns array of skill group names currently in the data
     */
    const getExistingGroups = (): string[] => {
        return data.map(item => item.skill_group);
    };

    /**
     * Helper function to get skills for a specific group
     * Returns skills array for given group name, empty array if not found
     */
    const getSkillsForGroup = (group: string): string[] => {
        const skillItem = data.find(item => item.skill_group === group);
        return skillItem ? skillItem.skills : [];
    };

    /**
     * Local state to track input values for real-time typing
     * Maintains comma-separated string representation of skills for each group
     */
    const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
        const initialValues: Record<string, string> = {};
        getExistingGroups().forEach(group => {
            initialValues[group] = getSkillsForGroup(group).join(', ');
        });
        return initialValues;
    });

    // State for new skill group input management
    const [newGroupName, setNewGroupName] = useState('');
    const [showAddGroup, setShowAddGroup] = useState(false);

    /**
     * Update skills for a specific group
     * Handles real-time input updates and data synchronization
     * Parses comma-separated string to skills array
     */
    const updateSkills = (skillGroup: string, value: string) => {
        // Update local input state immediately for real-time display
        setInputValues(prev => ({ ...prev, [skillGroup]: value }));

        // Parse and update skills data
        const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);

        // Update or add the skill group in the data
        const updatedData = data.filter(item => item.skill_group !== skillGroup);
        if (skills.length > 0) {
            updatedData.push({
                skill_group: skillGroup,
                skills,
            });
        }

        onChange(updatedData);
    };

    /**
     * Add new skill group to the list
     * Validates group name uniqueness and creates new empty group
     */
    const addNewSkillGroup = () => {
        if (newGroupName.trim() && !getExistingGroups().includes(newGroupName.trim())) {
            const trimmedName = newGroupName.trim();
            setInputValues(prev => ({ ...prev, [trimmedName]: '' }));
            setNewGroupName('');
            setShowAddGroup(false);

            // Add empty group to data
            const updatedData = [...data, {
                skill_group: trimmedName,
                skills: []
            }];
            onChange(updatedData);
        }
    };

    /**
     * Remove skill group from the list
     * Cleans up both input values and data state
     */
    const removeSkillGroup = (groupToRemove: string) => {
        // Remove from input values
        const updatedInputValues = { ...inputValues };
        delete updatedInputValues[groupToRemove];
        setInputValues(updatedInputValues);

        // Remove from data
        const updatedData = data.filter(item => item.skill_group !== groupToRemove);
        onChange(updatedData);
    };

    // Get current skill groups (only from data)
    const currentGroups = getExistingGroups();

    return (
        <div className="space-y-4">

            {/* Section header with icon, title, and add button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Code icon for visual identification */}
                    <Code className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Technical Skills</h3>
                </div>
                
                {/* Add skill group button with plus icon */}
                <button
                    type="button"
                    onClick={() => setShowAddGroup(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Skill Group
                </button>
            </div>

            {/* Add new skill group section - conditionally displayed */}
            {showAddGroup && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    
                    {/* New skill group header with close button */}
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">New Skill Group</h4>
                        
                        {/* Close new group form button */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddGroup(false);
                                setNewGroupName('');
                            }}
                            className="text-red-600 hover:text-red-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* New skill group input with label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skill Group Name *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Programming Languages, Cloud Platforms, Databases..."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addNewSkillGroup();
                                    }
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                                autoFocus
                            />
                            
                            {/* Add group confirmation button */}
                            <button
                                type="button"
                                onClick={addNewSkillGroup}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic list of skill groups */}
            {currentGroups.map((group) => (
                <div key={group} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    
                    {/* Individual skill group header with remove button */}
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{group}</h4>
                        
                        {/* Remove skill group button with trash icon */}
                        <button
                            type="button"
                            onClick={() => removeSkillGroup(group)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {/* Skills input field with label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skills (comma-separated)
                        </label>
                        <textarea
                            placeholder="JavaScript, TypeScript, React, Node.js, Python..."
                            value={inputValues[group] || ''}
                            onChange={(e) => updateSkills(group, e.target.value)}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TechnicalSkillsForm;