"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddSkillButtonProps {
    type: 'technical' | 'soft';
    onAdd: (name: string, type: 'technical' | 'soft') => void;
    disabled?: boolean;
}

const AddSkillButton: React.FC<AddSkillButtonProps> = ({ type, onAdd, disabled = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [skillName, setSkillName] = useState('');

    const handleAdd = () => {
        if (skillName.trim() && !disabled) {
            onAdd(skillName.trim(), type);
            setSkillName('');
            setIsAdding(false);
        }
    };

    const handleCancel = () => {
        setSkillName('');
        setIsAdding(false);
    };

    const handleStartAdding = () => {
        if (!disabled) {
            setIsAdding(true);
        }
    };

    if (isAdding && !disabled) {
        return (
            <div className="inline-flex items-center gap-2">
                <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="Enter skill name"
                    className="px-3 py-1 border border-gray-300 rounded-full text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    autoFocus
                />
                <button
                    onClick={handleAdd}
                    className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                >
                    Add
                </button>
                <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleStartAdding}
            disabled={disabled}
            className={`inline-flex items-center gap-1 px-3 py-1 border-2 border-dashed rounded-full text-xs sm:text-sm transition-colors ${
                disabled
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
            }`}
            title={disabled ? 'Maximum skills limit reached' : 'Add a new skill'}
        >
            <Plus size={14} />
            Add Skill
        </button>
    );
};

export default AddSkillButton;