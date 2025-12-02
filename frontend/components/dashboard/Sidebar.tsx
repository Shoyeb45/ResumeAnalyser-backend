"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    PieChart,
    FilePen,
    FileScan,
    Brain,
    User,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Files
} from 'lucide-react';
import { usePathname } from 'next/navigation';

// Define the structure for navigation items
interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    navigation: string; // Next.js route path
    hasNestedRoutes?: boolean; // Flag to indicate if this item has nested routes
}

// Define the structure for navigation sections
interface NavSection {
    title?: string;
    items: NavItem[];
}

const Sidebar: React.FC = () => {
    // Next.js router for getting current pathname
    const router = useRouter();

    // State to control sidebar collapsed/expanded state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Get current pathname to highlight active item
    const pathname = usePathname();

    // Check if screen is mobile and set collapsed state accordingly
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768; // md breakpoint
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        // Check on initial load
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Main navigation sections configuration
    const navigationSections: NavSection[] = [
        {
            // Main features section (no title)
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: <PieChart size={20} />,
                    navigation: '/dashboard'
                },
                {
                    id: 'jd-matcher',
                    label: 'JD Matcher',
                    icon: <FileScan size={20} />,
                    navigation: '/dashboard/jd-matcher',
                    hasNestedRoutes: true
                },
                {
                    id: 'resume-builder',
                    label: 'Resume Builder',
                    icon: <FilePen size={20} />,
                    navigation: '/dashboard/resume-builder',
                    hasNestedRoutes: true
                },
                {
                    id: 'skill-assessment',
                    label: 'Skill Assessment',
                    icon: <Brain size={20} />,
                    navigation: '/dashboard/skill-assessment',
                    hasNestedRoutes: true
                },
                {
                    id: 'resume-manager',
                    label: 'Resume Manager',
                    icon: <Files size={20} />,
                    navigation: '/dashboard/resume-manager'
                }
            ]
        },
        {
            // Account section
            title: 'ACCOUNT',
            items: [
                {
                    id: 'profile',
                    label: 'Profile',
                    icon: <User size={20} />,
                    navigation: '/dashboard/profile'
                },
                {
                    id: 'help-support',
                    label: 'Help & Support',
                    icon: <HelpCircle size={20} />,
                    navigation: '/dashboard/help-support'
                }
            ]
        }
    ];

    /**
     * Check if a navigation item should be active
     * For items with nested routes, check if pathname starts with the navigation path
     * For regular items, check for exact match
     */
    const isItemActive = (item: NavItem): boolean => {
        if (item.hasNestedRoutes) {
            return pathname.startsWith(item.navigation);
        }
        return pathname === item.navigation;
    };

    /**
     * Toggle sidebar collapsed state
     * Only allow toggle if not on mobile (mobile should stay collapsed)
     */
    const toggleSidebar = () => {
        if (!isMobile) {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-2">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => router.push('/')}>
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">iT</span>
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">IntelliResume</h1>
                            </div>
                        )}
                    </div>

                    {/* Toggle Button - only show on desktop */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden sm:block p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? (
                                <ChevronRight size={16} className="text-gray-500" />
                            ) : (
                                <ChevronLeft size={16} className="text-gray-500" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto py-4">
                {navigationSections.map((section, sectionIndex) => {
                    return (
                        <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-8' : ''}>
                            {/* Section Title */}
                            {section.title && !isCollapsed && (
                                <div className="px-4 mb-3 ">
                                    <h2 className="text-xs font-semibold text-gray-400 border-t pt-4 px-3 border-gray-200 uppercase tracking-wider">
                                        {section.title}
                                    </h2>
                                </div>
                            )}

                            {/* Navigation Items using Link component */}
                            <nav className="space-y-1 px-2">
                                {section.items.map((item) => {
                                    const isActive = isItemActive(item);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.navigation}
                                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                            title={isCollapsed ? item.label : undefined}
                                            aria-label={`Navigate to ${item.label}`}
                                        >
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                                                }`}>
                                                {item.icon}
                                            </div>

                                            {/* Label - hidden when collapsed */}
                                            {!isCollapsed && (
                                                <span className="font-medium truncate">{item.label}</span>
                                            )}
                                        </Link>
                                    )

                                })
                                }
                            </nav>
                        </div>
                    )
                })}
            </div>

            {/* Footer Section */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-100">
                    <div className="text-xs text-gray-400 text-center">
                        © 2025 Resume Analyzer
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;