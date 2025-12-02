"use client";

import React from 'react';
import { Resume } from '@/types/resume';
import { formatDate } from '@/lib/utils';
import { Edit, Download, Trash2 } from 'lucide-react';

const ResumeCard: React.FC<{
  resume: Resume;
  onEdit: (resume: Resume) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ resume, onEdit, onDownload, onDelete }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <div className="w-48 sm:w-70">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
              {resume.resume_name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Uploaded on {formatDate(resume.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-gray-600">ATS Score:</span>
          <span className={`text-lg sm:text-xl font-bold ${getScoreColor(resume.ats_score)}`}>
            {resume.ats_score}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${getScoreBgColor(resume.ats_score)}`}
            style={{ width: `${resume.ats_score}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">

        <div className='flex'>
          <button
            onClick={() => onEdit(resume)}
            className="flex items-center justify-center sm:justify-start space-x-1 px-3 py-2 sm:py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded w-full sm:w-auto"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDownload(resume._id)}
            className="flex items-center justify-center sm:justify-start space-x-1 px-3 py-2 sm:py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        <button
          onClick={() => onDelete(resume._id)}
          className="flex items-center justify-center sm:justify-start space-x-1 px-3 py-2 sm:py-1.5 text-sm text-red-600 hover:bg-red-50 rounded w-full sm:w-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;