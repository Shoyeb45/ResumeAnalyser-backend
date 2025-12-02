"use client";

import { Sparkles, X, RotateCcw, Check } from 'lucide-react';

interface AIDialogProps {
  isOpen: boolean;
  suggestions: string[];
  isLoading?: boolean;
  onClose: () => void;
  onAccept: () => void;
  onRegenerate: () => void;
}

const AIDialog: React.FC<AIDialogProps> = ({
  isOpen,
  suggestions,
  isLoading = false,
  onClose,
  onAccept,
  onRegenerate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm border-gray-200 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">AI Generated Suggestions</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Here are optimized descriptions for your {suggestions.length} description points:
          </p>
        </div>

        <div className="p-6 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Point {index + 1}</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1 px-4 py-2 text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {isLoading ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDialog;