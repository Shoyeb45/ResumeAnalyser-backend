"use client";

import { Target, TrendingUp, FileText } from 'lucide-react';

const ATSOptimization: React.FC<{
    suggestions: Array<{description: string; weightage: number}>;
    jobFitAssessment: {score: number; notes: string};
    resumeSummary: string;
  }> = ({ suggestions, jobFitAssessment, resumeSummary }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">ATS Optimization & Job Fit</h3>
        
        <div className="space-y-6">
          {/* Job Fit Assessment */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">Job Fit Assessment</h4>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {jobFitAssessment.score}% Match
                  </span>
                </div>
                <p className="text-sm text-gray-700">{jobFitAssessment.notes}</p>
              </div>
            </div>
          </div>
  
          {/* ATS Optimization Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h4 className="text-lg font-medium text-gray-900">ATS Optimization Suggestions</h4>
            </div>
            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{suggestion.description}</p>
                      <div className="mt-2">
                        <div className="bg-purple-200 rounded-full px-2 py-1 inline-block">
                          <span className="text-xs font-medium text-purple-800">
                            Impact: {suggestion.weightage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Analysis in progress...</p>
                </div>
              )}
            </div>
          </div>
  
          {/* Resume Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">AI Resume Summary</h4>
                <p className="text-sm text-gray-700">{resumeSummary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default ATSOptimization;