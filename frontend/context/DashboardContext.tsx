"use client";

import { createContext, useContext, useState, ReactNode, useRef } from 'react'
import { ResumeAnalysis, ResumeData, ExtractedSkills } from '@/types/resume';

//Define the context type
type ContextType = {
    openDialog: boolean;
    setOpenDialog: (status: boolean) => void;
    resumeRef: React.RefObject<HTMLDivElement>;
    resumeAnalysisData: ResumeAnalysis | null;
    setResumeAnalysisData: (data: ResumeAnalysis | null) => void;
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
    skills: ExtractedSkills | null;
    setSkills: React.Dispatch<React.SetStateAction<ExtractedSkills | null>>;
}

// Create context with default undefined
const Context = createContext<ContextType | undefined>(undefined);

// Provider props type
type ContextProviderProps = {
    children: ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const resumeRef = useRef<HTMLDivElement>(null);
    const [resumeAnalysisData, setResumeAnalysisData] = useState<ResumeAnalysis | null>(null);
    const [resumeData, setResumeData] = useState<ResumeData>({
        _id: '',
        resume_name: '',
        is_primary: false,
        personal_info: {
            name: '',
            contact_info: {
                email: '',
                mobile: '',
                location: '',
                social_links: {
                    linkedin: '',
                    github: '',
                    portfolio: ''
                },
            },
            professional_summary: ''
        },
        educations: [],
        work_experiences: [],
        projects: [],
        skills: [],
        achievements: [],
        certifications: [],
        languages: [],
        publications: [],
        extracurriculars: [],
        ats_score: 0
    });

    const [skills, setSkills] = useState<ExtractedSkills | null>({
        technicalSkills: [],
        softSkills: []
    });

    return (
        <Context.Provider value={{ openDialog, setOpenDialog, resumeAnalysisData, setResumeAnalysisData, resumeData, setResumeData, resumeRef: resumeRef as React.RefObject<HTMLDivElement>, skills, setSkills }}>
            {children}
        </Context.Provider>
    )
}

export const useDashboard = (): ContextType => {
    const context = useContext(Context)
    if (!context) {
        throw new Error('useDashboard must be used within a ContextProvider')
    }
    return context
}