import React from 'react';
import { X } from 'lucide-react';
import { AssessmentSkill } from '@/types/resume';

const SkillTag: React.FC<{
    skill: AssessmentSkill;
    onRemove: (skillId: string) => void;
}> = ({ skill, onRemove }) => {
    const bgColor = skill.type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
    
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${bgColor}`}>
            {skill.name}
            <button
                onClick={() => onRemove(skill.id)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
                <X size={14} />
            </button>
        </span>
    );
};
export default SkillTag;