"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Target, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FeaturesSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    const features = [
        {
            icon: Eye,
            title: "See Your Resume Through Recruiter Eyes",
            subtitle: "Resume Analysis Dashboard",
            description: "Our AI doesn't just check boxes—it understands context, industry nuances, and what hiring managers actually want",
            features: [
                "ATS Score with specific fixes (not just a number)",
                "Side-by-side before/after improvements",
                "Exact keywords you're missing for your target role"
            ],
            colorClasses: {
                bg: "bg-primary/10",
                text: "text-primary",
                border: "border-blue-500",
                hoverBg: "hover:bg-primary",
                dotBg: "bg-primary"
            }
        },
        {
            icon: Target,
            title: "AI skill test with real-time questions based on your dream job.",
            subtitle: "Personalized Recommendations",
            description: "Get your complete career growth blueprint: skills to learn, courses to take, and exactly where to focus next",
            features: [
                "Skills roadmap tailored to your goals",
                "Course recommendations that actually matter",
                "Quick skill assessments to validate your abilities"
            ],
            colorClasses: {
                bg: "bg-emerald-500/10",
                text: "text-emerald-500",
                border: "border-emerald-500",
                hoverBg: "hover:bg-emerald-500",
                dotBg: "bg-emerald-500"
            }
        },
        {
            icon: Star,
            title: "Stop Applying Blindly",
            subtitle: "Job Matching Intelligence",
            description: "Real feedback from real analysis—not generic tips everyone else is giving you",
            features: [
                "Match score for each job description",
                "Specific gaps between you and the role",
                "Priority improvements for maximum impact"
            ],
            colorClasses: {
                bg: "bg-amber-500/10",
                text: "text-amber-500",
                border: "border-amber-500",
                hoverBg: "hover:bg-amber-500",
                dotBg: "bg-amber-500"
            }
        }
    ];

    return (
        <section id="features" className="py-16 bg-white" ref={ref}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-intelliresume-navy mb-4">
                        What Makes IntelliResume Different
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Beyond basic resume checking. We provide intelligent insights that transform your career trajectory.
                    </p>
                </motion.div>

                <div className="space-y-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                            transition={{ duration: 0.8, delay: index * 0.3 }}
                        >
                            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                                <div className="inline-flex items-center mb-4">
                                    <motion.div
                                        className={`p-2 rounded-lg ${feature.colorClasses.bg} mr-3`}
                                        whileHover={{ scale: 1.1, rotate: 12 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <feature.icon className={`h-6 w-6 ${feature.colorClasses.text}`} />
                                    </motion.div>
                                    <span className={`text-sm font-semibold ${feature.colorClasses.text} uppercase tracking-wide`}>
                                        {feature.subtitle}
                                    </span>
                                </div>

                                <motion.h3
                                    className="text-3xl font-heading font-bold text-intelliresume-navy mb-4"
                                    whileHover={{ color: "#3b82f6" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {feature.title}
                                </motion.h3>

                                <p className="text-lg text-gray-600 mb-6">
                                    {feature.description}
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {feature.features.map((item, itemIndex) => (
                                        <motion.li
                                            key={itemIndex}
                                            className="flex items-start"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                            transition={{ duration: 0.5, delay: (index * 0.3) + (itemIndex * 0.1) }}
                                            whileHover={{ x: 8 }}
                                        >
                                            <motion.div
                                                className={`w-2 h-2 rounded-full ${feature.colorClasses.dotBg} mt-2 mr-3 flex-shrink-0`}
                                                whileHover={{ scale: 1.5 }}
                                                transition={{ type: "spring", stiffness: 500 }}
                                            />
                                            <span className="text-gray-700">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>

                                <Button 
                                    className={`border ${feature.colorClasses.border} ${feature.colorClasses.text} bg-white ${feature.colorClasses.hoverBg} hover:text-white`}
                                    asChild
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
                                    >
                                        See How This Works
                                    </motion.button>
                                </Button>
                            </div>

                            <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                                <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
                                        <motion.div
                                            className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center"
                                            whileHover={{ backgroundColor: "#f9fafb" }}
                                        >
                                            <div className="text-center">
                                                <motion.div
                                                    className={`w-16 h-16 mx-auto mb-4 ${feature.colorClasses.bg} rounded-full flex items-center justify-center`}
                                                    whileHover={{ scale: 1.1, rotate: 12 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <feature.icon className={`h-8 w-8 ${feature.colorClasses.text}`} />
                                                </motion.div>
                                                <div className="text-gray-500">Interactive Demo Preview</div>
                                            </div>
                                        </motion.div>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;