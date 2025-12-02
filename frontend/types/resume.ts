export interface ResumeAnalysis {
    success: boolean;
    message: string;
    resume_metadata: {
        resume_name: string;
        is_primary: boolean;
    };
    resume_analysis: {
        ats_score: {
            ats_score: number;
            format_compliance: number;
            keyword_optimization: number;
            readability: number;
        };
        job_match_score: number;
        skill_match_percent: number;
        technical_skills: string[];
        soft_skills: string[];
        matched_skills: string[];
        missing_skills: string[];
        nlp_analysis: {
            word_count: number;
            entities: string[];
            keywords: string[];
            role_match_score: number;
            role_matched: string | null;
        };
        llm_analysis: {
            overall_analysis: {
                overall_strengths: AnalysisItem[];
                areas_for_improvement: AnalysisItem[];
                ats_optimization_suggestions: AnalysisItem[];
                job_fit_assessment: {
                    score: number;
                    notes: string;
                };
                recommendation_score: number;
                resume_summary: string;
            };
            section_wise_analysis: {
                education: SectionAnalysis;
                projects: SectionAnalysis;
                experience: SectionAnalysis;
                skills: SectionAnalysis;
                extracurricular: SectionAnalysis;
            };
        };
        job_title: string
    };
}

export interface AnalysisItem {
    description: string;
    weightage: number;
}

export interface SectionAnalysis {
    good: string[];
    bad: string[];
    improvements: string[];
    overall_review: string;
    description: string;
}

export interface PersonalInfo {
    name: string;
    contact_info: {
        email: string;
        mobile: string;
        location: string;
        social_links: {
            linkedin: string;
            github: string;
            portfolio: string;
        };
    };
    professional_summary: string;
}

export interface Education {
    institute_name: string;
    degree: string;
    specialisation: string;
    date: {
        start: string;
        end: string;
    };
    location: string;
    gpa: string;
    relevant_coursework: string[];
}

export interface Project {
    title: string;
    project_link: string;
    date: {
        start: string;
        end: string;
    };
    location: string;
    organization: string;
    bullet_points: string[];
    technologies_used: string[];
}

export interface WorkExperience {
    company_name: string;
    job_title: string;
    date: {
        start: string;
        end: string;
    };
    location: string;
    bullet_points: string[];
}

export interface Skill {
    skill_group: string;
    skills: string[];
}

export interface Achievement {
    title: string;
    description: string;
    date_achieved: string;
    organization: string;
}
export interface Certification {
    certification_name: string;
    issuing_organisation: string;
    date_issued: string;
    expiry_date: string;
    description: string;
}

export interface Language {
    language: string;
    proficiency: string;
}

export interface Publication {
    title: string;
    date: string;
    description: string;
}


export interface Extracurricular {

    title: string;
    organization_name: string;
    role: string;
    date: {
        start: string;
        end: string;
    };
    bullet_points: string[];

    //ISKO ADD KARO
    certificate: string
    location: string
}

export interface ResumeData {
    _id: string,
    resume_name: string,
    is_primary: boolean,
    personal_info: PersonalInfo;
    educations: Education[];
    work_experiences: WorkExperience[];
    projects: Project[];
    skills: Skill[];
    achievements: Achievement[];
    certifications: Certification[];
    languages: Language[];
    publications: Publication[];
    extracurriculars: Extracurricular[];
    ats_score: number;
}

export interface ResumeMetadata {
    resume_name: string;
    is_primary: boolean;
}

export interface ResumeResponse {
    success: boolean;
    message: string;
    resume_metadata: ResumeMetadata;
    resume_details: ResumeData;
}

export interface LoadingStates {
    [projectId: string]: boolean;
}

export interface AISuggestions {
    [projectId: string]: string[] | null;
}

export interface AIDialogState {
    isOpen: boolean;
    projectId: number | null;
    suggestions: string[];
}

export interface ExperienceLoadingStates {
    [experienceId: string]: boolean;
}

export interface ExperienceAISuggestions {
    [experienceId: string]: string[] | null;
}

export interface ExperienceAIDialogState {
    isOpen: boolean;
    experienceId: string | null;
    suggestions: string[];
}
export interface AssessmentSkill {
    id: string;
    name: string;
    type: 'technical' | 'soft';
}

export interface AssessmentQuestion {
    topic: string;
    question: string;
    options: string[];
    answer: string;
}

export interface SkillScore {
    skill: string;
    score: number;
    industryAverage: number;
}

export interface CareerSuggestion {
    role: string;
    match: number;
    icon: React.ReactNode;
}

export interface LearningRecommendation {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export interface StrengthsAndImprovements {
    strengths: Array<{ skill: string; description: string }>;
    improvements: Array<{ skill: string; description: string }>;
}

export interface MockAnswer {
    questionId: string;
    answer: string;
    isCorrect: boolean;
}

export interface AssessmentData {
    // Basic assessment structure
    skills: {
        id: string;
        name: string;
        type: 'technical' | 'soft';
    }[];

    questions: {
        id: string;
        question: string;
        options: string[];
        answer: string;
        topic: string;
        type: 'multiple-choice';
    }[];

    answers: {
        questionId: string;
        answer: string;
        isCorrect: boolean;
        skill: string;
    }[];

    // Results structure
    results: {
        overall_score: number;
        skill_scores: {
            skill: string;
            score: number | null;
            industryAverage?: number;
        }[];
        career_suggestions: {
            suggestions: {
                role_name: string;
                match_percent: string;
            }[];
            strengths: {
                skill: string;
                strength_point: string;
            }[];
            improvement_areas: {
                skill: string;
                improvement_point: string;
            }[];
        };
    };
}

// API Types
export interface APIResponse {
    status: boolean;
    message: string;
    overall_score: number;
    skill_wise_scores: {
        skill: string;
        score: number | 0;
    }[];
    career_suggestions: {
        suggestions: {
            role_name: string;
            match_percent: string;
        }[];
        strengths: {
            skill: string;
            strength_point: string;
        }[];
        improvement_areas: {
            skill: string;
            improvement_point: string;
        }[];
    };
}

export interface LatestResumeData {
    id: string;
    resumeId: string;
    fileName: string;
    lastUpdated: string;
    analysisStatus: 'completed' | 'pending' | 'failed';
    atsScore: number;
    matchRate: number;
    overallStrengths: Array<{ description: string; weightage: number }>;
    areasForImprovement: Array<{ description: string; weightage: number }>;
    atsOptimizationSuggestions: Array<{ description: string; weightage: number }>;
    jobFitAssessment: { score: number; notes: string };
    recommendationScore: number;
    resumeSummary: string;
    technicalSkills: string[];
    softSkills: string[];
    jobTitle: string;
}

export interface ExtractedSkills {
    technicalSkills: string[];
    softSkills: string[];
}

export interface JobMatch {
    resume_metadata: {
        resume_name: string;
        is_primary: boolean;
    };
    _id: string;
    created_at: string;
    updated_at: string;
    ats_score: {
        ats_score: number;
        format_compliance: number;
        keyword_optimization: number;
        readability: number;
    };
    job_match_score: number;
    skill_match_percent: number;
    technical_skills: { skill_group: string; skills: string[] }[];
    soft_skills: { skill_group: string; skills: string[] }[];
    matched_skills: string[];
    missing_skills: string[];
    llm_analysis: any;
    job_title: string;
}

export interface Resume {
    _id: string;
    user_id: string;
    resume_name: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    personal_info: PersonalInfo;
    projects: Project[];
    educations: Education[];
    skills: Skill[];
    achievements: Achievement[];
    certifications: Certification[];
    languages: Language[];
    work_experiences: WorkExperience[];
    publications: Publication[];
    extracurriculars: Extracurricular[];
    keywords: string[];
    last_analyzed: string | null;
    ats_score: number;
}
