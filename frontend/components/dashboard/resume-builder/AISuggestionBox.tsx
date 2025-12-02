"use client";

import { Sparkles, X, RotateCcw, Check } from 'lucide-react';

interface AISuggestionBoxProps {
  suggestion: string;
  onAccept: () => void;
  onDecline: () => void;
  onRegenerate: () => void;
  className?: string;
}

const AISuggestionBox: React.FC<AISuggestionBoxProps> = ({
  suggestion,
  onAccept,
  onDecline,
  onRegenerate,
  className = ""
}) => {
  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">AI Suggestion</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">
        Here&apos;s an optimized description that includes more metrics and achievements:
      </p>
      <div className="p-3 bg-white border border-blue-200 rounded text-sm text-gray-800 leading-relaxed">
        {suggestion}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecline}
          className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm transition-colors"
        >
          <X className="w-3 h-3" />
          Decline
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 text-sm transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Regenerate
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Check className="w-3 h-3" />
          Accept
        </button>
      </div>
    </div>
  );
};

export default AISuggestionBox;