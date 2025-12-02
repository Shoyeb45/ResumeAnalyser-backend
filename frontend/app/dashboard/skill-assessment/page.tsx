"use client";

import React, { useState, useEffect } from 'react';
import ProgressSteppe from '@/components/dashboard/skill-assessment/ProgressSteppe';
import SkillExtraction from '@/components/dashboard/skill-assessment/SkillExtraction';
import Assessment from '@/components/dashboard/skill-assessment/Assessment';
import CareerFeedback from '@/components/dashboard/skill-assessment/CareerFeedback';
import { AssessmentData, APIResponse } from '@/types/resume';
import axios from 'axios';

/**
 * Interface defining the structure of a question object
 */
interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  topic: string;
  type: 'multiple-choice';
}

/**
 * SkillAssessmentDashboard Component
 * 
 * Main dashboard component that manages the complete skill assessment workflow.
 * Handles three main steps:
 * 1. Skill Extraction - User selects or confirms their skills
 * 2. Assessment - User takes the generated assessment
 * 3. Career Feedback - User receives results and career suggestions
 * 
 * Features:
 * - Multi-step assessment process with progress tracking
 * - Timed assessment with 15-minute countdown
 * - Question navigation (next/previous)
 * - Answer persistence across question navigation
 * - Real-time score calculation and feedback
 * - Assessment retake functionality
 * 
 * @returns {JSX.Element} The skill assessment dashboard component
 */
const SkillAssessmentDashboard: React.FC = () => {
  // Step management state (1: Skill Extraction, 2: Assessment, 3: Feedback)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Main assessment data structure containing skills, questions, answers, and results
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    skills: [],
    questions: [],
    answers: [],
    results: {
      overall_score: 0,
      skill_scores: [],
      career_suggestions: {
        suggestions: [],
        strengths: [],
        improvement_areas: []
      }
    },
  });

  // Assessment flow control states
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Track user answers by question index to allow navigation between questions
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  /**
   * Timer effect for assessment countdown
   * Manages the 15-minute assessment timer and auto-submits when time runs out
   */
  useEffect(() => {
    if (currentStep === 2 && assessmentStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit assessment when time runs out
            submitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Cleanup timer on component unmount or dependency change
      return () => clearInterval(timer);
    }
  }, [currentStep, assessmentStarted, timeRemaining]);

  /**
   * Initiates the skill assessment by fetching questions from the API
   * Separates technical and soft skills and sends them to the backend
   * Transitions to step 2 (Assessment) on success
   */
  const handleStartAssessment = async () => {
    setLoading(true);
    setError('');

    try {
      // Filter and extract skill names by type
      const technicalSkills = assessmentData.skills.filter(skill => skill.type === 'technical').map(skill => skill.name);
      const softSkills = assessmentData.skills.filter(skill => skill.type === 'soft').map(skill => skill.name);

      // API call to generate assessment questions
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/skill-assessment`,
        {
          "technical_skills": JSON.stringify(technicalSkills),
          "soft_skills": JSON.stringify(softSkills)
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.success) {
        // Transform API response to match internal question structure
        const questions = response.data.questions.map((q: Question, index: number) => ({
          id: index.toString(),
          question: q.question,
          options: q.options,
          answer: q.answer,
          topic: q.topic,
          type: 'multiple-choice' as const
        }));

        // Update assessment data with fetched questions
        setAssessmentData(prev => ({ ...prev, questions }));
        setCurrentStep(2);
        setAssessmentStarted(true);
      } else {
        setError('Failed to fetch questions. Please try again.');
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles answer selection for the current question
   * Updates the userAnswers state to maintain answer persistence
   * 
   * @param {string} answer - The selected answer option
   */
  const handleAnswer = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  /**
   * Navigates to the next question or submits assessment if on last question
   * Handles both progression through questions and final submission
   */
  const handleNextQuestion = () => {
    if (currentQuestion < assessmentData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit assessment when reaching the last question
      submitAssessment();
    }
  };

  /**
   * Navigates to the previous question
   * Allows users to review and change their previous answers
   */
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  /**
   * Submits the complete assessment for scoring
   * Processes user answers, calculates scores, and fetches career suggestions
   * Transitions to step 3 (Career Feedback) on success
   */
  const submitAssessment = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert userAnswers object to the format expected by the backend
      const formattedAnswers = Object.entries(userAnswers).map(([questionIndex, answer]) => {
        const question = assessmentData.questions[parseInt(questionIndex)];
        const isCorrect = question.answer === answer;

        return {
          questionId: question.question,
          answer,
          isCorrect,
          skill: question.topic
        };
      });

      // Update local assessment data with formatted answers
      setAssessmentData(prev => ({
        ...prev,
        answers: formattedAnswers
      }));

      // Calculate skill-wise scores for backend processing
      const skillScoreMap = new Map<string, { total: number; correct: number }>();

      formattedAnswers.forEach(answer => {
        const question = assessmentData.questions.find(q => q.question === answer.questionId);
        const skill = question?.topic || 'Unknown';

        const current = skillScoreMap.get(skill) || { total: 0, correct: 0 };
        skillScoreMap.set(skill, {
          total: current.total + 1,
          correct: current.correct + (answer.isCorrect ? 1 : 0)
        });
      });

      // Transform skill scores for API submission
      const scoreData = Array.from(skillScoreMap.entries()).map(([skill, scores]) => ({
        skill,
        total_questions: scores.total,
        correct_questions: scores.correct
      }));

      // Submit scores to get detailed feedback and career suggestions
      const response = await axios.post<APIResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_FASTAPI_URL}/api/v1/resume/skill-assessment-score`,
        {
          "skills": JSON.stringify(scoreData),
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data.status) {
        // Add mock industry averages to skill scores for comparison
        const skillScoresWithAverage = response.data.skill_wise_scores.map(score => ({
          ...score,
          industryAverage: Math.floor(Math.random() * 30) + 60 // Mock industry average (60-90%)
        }));

        // Update assessment data with final results
        setAssessmentData(prev => ({
          ...prev,
          results: {
            overall_score: response.data.overall_score,
            skill_scores: skillScoresWithAverage,
            career_suggestions: response.data.career_suggestions,
          }
        }));

        // Transition to feedback step
        setCurrentStep(3);
      } else {
        setError('Failed to calculate scores. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resets the entire assessment to allow retaking
   * Clears all assessment data and returns to step 1
   */
  const handleRetakeAssessment = () => {
    setCurrentStep(1);
    setCurrentQuestion(0);
    setTimeRemaining(900);
    setAssessmentStarted(false);
    setUserAnswers({}); // Clear all user answers
    
    // Reset assessment data to initial state
    setAssessmentData(prev => ({
      ...prev,
      questions: [],
      answers: [],
      results: {
        overall_score: 0,
        skill_scores: [],
        career_suggestions: {
          suggestions: [],
          strengths: [],
          improvement_areas: []
        }
      }
    }));
    setError('');
  };

  /**
   * Updates the skills in assessment data
   * Called from SkillExtraction component when skills are modified
   * 
   * @param {AssessmentData['skills']} newSkills - Updated skills array
   */
  const updateSkills = (newSkills: AssessmentData['skills']) => {
    setAssessmentData(prev => ({ ...prev, skills: newSkills }));
  };

  return (
    <div className="h-screen w-full bg-gray-50 overflow-y-scroll">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">Skill Assessment Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">Evaluate your skills with AI-generated questions and get personalized career feedback</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className=" mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Stepper */}
        <ProgressSteppe currentStep={currentStep} totalSteps={3} />

        {/* Step 1: Skill Extraction */}
        {currentStep === 1 && (
          <SkillExtraction
            onSkillsChange={updateSkills}
            onNext={handleStartAssessment}
            loading={loading}
          />
        )}

        {/* Step 2: Assessment */}
        {currentStep === 2 && assessmentData.questions.length > 0 && (
          <Assessment
            question={assessmentData.questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={assessmentData.questions.length}
            timeRemaining={timeRemaining}
            currentAnswer={userAnswers[currentQuestion] || ''} // Pass current answer for persistence
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion} // Enable backward navigation
            onSkip={handleNextQuestion}
            loading={loading}
          />
        )}

        {/* Step 3: Career Feedback */}
        {currentStep === 3 && (
          <CareerFeedback
            assessmentData={assessmentData}
            onRetakeAssessment={handleRetakeAssessment}
          />
        )}
      </div>
    </div>
  );
};

export default SkillAssessmentDashboard;