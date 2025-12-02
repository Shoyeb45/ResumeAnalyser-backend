"use client";

import { Phone, Mail, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDashboard } from '@/context/DashboardContext';

// Simple SVG icons that work better in PDF
const LinkedInIcon: React.FC = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const GitHubIcon: React.FC = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

const ResumeTemplate: React.FC = () => {
    const { resumeData } = useDashboard();
    const [zoom, setZoom] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const { resumeRef } = useDashboard();

    const { personal_info, educations, work_experiences, projects, skills, certifications, extracurriculars } = resumeData;

    useEffect(() => {
        const handleWheel = (e: WheelEvent): void => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.01 : 0.01;
                setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
            }
        };

        const handleKeyDown = (e: KeyboardEvent): void => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
                e.preventDefault();
                setZoom(prevZoom => Math.min(3, prevZoom + 0.1));
            } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault();
                setZoom(prevZoom => Math.max(0.5, prevZoom - 0.1));
            } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault();
                setZoom(1);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full  bg-gray-100 py-4 px-2 overflow-auto"
            style={{ cursor: 'grab' }}
        >
            {/* Zoom Info */}
            {/* <div className="fixed top-4 right-4 bg-white px-3 py-2 rounded shadow-md z-10 text-sm">
                Zoom: {Math.round(zoom * 100)}%
                <div className="text-xs text-gray-500 mt-1">
                    Ctrl + Scroll or Ctrl + +/-
                </div>
            </div> */}

            {/* Resume Container */}
            <div
                className="flex justify-center"
                style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.1s ease-out'
                }}

            >
                <div
                    className="bg-white text-black font-serif shadow-2xl print:shadow-none"
                    style={{
                        minWidth: "210mm",
                        height: "297mm",
                        padding: "10mm",
                        boxSizing: "border-box"
                    }}
                    ref={resumeRef}
                >

                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-3xl tracking-wide uppercase break-words">
                            {personal_info.name}
                        </h1>
                        <p className="mb-1 text-base">
                            {personal_info.contact_info.location}
                        </p>

                        <div className="flex justify-center items-center flex-wrap gap-3" >
                            {personal_info.contact_info.mobile && (
                                <span className="text-sm flex gap-1 items-center underline underline-offset-4 whitespace-nowrap">
                                    <Phone size={10} />
                                    <span className="break-all">{personal_info.contact_info.mobile}</span>
                                </span>
                            )}
                            {personal_info.contact_info.email && (
                                <span className="text-sm flex gap-1 items-center underline underline-offset-4 whitespace-nowrap">
                                    <Mail size={10} />
                                    <span className="break-all">{personal_info.contact_info.email}</span>
                                </span>
                            )}
                            {personal_info.contact_info.social_links.linkedin && (
                                <span className="text-sm flex gap-1 items-center underline underline-offset-4 whitespace-nowrap">
                                    <div>
                                        <LinkedInIcon />
                                    </div>
                                    <span className="break-all">{personal_info.contact_info.social_links.linkedin}</span>
                                </span>
                            )}
                            {personal_info.contact_info.social_links.github && (
                                <span className="text-sm flex gap-1 items-center underline underline-offset-4 whitespace-nowrap">
                                    <div>
                                        <GitHubIcon />
                                    </div>
                                    <span className="break-all">{personal_info.contact_info.social_links.github}</span>
                                </span>
                            )}
                            {personal_info.contact_info.social_links.portfolio && (
                                <span className="text-sm flex gap-1 items-center underline underline-offset-4 whitespace-nowrap">
                                    <Globe size={10} />
                                    <span className="break-all">{personal_info.contact_info.social_links.portfolio}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Education */}
                    {educations.length > 0 && (
                        <div className="mb-2">
                            <h2 className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                EDUCATION
                            </h2>
                            {educations.map((edu, index) => (
                                <div key={index} className="mb-1">
                                    <div className="flex justify-between items-start flex-wrap gap-2 text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold break-words" >{edu.institute_name}</p>
                                            <p className="italic break-words" >
                                                {edu.degree} {edu.specialisation && `in ${edu.specialisation}`} {edu.gpa && `- CGPA ${edu.gpa}`}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0 text-xs">
                                            <p className="font-semibold whitespace-nowrap">{edu.date.start} - {edu.date.end}</p>
                                            <p className="italic break-words">{edu.location}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                PROJECTS
                            </h2>
                            {projects.map((project, index) => (
                                <div key={index} className="mb-4 text-sm">
                                    <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
                                        <div className='flex gap-1'>
                                            <p className="font-bold break-words underline underline-offset-4" >
                                                {project.title}
                                            </p>
                                            {project.technologies_used.length > 0 &&
                                                <span className='text-x'>|</span>
                                            }
                                            <p className="font-bold break-words underline underline-offset-4" >
                                                {project.technologies_used.join(', ')}
                                            </p>

                                        </div>
                                        <p className="font-semibold flex-shrink-0 whitespace-nowrap ">{project.date.start} {project.date.end && ` - ${project.date.end}`}</p>
                                    </div>
                                    <ul className="list-disc list-outside pl-6 space-y-1">
                                        {project.bullet_points.filter(desc => desc.trim()).map((desc, index) => (
                                            <li key={index} className="break-words">{desc}</li>
                                        ))}
                                        {project.project_link &&
                                            <li className='underline underline-offset-4'>{project.project_link}</li>
                                        }
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Experience */}
                    {work_experiences.length > 0 && (
                        <div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                EXPERIENCE
                            </h2>
                            {work_experiences.map((exp, index) => (
                                <div key={index} className="mb-3 text-sm">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold break-words" >{exp.company_name} </p>
                                            <p className="italic font-semibold break-words" >{exp.job_title}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold whitespace-nowrap">{exp.date.start} {exp.date.end && ` - ${exp.date.end}`}</p>
                                            <p className="italic break-words">{exp.location}</p>
                                        </div>
                                    </div>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        {exp.bullet_points.filter(resp => resp.trim()).map((resp, index) => (
                                            <li key={index} className="break-words" >{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Technical Skills */}
                    {/* {
                        skills
                        && (<div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                TECHNICAL SKILLS
                            </h2>
                            <div className=" text-sm">
                                <p className="break-words" >
                                    <span className="font-bold">Languages:</span> {skills.languages.length > 0 ? skills.languages.join(', ') : ''}
                                </p>
                                <p className="break-words" >
                                    <span className="font-bold">Developer Tools:</span> {skills.developerTools.length > 0 ? skills.developerTools.join(', ') : ''}
                                </p>
                                <p className="break-words" >
                                    <span className="font-bold">Technologies/Frameworks:</span> {skills.technologiesFrameworks.length > 0 ? technicalSkills.technologiesFrameworks.join(', ') : ''}
                                </p>
                            </div>
                        </div>
                        )
                    } */}

                    {
                        skills.length > 0
                        && (<div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                TECHNICAL SKILLS
                            </h2>
                            <div className="text-sm">
                                {
                                    skills.map((skill, index) => (
                                        <p key={index} className="break-words" >
                                            <span className="font-bold">{skill.skill_group}:</span> {skill.skills.join(', ')}
                                        </p>
                                    ))
                                }
                            </div>
                        </div>
                        )
                    }

                    {/* Extracurricular */}
                    {extracurriculars.length > 0 && (
                        <div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                EXTRACURRICULAR
                            </h2>
                            {extracurriculars.map((activity, index) => (
                                <div key={index} className="mb-3 text-sm">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className='flex gap-1'>
                                                <p className="font-bold break-words" >{activity.title} </p>
                                                {
                                                    activity.organization_name && <span>|</span>
                                                }
                                                <p className="font-bold break-words" >{activity.organization_name} </p>
                                            </div>
                                            <p className="italic font-semibold break-words" >{activity.role}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold whitespace-nowrap">{activity.date.start} {activity.date.end && `- ${activity.date.end}`}</p>
                                            <p className="italic break-words">{activity.location}</p>
                                        </div>
                                    </div>
                                    <ul className="list-disc list-inside ml-4 mt-2">
                                        {activity.bullet_points.filter(resp => resp.trim()).map((resp, index) => (
                                            <li key={index} className="break-words" >{resp}</li>
                                        ))}
                                        {activity.certificate && <li>{activity.certificate} </li>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications.length > 0 && (
                        <div className="mb-2">
                            <h2
                                className="w-full border-b font-medium text-base mb-2 uppercase tracking-wide">
                                CERTIFICATIONS
                            </h2>
                            <div className="space-y-2 text-sm">
                                {certifications.map((cert, index) => (
                                    <div key={index} className="mb-2">
                                        <div className="flex justify-between items-start flex-wrap gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold break-words">{cert.certification_name}</p>
                                                {cert.issuing_organisation && (
                                                    <p className="italic break-words">{cert.issuing_organisation}</p>
                                                )}
                                            </div>
                                            <div className="text-right flex-shrink-0 text-xs">
                                                {cert.date_issued && (
                                                    <p className="font-semibold whitespace-nowrap">
                                                        {cert.date_issued}
                                                        {cert.expiry_date && ` - ${cert.expiry_date}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {cert.description && (
                                            <p className="text-xs mt-1 break-words text-gray-700">{cert.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .bg-gray-100 {
                        background: white !important;
                    }
                    .fixed {
                        display: none !important;
                    }
                    div[style*="transform: scale"] {
                        transform: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ResumeTemplate;