"use client";

import { useState, useEffect } from 'react';
import { Clock, ChevronLeft } from 'lucide-react';
import { AssessmentQuestion } from '@/types/resume';

interface AssessmentProps {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  loading?: boolean;
  currentAnswer?: string; // Add this prop to receive the current answer
}

const Assessment: React.FC<AssessmentProps> = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  timeRemaining, 
  onAnswer, 
  onNext, 
  onPrevious, 
  onSkip,
  loading = false,
  currentAnswer = '' // Default to empty string
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>(currentAnswer);

  // Update selectedAnswer when currentAnswer prop changes (when navigating between questions)
  useEffect(() => {
    setSelectedAnswer(currentAnswer);
  }, [currentAnswer, questionNumber]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
    onNext();
  };

  const handleSkip = () => {
    onAnswer(''); // Send empty answer for skipped question
    onSkip();
  };

  const handlePrevious = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
    }
    onPrevious();
  };

  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm max-w-6xl mx-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold mb-4">AI-Generated Skill Assessment</h2>
        <div className="flex items-center justify-end text-sm gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-700" />
            <span className={`text-lg font-mono ${timeRemaining <= 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <span className="bg-blue-500/20 px-2 py-1 rounded-full">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {question.topic}
          </span>
          <span className="text-gray-500">• Multiple Choice</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{question.question}</h3>

        <div className="space-y-3">
          {question.options?.map((option, index) => {
            // Extract the option letter (A, B, C, D) and text
            const optionLetter = option.charAt(0);
            const optionText = option.substring(3); // Remove "A. " or "B. " etc.
            
            return (
              <label 
                key={index} 
                className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedAnswer === optionLetter ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={optionLetter}
                  checked={selectedAnswer === optionLetter}
                  onChange={() => setSelectedAnswer(optionLetter)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{optionLetter}.</span>
                  <span>{optionText}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={questionNumber === 1}
          className={`px-4 py-2 flex items-center gap-2 rounded-lg ${
            questionNumber === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
          >
            Skip Question
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {loading ? 'Submitting...' : isLastQuestion ? 'Submit Assessment' : 'Next Question'}
          </button>
        </div>
      </div>

      {timeRemaining <= 300 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            ⚠️ Less than 5 minutes remaining! Your assessment will be automatically submitted when time expires.
          </p>
        </div>
      )}
    </div>
  );
};

export default Assessment;