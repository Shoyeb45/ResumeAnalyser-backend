"use client";
import { CheckCircle, AlertCircle } from 'lucide-react';

const StrengthsAndImprovements: React.FC<{
    strengths: Array<{description: string; weightage: number}>;
    improvements: Array<{description: string; weightage: number}>;
  }> = ({ strengths, improvements }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Resume Analysis</h3>
        
        <div className="space-y-6">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900">Key Strengths</h4>
            </div>
            <div className="space-y-3">
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{strength.description}</p>
                      <div className="mt-2">
                        <div className="bg-green-200 rounded-full px-2 py-1 inline-block">
                          <span className="text-xs font-medium text-green-800">
                            Impact: {strength.weightage}%
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
  
          {/* Areas for Improvement */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900">Areas for Improvement</h4>
            </div>
            <div className="space-y-3">
              {improvements.length > 0 ? (
                improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{improvement.description}</p>
                      <div className="mt-2">
                        <div className="bg-orange-200 rounded-full px-2 py-1 inline-block">
                          <span className="text-xs font-medium text-orange-800">
                            Priority: {improvement.weightage}%
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
        </div>
      </div>
    );
  };

  export default StrengthsAndImprovements;